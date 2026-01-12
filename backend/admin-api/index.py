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
    cursor.execute("SELECT id, email, name, phone, telegram, role, is_active, created_at FROM users ORDER BY created_at DESC")
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

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
