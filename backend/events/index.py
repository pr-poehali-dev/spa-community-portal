"""
API для работы с мероприятиями СПАРКОМ.
Позволяет получать список событий, детальную информацию и регистрироваться на мероприятия.
"""
import json
import os
import psycopg2
from datetime import datetime
from typing import Optional
from models import EventListItem, EventDetail, RegistrationRequest

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
    """Получение списка событий с фильтрацией"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    event_type = params.get('type', '')
    search = params.get('search', '')
    date_from = params.get('date_from', '')
    date_to = params.get('date_to', '')
    available_only = params.get('available_only', 'false').lower() == 'true'
    sort = params.get('sort', 'date')
    limit = min(int(params.get('limit', 20)), 100)
    offset = int(params.get('offset', 0))
    
    where_clauses = []
    query_params = []
    
    if event_type:
        where_clauses.append(f"type = %s")
        query_params.append(event_type)
    
    if search:
        where_clauses.append(f"(title ILIKE %s OR description ILIKE %s)")
        search_param = f'%{search}%'
        query_params.extend([search_param, search_param])
    
    if date_from:
        where_clauses.append(f"date >= %s")
        query_params.append(date_from)
    
    if date_to:
        where_clauses.append(f"date <= %s")
        query_params.append(date_to)
    
    if available_only:
        where_clauses.append(f"available_spots > 0")
    
    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    
    sort_mapping = {
        'date': 'date ASC, time ASC',
        'price_asc': 'price ASC',
        'price_desc': 'price DESC',
        'spots': 'available_spots DESC'
    }
    order_sql = f"ORDER BY {sort_mapping.get(sort, 'date ASC, time ASC')}"
    
    query = f"""
        SELECT id, slug, title, description, date, time, location, 
               type, price, available_spots, total_spots, image_url
        FROM {SCHEMA}.events
        {where_sql}
        {order_sql}
        LIMIT %s OFFSET %s
    """
    query_params.extend([limit, offset])
    
    cur.execute(query, query_params)
    rows = cur.fetchall()
    
    count_query = f"SELECT COUNT(*) FROM {SCHEMA}.events {where_sql}"
    cur.execute(count_query, query_params[:-2])
    total = cur.fetchone()[0]
    
    items = []
    for row in rows:
        items.append({
            'id': row[0],
            'slug': row[1],
            'title': row[2],
            'description': row[3],
            'date': row[4].isoformat() if row[4] else None,
            'time': row[5].isoformat() if row[5] else None,
            'location': row[6],
            'type': row[7],
            'price': row[8],
            'available_spots': row[9],
            'total_spots': row[10],
            'image_url': row[11]
        })
    
    cur.close()
    conn.close()
    
    return {
        'items': items,
        'total': total,
        'limit': limit,
        'offset': offset
    }

def get_event_detail(slug: str = None, event_id: int = None) -> Optional[dict]:
    """Получение детальной информации о событии"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    if slug:
        cur.execute(f"""
            SELECT id, slug, title, description, date, time, location, 
                   type, price, available_spots, total_spots, image_url,
                   program, rules, created_at
            FROM {SCHEMA}.events
            WHERE slug = %s
        """, (slug,))
    elif event_id:
        cur.execute(f"""
            SELECT id, slug, title, description, date, time, location, 
                   type, price, available_spots, total_spots, image_url,
                   program, rules, created_at
            FROM {SCHEMA}.events
            WHERE id = %s
        """, (event_id,))
    else:
        cur.close()
        conn.close()
        return None
    
    row = cur.fetchone()
    cur.close()
    conn.close()
    
    if not row:
        return None
    
    return {
        'id': row[0],
        'slug': row[1],
        'title': row[2],
        'description': row[3],
        'date': row[4].isoformat() if row[4] else None,
        'time': row[5].isoformat() if row[5] else None,
        'location': row[6],
        'type': row[7],
        'price': row[8],
        'available_spots': row[9],
        'total_spots': row[10],
        'image_url': row[11],
        'program': row[12] if row[12] else [],
        'rules': row[13] if row[13] else [],
        'created_at': row[14].isoformat() if row[14] else None
    }

def register_for_event(event_id: int, user_id: int) -> dict:
    """Регистрация пользователя на событие"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(f"SELECT available_spots FROM {SCHEMA}.events WHERE id = %s", (event_id,))
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return {'error': 'Событие не найдено', 'status': 404}
        
        if row[0] <= 0:
            cur.close()
            conn.close()
            return {'error': 'Нет свободных мест', 'status': 400}
        
        cur.execute(f"""
            SELECT id FROM {SCHEMA}.event_registrations 
            WHERE event_id = %s AND user_id = %s
        """, (event_id, user_id))
        
        if cur.fetchone():
            cur.close()
            conn.close()
            return {'error': 'Вы уже зарегистрированы на это событие', 'status': 409}
        
        cur.execute(f"""
            INSERT INTO {SCHEMA}.event_registrations (event_id, user_id, status)
            VALUES (%s, %s, 'registered')
            RETURNING id, registered_at
        """, (event_id, user_id))
        
        reg = cur.fetchone()
        
        cur.execute(f"""
            UPDATE {SCHEMA}.events 
            SET available_spots = available_spots - 1 
            WHERE id = %s
        """, (event_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'id': reg[0],
            'registered_at': reg[1].isoformat() if reg[1] else None,
            'message': 'Регистрация успешна'
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e), 'status': 500}

def cancel_registration(event_id: int, user_id: int) -> dict:
    """Отмена регистрации на событие"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(f"""
            SELECT id, status FROM {SCHEMA}.event_registrations 
            WHERE event_id = %s AND user_id = %s
        """, (event_id, user_id))
        
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return {'error': 'Регистрация не найдена', 'status': 404}
        
        if row[1] == 'canceled':
            cur.close()
            conn.close()
            return {'error': 'Регистрация уже отменена', 'status': 400}
        
        cur.execute(f"""
            UPDATE {SCHEMA}.event_registrations 
            SET status = 'canceled', canceled_at = NOW()
            WHERE id = %s
        """, (row[0],))
        
        cur.execute(f"""
            UPDATE {SCHEMA}.events 
            SET available_spots = available_spots + 1 
            WHERE id = %s
        """, (event_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {'message': 'Регистрация отменена'}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e), 'status': 500}

def get_user_registrations(user_id: int) -> list:
    """Получение регистраций пользователя"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(f"""
        SELECT r.id, r.event_id, r.status, r.registered_at, r.canceled_at,
               e.slug, e.title, e.date, e.time, e.location, e.price, e.image_url
        FROM {SCHEMA}.event_registrations r
        JOIN {SCHEMA}.events e ON r.event_id = e.id
        WHERE r.user_id = %s
        ORDER BY r.registered_at DESC
    """, (user_id,))
    
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    registrations = []
    for row in rows:
        registrations.append({
            'id': row[0],
            'event_id': row[1],
            'status': row[2],
            'registered_at': row[3].isoformat() if row[3] else None,
            'canceled_at': row[4].isoformat() if row[4] else None,
            'event': {
                'slug': row[5],
                'title': row[6],
                'date': row[7].isoformat() if row[7] else None,
                'time': row[8].isoformat() if row[8] else None,
                'location': row[9],
                'price': row[10],
                'image_url': row[11]
            }
        })
    
    return registrations

def handler(event: dict, context) -> dict:
    """
    API для работы с мероприятиями.
    Поддерживает получение списка событий, регистрацию и отмену регистрации.
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    params = event.get('queryStringParameters') or {}
    
    try:
        if method == 'GET':
            slug = params.get('slug')
            event_id = params.get('id')
            
            if params.get('my_registrations') == 'true':
                user_id = get_user_id_from_token(headers)
                if not user_id:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Требуется авторизация'})
                    }
                
                registrations = get_user_registrations(user_id)
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'registrations': registrations})
                }
            
            if slug or event_id:
                detail = get_event_detail(
                    slug=slug,
                    event_id=int(event_id) if event_id else None
                )
                
                if not detail:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Событие не найдено'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(detail)
                }
            
            result = get_events_list(params)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif method == 'POST':
            user_id = get_user_id_from_token(headers)
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            body = json.loads(event.get('body', '{}'))
            event_id = body.get('event_id')
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не указан event_id'})
                }
            
            result = register_for_event(event_id, user_id)
            
            if 'error' in result:
                status = result.pop('status', 400)
                return {
                    'statusCode': status,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result)
                }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif method == 'DELETE':
            user_id = get_user_id_from_token(headers)
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            event_id = params.get('event_id')
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не указан event_id'})
                }
            
            result = cancel_registration(int(event_id), user_id)
            
            if 'error' in result:
                status = result.pop('status', 400)
                return {
                    'statusCode': status,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result)
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
