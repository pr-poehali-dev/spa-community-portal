"""
Yandex OAuth2 Authentication Handler

API:
  GET  /?action=auth-url    - Get authorization URL
  POST /?action=callback    - Exchange code for tokens
  POST /?action=refresh     - Refresh access token
  POST /?action=logout      - Logout user

Returns JWT access tokens compatible with Email auth system.
"""
import json
import os
import secrets
import hashlib
import base64
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from urllib.error import HTTPError
from datetime import datetime, timedelta, timezone
import psycopg2
import jwt


# =============================================================================
# CONFIG
# =============================================================================

YANDEX_AUTH_URL = 'https://oauth.yandex.ru/authorize'
YANDEX_TOKEN_URL = 'https://oauth.yandex.ru/token'
YANDEX_USER_INFO_URL = 'https://login.yandex.ru/info'

JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}


# =============================================================================
# DATABASE
# =============================================================================

def get_connection():
    """Get database connection."""
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema() -> str:
    """Get database schema prefix with quotes."""
    return '"t_p13705114_spa_community_portal".'


# =============================================================================
# JWT UTILITIES
# =============================================================================

def get_jwt_secret() -> str:
    """Get JWT secret from environment."""
    secret = os.environ.get('JWT_SECRET', '')
    if not secret or len(secret) < 32:
        raise ValueError('JWT_SECRET must be at least 32 characters')
    return secret


def create_access_token(user_id: int, email: str, name: str) -> tuple[str, int]:
    """Create JWT access token (same format as Email auth)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        'user_id': user_id,
        'email': email,
        'name': name,
        'exp': int(expire.timestamp()),
        'iat': int(datetime.now(timezone.utc).timestamp())
    }
    token = jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)
    return token, ACCESS_TOKEN_EXPIRE_MINUTES * 60


def create_refresh_token() -> str:
    """Create random refresh token."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Hash token for storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def cleanup_expired_tokens(cur, S: str):
    """Remove expired refresh tokens."""
    now = datetime.now(timezone.utc).isoformat()
    cur.execute(f"DELETE FROM {S}refresh_tokens WHERE expires_at < %s", (now,))


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


def exchange_code_for_token(code: str, client_id: str, client_secret: str) -> dict:
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
        },
        method='GET'
    )

    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode())
    except HTTPError:
        return {}


# =============================================================================
# HTTP HELPERS
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
        'body': json.dumps(body),
        'isBase64Encoded': False
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
        email = user_info.get('default_email', '') or f"yandex_{yandex_id}@temp.local"
        name = user_info.get('real_name') or user_info.get('display_name', '') or f"Yandex User {yandex_id}"
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
                print(f"[INFO] Existing user login: user_id={user_id}")
            else:
                # 2. Check if user exists by email - link Yandex account
                if email and not email.endswith('@temp.local'):
                    cur.execute(
                        f"SELECT id, name, avatar_url FROM {S}users WHERE email = %s",
                        (email,)
                    )
                    row = cur.fetchone()

                if email and not email.endswith('@temp.local') and row:
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
                    print(f"[INFO] Linked Yandex to existing user: user_id={user_id}")
                else:
                    # 3. Create new user (password_hash='' for OAuth users)
                    cur.execute(
                        f"""INSERT INTO {S}users
                            (yandex_id, email, password_hash, name, avatar_url, email_verified, created_at, updated_at, last_login_at)
                            VALUES (%s, %s, '', %s, %s, TRUE, %s, %s, %s)
                            RETURNING id""",
                        (yandex_id, email, name, picture, now, now, now)
                    )
                    user_id = cur.fetchone()[0]
                    print(f"[INFO] Created new user: user_id={user_id}")

            # Create JWT tokens (same format as Email auth)
            access_token, expires_in = create_access_token(user_id, email, name)
            refresh_token = create_refresh_token()
            refresh_token_hash = hash_token(refresh_token)
            refresh_expires = (datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()

            # Store refresh token in shared refresh_tokens table
            cur.execute(
                f"""INSERT INTO {S}refresh_tokens (user_id, token_hash, expires_at, created_at)
                    VALUES (%s, %s, %s, %s)""",
                (user_id, refresh_token_hash, refresh_expires, now)
            )

            conn.commit()
            print(f"[SUCCESS] Yandex auth complete for user_id={user_id}")

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
            return error(500, 'Authentication failed', origin)
        finally:
            conn.close()

    except HTTPError as e:
        print(f"[ERROR] Yandex API HTTP error: {e}")
        return error(500, 'Yandex API error', origin)
    except Exception as e:
        print(f"[ERROR] Unexpected error in callback: {type(e).__name__}: {str(e)}")
        return error(500, 'Authentication failed', origin)


def handle_refresh(event: dict, origin: str) -> dict:
    """Refresh access token using refresh token."""
    body_str = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        body_str = base64.b64decode(body_str).decode('utf-8')

    try:
        payload = json.loads(body_str) if body_str else {}
    except json.JSONDecodeError:
        return error(400, 'Invalid JSON', origin)

    refresh_token = payload.get('refresh_token', '')
    if not refresh_token:
        return error(400, 'Refresh token required', origin)

    S = get_schema()
    conn = get_connection()

    try:
        cur = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        
        # Clean expired tokens
        cleanup_expired_tokens(cur, S)

        # Find token
        token_hash = hash_token(refresh_token)
        cur.execute(
            f"""SELECT user_id, expires_at FROM {S}refresh_tokens 
                WHERE token_hash = %s AND expires_at > %s""",
            (token_hash, now)
        )
        row = cur.fetchone()

        if not row:
            return error(401, 'Invalid or expired refresh token', origin)

        user_id, _ = row

        # Get user data
        cur.execute(
            f"SELECT email, name FROM {S}users WHERE id = %s",
            (user_id,)
        )
        user_row = cur.fetchone()

        if not user_row:
            return error(401, 'User not found', origin)

        email, name = user_row

        # Create new access token
        access_token, expires_in = create_access_token(user_id, email, name)

        return response(200, {
            'access_token': access_token,
            'expires_in': expires_in
        }, origin)

    except Exception as e:
        print(f"[ERROR] Refresh token error: {type(e).__name__}: {str(e)}")
        return error(500, 'Token refresh failed', origin)
    finally:
        conn.close()


def handle_logout(event: dict, origin: str) -> dict:
    """Logout user by revoking refresh token."""
    body_str = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        body_str = base64.b64decode(body_str).decode('utf-8')

    try:
        payload = json.loads(body_str) if body_str else {}
    except json.JSONDecodeError:
        return error(400, 'Invalid JSON', origin)

    refresh_token = payload.get('refresh_token', '')
    if not refresh_token:
        return response(200, {'message': 'Logged out'}, origin)

    S = get_schema()
    conn = get_connection()

    try:
        cur = conn.cursor()
        token_hash = hash_token(refresh_token)
        
        cur.execute(
            f"DELETE FROM {S}refresh_tokens WHERE token_hash = %s",
            (token_hash,)
        )
        
        conn.commit()
        return response(200, {'message': 'Logged out'}, origin)

    except Exception as e:
        print(f"[ERROR] Logout error: {type(e).__name__}: {str(e)}")
        return error(500, 'Logout failed', origin)
    finally:
        conn.close()


# =============================================================================
# MAIN HANDLER
# =============================================================================

def handler(event: dict, context) -> dict:
    """Main entry point for Yandex OAuth authentication."""
    method = event.get('httpMethod', 'GET')
    query = event.get('queryStringParameters', {}) or {}
    action = query.get('action', 'auth-url')
    origin = get_origin(event)

    print(f"[DEBUG] Received request: method={method}, query={query}")

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': '',
            'isBase64Encoded': False
        }

    print(f"[DEBUG] Action: '{action}'")

    if action == 'auth-url' and method == 'GET':
        return handle_auth_url(event, origin)
    elif action == 'callback' and method == 'POST':
        return handle_callback(event, origin)
    elif action == 'refresh' and method == 'POST':
        return handle_refresh(event, origin)
    elif action == 'logout' and method == 'POST':
        return handle_logout(event, origin)
    else:
        return error(400, f'Unknown action: {action}', origin)
