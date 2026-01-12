import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: dict, context) -> dict:
    """
    API для работы с данными спарком.рф
    """
    method = event.get('httpMethod', 'GET')
    path = event.get('requestContext', {}).get('http', {}).get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            resource = query_params.get('resource', '')
            slug = query_params.get('slug', '')
            event_type = query_params.get('type', '')
            category = query_params.get('category', '')
            
            if resource == 'events':
                result = get_events(conn, event_type, slug)
            elif resource == 'baths':
                result = get_baths(conn, slug)
            elif resource == 'masters':
                result = get_masters(conn, slug)
            elif resource == 'blog':
                result = get_blog_posts(conn, category, slug)
            else:
                result = {'error': 'Invalid resource'}
            
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'create_booking':
                result = create_booking(conn, body)
            else:
                result = {'error': 'Invalid action'}
            
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }

def get_events(conn, event_type='', slug=''):
    """Получить список событий или одно событие по slug"""
    cursor = conn.cursor()
    
    if slug:
        cursor.execute(
            "SELECT * FROM events WHERE slug = %s",
            (slug,)
        )
        result = cursor.fetchone()
        cursor.close()
        return dict(result) if result else None
    
    if event_type and event_type != 'all':
        cursor.execute(
            "SELECT * FROM events WHERE type = %s ORDER BY date ASC",
            (event_type,)
        )
    else:
        cursor.execute("SELECT * FROM events ORDER BY date ASC")
    
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def get_baths(conn, slug=''):
    """Получить список бань или одну баню по slug"""
    cursor = conn.cursor()
    
    if slug:
        cursor.execute(
            "SELECT * FROM baths WHERE slug = %s",
            (slug,)
        )
        result = cursor.fetchone()
        cursor.close()
        return dict(result) if result else None
    
    cursor.execute("SELECT * FROM baths ORDER BY rating DESC")
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def get_masters(conn, slug=''):
    """Получить список мастеров или одного мастера по slug"""
    cursor = conn.cursor()
    
    if slug:
        cursor.execute(
            "SELECT * FROM masters WHERE slug = %s",
            (slug,)
        )
        result = cursor.fetchone()
        cursor.close()
        return dict(result) if result else None
    
    cursor.execute("SELECT * FROM masters ORDER BY rating DESC")
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def get_blog_posts(conn, category='', slug=''):
    """Получить список постов блога или один пост по slug"""
    cursor = conn.cursor()
    
    if slug:
        cursor.execute(
            "SELECT * FROM blog_posts WHERE slug = %s",
            (slug,)
        )
        result = cursor.fetchone()
        cursor.close()
        return dict(result) if result else None
    
    if category:
        cursor.execute(
            "SELECT * FROM blog_posts WHERE category = %s ORDER BY date DESC",
            (category,)
        )
    else:
        cursor.execute("SELECT * FROM blog_posts ORDER BY date DESC")
    
    result = cursor.fetchall()
    cursor.close()
    return [dict(row) for row in result]

def create_booking(conn, data):
    """Создать новую заявку на событие"""
    cursor = conn.cursor()
    
    event_id = data.get('event_id')
    name = data.get('name', '')
    phone = data.get('phone', '')
    telegram = data.get('telegram', '')
    
    if not event_id or not name or not phone:
        return {'error': 'Missing required fields'}
    
    cursor.execute(
        "INSERT INTO bookings (event_id, name, phone, telegram) VALUES (%s, %s, %s, %s) RETURNING id",
        (event_id, name, phone, telegram)
    )
    
    booking_id = cursor.fetchone()['id']
    
    cursor.execute(
        "UPDATE events SET available_spots = available_spots - 1 WHERE id = %s AND available_spots > 0",
        (event_id,)
    )
    
    conn.commit()
    cursor.close()
    
    return {'success': True, 'booking_id': booking_id}
