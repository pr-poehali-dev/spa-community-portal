"""API для авторизации и управления пользователями"""
import json
import os
from datetime import datetime, timedelta
from psycopg2.extras import RealDictCursor
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from utils import (
    get_db_connection,
    hash_password,
    verify_password,
    create_tokens,
    get_user_by_token,
    refresh_access_token,
    revoke_token,
    check_rate_limit,
    get_client_ip,
    generate_token
)


def send_reset_email(email: str, token: str):
    """Отправка письма с токеном восстановления пароля"""
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    site_url = os.environ.get('SITE_URL', 'http://localhost:5173')
    
    if not all([smtp_host, smtp_user, smtp_password]):
        raise ValueError('SMTP настройки не заданы')
    
    reset_url = f"{site_url}/reset-password?token={token}"
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Восстановление пароля'
    msg['From'] = smtp_user
    msg['To'] = email
    
    text = f"""Здравствуйте!

Вы запросили восстановление пароля.
Перейдите по ссылке для создания нового пароля:

{reset_url}

Ссылка действительна 1 час.
Если вы не запрашивали восстановление пароля, проигнорируйте это письмо."""
    
    html = f"""<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Восстановление пароля</h2>
    <p>Здравствуйте!</p>
    <p>Вы запросили восстановление пароля.</p>
    <p>Перейдите по ссылке для создания нового пароля:</p>
    <p><a href="{reset_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Восстановить пароль</a></p>
    <p style="color: #666; font-size: 14px;">Ссылка действительна 1 час.</p>
    <p style="color: #666; font-size: 14px;">Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
</body>
</html>"""
    
    msg.attach(MIMEText(text, 'plain'))
    msg.attach(MIMEText(html, 'html'))
    
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


def handler(event: dict, context) -> dict:
    """
    Обработчик авторизации и регистрации пользователей
    
    Endpoints:
    - POST /login - вход (email + password)
    - POST /register - регистрация
    - POST /refresh - обновление access токена
    - POST /logout - выход (отзыв токенов)
    - POST /reset-password - запрос на сброс пароля
    - POST /confirm-reset - подтверждение сброса пароля
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'login':
            return handle_login(event, body, headers)
        elif action == 'register':
            return handle_register(event, body, headers)
        elif action == 'refresh':
            return handle_refresh(body, headers)
        elif action == 'logout':
            return handle_logout(event, headers)
        elif action == 'reset-password':
            return handle_reset_password(event, body, headers)
        elif action == 'confirm-reset':
            return handle_confirm_reset(body, headers)
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def handle_login(event: dict, body: dict, headers: dict) -> dict:
    """Обработка входа"""
    client_ip = get_client_ip(event)
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    allowed, wait_minutes = check_rate_limit(client_ip, 'login', max_attempts=5, window_minutes=15)
    if not allowed:
        return {
            'statusCode': 429,
            'headers': headers,
            'body': json.dumps({
                'error': f'Слишком много попыток входа. Попробуйте через {wait_minutes} мин.'
            }),
            'isBase64Encoded': False
        }
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Email и пароль обязательны'}),
            'isBase64Encoded': False
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
                    'body': json.dumps({'error': 'Неверный email или пароль'}),
                    'isBase64Encoded': False
                }
            
            access_token, refresh_token, access_exp, refresh_exp = create_tokens(user['id'])
            
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'phone': user['phone'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'created_at': user['created_at'].isoformat() if user['created_at'] else None
            }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'expires_in': 3600,
                    'user': user_data
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()


def handle_register(event: dict, body: dict, headers: dict) -> dict:
    """Обработка регистрации"""
    client_ip = get_client_ip(event)
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    phone = body.get('phone', '').strip()
    first_name = body.get('first_name', '').strip()
    last_name = body.get('last_name', '').strip()
    
    allowed, wait_minutes = check_rate_limit(client_ip, 'register', max_attempts=3, window_minutes=60)
    if not allowed:
        return {
            'statusCode': 429,
            'headers': headers,
            'body': json.dumps({
                'error': f'Слишком много попыток регистрации. Попробуйте через {wait_minutes} мин.'
            }),
            'isBase64Encoded': False
        }
    
    if not all([email, password, first_name, last_name]):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Все поля обязательны'}),
            'isBase64Encoded': False
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'}),
            'isBase64Encoded': False
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
                    'body': json.dumps({'error': 'Email уже зарегистрирован'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                """INSERT INTO t_p13705114_spa_community_portal.users 
                   (email, password_hash, phone, first_name, last_name, is_active) 
                   VALUES (%s, %s, %s, %s, %s, true) RETURNING id, email, phone, first_name, last_name, created_at""",
                (email, password_hash, phone, first_name, last_name)
            )
            user = cur.fetchone()
            conn.commit()
            
            access_token, refresh_token, access_exp, refresh_exp = create_tokens(user['id'])
            
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'phone': user['phone'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'created_at': user['created_at'].isoformat() if user['created_at'] else None
            }
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'expires_in': 3600,
                    'user': user_data
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()


def handle_refresh(body: dict, headers: dict) -> dict:
    """Обновление access токена"""
    refresh_token = body.get('refresh_token')
    
    if not refresh_token:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Refresh token обязателен'}),
            'isBase64Encoded': False
        }
    
    result = refresh_access_token(refresh_token)
    
    if not result:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Невалидный refresh token'}),
            'isBase64Encoded': False
        }
    
    new_access_token, expires_at = result
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'access_token': new_access_token,
            'expires_in': 3600
        }),
        'isBase64Encoded': False
    }


def handle_logout(event: dict, headers: dict) -> dict:
    """Выход (отзыв токенов)"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    access_token = auth_header.replace('Bearer ', '').strip()
    
    revoked = revoke_token(access_token, token_type='access')
    
    if revoked:
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Вы вышли из системы'}),
            'isBase64Encoded': False
        }
    else:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Сессия не найдена'}),
            'isBase64Encoded': False
        }


def handle_reset_password(event: dict, body: dict, headers: dict) -> dict:
    """Запрос на сброс пароля"""
    client_ip = get_client_ip(event)
    email = body.get('email', '').strip().lower()
    
    allowed, wait_minutes = check_rate_limit(client_ip, 'reset-password', max_attempts=3, window_minutes=60)
    if not allowed:
        return {
            'statusCode': 429,
            'headers': headers,
            'body': json.dumps({
                'error': f'Слишком много попыток. Попробуйте через {wait_minutes} мин.'
            }),
            'isBase64Encoded': False
        }
    
    if not email:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Email обязателен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT id FROM t_p13705114_spa_community_portal.users 
                   WHERE email = %s AND is_active = true""",
                (email,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': 'Если email существует, письмо отправлено'}),
                    'isBase64Encoded': False
                }
            
            token = generate_token(32)
            expires_at = datetime.now() + timedelta(hours=1)
            
            cur.execute(
                """INSERT INTO t_p13705114_spa_community_portal.password_reset_tokens 
                   (user_id, token, expires_at) VALUES (%s, %s, %s)""",
                (user['id'], token, expires_at)
            )
            conn.commit()
            
            try:
                send_reset_email(email, token)
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': f'Ошибка отправки письма: {str(e)}'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Письмо с инструкциями отправлено'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()


def handle_confirm_reset(body: dict, headers: dict) -> dict:
    """Подтверждение сброса пароля"""
    token = body.get('token', '').strip()
    new_password = body.get('new_password', '')
    
    if not token or not new_password:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Токен и новый пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    if len(new_password) < 6:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT user_id FROM t_p13705114_spa_community_portal.password_reset_tokens 
                   WHERE token = %s AND expires_at > NOW() AND used_at IS NULL""",
                (token,)
            )
            reset_token = cur.fetchone()
            
            if not reset_token:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Невалидный или истёкший токен'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(new_password)
            
            cur.execute(
                """UPDATE t_p13705114_spa_community_portal.users 
                   SET password_hash = %s WHERE id = %s""",
                (password_hash, reset_token['user_id'])
            )
            
            cur.execute(
                """UPDATE t_p13705114_spa_community_portal.password_reset_tokens 
                   SET used_at = NOW() WHERE token = %s""",
                (token,)
            )
            
            cur.execute(
                """DELETE FROM t_p13705114_spa_community_portal.user_sessions 
                   WHERE user_id = %s""",
                (reset_token['user_id'],)
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Пароль успешно изменён'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
