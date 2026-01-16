import json
import os
import psycopg2
from datetime import datetime

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
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT user_id FROM t_p13705114_spa_community_portal.user_sessions 
        WHERE access_token = %s AND access_expires_at > NOW()
    """, (token,))
    
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not result:
        raise ValueError('Невалидный токен')
    
    return result[0]

def handler(event: dict, context) -> dict:
    """
    API для работы с отзывами.
    Поддерживает создание, получение и модерацию отзывов.
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': ''
        }
    
    params = event.get('queryStringParameters') or {}
    headers = event.get('headers', {})
    
    if method == 'GET':
        entity_type = params.get('entity_type')
        entity_id = params.get('entity_id')
        
        if not entity_type or not entity_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуются параметры entity_type и entity_id'}, ensure_ascii=False)
            }
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            result = get_reviews(cursor, entity_type, int(entity_id))
        
        elif method == 'POST':
            user_id = get_user_id_from_token(headers)
            body = json.loads(event.get('body', '{}'))
            result = create_review(cursor, conn, user_id, body)
        
        else:
            cursor.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False)
            }
        
        cursor.close()
        
        return {
            'statusCode': 200 if method == 'GET' else 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False)
        }
    
    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False)
        }
    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error: {error_msg}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка: {error_msg}'}, ensure_ascii=False)
        }
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

def get_reviews(cursor, entity_type: str, entity_id: int) -> dict:
    """Получение отзывов для сущности"""
    if entity_type not in ['bath', 'master', 'event']:
        raise ValueError('Некорректный тип сущности')
    
    cursor.execute(
        "SELECT r.id, r.rating, r.comment, r.response, r.created_at, u.id, u.first_name, u.last_name " +
        "FROM t_p13705114_spa_community_portal.reviews r " +
        "JOIN t_p13705114_spa_community_portal.users u ON r.user_id = u.id " +
        "WHERE r.entity_type = '" + entity_type + "' AND r.entity_id = " + str(entity_id) + " AND r.is_approved = true " +
        "ORDER BY r.created_at DESC"
    )
    
    rows = cursor.fetchall()
    
    reviews = []
    for row in rows:
        reviews.append({
            'id': row[0],
            'rating': row[1],
            'comment': row[2] if row[2] else '',
            'response': row[3] if row[3] else None,
            'created_at': row[4].isoformat() if row[4] else None,
            'user': {
                'id': row[5],
                'first_name': row[6] if row[6] else '',
                'last_name': row[7] if row[7] else ''
            }
        })
    
    cursor.execute(
        "SELECT COALESCE(AVG(rating)::numeric(3,1), 0), COUNT(*) " +
        "FROM t_p13705114_spa_community_portal.reviews " +
        "WHERE entity_type = '" + entity_type + "' AND entity_id = " + str(entity_id) + " AND is_approved = true"
    )
    
    stats = cursor.fetchone()
    avg_rating = float(stats[0]) if stats[0] else 0.0
    total_count = int(stats[1]) if stats[1] else 0
    
    return {
        'reviews': reviews,
        'stats': {
            'average_rating': avg_rating,
            'total_count': total_count
        }
    }

def create_review(cursor, conn, user_id: int, data: dict) -> dict:
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
    
    cursor.execute(
        "SELECT id FROM t_p13705114_spa_community_portal.reviews " +
        "WHERE user_id = " + str(user_id) + " AND entity_type = '" + entity_type + "' AND entity_id = " + str(entity_id)
    )
    
    if cursor.fetchone():
        raise ValueError('Вы уже оставляли отзыв на эту сущность')
    
    comment_escaped = comment.replace("'", "''")
    cursor.execute(
        "INSERT INTO t_p13705114_spa_community_portal.reviews " +
        "(user_id, entity_type, entity_id, rating, comment, is_approved, created_at) " +
        "VALUES (" + str(user_id) + ", '" + entity_type + "', " + str(entity_id) + ", " + str(rating) + ", '" + comment_escaped + "', true, NOW()) " +
        "RETURNING id, created_at"
    )
    
    result = cursor.fetchone()
    review_id = result[0]
    created_at = result[1]
    
    table_map = {
        'bath': 'baths',
        'master': 'masters',
        'event': 'events'
    }
    table_name = table_map.get(entity_type)
    
    if table_name:
        cursor.execute(
            "UPDATE t_p13705114_spa_community_portal." + table_name + " " +
            "SET rating = (" +
            "SELECT AVG(rating)::numeric(2,1) FROM t_p13705114_spa_community_portal.reviews " +
            "WHERE entity_type = '" + entity_type + "' AND entity_id = " + str(entity_id) + " AND is_approved = true" +
            "), reviews_count = (" +
            "SELECT COUNT(*) FROM t_p13705114_spa_community_portal.reviews " +
            "WHERE entity_type = '" + entity_type + "' AND entity_id = " + str(entity_id) + " AND is_approved = true" +
            ") WHERE id = " + str(entity_id)
        )
    
    conn.commit()
    
    return {
        'id': review_id,
        'created_at': created_at,
        'message': 'Отзыв успешно создан'
    }