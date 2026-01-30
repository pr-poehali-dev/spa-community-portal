"""Утилиты для работы с авторизацией"""
import os
import secrets
import hashlib
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_connection():
    """Получение подключения к БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    """Хеширование пароля через SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Проверка пароля"""
    return hash_password(password) == password_hash


def generate_token(length: int = 32) -> str:
    """Генерация случайного токена"""
    return secrets.token_urlsafe(length)


def create_tokens(user_id: int) -> tuple[str, str, datetime, datetime]:
    """
    Создание пары access + refresh токенов
    
    Returns:
        (access_token, refresh_token, access_expires_at, refresh_expires_at)
    """
    access_token = generate_token(32)
    refresh_token = generate_token(48)
    
    access_expires_at = datetime.now() + timedelta(hours=1)
    refresh_expires_at = datetime.now() + timedelta(days=30)
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO t_p13705114_spa_community_portal.user_sessions 
                   (user_id, session_token, refresh_token, expires_at, refresh_expires_at) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (user_id, access_token, refresh_token, access_expires_at, refresh_expires_at)
            )
            conn.commit()
    finally:
        conn.close()
    
    return access_token, refresh_token, access_expires_at, refresh_expires_at


def get_user_by_token(token: str) -> dict | None:
    """Получение пользователя по access токену"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.* FROM t_p13705114_spa_community_portal.users u
                   JOIN t_p13705114_spa_community_portal.user_sessions s ON u.id = s.user_id
                   WHERE s.session_token = %s 
                   AND s.expires_at > NOW() 
                   AND u.is_active = true""",
                (token,)
            )
            user = cur.fetchone()
            return dict(user) if user else None
    finally:
        conn.close()


def refresh_access_token(refresh_token: str) -> tuple[str, datetime] | None:
    """
    Обновление access токена через refresh токен
    
    Returns:
        (new_access_token, expires_at) или None если refresh токен невалиден
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT user_id FROM t_p13705114_spa_community_portal.user_sessions
                   WHERE refresh_token = %s 
                   AND refresh_expires_at > NOW()""",
                (refresh_token,)
            )
            session = cur.fetchone()
            
            if not session:
                return None
            
            new_access_token = generate_token(32)
            new_expires_at = datetime.now() + timedelta(hours=1)
            
            cur.execute(
                """UPDATE t_p13705114_spa_community_portal.user_sessions
                   SET session_token = %s, expires_at = %s
                   WHERE refresh_token = %s""",
                (new_access_token, new_expires_at, refresh_token)
            )
            conn.commit()
            
            return new_access_token, new_expires_at
    finally:
        conn.close()


def revoke_token(token: str, token_type: str = 'access') -> bool:
    """
    Отзыв токена (logout)
    
    Args:
        token: access_token или refresh_token
        token_type: 'access' или 'refresh'
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if token_type == 'access':
                cur.execute(
                    """DELETE FROM t_p13705114_spa_community_portal.user_sessions
                       WHERE session_token = %s""",
                    (token,)
                )
            else:
                cur.execute(
                    """DELETE FROM t_p13705114_spa_community_portal.user_sessions
                       WHERE refresh_token = %s""",
                    (token,)
                )
            conn.commit()
            return cur.rowcount > 0
    finally:
        conn.close()


def check_rate_limit(identifier: str, action: str, max_attempts: int = 5, window_minutes: int = 15) -> tuple[bool, int]:
    """
    Проверка rate limit
    
    Returns:
        (allowed: bool, wait_minutes: int)
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT * FROM t_p13705114_spa_community_portal.rate_limits 
                   WHERE identifier = %s AND action = %s""",
                (identifier, action)
            )
            record = cur.fetchone()
            
            now = datetime.now()
            
            if record:
                if record['blocked_until'] and record['blocked_until'] > now:
                    remaining = int((record['blocked_until'] - now).total_seconds() / 60)
                    return False, remaining
                
                time_diff = (now - record['first_attempt']).total_seconds() / 60
                
                if time_diff > window_minutes:
                    cur.execute(
                        """UPDATE t_p13705114_spa_community_portal.rate_limits 
                           SET attempts = 1, first_attempt = %s, last_attempt = %s, blocked_until = NULL 
                           WHERE identifier = %s AND action = %s""",
                        (now, now, identifier, action)
                    )
                    conn.commit()
                    return True, 0
                
                new_attempts = record['attempts'] + 1
                
                if new_attempts > max_attempts:
                    blocked_until = now + timedelta(minutes=window_minutes)
                    cur.execute(
                        """UPDATE t_p13705114_spa_community_portal.rate_limits 
                           SET attempts = %s, last_attempt = %s, blocked_until = %s 
                           WHERE identifier = %s AND action = %s""",
                        (new_attempts, now, blocked_until, identifier, action)
                    )
                    conn.commit()
                    return False, window_minutes
                
                cur.execute(
                    """UPDATE t_p13705114_spa_community_portal.rate_limits 
                       SET attempts = %s, last_attempt = %s 
                       WHERE identifier = %s AND action = %s""",
                    (new_attempts, now, identifier, action)
                )
                conn.commit()
                return True, 0
            else:
                cur.execute(
                    """INSERT INTO t_p13705114_spa_community_portal.rate_limits 
                       (identifier, action, attempts, first_attempt, last_attempt) 
                       VALUES (%s, %s, 1, %s, %s)""",
                    (identifier, action, now, now)
                )
                conn.commit()
                return True, 0
    finally:
        conn.close()


def get_client_ip(event: dict) -> str:
    """Извлечение IP клиента из event"""
    headers = event.get('headers', {})
    forwarded = headers.get('X-Forwarded-For', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return headers.get('X-Real-IP', event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown'))
