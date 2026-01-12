"""API для авторизации и управления пользователями"""
import json
import os
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def create_session(user_id: int) -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=30)
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO t_p13705114_spa_community_portal.user_sessions 
                   (user_id, session_token, expires_at) 
                   VALUES (%s, %s, %s)""",
                (user_id, token, expires_at)
            )
            conn.commit()
    finally:
        conn.close()
    
    return token, expires_at

def get_user_by_token(token: str) -> dict | None:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.* FROM t_p13705114_spa_community_portal.users u
                   JOIN t_p13705114_spa_community_portal.user_sessions s ON u.id = s.user_id
                   WHERE s.session_token = %s AND s.expires_at > NOW() AND u.is_active = true""",
                (token,)
            )
            user = cur.fetchone()
            return dict(user) if user else None
    finally:
        conn.close()

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'login':
                email = body.get('email', '').strip().lower()
                password = body.get('password', '')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Email и пароль обязательны'})
                    }
                
                conn = get_db_connection()
                try:
                    with conn.cursor(cursor_factory=RealDictCursor) as cur:
                        cur.execute(
                            """SELECT * FROM t_p13705114_spa_community_portal.users 
                               WHERE email = %s AND is_active = true""",
                            (email,)
                        )
                        user = cur.fetchone()
                        
                        if not user or not verify_password(password, user['password_hash']):
                            return {
                                'statusCode': 401,
                                'headers': headers,
                                'body': json.dumps({'error': 'Неверный email или пароль'})
                            }
                        
                        token, expires_at = create_session(user['id'])
                        
                        user_data = dict(user)
                        del user_data['password_hash']
                        
                        return {
                            'statusCode': 200,
                            'headers': headers,
                            'body': json.dumps({
                                'token': token,
                                'expires_at': expires_at.isoformat(),
                                'user': user_data
                            })
                        }
                finally:
                    conn.close()
            
            elif action == 'register':
                email = body.get('email', '').strip().lower()
                password = body.get('password', '')
                name = body.get('name', '').strip()
                phone = body.get('phone', '').strip()
                telegram = body.get('telegram', '').strip()
                
                if not email or not password or not name:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Email, пароль и имя обязательны'})
                    }
                
                if len(password) < 6:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})
                    }
                
                conn = get_db_connection()
                try:
                    with conn.cursor(cursor_factory=RealDictCursor) as cur:
                        cur.execute(
                            """SELECT id FROM t_p13705114_spa_community_portal.users WHERE email = %s""",
                            (email,)
                        )
                        if cur.fetchone():
                            return {
                                'statusCode': 409,
                                'headers': headers,
                                'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
                            }
                        
                        password_hash = hash_password(password)
                        cur.execute(
                            """INSERT INTO t_p13705114_spa_community_portal.users 
                               (email, password_hash, name, phone, telegram, role) 
                               VALUES (%s, %s, %s, %s, %s, 'participant') 
                               RETURNING id, email, name, phone, telegram, role, avatar_url, created_at""",
                            (email, password_hash, name, phone or None, telegram or None)
                        )
                        conn.commit()
                        user = cur.fetchone()
                        
                        token, expires_at = create_session(user['id'])
                        user_data = dict(user)
                        
                        return {
                            'statusCode': 201,
                            'headers': headers,
                            'body': json.dumps({
                                'token': token,
                                'expires_at': expires_at.isoformat(),
                                'user': {
                                    'id': user_data['id'],
                                    'email': user_data['email'],
                                    'name': user_data['name'],
                                    'phone': user_data.get('phone'),
                                    'telegram': user_data.get('telegram'),
                                    'role': user_data['role'],
                                    'avatar_url': user_data.get('avatar_url')
                                }
                            })
                        }
                finally:
                    conn.close()
            
            elif action == 'logout':
                auth_header = event.get('headers', {}).get('Authorization', '')
                token = auth_header.replace('Bearer ', '')
                
                if token:
                    conn = get_db_connection()
                    try:
                        with conn.cursor() as cur:
                            cur.execute(
                                """UPDATE t_p13705114_spa_community_portal.user_sessions 
                                   SET expires_at = NOW() WHERE session_token = %s""",
                                (token,)
                            )
                            conn.commit()
                    finally:
                        conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'GET':
            auth_header = event.get('headers', {}).get('Authorization', '')
            token = auth_header.replace('Bearer ', '')
            
            if not token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Не авторизован'})
                }
            
            user = get_user_by_token(token)
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Сессия истекла'})
                }
            
            del user['password_hash']
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'user': user})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }