"""
API для регистрации и авторизации пользователей.
Поддерживает регистрацию по email, вход, выход и проверку токена.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import secrets
from datetime import datetime, timedelta

SCHEMA = 't_p13705114_spa_community_portal'


def get_db_connection():
    """Создание подключения к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def hash_password(password: str) -> str:
    """Хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token() -> str:
    """Генерация токена"""
    return secrets.token_urlsafe(32)


def handler(event: dict, context) -> dict:
    """
    API для авторизации.
    
    POST /auth/register - регистрация
    POST /auth/login - вход
    POST /auth/logout - выход
    GET /auth/me - получить данные текущего пользователя
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', 'login')
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if action == 'register':
                result = register_user(body)
            elif action == 'login':
                result = login_user(body)
            elif action == 'logout':
                request_headers = event.get('headers', {})
                result = logout_user(request_headers)
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неизвестное действие'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET' and action == 'me':
            request_headers = event.get('headers', {})
            result = get_current_user(request_headers)
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result, ensure_ascii=False, default=str),
            'isBase64Encoded': False
        }
    
    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }


def register_user(data: dict) -> dict:
    """Регистрация нового пользователя"""
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    
    if not email or not password:
        raise ValueError('Email и пароль обязательны')
    
    if len(password) < 6:
        raise ValueError('Пароль должен содержать минимум 6 символов')
    
    if not name:
        raise ValueError('Имя обязательно')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Проверка существования email
            cursor.execute(
                f"SELECT id FROM {SCHEMA}.users WHERE email = %s",
                (email,)
            )
            
            if cursor.fetchone():
                raise ValueError('Пользователь с таким email уже существует')
            
            # Создание пользователя
            password_hash = hash_password(password)
            
            cursor.execute(
                f"""
                INSERT INTO {SCHEMA}.users 
                (email, password_hash, name, phone, role, created_at)
                VALUES (%s, %s, %s, %s, 'user', NOW())
                RETURNING id, email, name, phone, role, created_at
                """,
                (email, password_hash, name, phone)
            )
            
            user = cursor.fetchone()
            
            # Создание сессии
            token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            
            cursor.execute(
                f"""
                INSERT INTO {SCHEMA}.user_sessions 
                (user_id, session_token, expires_at, created_at)
                VALUES (%s, %s, %s, NOW())
                RETURNING id
                """,
                (user['id'], token, expires_at)
            )
            
            conn.commit()
            
            return {
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'phone': user['phone'],
                    'role': user['role']
                },
                'token': token,
                'expires_at': expires_at.isoformat()
            }
    finally:
        conn.close()


def login_user(data: dict) -> dict:
    """Вход пользователя"""
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        raise ValueError('Email и пароль обязательны')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            password_hash = hash_password(password)
            
            cursor.execute(
                f"""
                SELECT id, email, name, phone, role, created_at
                FROM {SCHEMA}.users
                WHERE email = %s AND password_hash = %s
                """,
                (email, password_hash)
            )
            
            user = cursor.fetchone()
            
            if not user:
                raise ValueError('Неверный email или пароль')
            
            # Создание сессии
            token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            
            cursor.execute(
                f"""
                INSERT INTO {SCHEMA}.user_sessions 
                (user_id, session_token, expires_at, created_at)
                VALUES (%s, %s, %s, NOW())
                RETURNING id
                """,
                (user['id'], token, expires_at)
            )
            
            conn.commit()
            
            return {
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'phone': user['phone'],
                    'role': user['role']
                },
                'token': token,
                'expires_at': expires_at.isoformat()
            }
    finally:
        conn.close()


def logout_user(headers: dict) -> dict:
    """Выход пользователя"""
    token = headers.get('x-authorization', '').replace('Bearer ', '')
    
    if not token:
        raise ValueError('Токен не предоставлен')
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                f"DELETE FROM {SCHEMA}.user_sessions WHERE session_token = %s",
                (token,)
            )
            conn.commit()
            
            return {'message': 'Успешный выход'}
    finally:
        conn.close()


def get_current_user(headers: dict) -> dict:
    """Получение данных текущего пользователя"""
    token = headers.get('x-authorization', '').replace('Bearer ', '')
    
    if not token:
        raise ValueError('Токен не предоставлен')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                f"""
                SELECT u.id, u.email, u.name, u.phone, u.role, u.created_at
                FROM {SCHEMA}.users u
                JOIN {SCHEMA}.user_sessions s ON u.id = s.user_id
                WHERE s.session_token = %s AND s.expires_at > NOW()
                """,
                (token,)
            )
            
            user = cursor.fetchone()
            
            if not user:
                raise ValueError('Невалидный или истекший токен')
            
            return {
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'phone': user['phone'],
                    'role': user['role'],
                    'created_at': user['created_at'].isoformat() if user['created_at'] else None
                }
            }
    finally:
        conn.close()
