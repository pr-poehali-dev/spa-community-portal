import json
import os
import psycopg2
from typing import Optional

def get_db_connection():
    """Создание подключения к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: dict, context) -> dict:
    """
    API для работы с каталогом бань и мастеров.
    Поддерживает получение списков, детальной информации, поиск и фильтрацию.
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': ''
        }
    
    params = event.get('queryStringParameters') or {}
    path = event.get('params', {}).get('path', '')
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        resource = params.get('resource', 'baths')
        item_id = params.get('id')
        slug = params.get('slug')
        
        if resource == 'baths':
            if slug:
                result = get_bath_by_slug(cursor, slug)
            elif item_id:
                result = get_bath_by_id(cursor, int(item_id))
            else:
                result = get_baths_list(cursor, params)
        
        elif resource == 'masters':
            if slug:
                result = get_master_by_slug(cursor, slug)
            elif item_id:
                result = get_master_by_id(cursor, int(item_id))
            else:
                result = get_masters_list(cursor, params)
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Некорректный ресурс. Используйте: baths, masters'})
            }
        
        cursor.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False, default=str)
        }
    
    except ValueError as e:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Внутренняя ошибка сервера'}, ensure_ascii=False)
        }
    finally:
        if conn:
            conn.close()

def get_baths_list(cursor, params: dict) -> dict:
    """Получение списка бань с фильтрацией"""
    query = "SELECT id, slug, name, address, capacity, price_per_hour, features, images, rating, reviews_count FROM t_p13705114_spa_community_portal.baths WHERE 1=1"
    query_params = []
    
    if params.get('city'):
        query += " AND address ILIKE %s"
        query_params.append(f"%{params['city']}%")
    
    if params.get('min_capacity'):
        query += " AND capacity >= %s"
        query_params.append(int(params['min_capacity']))
    
    if params.get('max_price'):
        query += " AND price_per_hour <= %s"
        query_params.append(int(params['max_price']))
    
    if params.get('min_rating'):
        query += " AND rating >= %s"
        query_params.append(float(params['min_rating']))
    
    if params.get('search'):
        query += " AND (name ILIKE %s OR description ILIKE %s)"
        search_term = f"%{params['search']}%"
        query_params.extend([search_term, search_term])
    
    sort = params.get('sort', 'rating')
    if sort == 'price_asc':
        query += " ORDER BY price_per_hour ASC"
    elif sort == 'price_desc':
        query += " ORDER BY price_per_hour DESC"
    elif sort == 'rating':
        query += " ORDER BY rating DESC, reviews_count DESC"
    elif sort == 'reviews':
        query += " ORDER BY reviews_count DESC"
    else:
        query += " ORDER BY rating DESC"
    
    limit = min(int(params.get('limit', 20)), 100)
    offset = int(params.get('offset', 0))
    query += " LIMIT %s OFFSET %s"
    query_params.extend([limit, offset])
    
    cursor.execute(query, query_params)
    rows = cursor.fetchall()
    
    baths = []
    for row in rows:
        baths.append({
            'id': row[0],
            'slug': row[1],
            'name': row[2],
            'address': row[3],
            'capacity': row[4],
            'price_per_hour': row[5],
            'features': row[6],
            'images': row[7],
            'rating': float(row[8]) if row[8] else 0,
            'reviews_count': row[9]
        })
    
    count_query = "SELECT COUNT(*) FROM t_p13705114_spa_community_portal.baths WHERE 1=1"
    count_params = []
    
    if params.get('city'):
        count_query += " AND address ILIKE %s"
        count_params.append(f"%{params['city']}%")
    
    if params.get('min_capacity'):
        count_query += " AND capacity >= %s"
        count_params.append(int(params['min_capacity']))
    
    if params.get('max_price'):
        count_query += " AND price_per_hour <= %s"
        count_params.append(int(params['max_price']))
    
    if params.get('min_rating'):
        count_query += " AND rating >= %s"
        count_params.append(float(params['min_rating']))
    
    if params.get('search'):
        count_query += " AND (name ILIKE %s OR description ILIKE %s)"
        search_term = f"%{params['search']}%"
        count_params.extend([search_term, search_term])
    
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()[0]
    
    return {
        'items': baths,
        'total': total,
        'limit': limit,
        'offset': offset
    }

def get_bath_by_id(cursor, bath_id: int) -> dict:
    """Получение детальной информации о бане по ID"""
    cursor.execute("""
        SELECT id, slug, name, address, description, capacity, price_per_hour, 
               features, images, rating, reviews_count, created_at
        FROM t_p13705114_spa_community_portal.baths 
        WHERE id = %s
    """, (bath_id,))
    
    row = cursor.fetchone()
    if not row:
        raise ValueError('Баня не найдена')
    
    return {
        'id': row[0],
        'slug': row[1],
        'name': row[2],
        'address': row[3],
        'description': row[4],
        'capacity': row[5],
        'price_per_hour': row[6],
        'features': row[7],
        'images': row[8],
        'rating': float(row[9]) if row[9] else 0,
        'reviews_count': row[10],
        'created_at': row[11]
    }

def get_bath_by_slug(cursor, slug: str) -> dict:
    """Получение детальной информации о бане по slug"""
    cursor.execute("""
        SELECT id, slug, name, address, description, capacity, price_per_hour, 
               features, images, rating, reviews_count, created_at
        FROM t_p13705114_spa_community_portal.baths 
        WHERE slug = %s
    """, (slug,))
    
    row = cursor.fetchone()
    if not row:
        raise ValueError('Баня не найдена')
    
    return {
        'id': row[0],
        'slug': row[1],
        'name': row[2],
        'address': row[3],
        'description': row[4],
        'capacity': row[5],
        'price_per_hour': row[6],
        'features': row[7],
        'images': row[8],
        'rating': float(row[9]) if row[9] else 0,
        'reviews_count': row[10],
        'created_at': row[11]
    }

def get_masters_list(cursor, params: dict) -> dict:
    """Получение списка мастеров с фильтрацией"""
    query = "SELECT id, slug, name, specialization, experience, avatar_url, rating, reviews_count FROM t_p13705114_spa_community_portal.masters WHERE 1=1"
    query_params = []
    
    if params.get('specialization'):
        query += " AND specialization ILIKE %s"
        query_params.append(f"%{params['specialization']}%")
    
    if params.get('min_experience'):
        query += " AND experience >= %s"
        query_params.append(int(params['min_experience']))
    
    if params.get('min_rating'):
        query += " AND rating >= %s"
        query_params.append(float(params['min_rating']))
    
    if params.get('search'):
        query += " AND (name ILIKE %s OR description ILIKE %s OR specialization ILIKE %s)"
        search_term = f"%{params['search']}%"
        query_params.extend([search_term, search_term, search_term])
    
    sort = params.get('sort', 'rating')
    if sort == 'experience':
        query += " ORDER BY experience DESC"
    elif sort == 'rating':
        query += " ORDER BY rating DESC, reviews_count DESC"
    elif sort == 'reviews':
        query += " ORDER BY reviews_count DESC"
    else:
        query += " ORDER BY rating DESC"
    
    limit = min(int(params.get('limit', 20)), 100)
    offset = int(params.get('offset', 0))
    query += " LIMIT %s OFFSET %s"
    query_params.extend([limit, offset])
    
    cursor.execute(query, query_params)
    rows = cursor.fetchall()
    
    masters = []
    for row in rows:
        masters.append({
            'id': row[0],
            'slug': row[1],
            'name': row[2],
            'specialization': row[3],
            'experience': row[4],
            'avatar_url': row[5],
            'rating': float(row[6]) if row[6] else 0,
            'reviews_count': row[7]
        })
    
    count_query = "SELECT COUNT(*) FROM t_p13705114_spa_community_portal.masters WHERE 1=1"
    count_params = []
    
    if params.get('specialization'):
        count_query += " AND specialization ILIKE %s"
        count_params.append(f"%{params['specialization']}%")
    
    if params.get('min_experience'):
        count_query += " AND experience >= %s"
        count_params.append(int(params['min_experience']))
    
    if params.get('min_rating'):
        count_query += " AND rating >= %s"
        count_params.append(float(params['min_rating']))
    
    if params.get('search'):
        count_query += " AND (name ILIKE %s OR description ILIKE %s OR specialization ILIKE %s)"
        search_term = f"%{params['search']}%"
        count_params.extend([search_term, search_term, search_term])
    
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()[0]
    
    return {
        'items': masters,
        'total': total,
        'limit': limit,
        'offset': offset
    }

def get_master_by_id(cursor, master_id: int) -> dict:
    """Получение детальной информации о мастере по ID"""
    cursor.execute("""
        SELECT id, slug, name, specialization, experience, description, 
               avatar_url, services, rating, reviews_count, created_at
        FROM t_p13705114_spa_community_portal.masters 
        WHERE id = %s
    """, (master_id,))
    
    row = cursor.fetchone()
    if not row:
        raise ValueError('Мастер не найден')
    
    return {
        'id': row[0],
        'slug': row[1],
        'name': row[2],
        'specialization': row[3],
        'experience': row[4],
        'description': row[5],
        'avatar_url': row[6],
        'services': row[7],
        'rating': float(row[8]) if row[8] else 0,
        'reviews_count': row[9],
        'created_at': row[10]
    }

def get_master_by_slug(cursor, slug: str) -> dict:
    """Получение детальной информации о мастере по slug"""
    cursor.execute("""
        SELECT id, slug, name, specialization, experience, description, 
               avatar_url, services, rating, reviews_count, created_at
        FROM t_p13705114_spa_community_portal.masters 
        WHERE slug = %s
    """, (slug,))
    
    row = cursor.fetchone()
    if not row:
        raise ValueError('Мастер не найден')
    
    return {
        'id': row[0],
        'slug': row[1],
        'name': row[2],
        'specialization': row[3],
        'experience': row[4],
        'description': row[5],
        'avatar_url': row[6],
        'services': row[7],
        'rating': float(row[8]) if row[8] else 0,
        'reviews_count': row[9],
        'created_at': row[10]
    }