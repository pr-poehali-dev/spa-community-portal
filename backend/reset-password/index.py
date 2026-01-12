import json
import os
import hashlib
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для установки нового пароля по токену'''
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
        body = json.loads(event.get('body', '{}'))
        token = body.get('token', '').strip()
        new_password = body.get('password', '')

        if not token or not new_password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Токен и пароль обязательны'}),
                'isBase64Encoded': False
            }

        if len(new_password) < 6:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'}),
                'isBase64Encoded': False
            }

        # Подключение к БД
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        # Проверяем токен
        cur.execute(
            """SELECT user_id, used_at FROM password_reset_tokens 
               WHERE token = %s AND expires_at > %s""",
            (token, datetime.now())
        )
        result = cur.fetchone()

        if not result:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недействительный или истекший токен'}),
                'isBase64Encoded': False
            }

        user_id, used_at = result

        if used_at:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Токен уже использован'}),
                'isBase64Encoded': False
            }

        # Хешируем новый пароль
        password_hash = hashlib.sha256(new_password.encode()).hexdigest()

        # Обновляем пароль
        cur.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (password_hash, user_id)
        )

        # Помечаем токен как использованный
        cur.execute(
            "UPDATE password_reset_tokens SET used_at = %s WHERE token = %s",
            (datetime.now(), token)
        )

        # Удаляем все сессии пользователя для безопасности
        cur.execute("DELETE FROM sessions WHERE user_id = %s", (user_id,))

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Пароль успешно изменен'}),
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
