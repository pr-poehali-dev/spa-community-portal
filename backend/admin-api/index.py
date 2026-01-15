import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    """Создает подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: dict, context) -> dict:
    """
    Admin API для управления данными спарком.рф
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        query_params = event.get('queryStringParameters') or {}
        resource = query_params.get('resource', '')
        
        if method == 'GET':
            if resource == 'events':
                result = get_all_events(conn)
            elif resource == 'saunas':
                result = get_all_saunas(conn)
            elif resource == 'masters':
                result = get_all_masters(conn)
            elif resource == 'users':
                result = get_all_users(conn)
            elif resource == 'bookings':
                result = get_all_bookings(conn)
            elif resource == 'roles':
                user_id = query_params.get('user_id')
                result = get_user_roles(conn, user_id) if user_id else {'error': 'user_id required'}
            elif resource == 'role_applications':
                user_id = query_params.get('user_id')
                result = get_role_applications(conn, user_id)
            elif resource == 'stats':
                result = get_admin_stats(conn)
            else:
                result = {'error': 'Invalid resource'}
            
            conn.close()
            return response_json(result)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            if resource == 'events':
                result = create_event(conn, body)
            elif resource == 'saunas':
                result = create_sauna(conn, body)
            elif resource == 'masters':
                result = create_master(conn, body)
            elif resource == 'users':
                result = create_user(conn, body)
            elif resource == 'role_application':
                result = create_role_application(conn, body)
            else:
                result = {'error': 'Invalid resource'}
            
            conn.close()
            return response_json(result)
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            item_id = query_params.get('id')
            
            if not item_id:
                return response_json({'error': 'Missing ID'}, 400)
            
            if resource == 'events':
                result = update_event(conn, item_id, body)
            elif resource == 'saunas':
                result = update_sauna(conn, item_id, body)
            elif resource == 'masters':
                result = update_master(conn, item_id, body)
            elif resource == 'users':
                result = update_user(conn, item_id, body)
            elif resource == 'bookings':
                result = update_booking(conn, item_id, body)
            elif resource == 'role_application':
                result = review_role_application(conn, item_id, body)
            else:
                result = {'error': 'Invalid resource'}
            
            conn.close()
            return response_json(result)
        
        elif method == 'DELETE':
            item_id = query_params.get('id')
            
            if not item_id:
                return response_json({'error': 'Missing ID'}, 400)
            
            if resource == 'events':
                result = delete_event(conn, item_id)
            elif resource == 'saunas':
                result = delete_sauna(conn, item_id)
            elif resource == 'masters':
                result = delete_master(conn, item_id)
            elif resource == 'users':
                result = delete_user(conn, item_id)
            elif resource == 'bookings':
                result = delete_booking(conn, item_id)
            else:
                result = {'error': 'Invalid resource'}
            
            conn.close()
            return response_json(result)
        
        return response_json({'error': 'Method not allowed'}, 405)
        
    except Exception as e:
        return response_json({'error': str(e)}, 500)

def response_json(data, status=200):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, default=str, ensure_ascii=False),
        'isBase64Encoded': False
    }

def get_all_events(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY date DESC")
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def create_event(conn, data):
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO events (slug, title, description, date, time, location, type, 
           price, available_spots, total_spots, image_url, program, rules)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (data.get('slug'), data.get('title'), data.get('description'),
         data.get('date'), data.get('time'), data.get('location'), data.get('type'),
         data.get('price'), data.get('total_spots'), data.get('total_spots'),
         data.get('image_url'), json.dumps(data.get('program', [])),
         json.dumps(data.get('rules', [])))
    )
    event_id = cursor.fetchone()['id']
    conn.commit()
    cursor.close()
    return {'success': True, 'id': event_id}

def update_event(conn, event_id, data):
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE events SET title=%s, description=%s, date=%s, time=%s, location=%s,
           type=%s, price=%s, total_spots=%s, image_url=%s, program=%s, rules=%s,
           updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
        (data.get('title'), data.get('description'), data.get('date'), data.get('time'),
         data.get('location'), data.get('type'), data.get('price'), data.get('total_spots'),
         data.get('image_url'), json.dumps(data.get('program', [])),
         json.dumps(data.get('rules', [])), event_id)
    )
    conn.commit()
    cursor.close()
    return {'success': True}

def delete_event(conn, event_id):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE id=%s", (event_id,))
    conn.commit()
    cursor.close()
    return {'success': True}

def get_all_saunas(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM baths ORDER BY name")
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def create_sauna(conn, data):
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO baths (slug, name, address, description, capacity, 
           price_per_hour, features, images)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (data.get('slug'), data.get('name'), data.get('address'), data.get('description'),
         data.get('capacity'), data.get('price_per_hour'),
         json.dumps(data.get('features', [])), json.dumps(data.get('images', [])))
    )
    sauna_id = cursor.fetchone()['id']
    conn.commit()
    cursor.close()
    return {'success': True, 'id': sauna_id}

def update_sauna(conn, sauna_id, data):
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE baths SET name=%s, address=%s, description=%s, capacity=%s,
           price_per_hour=%s, features=%s, images=%s, updated_at=CURRENT_TIMESTAMP
           WHERE id=%s""",
        (data.get('name'), data.get('address'), data.get('description'),
         data.get('capacity'), data.get('price_per_hour'),
         json.dumps(data.get('features', [])), json.dumps(data.get('images', [])),
         sauna_id)
    )
    conn.commit()
    cursor.close()
    return {'success': True}

def delete_sauna(conn, sauna_id):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM baths WHERE id=%s", (sauna_id,))
    conn.commit()
    cursor.close()
    return {'success': True}

def get_all_masters(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM masters ORDER BY name")
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def create_master(conn, data):
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO masters (slug, name, specialization, experience, description,
           avatar_url, services) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (data.get('slug'), data.get('name'), data.get('specialization'),
         data.get('experience'), data.get('description'), data.get('avatar_url'),
         json.dumps(data.get('services', [])))
    )
    master_id = cursor.fetchone()['id']
    conn.commit()
    cursor.close()
    return {'success': True, 'id': master_id}

def update_master(conn, master_id, data):
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE masters SET name=%s, specialization=%s, experience=%s, description=%s,
           avatar_url=%s, services=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
        (data.get('name'), data.get('specialization'), data.get('experience'),
         data.get('description'), data.get('avatar_url'),
         json.dumps(data.get('services', [])), master_id)
    )
    conn.commit()
    cursor.close()
    return {'success': True}

def delete_master(conn, master_id):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM masters WHERE id=%s", (master_id,))
    conn.commit()
    cursor.close()
    return {'success': True}

def get_all_users(conn):
    cursor = conn.cursor()
    cursor.execute(
        """SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, u.is_active,
           COUNT(DISTINCT ur.id) as roles_count
           FROM t_p13705114_spa_community_portal.users u
           LEFT JOIN t_p13705114_spa_community_portal.user_roles ur ON u.id = ur.user_id
           GROUP BY u.id
           ORDER BY u.created_at DESC LIMIT 100"""
    )
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def get_admin_stats(conn):
    cursor = conn.cursor()
    cursor.execute(
        """SELECT 
            (SELECT COUNT(*) FROM t_p13705114_spa_community_portal.users WHERE is_active = true) as active_users,
            (SELECT COUNT(*) FROM t_p13705114_spa_community_portal.role_applications WHERE status = 'pending') as pending_applications,
            (SELECT COUNT(*) FROM t_p13705114_spa_community_portal.user_roles WHERE status = 'approved') as approved_roles,
            (SELECT COUNT(*) FROM t_p13705114_spa_community_portal.events) as total_events,
            (SELECT COUNT(*) FROM t_p13705114_spa_community_portal.bookings) as total_bookings"""
    )
    result = cursor.fetchone()
    cursor.close()
    return dict(result)

def create_user(conn, data):
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO users (email, password_hash, name, phone, telegram, role)
           VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
        (data.get('email'), data.get('password_hash', ''), data.get('name'),
         data.get('phone'), data.get('telegram'), data.get('role', 'participant'))
    )
    user_id = cursor.fetchone()['id']
    conn.commit()
    cursor.close()
    return {'success': True, 'id': user_id}

def update_user(conn, user_id, data):
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE users SET name=%s, phone=%s, telegram=%s, role=%s, is_active=%s,
           updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
        (data.get('name'), data.get('phone'), data.get('telegram'),
         data.get('role'), data.get('is_active'), user_id)
    )
    conn.commit()
    cursor.close()
    return {'success': True}

def delete_user(conn, user_id):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
    conn.commit()
    cursor.close()
    return {'success': True}

def get_all_bookings(conn):
    cursor = conn.cursor()
    cursor.execute(
        """SELECT b.*, e.title as event_title, u.email as user_email, u.name as user_name
           FROM bookings b 
           LEFT JOIN events e ON b.event_id = e.id
           LEFT JOIN users u ON b.user_id = u.id
           ORDER BY b.created_at DESC"""
    )
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def update_booking(conn, booking_id, data):
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE bookings SET status=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
        (data.get('status'), booking_id)
    )
    conn.commit()
    cursor.close()
    return {'success': True}

def delete_booking(conn, booking_id):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bookings WHERE id=%s", (booking_id,))
    conn.commit()
    cursor.close()
    return {'success': True}

def get_user_roles(conn, user_id):
    cursor = conn.cursor()
    cursor.execute(
        """SELECT ur.*, 
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
        WHERE ur.user_id = %s""",
        (user_id,)
    )
    roles = cursor.fetchall()
    cursor.execute("SELECT * FROM user_reputation WHERE user_id = %s", (user_id,))
    reputation = cursor.fetchone()
    cursor.close()
    return {
        'roles': [dict(r) for r in roles],
        'reputation': dict(reputation) if reputation else None
    }

def get_role_applications(conn, user_id=None):
    cursor = conn.cursor()
    if user_id:
        cursor.execute(
            """SELECT ra.*, u.first_name, u.last_name, u.email
               FROM t_p13705114_spa_community_portal.role_applications ra
               JOIN t_p13705114_spa_community_portal.users u ON ra.user_id = u.id
               WHERE ra.user_id = %s
               ORDER BY ra.created_at DESC""",
            (user_id,)
        )
    else:
        cursor.execute(
            """SELECT ra.*, u.first_name, u.last_name, u.email
               FROM t_p13705114_spa_community_portal.role_applications ra
               JOIN t_p13705114_spa_community_portal.users u ON ra.user_id = u.id
               ORDER BY ra.created_at DESC"""
        )
    result = cursor.fetchall()
    cursor.close()
    return [dict(r) for r in result]

def create_role_application(conn, data):
    cursor = conn.cursor()
    user_id = data.get('user_id')
    role_type = data.get('role_type')
    application_data = data.get('application_data', {})
    
    cursor.execute(
        "SELECT id FROM role_applications WHERE user_id = %s AND role_type = %s AND status = 'pending'",
        (user_id, role_type)
    )
    if cursor.fetchone():
        cursor.close()
        return {'error': 'Application already exists'}
    
    cursor.execute(
        """INSERT INTO role_applications (user_id, role_type, application_data, status)
           VALUES (%s, %s, %s, 'pending') RETURNING id, created_at""",
        (user_id, role_type, json.dumps(application_data))
    )
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    return {'success': True, 'id': result['id'], 'created_at': str(result['created_at'])}

def review_role_application(conn, app_id, data):
    cursor = conn.cursor()
    status = data.get('status')
    rejection_reason = data.get('rejection_reason')
    
    if status not in ['approved', 'rejected']:
        cursor.close()
        return {'error': 'Invalid status'}
    
    cursor.execute(
        "SELECT * FROM t_p13705114_spa_community_portal.role_applications WHERE id = %s",
        (app_id,)
    )
    application = cursor.fetchone()
    
    if not application:
        cursor.close()
        return {'error': 'Application not found'}
    
    if application['status'] != 'pending':
        cursor.close()
        return {'error': 'Application already reviewed'}
    
    if status == 'approved':
        cursor.execute(
            """INSERT INTO t_p13705114_spa_community_portal.user_roles
               (user_id, role_type, level, status, approved_at, created_at)
               VALUES (%s, %s, 1, 'approved', NOW(), NOW())""",
            (application['user_id'], application['role_type'])
        )
        
    
    cursor.execute(
        """UPDATE t_p13705114_spa_community_portal.role_applications
           SET status = %s, reviewed_at = NOW(), rejection_reason = %s
           WHERE id = %s""",
        (status, rejection_reason if status == 'rejected' else None, app_id)
    )
    
    conn.commit()
    cursor.close()
    return {'success': True}