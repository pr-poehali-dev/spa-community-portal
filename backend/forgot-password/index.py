import json
import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для запроса восстановления пароля'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        body = json.loads(body_str)
        email = body.get('email', '').strip().lower()

        if not email:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Email обязателен'}),
                'isBase64Encoded': False
            }

        # Подключение к БД
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        # Проверяем rate limiting
        ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
        one_hour_ago = datetime.now() - timedelta(hours=1)
        
        cur.execute(
            "SELECT COUNT(*) FROM password_reset_tokens WHERE ip_address = %s AND created_at > %s",
            (ip, one_hour_ago)
        )
        count = cur.fetchone()[0]
        
        if count >= 3:
            cur.close()
            conn.close()
            return {
                'statusCode': 429,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Слишком много попыток. Попробуйте через час'}),
                'isBase64Encoded': False
            }

        # Проверяем существование пользователя
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cur.fetchone()

        if user:
            user_id = user[0]
            
            # Генерируем токен
            token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(hours=1)
            
            # Сохраняем токен
            cur.execute(
                """INSERT INTO password_reset_tokens (user_id, token, expires_at, ip_address)
                   VALUES (%s, %s, %s, %s)""",
                (user_id, token, expires_at, ip)
            )
            conn.commit()
            
            # Отправляем письмо
            reset_url = f"https://preview--spa-community-portal.poehali.dev/reset-password?token={token}"
            send_reset_email(email, reset_url)

        cur.close()
        conn.close()

        # Всегда возвращаем успех (не раскрываем существование email)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Если email существует, письмо будет отправлено'}),
            'isBase64Encoded': False
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }


def send_reset_email(to_email: str, reset_url: str):
    '''Отправка письма для восстановления пароля'''
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    from_email = os.environ.get('SMTP_FROM', smtp_user)

    if not smtp_user or not smtp_password:
        raise ValueError('SMTP credentials not configured')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Восстановление пароля'
    msg['From'] = from_email
    msg['To'] = to_email

    text = f"""
Здравствуйте!

Вы запросили восстановление пароля на портале мастеров.

Перейдите по ссылке для создания нового пароля:
{reset_url}

Ссылка действительна в течение 1 часа.

Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
"""

    html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #ea580c; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
        }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Восстановление пароля</h2>
        <p>Здравствуйте!</p>
        <p>Вы запросили восстановление пароля на портале мастеров.</p>
        <p>Нажмите на кнопку ниже для создания нового пароля:</p>
        <a href="{reset_url}" class="button">Восстановить пароль</a>
        <p>Или скопируйте ссылку в браузер:</p>
        <p style="word-break: break-all; color: #666;">{reset_url}</p>
        <p>Ссылка действительна в течение 1 часа.</p>
        <div class="footer">
            <p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
        </div>
    </div>
</body>
</html>
"""

    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    msg.attach(part1)
    msg.attach(part2)

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)