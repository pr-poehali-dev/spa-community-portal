"""
Публичный API для получения данных о событиях, банях, мастерах и блоге.
Не требует авторизации.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

SCHEMA = 't_p13705114_spa_community_portal'


def get_db_connection():
    """Создание подключения к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def handler(event: dict, context) -> dict:
    """
    Публичный API для получения данных.
    
    GET /events - список событий
    GET /events/:id - детали события
    GET /baths - список бань
    GET /baths/:id - детали бани
    GET /masters - список мастеров
    GET /masters/:id - детали мастера
    GET /blog - список статей блога
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if method != 'GET':
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        path_params = event.get('pathParams', {})
        query_params = event.get('queryStringParameters', {}) or {}
        
        # Определяем тип запроса из пути
        path = event.get('path', '/')
        resource = query_params.get('resource', '')
        entity_id = query_params.get('id', '')
        
        if 'events' in path or resource == 'events':
            if entity_id:
                result = get_event_details(entity_id)
            else:
                result = get_events_list(query_params)
        elif 'baths' in path or resource == 'baths':
            if entity_id:
                result = get_bath_details(entity_id)
            else:
                result = get_baths_list(query_params)
        elif 'masters' in path or resource == 'masters':
            if entity_id:
                result = get_master_details(entity_id)
            else:
                result = get_masters_list(query_params)
        elif 'blog' in path or resource == 'blog':
            result = get_blog_posts(query_params)
        else:
            result = {'error': 'Unknown resource'}
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result, ensure_ascii=False, default=str),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Server error: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }


def get_events_list(params: dict) -> dict:
    """Получение списка событий"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Параметры фильтрации
            event_type = params.get('type')
            limit = int(params.get('limit', 10))
            offset = int(params.get('offset', 0))
            
            where_clauses = ["date >= CURRENT_DATE"]
            query_params = []
            
            if event_type:
                where_clauses.append("type = %s")
                query_params.append(event_type)
            
            where_sql = " AND ".join(where_clauses)
            
            cursor.execute(
                f"""
                SELECT id, slug, title, description, date, time, location, type, 
                       price, available_spots, total_spots, image_url
                FROM {SCHEMA}.events
                WHERE {where_sql}
                ORDER BY date ASC, time ASC
                LIMIT %s OFFSET %s
                """,
                (*query_params, limit, offset)
            )
            
            events = cursor.fetchall()
            
            return {
                'events': [dict(event) for event in events],
                'total': len(events)
            }
    finally:
        conn.close()


def get_event_details(event_id: str) -> dict:
    """Получение деталей события"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                f"""
                SELECT e.*, 
                       b.name as bathhouse_name, b.address as bathhouse_address,
                       m.name as master_name, m.avatar_url as master_avatar
                FROM {SCHEMA}.events e
                LEFT JOIN {SCHEMA}.baths b ON e.bathhouse_id = b.id
                LEFT JOIN {SCHEMA}.masters m ON e.master_id = m.id
                WHERE e.id = %s OR e.slug = %s
                """,
                (event_id, event_id)
            )
            
            event = cursor.fetchone()
            
            if not event:
                return {'error': 'Event not found'}
            
            return dict(event)
    finally:
        conn.close()


def get_baths_list(params: dict) -> dict:
    """Получение списка бань"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            limit = int(params.get('limit', 10))
            offset = int(params.get('offset', 0))
            
            cursor.execute(
                f"""
                SELECT id, slug, name, address, description, capacity, 
                       price_per_hour, features, images, rating, reviews_count
                FROM {SCHEMA}.baths
                ORDER BY rating DESC, reviews_count DESC
                LIMIT %s OFFSET %s
                """,
                (limit, offset)
            )
            
            baths = cursor.fetchall()
            
            return {
                'baths': [dict(bath) for bath in baths],
                'total': len(baths)
            }
    finally:
        conn.close()


def get_bath_details(bath_id: str) -> dict:
    """Получение деталей бани"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                f"""
                SELECT *
                FROM {SCHEMA}.baths
                WHERE id = %s OR slug = %s
                """,
                (bath_id, bath_id)
            )
            
            bath = cursor.fetchone()
            
            if not bath:
                return {'error': 'Bath not found'}
            
            return dict(bath)
    finally:
        conn.close()


def get_masters_list(params: dict) -> dict:
    """Получение списка мастеров"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            limit = int(params.get('limit', 10))
            offset = int(params.get('offset', 0))
            
            cursor.execute(
                f"""
                SELECT id, slug, name, specialization, experience, description,
                       avatar_url, services, rating, reviews_count
                FROM {SCHEMA}.masters
                ORDER BY rating DESC, reviews_count DESC
                LIMIT %s OFFSET %s
                """,
                (limit, offset)
            )
            
            masters = cursor.fetchall()
            
            return {
                'masters': [dict(master) for master in masters],
                'total': len(masters)
            }
    finally:
        conn.close()


def get_master_details(master_id: str) -> dict:
    """Получение деталей мастера"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                f"""
                SELECT *
                FROM {SCHEMA}.masters
                WHERE id = %s OR slug = %s
                """,
                (master_id, master_id)
            )
            
            master = cursor.fetchone()
            
            if not master:
                return {'error': 'Master not found'}
            
            return dict(master)
    finally:
        conn.close()


def get_blog_posts(params: dict) -> dict:
    """Получение списка статей блога"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            category = params.get('category')
            limit = int(params.get('limit', 10))
            offset = int(params.get('offset', 0))
            
            where_clauses = ["status = 'published'", "archived = false"]
            query_params = []
            
            if category:
                where_clauses.append("category = %s")
                query_params.append(category)
            
            where_sql = " AND ".join(where_clauses)
            
            cursor.execute(
                f"""
                SELECT id, slug, title, excerpt, category, author, date,
                       image_url, views_count, likes_count, comments_count, reading_time
                FROM {SCHEMA}.blog_posts
                WHERE {where_sql}
                ORDER BY published_at DESC
                LIMIT %s OFFSET %s
                """,
                (*query_params, limit, offset)
            )
            
            posts = cursor.fetchall()
            
            return {
                'posts': [dict(post) for post in posts],
                'total': len(posts)
            }
    finally:
        conn.close()
