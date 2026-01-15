"""API для управления ролями пользователей"""
import json
from datetime import datetime
from psycopg2.extras import RealDictCursor
from utils import get_db_connection, get_user_by_token


def handler(event: dict, context) -> dict:
    """
    API для работы с ролями пользователей
    
    Endpoints:
    - POST /apply - подать заявку на роль
    - GET /my - получить мои роли
    - GET /applications/my - получить мои заявки
    """
    method = event.get('httpMethod', 'GET')
    
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
        
        if method == 'POST' and path == 'apply':
            body = json.loads(event.get('body', '{}'))
            return apply_for_role(user, body, headers)
        
        elif method == 'GET' and path == 'my':
            return get_my_roles(user, headers)
        
        elif method == 'GET' and path == 'applications/my':
            return get_my_applications(user, headers)
        
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Endpoint не найден'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def apply_for_role(user: dict, body: dict, headers: dict) -> dict:
    """Подача заявки на роль"""
    role_type = body.get('role_type', '').strip()
    description = body.get('description', '').strip()
    
    valid_roles = ['organizer', 'master', 'partner', 'editor']
    
    if role_type not in valid_roles:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': f'Некорректная роль. Допустимые: {", ".join(valid_roles)}'}),
            'isBase64Encoded': False
        }
    
    if not description or len(description) < 20:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Описание должно содержать минимум 20 символов'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT id FROM t_p13705114_spa_community_portal.role_applications
                   WHERE user_id = %s AND role_type = %s AND status = 'pending'""",
                (user['id'], role_type)
            )
            existing = cur.fetchone()
            
            if existing:
                return {
                    'statusCode': 409,
                    'headers': headers,
                    'body': json.dumps({'error': 'У вас уже есть активная заявка на эту роль'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """SELECT id FROM t_p13705114_spa_community_portal.user_roles
                   WHERE user_id = %s AND role_type = %s AND status = 'approved'""",
                (user['id'], role_type)
            )
            has_role = cur.fetchone()
            
            if has_role:
                return {
                    'statusCode': 409,
                    'headers': headers,
                    'body': json.dumps({'error': 'У вас уже есть эта роль'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO t_p13705114_spa_community_portal.role_applications
                   (user_id, role_type, description, status, created_at)
                   VALUES (%s, %s, %s, 'pending', NOW())
                   RETURNING id, role_type, status, created_at""",
                (user['id'], role_type, description)
            )
            application = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({
                    'id': application['id'],
                    'role_type': application['role_type'],
                    'status': application['status'],
                    'created_at': application['created_at'].isoformat()
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()


def get_my_roles(user: dict, headers: dict) -> dict:
    """Получение моих ролей"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT role_type, level, status, approved_at, created_at
                   FROM t_p13705114_spa_community_portal.user_roles
                   WHERE user_id = %s
                   ORDER BY created_at DESC""",
                (user['id'],)
            )
            roles = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([
                    {
                        'role_type': r['role_type'],
                        'level': r['level'],
                        'status': r['status'],
                        'approved_at': r['approved_at'].isoformat() if r['approved_at'] else None,
                        'created_at': r['created_at'].isoformat() if r['created_at'] else None
                    }
                    for r in roles
                ]),
                'isBase64Encoded': False
            }
    finally:
        conn.close()


def get_my_applications(user: dict, headers: dict) -> dict:
    """Получение моих заявок"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT id, role_type, description, status, created_at, reviewed_at, rejection_reason
                   FROM t_p13705114_spa_community_portal.role_applications
                   WHERE user_id = %s
                   ORDER BY created_at DESC""",
                (user['id'],)
            )
            applications = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([
                    {
                        'id': a['id'],
                        'role_type': a['role_type'],
                        'description': a['description'],
                        'status': a['status'],
                        'created_at': a['created_at'].isoformat() if a['created_at'] else None,
                        'reviewed_at': a['reviewed_at'].isoformat() if a['reviewed_at'] else None,
                        'rejection_reason': a['rejection_reason']
                    }
                    for a in applications
                ]),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
