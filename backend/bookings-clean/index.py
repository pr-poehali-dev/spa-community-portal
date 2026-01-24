"""
API для управления бронированиями бань и мастеров.
Требует авторизации.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, time

SCHEMA = 't_p13705114_spa_community_portal'


def get_db_connection():
    """Создание подключения к БД"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def get_user_id_from_token(headers: dict) -> int:
    """Извлечение user_id из токена"""
    token = headers.get('x-authorization', '').replace('Bearer ', '')
    if not token:
        raise ValueError('Требуется авторизация')
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                f"SELECT user_id FROM {SCHEMA}.user_sessions WHERE session_token = %s AND expires_at > NOW()",
                (token,)
            )
            result = cursor.fetchone()
            
            if not result:
                raise ValueError('Невалидный токен')
            
            return result[0]
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """
    API для бронирований.
    
    GET /bookings - список бронирований пользователя
    POST /bookings - создать бронирование
    PUT /bookings/:id - обновить бронирование
    DELETE /bookings/:id - отменить бронирование
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
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
    
    headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        request_headers = event.get('headers', {})
        user_id = get_user_id_from_token(request_headers)
        
        query_params = event.get('queryStringParameters', {}) or {}
        booking_id = query_params.get('id', '')
        
        if method == 'GET':
            if booking_id:
                result = get_booking_details(user_id, booking_id)
            else:
                result = get_user_bookings(user_id, query_params)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            result = create_booking(user_id, body)
        
        elif method == 'PUT':
            if not booking_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID бронирования'}),
                    'isBase64Encoded': False
                }
            body = json.loads(event.get('body', '{}'))
            result = update_booking(user_id, booking_id, body)
        
        elif method == 'DELETE':
            if not booking_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID бронирования'}),
                    'isBase64Encoded': False
                }
            result = cancel_booking(user_id, booking_id)
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
        status_code = 200 if method in ['GET', 'PUT', 'DELETE'] else 201
        
        return {
            'statusCode': status_code,
            'headers': headers,
            'body': json.dumps(result, ensure_ascii=False, default=str),
            'isBase64Encoded': False
        }
    
    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Server error: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }


def get_user_bookings(user_id: int, params: dict) -> dict:
    """Получение бронирований пользователя"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            status = params.get('status')
            limit = int(params.get('limit', 20))
            offset = int(params.get('offset', 0))
            
            where_clauses = ["user_id = %s"]
            query_params = [user_id]
            
            if status:
                where_clauses.append("status = %s")
                query_params.append(status)
            
            where_sql = " AND ".join(where_clauses)
            
            cursor.execute(
                f"""
                SELECT id, booking_type, entity_id, booking_date, start_time, end_time,
                       guests_count, total_price, status, notes, created_at
                FROM {SCHEMA}.bath_master_bookings
                WHERE {where_sql}
                ORDER BY booking_date DESC, start_time DESC
                LIMIT %s OFFSET %s
                """,
                (*query_params, limit, offset)
            )
            
            bookings = cursor.fetchall()
            
            return {
                'bookings': [dict(booking) for booking in bookings],
                'total': len(bookings)
            }
    finally:
        conn.close()


def get_booking_details(user_id: int, booking_id: str) -> dict:
    """Получение деталей бронирования"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                f"""
                SELECT *
                FROM {SCHEMA}.bath_master_bookings
                WHERE id = %s AND user_id = %s
                """,
                (booking_id, user_id)
            )
            
            booking = cursor.fetchone()
            
            if not booking:
                raise ValueError('Бронирование не найдено')
            
            return dict(booking)
    finally:
        conn.close()


def create_booking(user_id: int, data: dict) -> dict:
    """Создание бронирования"""
    booking_type = data.get('booking_type')
    entity_id = data.get('entity_id')
    booking_date = data.get('booking_date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    guests_count = data.get('guests_count', 1)
    total_price = data.get('total_price')
    notes = data.get('notes', '')
    
    if not all([booking_type, entity_id, booking_date, start_time, end_time, total_price]):
        raise ValueError('Не все обязательные поля заполнены')
    
    if booking_type not in ['bath', 'master']:
        raise ValueError('Некорректный тип бронирования')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Проверка на конфликт времени
            cursor.execute(
                f"""
                SELECT id FROM {SCHEMA}.bath_master_bookings
                WHERE booking_type = %s 
                  AND entity_id = %s 
                  AND booking_date = %s
                  AND start_time < %s
                  AND end_time > %s
                  AND status IN ('pending', 'confirmed')
                """,
                (booking_type, entity_id, booking_date, end_time, start_time)
            )
            
            if cursor.fetchone():
                raise ValueError('Это время уже забронировано')
            
            # Создание бронирования
            cursor.execute(
                f"""
                INSERT INTO {SCHEMA}.bath_master_bookings
                (user_id, booking_type, entity_id, booking_date, start_time, end_time,
                 guests_count, total_price, status, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s)
                RETURNING id, created_at
                """,
                (user_id, booking_type, entity_id, booking_date, start_time, end_time,
                 guests_count, total_price, notes)
            )
            
            result = cursor.fetchone()
            conn.commit()
            
            return {
                'id': result['id'],
                'created_at': result['created_at'],
                'message': 'Бронирование создано'
            }
    finally:
        conn.close()


def update_booking(user_id: int, booking_id: str, data: dict) -> dict:
    """Обновление бронирования"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Проверка принадлежности бронирования
            cursor.execute(
                f"""
                SELECT status FROM {SCHEMA}.bath_master_bookings
                WHERE id = %s AND user_id = %s
                """,
                (booking_id, user_id)
            )
            
            booking = cursor.fetchone()
            if not booking:
                raise ValueError('Бронирование не найдено')
            
            if booking['status'] not in ['pending', 'confirmed']:
                raise ValueError('Нельзя изменить бронирование в статусе ' + booking['status'])
            
            # Обновление полей
            update_fields = []
            update_values = []
            
            if 'guests_count' in data:
                update_fields.append("guests_count = %s")
                update_values.append(data['guests_count'])
            
            if 'notes' in data:
                update_fields.append("notes = %s")
                update_values.append(data['notes'])
            
            if not update_fields:
                raise ValueError('Нет полей для обновления')
            
            update_fields.append("updated_at = NOW()")
            update_values.append(booking_id)
            
            cursor.execute(
                f"""
                UPDATE {SCHEMA}.bath_master_bookings
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, updated_at
                """,
                update_values
            )
            
            result = cursor.fetchone()
            conn.commit()
            
            return {
                'id': result['id'],
                'updated_at': result['updated_at'],
                'message': 'Бронирование обновлено'
            }
    finally:
        conn.close()


def cancel_booking(user_id: int, booking_id: str) -> dict:
    """Отмена бронирования"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                f"""
                UPDATE {SCHEMA}.bath_master_bookings
                SET status = 'canceled', canceled_at = NOW(), updated_at = NOW()
                WHERE id = %s AND user_id = %s AND status IN ('pending', 'confirmed')
                RETURNING id
                """,
                (booking_id, user_id)
            )
            
            result = cursor.fetchone()
            
            if not result:
                raise ValueError('Бронирование не найдено или уже отменено')
            
            conn.commit()
            
            return {
                'id': result['id'],
                'message': 'Бронирование отменено'
            }
    finally:
        conn.close()
