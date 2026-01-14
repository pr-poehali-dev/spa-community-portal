"""API для управления ролями пользователей"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    """Создание подключения к БД"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def handler(event: dict, context) -> dict:
    """API для работы с системой ролей"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('params', {}).get('path', '')
    
    try:
        # GET /roles/{user_id} - получить все роли пользователя
        if method == 'GET' and path.startswith('user/'):
            user_id = int(path.split('/')[-1])
            return get_user_roles(user_id)
        
        # POST /roles/apply - подать заявку на роль
        elif method == 'POST' and path == 'apply':
            body = json.loads(event.get('body', '{}'))
            return apply_for_role(body)
        
        # GET /roles/applications/{user_id} - заявки пользователя
        elif method == 'GET' and path.startswith('applications/'):
            user_id = int(path.split('/')[-1])
            return get_user_applications(user_id)
        
        # PUT /roles/applications/{id}/review - рассмотреть заявку (для админа)
        elif method == 'PUT' and 'review' in path:
            app_id = int(path.split('/')[-2])
            body = json.loads(event.get('body', '{}'))
            return review_application(app_id, body)
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_user_roles(user_id: int) -> dict:
    """Получить все роли пользователя"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
        SELECT ur.*, 
               CASE ur.role_type
                   WHEN 'organizer' THEN row_to_json(ol.*)
                   WHEN 'master' THEN row_to_json(ml.*)
                   WHEN 'editor' THEN row_to_json(el.*)
                   ELSE NULL
               END as level_data
        FROM user_roles ur
        LEFT JOIN organizer_levels ol ON ol.user_id = ur.user_id AND ur.role_type = 'organizer'
        LEFT JOIN master_levels ml ON ml.user_id = ur.user_id AND ur.role_type = 'master'
        LEFT JOIN editor_levels el ON el.user_id = ur.user_id AND ur.role_type = 'editor'
        WHERE ur.user_id = %s
    """
    
    cur.execute(query, (user_id,))
    roles = cur.fetchall()
    
    # Получить репутацию
    cur.execute("SELECT * FROM user_reputation WHERE user_id = %s", (user_id,))
    reputation = cur.fetchone()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'roles': [dict(r) for r in roles],
            'reputation': dict(reputation) if reputation else None
        }, default=str),
        'isBase64Encoded': False
    }

def apply_for_role(data: dict) -> dict:
    """Подать заявку на роль"""
    user_id = data.get('user_id')
    role_type = data.get('role_type')
    application_data = data.get('application_data', {})
    
    if not user_id or not role_type:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id and role_type are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Проверить, есть ли уже заявка
    cur.execute(
        "SELECT id FROM role_applications WHERE user_id = %s AND role_type = %s AND status = 'pending'",
        (user_id, role_type)
    )
    
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Application already exists'}),
            'isBase64Encoded': False
        }
    
    # Создать заявку
    cur.execute(
        """
        INSERT INTO role_applications (user_id, role_type, application_data, status)
        VALUES (%s, %s, %s, 'pending')
        RETURNING id, created_at
        """,
        (user_id, role_type, json.dumps(application_data))
    )
    
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'id': result['id'],
            'created_at': str(result['created_at'])
        }),
        'isBase64Encoded': False
    }

def get_user_applications(user_id: int) -> dict:
    """Получить все заявки пользователя"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        """
        SELECT ra.*, u.name as reviewer_name
        FROM role_applications ra
        LEFT JOIN users u ON u.id = ra.reviewer_id
        WHERE ra.user_id = %s
        ORDER BY ra.created_at DESC
        """,
        (user_id,)
    )
    
    applications = cur.fetchall()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps([dict(a) for a in applications], default=str),
        'isBase64Encoded': False
    }

def review_application(app_id: int, data: dict) -> dict:
    """Рассмотреть заявку (для админа)"""
    reviewer_id = data.get('reviewer_id')
    status = data.get('status')  # approved / rejected
    notes = data.get('notes', '')
    
    if not reviewer_id or not status:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'reviewer_id and status are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Получить заявку
    cur.execute("SELECT * FROM role_applications WHERE id = %s", (app_id,))
    application = cur.fetchone()
    
    if not application:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Application not found'}),
            'isBase64Encoded': False
        }
    
    # Обновить статус заявки
    cur.execute(
        """
        UPDATE role_applications
        SET status = %s, reviewer_id = %s, reviewer_notes = %s, updated_at = NOW()
        WHERE id = %s
        """,
        (status, reviewer_id, notes, app_id)
    )
    
    # Если одобрено - создать роль
    if status == 'approved':
        cur.execute(
            """
            INSERT INTO user_roles (user_id, role_type, status, granted_at)
            VALUES (%s, %s, 'active', NOW())
            ON CONFLICT (user_id, role_type) DO NOTHING
            """,
            (application['user_id'], application['role_type'])
        )
        
        # Создать запись уровня в зависимости от типа роли
        if application['role_type'] == 'organizer':
            cur.execute(
                "INSERT INTO organizer_levels (user_id) VALUES (%s) ON CONFLICT DO NOTHING",
                (application['user_id'],)
            )
        elif application['role_type'] == 'master':
            cur.execute(
                "INSERT INTO master_levels (user_id) VALUES (%s) ON CONFLICT DO NOTHING",
                (application['user_id'],)
            )
        elif application['role_type'] == 'editor':
            cur.execute(
                "INSERT INTO editor_levels (user_id) VALUES (%s) ON CONFLICT DO NOTHING",
                (application['user_id'],)
            )
        
        # Создать запись репутации если её нет
        cur.execute(
            "INSERT INTO user_reputation (user_id) VALUES (%s) ON CONFLICT DO NOTHING",
            (application['user_id'],)
        )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }
