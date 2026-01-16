"""
API для управления бронированиями бань и услуг мастеров.
Поддерживает создание, просмотр, изменение и отмену бронирований.
"""
import json
import os
from datetime import datetime, date, time, timedelta
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p13705114_spa_community_portal'

def get_db_connection():
    """Создание подключения к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def get_user_from_token(token: str) -> Optional[dict]:
    """Получение пользователя по токену"""
    if not token:
        return None
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT u.id, u.email, u.first_name, u.last_name
                FROM {SCHEMA}.user_sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.access_token = %s AND s.expires_at > NOW()
            """, (token,))
            return cur.fetchone()
    finally:
        conn.close()

def check_time_slot_available(conn, booking_type: str, entity_id: int, booking_date: date, 
                               start_time: time, end_time: time, exclude_booking_id: int = None) -> bool:
    """Проверка доступности временного слота"""
    with conn.cursor() as cur:
        query = f"""
            SELECT COUNT(*) as count
            FROM {SCHEMA}.bath_master_bookings
            WHERE booking_type = %s 
              AND entity_id = %s 
              AND booking_date = %s
              AND status IN ('pending', 'confirmed')
              AND (
                (start_time < %s AND end_time > %s) OR
                (start_time < %s AND end_time > %s) OR
                (start_time >= %s AND end_time <= %s)
              )
        """
        params = [booking_type, entity_id, booking_date, end_time, start_time, 
                  end_time, start_time, start_time, end_time]
        
        if exclude_booking_id:
            query += " AND id != %s"
            params.append(exclude_booking_id)
        
        cur.execute(query, params)
        result = cur.fetchone()
        return result['count'] == 0

def get_entity_price(conn, booking_type: str, entity_id: int) -> Optional[int]:
    """Получение цены за час для бани или мастера"""
    with conn.cursor() as cur:
        if booking_type == 'bath':
            cur.execute(f"SELECT price_per_hour FROM {SCHEMA}.baths WHERE id = %s", (entity_id,))
        else:
            cur.execute(f"""
                SELECT (services->0->>'price')::integer as price_per_hour 
                FROM {SCHEMA}.masters 
                WHERE id = %s AND services IS NOT NULL AND jsonb_array_length(services) > 0
            """, (entity_id,))
        
        result = cur.fetchone()
        return result['price_per_hour'] if result else None

def calculate_hours(start_time: time, end_time: time) -> float:
    """Вычисление количества часов между временем"""
    start_dt = datetime.combine(date.today(), start_time)
    end_dt = datetime.combine(date.today(), end_time)
    diff = end_dt - start_dt
    return diff.total_seconds() / 3600

def handler(event: dict, context) -> dict:
    """Обработчик HTTP запросов для работы с бронированиями"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            return handle_get(event)
        elif method == 'POST':
            return handle_post(event)
        elif method == 'PUT':
            return handle_put(event)
        elif method == 'DELETE':
            return handle_delete(event)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def handle_get(event: dict) -> dict:
    """Получение бронирований"""
    params = event.get('queryStringParameters') or {}
    
    # Проверка авторизации
    auth_header = event.get('headers', {}).get('x-authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else None
    user = get_user_from_token(token)
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    booking_id = params.get('id')
    if booking_id:
        return get_booking_by_id(int(booking_id), user['id'])
    
    # Получение списка бронирований пользователя
    return get_user_bookings(user['id'], params)

def get_booking_by_id(booking_id: int, user_id: int) -> dict:
    """Получение конкретного бронирования"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT b.*, 
                       CASE 
                         WHEN b.booking_type = 'bath' THEN ba.name
                         ELSE m.name
                       END as entity_name,
                       CASE 
                         WHEN b.booking_type = 'bath' THEN ba.address
                         ELSE NULL
                       END as entity_address
                FROM {SCHEMA}.bath_master_bookings b
                LEFT JOIN {SCHEMA}.baths ba ON b.booking_type = 'bath' AND b.entity_id = ba.id
                LEFT JOIN {SCHEMA}.masters m ON b.booking_type = 'master' AND b.entity_id = m.id
                WHERE b.id = %s AND b.user_id = %s
            """, (booking_id, user_id))
            
            booking = cur.fetchone()
            if not booking:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Бронирование не найдено'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(booking), default=str),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def get_user_bookings(user_id: int, params: dict) -> dict:
    """Получение списка бронирований пользователя"""
    conn = get_db_connection()
    try:
        # Фильтры
        status = params.get('status')
        booking_type = params.get('type')
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        
        # Пагинация
        limit = min(int(params.get('limit', 20)), 100)
        offset = int(params.get('offset', 0))
        
        where_clauses = ['b.user_id = %s']
        query_params = [user_id]
        
        if status:
            where_clauses.append('b.status = %s')
            query_params.append(status)
        
        if booking_type:
            where_clauses.append('b.booking_type = %s')
            query_params.append(booking_type)
        
        if date_from:
            where_clauses.append('b.booking_date >= %s')
            query_params.append(date_from)
        
        if date_to:
            where_clauses.append('b.booking_date <= %s')
            query_params.append(date_to)
        
        where_sql = ' AND '.join(where_clauses)
        
        with conn.cursor() as cur:
            # Получаем общее количество
            cur.execute(f"""
                SELECT COUNT(*) as total
                FROM {SCHEMA}.bath_master_bookings b
                WHERE {where_sql}
            """, query_params)
            total = cur.fetchone()['total']
            
            # Получаем бронирования
            cur.execute(f"""
                SELECT b.*,
                       CASE 
                         WHEN b.booking_type = 'bath' THEN ba.name
                         ELSE m.name
                       END as entity_name,
                       CASE 
                         WHEN b.booking_type = 'bath' THEN ba.address
                         ELSE m.specialization
                       END as entity_info
                FROM {SCHEMA}.bath_master_bookings b
                LEFT JOIN {SCHEMA}.baths ba ON b.booking_type = 'bath' AND b.entity_id = ba.id
                LEFT JOIN {SCHEMA}.masters m ON b.booking_type = 'master' AND b.entity_id = m.id
                WHERE {where_sql}
                ORDER BY b.booking_date DESC, b.start_time DESC
                LIMIT %s OFFSET %s
            """, query_params + [limit, offset])
            
            bookings = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'items': [dict(b) for b in bookings],
                    'total': total,
                    'limit': limit,
                    'offset': offset
                }, default=str),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def handle_post(event: dict) -> dict:
    """Создание нового бронирования"""
    # Проверка авторизации
    auth_header = event.get('headers', {}).get('x-authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else None
    user = get_user_from_token(token)
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    try:
        data = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный JSON'}),
            'isBase64Encoded': False
        }
    
    # Валидация
    booking_type = data.get('booking_type')
    entity_id = data.get('entity_id')
    booking_date = data.get('booking_date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    guests_count = data.get('guests_count', 1)
    notes = data.get('notes', '')
    
    if not all([booking_type, entity_id, booking_date, start_time, end_time]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Отсутствуют обязательные поля'}),
            'isBase64Encoded': False
        }
    
    if booking_type not in ['bath', 'master']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный тип бронирования'}),
            'isBase64Encoded': False
        }
    
    # Парсим дату и время
    try:
        booking_date_obj = datetime.strptime(booking_date, '%Y-%m-%d').date()
        start_time_obj = datetime.strptime(start_time, '%H:%M').time()
        end_time_obj = datetime.strptime(end_time, '%H:%M').time()
    except ValueError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный формат даты или времени'}),
            'isBase64Encoded': False
        }
    
    # Проверка что дата в будущем
    if booking_date_obj < date.today():
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Дата бронирования должна быть в будущем'}),
            'isBase64Encoded': False
        }
    
    # Проверка что время окончания больше времени начала
    if end_time_obj <= start_time_obj:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Время окончания должно быть больше времени начала'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        # Проверяем доступность слота
        if not check_time_slot_available(conn, booking_type, entity_id, booking_date_obj, 
                                         start_time_obj, end_time_obj):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Выбранный временной слот уже занят'}),
                'isBase64Encoded': False
            }
        
        # Получаем цену
        price_per_hour = get_entity_price(conn, booking_type, entity_id)
        if not price_per_hour:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'{booking_type} не найден'}),
                'isBase64Encoded': False
            }
        
        # Рассчитываем общую стоимость
        hours = calculate_hours(start_time_obj, end_time_obj)
        total_price = int(price_per_hour * hours)
        
        # Создаем бронирование
        with conn.cursor() as cur:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.bath_master_bookings 
                (user_id, booking_type, entity_id, booking_date, start_time, end_time, 
                 guests_count, total_price, status, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s)
                RETURNING id, created_at
            """, (user['id'], booking_type, entity_id, booking_date_obj, start_time_obj, 
                  end_time_obj, guests_count, total_price, notes))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': result['id'],
                    'total_price': total_price,
                    'created_at': str(result['created_at']),
                    'message': 'Бронирование успешно создано'
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def handle_put(event: dict) -> dict:
    """Обновление статуса бронирования"""
    # Проверка авторизации
    auth_header = event.get('headers', {}).get('x-authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else None
    user = get_user_from_token(token)
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    try:
        data = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный JSON'}),
            'isBase64Encoded': False
        }
    
    booking_id = data.get('booking_id')
    status = data.get('status')
    
    if not booking_id or not status:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Отсутствуют обязательные поля'}),
            'isBase64Encoded': False
        }
    
    if status not in ['pending', 'confirmed', 'completed']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный статус'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Проверяем что бронирование принадлежит пользователю
            cur.execute(f"""
                SELECT id, status FROM {SCHEMA}.bath_master_bookings
                WHERE id = %s AND user_id = %s
            """, (booking_id, user['id']))
            
            booking = cur.fetchone()
            if not booking:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Бронирование не найдено'}),
                    'isBase64Encoded': False
                }
            
            if booking['status'] == 'canceled':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нельзя изменить отмененное бронирование'}),
                    'isBase64Encoded': False
                }
            
            # Обновляем статус
            cur.execute(f"""
                UPDATE {SCHEMA}.bath_master_bookings
                SET status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (status, booking_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Статус бронирования обновлен'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def handle_delete(event: dict) -> dict:
    """Отмена бронирования"""
    # Проверка авторизации
    auth_header = event.get('headers', {}).get('x-authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else None
    user = get_user_from_token(token)
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    booking_id = params.get('booking_id')
    
    if not booking_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Отсутствует ID бронирования'}),
            'isBase64Encoded': False
        }
    
    try:
        data = json.loads(event.get('body', '{}'))
        cancellation_reason = data.get('reason', '')
    except:
        cancellation_reason = ''
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Проверяем что бронирование принадлежит пользователю
            cur.execute(f"""
                SELECT id, status FROM {SCHEMA}.bath_master_bookings
                WHERE id = %s AND user_id = %s
            """, (booking_id, user['id']))
            
            booking = cur.fetchone()
            if not booking:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Бронирование не найдено'}),
                    'isBase64Encoded': False
                }
            
            if booking['status'] == 'canceled':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Бронирование уже отменено'}),
                    'isBase64Encoded': False
                }
            
            # Отменяем бронирование
            cur.execute(f"""
                UPDATE {SCHEMA}.bath_master_bookings
                SET status = 'canceled', 
                    canceled_at = CURRENT_TIMESTAMP,
                    cancellation_reason = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (cancellation_reason, booking_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Бронирование отменено'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
