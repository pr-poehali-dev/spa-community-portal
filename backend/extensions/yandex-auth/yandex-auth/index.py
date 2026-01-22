"""Yandex OAuth authentication handler."""
import base64
import json
import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from urllib.error import HTTPError

import jwt
import psycopg2

# =============================================================================
# CONSTANTS
# =============================================================================

YANDEX_AUTH_URL = "https://oauth.yandex.ru/authorize"
YANDEX_TOKEN_URL = "https://oauth.yandex.ru/token"
YANDEX_USER_INFO_URL = "https://login.yandex.ru/info"

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

HEADERS = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
}


# =============================================================================
# DATABASE
# =============================================================================

def get_connection():
    """Get database connection."""
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema() -> str:
    """Get database schema prefix with quotes for proper escaping."""
    return '"t_p13705114_spa_community_portal".'


def cleanup_expired_tokens(cur, schema: str) -> None:
    """Delete expired refresh tokens."""
    now = datetime.now(timezone.utc).isoformat()
    cur.execute(f"DELETE FROM {schema}refresh_tokens WHERE expires_at < %s", (now,))


# =============================================================================
# SECURITY
# =============================================================================

def hash_token(token: str) -> str:
    """Hash token with SHA256 for secure storage."""
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def get_jwt_secret() -> str:
    """Get JWT secret with validation."""
    secret = os.environ.get('JWT_SECRET', '')
    if not secret or len(secret) < 32:
        raise ValueError('JWT_SECRET must be at least 32 characters')
    return secret


# =============================================================================
# JWT
# =============================================================================

def create_access_token(user_id: int, email: str | None = None, name: str | None = None) -> tuple[str, int]:
    """Create JWT access token."""
    secret = get_jwt_secret()
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    payload = {
        'sub': str(user_id),
        'user_id': user_id,
        'exp': expire,
        'iat': now,
        'type': 'access'
    }
    if email:
        payload['email'] = email
    if name:
        payload['name'] = name

    token = jwt.encode(payload, secret, algorithm='HS256')
    return token, int(expires_delta.total_seconds())


def create_refresh_token() -> str:
    """Create refresh token."""
    return secrets.token_urlsafe(32)


# =============================================================================
# YANDEX API
# =============================================================================

def get_yandex_auth_url(client_id: str, redirect_uri: str, state: str) -> str:
    """Generate Yandex authorization URL."""
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'state': state
    }
    return f"{YANDEX_AUTH_URL}?{urlencode(params)}"


def exchange_code_for_token(
    code: str,
    client_id: str,
    client_secret: str
) -> dict:
    """Exchange authorization code for access token."""
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret
    }

    request = Request(
        YANDEX_TOKEN_URL,
        data=urlencode(data).encode('utf-8'),
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        method='POST'
    )

    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode())
    except HTTPError as e:
        error_body = e.read().decode()
        try:
            return json.loads(error_body)
        except json.JSONDecodeError:
            return {'error': 'http_error', 'error_description': 'Yandex API request failed'}


def get_yandex_user_info(access_token: str) -> dict:
    """Get user info from Yandex API."""
    request = Request(
        YANDEX_USER_INFO_URL,
        headers={
            'Authorization': f'OAuth {access_token}',
            'Content-Type': 'application/json'
        },
        method='GET'
    )

    with urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode())


# =============================================================================
# HELPERS
# =============================================================================

def get_allowed_origins() -> list[str]:
    """Get list of allowed origins from environment."""
    origins = os.environ.get('ALLOWED_ORIGINS', '')
    if origins:
        return [o.strip() for o in origins.split(',')]
    return []


def is_origin_allowed(origin: str) -> bool:
    """Check if origin is allowed."""
    allowed = get_allowed_origins()
    if not allowed:
        return True
    return origin in allowed


def response(status_code: int, body: dict, origin: str = '*') -> dict:
    """Create HTTP response."""
    headers = HEADERS.copy()
    if origin != '*' and is_origin_allowed(origin):
        headers['Access-Control-Allow-Origin'] = origin
    elif not get_allowed_origins():
        headers['Access-Control-Allow-Origin'] = origin if origin != '*' else '*'
    else:
        headers['Access-Control-Allow-Origin'] = 'null'

    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body)
    }


def error(status_code: int, message: str, origin: str = '*') -> dict:
    """Create error response."""
    return response(status_code, {'error': message}, origin)


def get_origin(event: dict) -> str:
    """Get request origin."""
    headers = event.get('headers', {}) or {}
    return headers.get('origin', headers.get('Origin', '*'))


# =============================================================================
# HANDLERS
# =============================================================================

def handle_auth_url(event: dict, origin: str) -> dict:
    """Generate Yandex authorization URL."""
    client_id = os.environ.get('YANDEX_CLIENT_ID', '')
    redirect_uri = os.environ.get('YANDEX_REDIRECT_URI', '')
    
    print(f"[DEBUG] auth-url: client_id={client_id[:10] if client_id else 'EMPTY'}..., redirect_uri={redirect_uri}")

    if not client_id or not redirect_uri:
        print(f"[ERROR] Missing config: client_id={bool(client_id)}, redirect_uri={bool(redirect_uri)}")
        return error(500, 'Server configuration error', origin)

    state = secrets.token_urlsafe(16)
    auth_url = get_yandex_auth_url(client_id, redirect_uri, state)

    return response(200, {
        'auth_url': auth_url,
        'state': state
    }, origin)


def handle_callback(event: dict, origin: str) -> dict:
    """Handle Yandex OAuth callback."""
    body_str = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        body_str = base64.b64decode(body_str).decode('utf-8')

    try:
        payload = json.loads(body_str) if body_str else {}
    except json.JSONDecodeError:
        payload = {}

    code = payload.get('code', '')

    if not code:
        query = event.get('queryStringParameters', {}) or {}
        code = query.get('code', '')

    if not code:
        return error(400, 'Authorization code is required', origin)

    client_id = os.environ.get('YANDEX_CLIENT_ID', '')
    client_secret = os.environ.get('YANDEX_CLIENT_SECRET', '')

    if not client_id or not client_secret:
        return error(500, 'Server configuration error', origin)

    try:
        jwt_secret = get_jwt_secret()
        print(f"[DEBUG] JWT secret length: {len(jwt_secret)}")
    except ValueError as e:
        print(f"[ERROR] JWT secret validation failed: {e}")
        return error(500, 'Server configuration error: JWT_SECRET', origin)

    try:
        print(f"[DEBUG] Exchanging code for token...")
        token_data = exchange_code_for_token(code, client_id, client_secret)
        print(f"[DEBUG] Token exchange result: {list(token_data.keys())}")

        if 'error' in token_data:
            print(f"[ERROR] Yandex token error: {token_data}")
            return error(400, token_data.get('error_description', 'Yandex auth failed'), origin)

        yandex_access_token = token_data.get('access_token')
        print(f"[DEBUG] Getting user info from Yandex...")
        user_info = get_yandex_user_info(yandex_access_token)
        print(f"[DEBUG] User info: id={user_info.get('id')}, email={user_info.get('default_email')}")

        yandex_id = str(user_info.get('id', ''))
        email = user_info.get('default_email', '')
        name = user_info.get('real_name') or user_info.get('display_name', '')
        # Yandex avatar: https://avatars.yandex.net/get-yapic/{avatar_id}/islands-200
        avatar_id = user_info.get('default_avatar_id', '')
        picture = f"https://avatars.yandex.net/get-yapic/{avatar_id}/islands-200" if avatar_id else ''

        S = get_schema()
        conn = get_connection()

        try:
            cur = conn.cursor()
            now = datetime.now(timezone.utc).isoformat()

            cleanup_expired_tokens(cur, S)

            # 1. Check if user exists by yandex_id
            cur.execute(
                f"SELECT id, email, name, avatar_url FROM {S}users WHERE yandex_id = %s",
                (yandex_id,)
            )
            row = cur.fetchone()

            if row:
                # User found by yandex_id - just login
                user_id, db_email, db_name, db_avatar = row
                cur.execute(
                    f"UPDATE {S}users SET last_login_at = %s, updated_at = %s WHERE id = %s",
                    (now, now, user_id)
                )
                email = db_email or email
                name = db_name or name
                picture = db_avatar or picture
            else:
                # 2. Check if user exists by email - link Yandex account
                if email:
                    cur.execute(
                        f"SELECT id, name, avatar_url FROM {S}users WHERE email = %s",
                        (email,)
                    )
                    row = cur.fetchone()

                if email and row:
                    # User found by email - link Yandex account
                    user_id, db_name, db_avatar = row
                    cur.execute(
                        f"""UPDATE {S}users
                            SET yandex_id = %s, avatar_url = COALESCE(avatar_url, %s),
                                last_login_at = %s, updated_at = %s
                            WHERE id = %s""",
                        (yandex_id, picture, now, now, user_id)
                    )
                    name = db_name or name
                    picture = db_avatar or picture
                else:
                    # 3. Create new user
                    cur.execute(
                        f"""INSERT INTO {S}users
                            (yandex_id, email, name, avatar_url, email_verified, created_at, updated_at, last_login_at)
                            VALUES (%s, %s, %s, %s, TRUE, %s, %s, %s)
                            RETURNING id""",
                        (yandex_id, email, name, picture, now, now, now)
                    )
                    user_id = cur.fetchone()[0]

            access_token, expires_in = create_access_token(user_id, email, name)
            refresh_token = create_refresh_token()
            refresh_token_hash = hash_token(refresh_token)
            refresh_expires = (datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()

            cur.execute(
                f"""INSERT INTO {S}refresh_tokens (user_id, token_hash, expires_at, created_at)
                    VALUES (%s, %s, %s, %s)""",
                (user_id, refresh_token_hash, refresh_expires, now)
            )

            conn.commit()

            return response(200, {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'expires_in': expires_in,
                'user': {
                    'id': user_id,
                    'email': email,
                    'name': name,
                    'avatar_url': picture,
                    'yandex_id': yandex_id
                }
            }, origin)

        except Exception as e:
            print(f"[ERROR] Database error: {type(e).__name__}: {str(e)}")
            conn.rollback()
            return error(500, f'Database error: {type(e).__name__}', origin)
        finally:
            conn.close()

    except HTTPError as e:
        print(f"[ERROR] Yandex API HTTP error: {e}")
        return error(500, 'Yandex API error', origin)
    except Exception as e:
        print(f"[ERROR] Unexpected error in callback: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return error(500, f'Internal server error: {type(e).__name__}', origin)


def handle_refresh(event: dict, origin: str) -> dict:
    """Refresh access token."""
    body_str = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        body_str = base64.b64decode(body_str).decode('utf-8')

    try:
        payload = json.loads(body_str)
    except json.JSONDecodeError:
        return error(400, 'Invalid JSON', origin)

    refresh_token = payload.get('refresh_token', '')
    if not refresh_token:
        return error(400, 'refresh_token is required', origin)

    try:
        get_jwt_secret()
    except ValueError:
        return error(500, 'Server configuration error', origin)

    S = get_schema()
    conn = get_connection()

    try:
        cur = conn.cursor()
        now = datetime.now(timezone.utc)

        cleanup_expired_tokens(cur, S)

        token_hash = hash_token(refresh_token)

        cur.execute(
            f"""SELECT rt.user_id, u.email, u.name, u.avatar_url, u.yandex_id
                FROM {S}refresh_tokens rt
                JOIN {S}users u ON u.id = rt.user_id
                WHERE rt.token_hash = %s AND rt.expires_at > %s""",
            (token_hash, now.isoformat())
        )

        row = cur.fetchone()
        if not row:
            conn.commit()
            return error(401, 'Invalid or expired refresh token', origin)

        user_id, email, name, avatar_url, yandex_id = row

        access_token, expires_in = create_access_token(user_id, email, name)

        conn.commit()

        return response(200, {
            'access_token': access_token,
            'expires_in': expires_in,
            'user': {
                'id': user_id,
                'email': email,
                'name': name,
                'avatar_url': avatar_url,
                'yandex_id': yandex_id
            }
        }, origin)

    except Exception:
        return error(500, 'Internal server error', origin)
    finally:
        conn.close()


def handle_logout(event: dict, origin: str) -> dict:
    """Logout user by invalidating refresh token."""
    body_str = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        body_str = base64.b64decode(body_str).decode('utf-8')

    try:
        payload = json.loads(body_str)
    except json.JSONDecodeError:
        return error(400, 'Invalid JSON', origin)

    refresh_token = payload.get('refresh_token', '')
    if refresh_token:
        S = get_schema()
        conn = get_connection()
        try:
            cur = conn.cursor()
            token_hash = hash_token(refresh_token)
            cur.execute(
                f"DELETE FROM {S}refresh_tokens WHERE token_hash = %s",
                (token_hash,)
            )
            cleanup_expired_tokens(cur, S)
            conn.commit()
        except Exception:
            pass
        finally:
            conn.close()

    return response(200, {'message': 'Logged out'}, origin)


# =============================================================================
# MAIN HANDLER
# =============================================================================

def handler(event: dict, context) -> dict:
    """Main handler - routes to specific handlers based on action."""
    origin = get_origin(event)
    
    print(f"[DEBUG] Received request: method={event.get('httpMethod')}, query={event.get('queryStringParameters')}")

    if event.get('httpMethod') == 'OPTIONS':
        headers = HEADERS.copy()
        headers['Access-Control-Allow-Origin'] = origin if origin != '*' else '*'
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    query = event.get('queryStringParameters', {}) or {}
    action = query.get('action', '')
    
    print(f"[DEBUG] Action: '{action}'")

    handlers = {
        'auth-url': handle_auth_url,
        'callback': handle_callback,
        'refresh': handle_refresh,
        'logout': handle_logout,
    }

    if action not in handlers:
        print(f"[ERROR] Unknown action: '{action}', available: {list(handlers.keys())}")
        return error(400, f'Unknown action: {action}', origin)

    return handlers[action](event, origin)