"""API для управления профилями пользователей"""
import json
from psycopg2.extras import RealDictCursor
from utils import get_db_connection, get_user_by_token


def handler(event: dict, context) -> dict:
    """
    API для работы с профилями пользователей
    
    Endpoints:
    - GET /me - получить данные текущего пользователя
    - PUT /me - обновить данные профиля
    - GET /{user_id} - получить публичный профиль пользователя
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
        auth_header = event.get('headers', {}).get('X-Authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        access_token = auth_header.replace('Bearer ', '').strip()
        user = get_user_by_token(access_token)
        
        if not user:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Невалидный токен'}),
                'isBase64Encoded': False
            }
        
        path = event.get('pathParameters', {}).get('proxy', '')
        
        if method == 'GET':
            if path == 'me' or path == '':
                return get_current_user(user, headers)
            else:
                try:
                    user_id = int(path)
                    return get_public_profile(user_id, headers)
                except ValueError:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Некорректный ID пользователя'}),
                        'isBase64Encoded': False
                    }
        
        elif method == 'PUT':
            if path == 'me' or path == '':
                body = json.loads(event.get('body', '{}'))
                return update_current_user(user, body, headers)
            else:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Можно редактировать только свой профиль'}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_current_user(user: dict, headers: dict) -> dict:
    """Получение полных данных текущего пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT 
                    u.id, u.email, u.phone, u.first_name, u.last_name, 
                    u.created_at, u.is_active,
                    ur.reputation_score, ur.reviews_count
                FROM t_p13705114_spa_community_portal.users u
                LEFT JOIN t_p13705114_spa_community_portal.user_reputation ur ON u.id = ur.user_id
                WHERE u.id = %s""",
                (user['id'],)
            )
            profile = cur.fetchone()
            
            if not profile:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пользователь не найден'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """SELECT role_type, level, status, approved_at
                FROM t_p13705114_spa_community_portal.user_roles
                WHERE user_id = %s""",
                (user['id'],)
            )
            roles = [dict(row) for row in cur.fetchall()]
            
            user_data = {
                'id': profile['id'],
                'email': profile['email'],
                'phone': profile['phone'],
                'first_name': profile['first_name'],
                'last_name': profile['last_name'],
                'created_at': profile['created_at'].isoformat() if profile['created_at'] else None,
                'is_active': profile['is_active'],
                'reputation': {
                    'score': profile['reputation_score'] or 0,
                    'reviews_count': profile['reviews_count'] or 0
                },
                'roles': [
                    {
                        'role_type': r['role_type'],
                        'level': r['level'],
                        'status': r['status'],
                        'approved_at': r['approved_at'].isoformat() if r['approved_at'] else None
                    }
                    for r in roles
                ]
            }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(user_data),
                'isBase64Encoded': False
            }
    finally:
        conn.close()


def update_current_user(user: dict, body: dict, headers: dict) -> dict:
    """Обновление данных профиля"""
    first_name = body.get('first_name', '').strip()
    last_name = body.get('last_name', '').strip()
    phone = body.get('phone', '').strip()
    
    if not first_name or not last_name:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Имя и фамилия обязательны'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """UPDATE t_p13705114_spa_community_portal.users
                   SET first_name = %s, last_name = %s, phone = %s
                   WHERE id = %s
                   RETURNING id, email, phone, first_name, last_name, created_at""",
                (first_name, last_name, phone, user['id'])
            )
            updated_user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'id': updated_user['id'],
                    'email': updated_user['email'],
                    'phone': updated_user['phone'],
                    'first_name': updated_user['first_name'],
                    'last_name': updated_user['last_name'],
                    'created_at': updated_user['created_at'].isoformat() if updated_user['created_at'] else None
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()


def get_public_profile(user_id: int, headers: dict) -> dict:
    """Получение публичного профиля пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT 
                    u.id, u.first_name, u.last_name, u.created_at,
                    ur.reputation_score, ur.reviews_count
                FROM t_p13705114_spa_community_portal.users u
                LEFT JOIN t_p13705114_spa_community_portal.user_reputation ur ON u.id = ur.user_id
                WHERE u.id = %s AND u.is_active = true""",
                (user_id,)
            )
            profile = cur.fetchone()
            
            if not profile:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пользователь не найден'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """SELECT role_type, level, status
                FROM t_p13705114_spa_community_portal.user_roles
                WHERE user_id = %s AND status = 'approved'""",
                (user_id,)
            )
            roles = [dict(row) for row in cur.fetchall()]
            
            public_data = {
                'id': profile['id'],
                'first_name': profile['first_name'],
                'last_name': profile['last_name'],
                'created_at': profile['created_at'].isoformat() if profile['created_at'] else None,
                'reputation': {
                    'score': profile['reputation_score'] or 0,
                    'reviews_count': profile['reviews_count'] or 0
                },
                'roles': [
                    {
                        'role_type': r['role_type'],
                        'level': r['level']
                    }
                    for r in roles
                ]
            }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(public_data),
                'isBase64Encoded': False
            }
    finally:
        conn.close()