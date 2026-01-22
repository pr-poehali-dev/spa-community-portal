"""
Telegram Bot Authentication Handler

API:
  GET  /?action=bot-url      - Get bot authorization URL
  POST /?action=exchange      - Exchange auth token for JWT tokens
  POST /?action=refresh       - Refresh access token
  POST /?action=logout        - Logout user

Returns JWT access tokens compatible with Email auth system.
Uses telegram_auth_tokens table for initial auth, then refresh_tokens for sessions.
"""
import json
import os
import secrets
import hashlib
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional
import psycopg2
import jwt


# =============================================================================
# CONFIG
# =============================================================================

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
# DATABASE HELPERS
# =============================================================================

def find_user_by_telegram_id(cur, S: str, telegram_id: str) -> Optional[dict]:
    """Find user by telegram_id."""
    cur.execute(
        f"SELECT id, email, name, avatar_url FROM {S}users WHERE telegram_id = %s",
        (telegram_id,)
    )
    row = cur.fetchone()
    if row:
        return {
            'id': row[0],
            'email': row[1],
            'name': row[2],
            'avatar_url': row[3]
        }
    return None


def create_or_update_user(cur, S: str, telegram_id: str, username: Optional[str], 
                          first_name: Optional[str], last_name: Optional[str], 
                          photo_url: Optional[str]) -> dict:
    """Create new user or update existing one."""
    # Build display name
    name_parts = []
    if first_name:
        name_parts.append(first_name)
    if last_name:
        name_parts.append(last_name)
    display_name = " ".join(name_parts) if name_parts else username or f"TG User {telegram_id}"

    # Check if user exists
    existing = find_user_by_telegram_id(cur, S, telegram_id)

    if existing:
        # Update existing user
        cur.execute(
            f"""UPDATE {S}users
                SET name = COALESCE(%s, name),
                    avatar_url = COALESCE(%s, avatar_url),
                    updated_at = %s
                WHERE telegram_id = %s
                RETURNING id, email, name, avatar_url""",
            (display_name, photo_url, datetime.now(timezone.utc).isoformat(), telegram_id)
        )
        print(f"[INFO] Updated existing Telegram user: telegram_id={telegram_id}")
    else:
        # Create new user (email='' and password_hash='' for Telegram users)
        email = f"tg_{telegram_id}@temp.local"
        now = datetime.now(timezone.utc).isoformat()
        cur.execute(
            f"""INSERT INTO {S}users 
                (telegram_id, name, avatar_url, email, password_hash, email_verified, created_at, updated_at)
                VALUES (%s, %s, %s, %s, '', TRUE, %s, %s)
                RETURNING id, email, name, avatar_url""",
            (telegram_id, display_name, photo_url, email, now, now)
        )
        print(f"[INFO] Created new Telegram user: telegram_id={telegram_id}")

    row = cur.fetchone()
    return {
        'id': row[0],
        'email': row[1],
        'name': row[2],
        'avatar_url': row[3],
        'telegram_id': telegram_id
    }


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

def handle_bot_url(event: dict, origin: str) -> dict:
    """Get Telegram bot URL for authentication."""
    bot_username = os.environ.get('TELEGRAM_BOT_USERNAME', '')
    
    if not bot_username:
        print(f"[ERROR] Missing TELEGRAM_BOT_USERNAME")
        return error(500, 'Server configuration error', origin)

    bot_url = f"https://t.me/{bot_username}?start=auth"
    
    print(f"[DEBUG] Generated bot URL: {bot_url}")

    return response(200, {
        'bot_url': bot_url,
        'bot_username': bot_username
    }, origin)


def handle_exchange(event: dict, origin: str) -> dict:
    """Exchange Telegram auth token for JWT tokens."""
    body_str = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        body_str = base64.b64decode(body_str).decode('utf-8')

    try:
        payload = json.loads(body_str) if body_str else {}
    except json.JSONDecodeError:
        return error(400, 'Invalid JSON', origin)

    auth_token = payload.get('auth_token', '')
    if not auth_token:
        return error(400, 'auth_token required', origin)

    try:
        jwt_secret = get_jwt_secret()
    except ValueError as e:
        print(f"[ERROR] JWT secret validation failed: {e}")
        return error(500, 'Server configuration error: JWT_SECRET', origin)

    S = get_schema()
    conn = get_connection()

    try:
        cur = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()

        # Find auth token in telegram_auth_tokens table
        token_hash = hash_token(auth_token)
        cur.execute(
            f"""SELECT telegram_id, telegram_username, telegram_first_name, telegram_last_name, 
                       telegram_photo_url, expires_at, used_at
                FROM {S}telegram_auth_tokens
                WHERE token_hash = %s""",
            (token_hash,)
        )
        row = cur.fetchone()

        if not row:
            print(f"[ERROR] Auth token not found in database")
            return error(401, 'Invalid auth token', origin)

        telegram_id, username, first_name, last_name, photo_url, expires_at, used_at = row

        # Check if token expired
        if expires_at and datetime.fromisoformat(expires_at) < datetime.now(timezone.utc):
            print(f"[ERROR] Auth token expired")
            return error(401, 'Auth token expired', origin)

        # Check if token already used
        if used_at:
            print(f"[WARN] Auth token already used")
            return error(401, 'Auth token already used', origin)

        # Mark token as used
        cur.execute(
            f"UPDATE {S}telegram_auth_tokens SET used_at = %s WHERE token_hash = %s",
            (now, token_hash)
        )

        # Create or update user
        user_data = create_or_update_user(
            cur, S, str(telegram_id), username, first_name, last_name, photo_url
        )

        user_id = user_data['id']
        email = user_data['email']
        name = user_data['name']

        # Update last_login_at
        cur.execute(
            f"UPDATE {S}users SET last_login_at = %s WHERE id = %s",
            (now, user_id)
        )

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
        print(f"[SUCCESS] Telegram auth complete for user_id={user_id}")

        return response(200, {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': expires_in,
            'user': user_data
        }, origin)

    except Exception as e:
        print(f"[ERROR] Exchange error: {type(e).__name__}: {str(e)}")
        conn.rollback()
        return error(500, 'Authentication failed', origin)
    finally:
        conn.close()


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
    """Main entry point for Telegram bot authentication."""
    method = event.get('httpMethod', 'GET')
    query = event.get('queryStringParameters', {}) or {}
    action = query.get('action', 'bot-url')
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

    if action == 'bot-url' and method == 'GET':
        return handle_bot_url(event, origin)
    elif action == 'exchange' and method == 'POST':
        return handle_exchange(event, origin)
    elif action == 'refresh' and method == 'POST':
        return handle_refresh(event, origin)
    elif action == 'logout' and method == 'POST':
        return handle_logout(event, origin)
    else:
        return error(400, f'Unknown action: {action}', origin)
