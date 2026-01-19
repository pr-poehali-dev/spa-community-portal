"""
API для работы с расписанием (ServiceSchedule).
Возвращает календарь событий, управление слотами расписания.
"""
import json
import os
import psycopg2
from datetime import datetime, timedelta
from calendar import monthrange

SCHEMA = 't_p13705114_spa_community_portal'

def get_db_connection():
    """Подключение к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def get_calendar(params: dict) -> dict:
    """Получение календаря событий"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    month = params.get('month', datetime.now().strftime('%Y-%m'))
    city = params.get('city', '')
    service_type = params.get('service_type', 'EVENT')
    
    year, month_num = map(int, month.split('-'))
    _, last_day = monthrange(year, month_num)
    
    date_from = f"{year}-{month_num:02d}-01"
    date_to = f"{year}-{month_num:02d}-{last_day:02d}"
    
    where_clauses = ["s.type = %s", "s.is_active = true", "sch.status = 'active'"]
    query_params = [service_type]
    
    if city:
        where_clauses.append("s.city = %s")
        query_params.append(city)
    
    where_sql = "WHERE " + " AND ".join(where_clauses)
    
    query = f"""
        SELECT 
            DATE(sch.start_datetime) as event_date,
            COUNT(*) as events_count,
            SUM(sch.capacity_available) as total_available_spots
        FROM {SCHEMA}.service_schedules sch
        JOIN {SCHEMA}.services s ON sch.service_id = s.id
        {where_sql}
          AND sch.start_datetime >= %s
          AND sch.start_datetime < %s
        GROUP BY DATE(sch.start_datetime)
        ORDER BY event_date ASC
    """
    
    query_params.extend([date_from, date_to])
    
    cur.execute(query, query_params)
    rows = cur.fetchall()
    
    calendar_data = []
    for row in rows:
        calendar_data.append({
            'date': row[0].isoformat() if row[0] else None,
            'events_count': row[1],
            'available_spots': row[2]
        })
    
    cur.close()
    conn.close()
    
    return {
        'month': month,
        'calendar': calendar_data
    }

def get_schedule_detail(schedule_id: str) -> dict:
    """Получение детальной информации о слоте расписания"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(f"""
        SELECT 
            sch.id, sch.service_id, sch.start_datetime, sch.end_datetime,
            sch.capacity_total, sch.capacity_available, sch.price_override, sch.status,
            s.title, s.slug, s.description, s.base_price, s.duration_minutes,
            b.id as bathhouse_id, b.name as bathhouse_name, b.address as bathhouse_address,
            m.id as master_id, m.name as master_name, m.avatar_url as master_avatar
        FROM {SCHEMA}.service_schedules sch
        JOIN {SCHEMA}.services s ON sch.service_id = s.id
        LEFT JOIN {SCHEMA}.baths b ON s.bathhouse_id = b.id
        LEFT JOIN {SCHEMA}.masters m ON s.master_id = m.id
        WHERE sch.id = %s
    """, (schedule_id,))
    
    row = cur.fetchone()
    
    if not row:
        cur.close()
        conn.close()
        return None
    
    result = {
        'id': str(row[0]),
        'service_id': str(row[1]),
        'start_datetime': row[2].isoformat() if row[2] else None,
        'end_datetime': row[3].isoformat() if row[3] else None,
        'capacity_total': row[4],
        'capacity_available': row[5],
        'price': row[6] if row[6] else row[11],
        'status': row[7],
        'service': {
            'title': row[8],
            'slug': row[9],
            'description': row[10],
            'base_price': row[11],
            'duration_minutes': row[12]
        },
        'bathhouse': {
            'id': row[13],
            'name': row[14],
            'address': row[15]
        } if row[13] else None,
        'master': {
            'id': row[16],
            'name': row[17],
            'avatar_url': row[18]
        } if row[16] else None
    }
    
    cur.close()
    conn.close()
    
    return result

def get_day_schedule(params: dict) -> dict:
    """Получение расписания на конкретный день"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    date = params.get('date', datetime.now().strftime('%Y-%m-%d'))
    city = params.get('city', '')
    service_type = params.get('service_type', 'EVENT')
    
    date_from = f"{date} 00:00:00"
    date_to = f"{date} 23:59:59"
    
    where_clauses = ["s.type = %s", "s.is_active = true", "sch.status = 'active'"]
    query_params = [service_type]
    
    if city:
        where_clauses.append("s.city = %s")
        query_params.append(city)
    
    where_sql = "WHERE " + " AND ".join(where_clauses)
    
    query = f"""
        SELECT 
            sch.id, sch.start_datetime, sch.end_datetime,
            sch.capacity_total, sch.capacity_available, sch.price_override,
            s.id as service_id, s.title, s.slug, s.base_price, s.images,
            b.id as bathhouse_id, b.name as bathhouse_name,
            m.id as master_id, m.name as master_name
        FROM {SCHEMA}.service_schedules sch
        JOIN {SCHEMA}.services s ON sch.service_id = s.id
        LEFT JOIN {SCHEMA}.baths b ON s.bathhouse_id = b.id
        LEFT JOIN {SCHEMA}.masters m ON s.master_id = m.id
        {where_sql}
          AND sch.start_datetime >= %s
          AND sch.start_datetime <= %s
        ORDER BY sch.start_datetime ASC
    """
    
    query_params.extend([date_from, date_to])
    
    cur.execute(query, query_params)
    rows = cur.fetchall()
    
    schedules = []
    for row in rows:
        image_url = None
        if row[10] and len(row[10]) > 0:
            image_url = row[10][0].get('url')
        
        schedules.append({
            'id': str(row[0]),
            'start_datetime': row[1].isoformat() if row[1] else None,
            'end_datetime': row[2].isoformat() if row[2] else None,
            'capacity_total': row[3],
            'capacity_available': row[4],
            'price': row[5] if row[5] else row[9],
            'service': {
                'id': str(row[6]),
                'title': row[7],
                'slug': row[8],
                'base_price': row[9],
                'image_url': image_url
            },
            'bathhouse': {
                'id': row[11],
                'name': row[12]
            } if row[11] else None,
            'master': {
                'id': row[13],
                'name': row[14]
            } if row[13] else None
        })
    
    cur.close()
    conn.close()
    
    return {
        'date': date,
        'schedules': schedules
    }

def handler(event: dict, context) -> dict:
    """Обработчик запросов к API расписания"""
    method = event.get('httpMethod', 'GET')
    
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
    
    path_params = event.get('pathParams', {})
    query_params = event.get('queryStringParameters', {})
    
    try:
        if method == 'GET':
            schedule_id = path_params.get('id', '')
            endpoint = query_params.get('endpoint', '')
            
            if schedule_id:
                result = get_schedule_detail(schedule_id)
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Schedule not found'}),
                        'isBase64Encoded': False
                    }
            elif endpoint == 'calendar':
                result = get_calendar(query_params)
            elif endpoint == 'day':
                result = get_day_schedule(query_params)
            else:
                result = get_calendar(query_params)
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