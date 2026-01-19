"""
API для работы с мероприятиями СПАРКОМ (Service → ServiceSchedule архитектура).
Позволяет получать список событий, детальную информацию, расписание и регистрироваться на мероприятия.
"""
import json
import os
import psycopg2
from datetime import datetime
from typing import Optional

SCHEMA = 't_p13705114_spa_community_portal'

def get_db_connection():
    """Подключение к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def get_user_id_from_token(headers: dict) -> Optional[int]:
    """Извлечение user_id из токена"""
    auth = headers.get('X-Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    
    token = auth.replace('Bearer ', '')
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(f"""
            SELECT user_id 
            FROM {SCHEMA}.user_sessions 
            WHERE access_token = %s 
              AND expires_at > NOW()
        """, (token,))
        
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        return row[0] if row else None
    except Exception:
        return None

def get_events_list(params: dict) -> dict:
    """Получение списка событий с фильтрацией (новая архитектура)"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    search = params.get('search', '')
    date_from = params.get('date_from', '')
    date_to = params.get('date_to', '')
    city = params.get('city', '')
    gender_type = params.get('gender_type', '')
    price_min = params.get('price_min', '')
    price_max = params.get('price_max', '')
    availability = params.get('available_only', 'false').lower() == 'true'
    sort = params.get('sort', 'date')
    limit = min(int(params.get('limit', 20)), 100)
    offset = int(params.get('offset', 0))
    
    where_clauses = ["s.type = 'EVENT'", "s.is_active = true"]
    query_params = []
    
    if search:
        where_clauses.append("(s.title ILIKE %s OR s.description ILIKE %s)")
        search_param = f'%{search}%'
        query_params.extend([search_param, search_param])
    
    if city:
        where_clauses.append("s.city = %s")
        query_params.append(city)
    
    if gender_type:
        where_clauses.append("s.gender_type = %s")
        query_params.append(gender_type)
    
    if price_min:
        where_clauses.append("s.base_price >= %s")
        query_params.append(int(price_min))
    
    if price_max:
        where_clauses.append("s.base_price <= %s")
        query_params.append(int(price_max))
    
    schedule_filters = []
    if date_from:
        schedule_filters.append("sch.start_datetime >= %s")
        query_params.append(date_from)
    
    if date_to:
        schedule_filters.append("sch.start_datetime <= %s")
        query_params.append(date_to)
    
    if availability:
        schedule_filters.append("sch.capacity_available > 0")
    
    schedule_where = ""
    if schedule_filters:
        schedule_where = "AND " + " AND ".join(schedule_filters)
    
    where_sql = "WHERE " + " AND ".join(where_clauses)
    
    sort_mapping = {
        'date': 'nearest_datetime ASC',
        'price_asc': 's.base_price ASC',
        'price_desc': 's.base_price DESC',
        'spots': 'max_available DESC'
    }
    order_sql = f"ORDER BY {sort_mapping.get(sort, 'nearest_datetime ASC')}"
    
    query = f"""
        SELECT 
            s.id, s.slug, s.title, s.description, s.duration_minutes, s.base_price,
            s.gender_type, s.city, s.images,
            b.id as bathhouse_id, b.name as bathhouse_name, b.address as bathhouse_address,
            m.id as master_id, m.name as master_name, m.avatar_url as master_avatar,
            COUNT(DISTINCT sch.id) as schedules_count,
            MIN(sch.start_datetime) as nearest_datetime,
            MAX(sch.capacity_available) as max_available
        FROM {SCHEMA}.services s
        LEFT JOIN {SCHEMA}.baths b ON s.bathhouse_id = b.id
        LEFT JOIN {SCHEMA}.masters m ON s.master_id = m.id
        LEFT JOIN {SCHEMA}.service_schedules sch ON s.id = sch.service_id 
            AND sch.status = 'active' 
            AND sch.start_datetime > NOW()
            {schedule_where}
        {where_sql}
        GROUP BY s.id, b.id, b.name, b.address, m.id, m.name, m.avatar_url
        {order_sql}
        LIMIT %s OFFSET %s
    """
    query_params.extend([limit, offset])
    
    cur.execute(query, query_params)
    rows = cur.fetchall()
    
    count_query = f"""
        SELECT COUNT(DISTINCT s.id)
        FROM {SCHEMA}.services s
        LEFT JOIN {SCHEMA}.service_schedules sch ON s.id = sch.service_id 
            AND sch.status = 'active' 
            AND sch.start_datetime > NOW()
            {schedule_where}
        {where_sql}
    """
    cur.execute(count_query, query_params[:-2])
    total = cur.fetchone()[0]
    
    items = []
    for row in rows:
        image_url = None
        if row[8] and len(row[8]) > 0:
            image_url = row[8][0].get('url')
        
        items.append({
            'id': str(row[0]),
            'slug': row[1],
            'title': row[2],
            'description': row[3],
            'duration_minutes': row[4],
            'price': row[5],
            'gender_type': row[6],
            'city': row[7],
            'image_url': image_url,
            'bathhouse': {
                'id': row[9],
                'name': row[10],
                'address': row[11]
            } if row[9] else None,
            'master': {
                'id': row[12],
                'name': row[13],
                'avatar_url': row[14]
            } if row[12] else None,
            'schedules_count': row[15] or 0,
            'nearest_datetime': row[16].isoformat() if row[16] else None,
            'available_spots': row[17] or 0
        })
    
    cur.close()
    conn.close()
    
    return {
        'items': items,
        'total': total,
        'limit': limit,
        'offset': offset
    }

def get_event_detail(slug: str = None, event_id: str = None) -> Optional[dict]:
    """Получение детальной информации о событии"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    if slug:
        where_clause = "s.slug = %s"
        param = slug
    elif event_id:
        where_clause = "s.id = %s"
        param = event_id
    else:
        cur.close()
        conn.close()
        return None
    
    cur.execute(f"""
        SELECT 
            s.id, s.slug, s.title, s.description, s.duration_minutes, s.base_price,
            s.gender_type, s.city, s.program, s.rules, s.images, s.created_at,
            b.id as bathhouse_id, b.name as bathhouse_name, b.address as bathhouse_address,
            b.description as bathhouse_description, b.images as bathhouse_images,
            b.rating as bathhouse_rating, b.reviews_count as bathhouse_reviews,
            m.id as master_id, m.name as master_name, m.avatar_url as master_avatar,
            m.specialization as master_specialization, m.experience as master_experience,
            m.rating as master_rating, m.reviews_count as master_reviews,
            u.id as organizer_id, u.name as organizer_name, u.email as organizer_email,
            u.phone as organizer_phone, u.telegram_username as organizer_telegram
        FROM {SCHEMA}.services s
        LEFT JOIN {SCHEMA}.baths b ON s.bathhouse_id = b.id
        LEFT JOIN {SCHEMA}.masters m ON s.master_id = m.id
        LEFT JOIN {SCHEMA}.users u ON s.organizer_id = u.id
        WHERE {where_clause}
    """, (param,))
    
    row = cur.fetchone()
    
    if not row:
        cur.close()
        conn.close()
        return None
    
    result = {
        'id': str(row[0]),
        'slug': row[1],
        'title': row[2],
        'description': row[3],
        'duration_minutes': row[4],
        'price': row[5],
        'gender_type': row[6],
        'city': row[7],
        'program': row[8] if row[8] else [],
        'rules': row[9] if row[9] else [],
        'images': row[10] if row[10] else [],
        'created_at': row[11].isoformat() if row[11] else None,
        'bathhouse': {
            'id': row[12],
            'name': row[13],
            'address': row[14],
            'description': row[15],
            'images': row[16] if row[16] else [],
            'rating': float(row[17]) if row[17] else 0,
            'reviews_count': row[18] or 0
        } if row[12] else None,
        'master': {
            'id': row[19],
            'name': row[20],
            'avatar_url': row[21],
            'specialization': row[22],
            'experience': row[23],
            'rating': float(row[24]) if row[24] else 0,
            'reviews_count': row[25] or 0
        } if row[19] else None,
        'organizer': {
            'id': row[26],
            'name': row[27],
            'email': row[28],
            'phone': row[29],
            'telegram': row[30]
        } if row[26] else None
    }
    
    cur.close()
    conn.close()
    
    return result

def get_event_schedules(event_id: str, params: dict) -> dict:
    """Получение расписания события"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    date_from = params.get('date_from', datetime.now().isoformat())
    date_to = params.get('date_to', '')
    status = params.get('status', 'active')
    
    query = f"""
        SELECT 
            id, start_datetime, end_datetime,
            capacity_total, capacity_available, price_override, status
        FROM {SCHEMA}.service_schedules
        WHERE service_id = %s AND start_datetime >= %s
    """
    
    query_params = [event_id, date_from]
    
    if date_to:
        query += " AND start_datetime <= %s"
        query_params.append(date_to)
    
    if status:
        query += " AND status = %s"
        query_params.append(status)
    
    query += " ORDER BY start_datetime ASC"
    
    cur.execute(query, query_params)
    rows = cur.fetchall()
    
    schedules = []
    for row in rows:
        schedules.append({
            'id': str(row[0]),
            'start_datetime': row[1].isoformat() if row[1] else None,
            'end_datetime': row[2].isoformat() if row[2] else None,
            'capacity_total': row[3],
            'capacity_available': row[4],
            'price': row[5],
            'status': row[6]
        })
    
    cur.close()
    conn.close()
    
    return {'schedules': schedules}

def handler(event: dict, context) -> dict:
    """Обработчик запросов к API событий"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters', {}) or {}
    
    slug_or_id = query_params.get('slug', '') or query_params.get('id', '')
    action = query_params.get('action', '')
    
    try:
        if method == 'GET':
            if slug_or_id and action == 'schedule':
                result = get_event_schedules(slug_or_id, query_params)
            elif slug_or_id:
                if slug_or_id.isdigit():
                    result = get_event_detail(event_id=slug_or_id)
                else:
                    result = get_event_detail(slug=slug_or_id)
                    
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Event not found'}),
                        'isBase64Encoded': False
                    }
            else:
                result = get_events_list(query_params)
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, default=str),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }