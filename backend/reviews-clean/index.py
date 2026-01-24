"""
API для работы с отзывами.
Поддерживает создание, получение и модерацию отзывов для бань, мастеров и событий.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

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
    API для работы с отзывами.
    
    GET /reviews?entity_type=bath&entity_id=1 - получить отзывы
    POST /reviews - создать отзыв
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
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
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            entity_type = params.get('entity_type')
            entity_id = params.get('entity_id')
            
            if not entity_type or not entity_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуются параметры entity_type и entity_id'}),
                    'isBase64Encoded': False
                }
            
            result = get_reviews(entity_type, int(entity_id))
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            request_headers = event.get('headers', {})
            user_id = get_user_id_from_token(request_headers)
            body = json.loads(event.get('body', '{}'))
            
            result = create_review(user_id, body)
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Метод не поддерживается'}),
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
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }


def get_reviews(entity_type: str, entity_id: int) -> dict:
    """Получение отзывов для сущности"""
    if entity_type not in ['bath', 'master', 'event']:
        raise ValueError('Некорректный тип сущности')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Получение отзывов с использованием параметризованного запроса
            cursor.execute(
                f"""
                SELECT r.id, r.rating, r.comment, r.response, r.created_at, 
                       u.id as user_id, u.name as user_name
                FROM {SCHEMA}.reviews r
                JOIN {SCHEMA}.users u ON r.user_id = u.id
                WHERE r.entity_type = %s AND r.entity_id = %s AND r.is_approved = true
                ORDER BY r.created_at DESC
                """,
                (entity_type, entity_id)
            )
            
            rows = cursor.fetchall()
            
            reviews = []
            for row in rows:
                reviews.append({
                    'id': row['id'],
                    'rating': row['rating'],
                    'comment': row['comment'] or '',
                    'response': row['response'],
                    'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                    'user': {
                        'id': row['user_id'],
                        'name': row['user_name'] or ''
                    }
                })
            
            # Получение статистики
            cursor.execute(
                f"""
                SELECT COALESCE(AVG(rating)::numeric(3,1), 0) as avg_rating, COUNT(*) as total_count
                FROM {SCHEMA}.reviews
                WHERE entity_type = %s AND entity_id = %s AND is_approved = true
                """,
                (entity_type, entity_id)
            )
            
            stats = cursor.fetchone()
            avg_rating = float(stats['avg_rating']) if stats['avg_rating'] else 0.0
            total_count = int(stats['total_count']) if stats['total_count'] else 0
            
            return {
                'reviews': reviews,
                'stats': {
                    'average_rating': avg_rating,
                    'total_count': total_count
                }
            }
    finally:
        conn.close()


def create_review(user_id: int, data: dict) -> dict:
    """Создание нового отзыва"""
    entity_type = data.get('entity_type')
    entity_id = data.get('entity_id')
    rating = data.get('rating')
    comment = data.get('comment', '')
    
    if not entity_type or not entity_id:
        raise ValueError('Требуются параметры entity_type и entity_id')
    
    if entity_type not in ['bath', 'master', 'event']:
        raise ValueError('Некорректный тип сущности')
    
    if not rating or rating < 1 or rating > 5:
        raise ValueError('Рейтинг должен быть от 1 до 5')
    
    if len(comment) < 10:
        raise ValueError('Комментарий должен содержать минимум 10 символов')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Проверка, что пользователь еще не оставлял отзыв
            cursor.execute(
                f"""
                SELECT id FROM {SCHEMA}.reviews
                WHERE user_id = %s AND entity_type = %s AND entity_id = %s
                """,
                (user_id, entity_type, entity_id)
            )
            
            if cursor.fetchone():
                raise ValueError('Вы уже оставляли отзыв на эту сущность')
            
            # Создание отзыва
            cursor.execute(
                f"""
                INSERT INTO {SCHEMA}.reviews 
                (user_id, entity_type, entity_id, rating, comment, is_approved, created_at)
                VALUES (%s, %s, %s, %s, %s, true, NOW())
                RETURNING id, created_at
                """,
                (user_id, entity_type, entity_id, rating, comment)
            )
            
            result = cursor.fetchone()
            review_id = result['id']
            created_at = result['created_at']
            
            # Обновление рейтинга сущности
            table_map = {
                'bath': 'baths',
                'master': 'masters',
                'event': 'events'
            }
            table_name = table_map.get(entity_type)
            
            if table_name:
                cursor.execute(
                    f"""
                    UPDATE {SCHEMA}.{table_name}
                    SET rating = (
                        SELECT AVG(rating)::numeric(2,1) 
                        FROM {SCHEMA}.reviews
                        WHERE entity_type = %s AND entity_id = %s AND is_approved = true
                    ),
                    reviews_count = (
                        SELECT COUNT(*) 
                        FROM {SCHEMA}.reviews
                        WHERE entity_type = %s AND entity_id = %s AND is_approved = true
                    )
                    WHERE id = %s
                    """,
                    (entity_type, entity_id, entity_type, entity_id, entity_id)
                )
            
            conn.commit()
            
            return {
                'id': review_id,
                'created_at': created_at.isoformat() if created_at else None,
                'message': 'Отзыв успешно создан'
            }
    finally:
        conn.close()
