"""
UGC Blog API для СПАРКОМ
Пользовательский блог с модерацией, антиспамом и правами доступа
"""
import json
import os
import re
from datetime import datetime, timedelta
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor


def get_db():
    """Подключение к БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)


def get_user_from_token(headers: dict) -> Optional[dict]:
    """Извлечение пользователя из токена"""
    auth_header = headers.get('X-Authorization', headers.get('authorization', ''))
    if not auth_header:
        return None
    
    token = auth_header.replace('Bearer ', '').replace('bearer ', '')
    if not token:
        return None
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.email, u.name, u.role, u.avatar_url, u.created_at
        FROM users u
        JOIN sessions s ON s.user_id = u.id
        WHERE s.access_token = %s AND s.expires_at > NOW()
    """, (token,))
    user = cursor.fetchone()
    conn.close()
    
    return dict(user) if user else None


def generate_slug(title: str) -> str:
    """Генерация slug из заголовка"""
    # Транслитерация русских букв
    translit_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }
    
    slug = title.lower()
    for ru, en in translit_map.items():
        slug = slug.replace(ru, en)
    
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    slug = slug.strip('-')
    
    return slug[:100]


def check_rate_limit(user_id: int) -> tuple[bool, str]:
    """Проверка лимита постов в сутки (антиспам)"""
    MAX_POSTS_PER_DAY = 10  # Конфигурируемый лимит
    
    conn = get_db()
    cursor = conn.cursor()
    
    today = datetime.now().date()
    cursor.execute("""
        SELECT posts_count FROM blog_rate_limits
        WHERE user_id = %s AND limit_date = %s
    """, (user_id, today))
    
    result = cursor.fetchone()
    
    if result:
        if result['posts_count'] >= MAX_POSTS_PER_DAY:
            conn.close()
            return False, f'Превышен лимит: максимум {MAX_POSTS_PER_DAY} постов в сутки'
        
        cursor.execute("""
            UPDATE blog_rate_limits
            SET posts_count = posts_count + 1, last_post_at = NOW()
            WHERE user_id = %s AND limit_date = %s
        """, (user_id, today))
    else:
        cursor.execute("""
            INSERT INTO blog_rate_limits (user_id, posts_count, last_post_at, limit_date)
            VALUES (%s, 1, NOW(), %s)
        """, (user_id, today))
    
    conn.commit()
    conn.close()
    
    return True, 'OK'


def create_post(user: dict, data: dict) -> dict:
    """Создание нового поста"""
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    visibility = data.get('visibility', 'public')
    related_event_id = data.get('related_event_id')
    
    if not title or len(title) < 5:
        return {'error': 'Заголовок должен содержать минимум 5 символов'}, 400
    
    if not content or len(content) < 50:
        return {'error': 'Содержание должно содержать минимум 50 символов'}, 400
    
    # Антиспам проверка
    allowed, message = check_rate_limit(user['id'])
    if not allowed:
        return {'error': message}, 429
    
    # Автопубликация для мастеров и организаторов
    auto_publish_roles = ['master', 'organizer', 'admin']
    status = 'published' if user['role'] in auto_publish_roles else 'draft'
    published_at = datetime.now() if status == 'published' else None
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Генерация уникального slug
    base_slug = generate_slug(title)
    slug = base_slug
    counter = 1
    
    while True:
        cursor.execute("SELECT id FROM blog_posts WHERE slug = %s", (slug,))
        if not cursor.fetchone():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    cursor.execute("""
        INSERT INTO blog_posts 
        (slug, title, content, author_id, status, visibility, 
         related_event_id, published_at, author, category, date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        RETURNING id, slug, status, created_at
    """, (slug, title, content, user['id'], status, visibility,
          related_event_id, published_at, user['name'], 'Общее'))
    
    result = cursor.fetchone()
    conn.commit()
    conn.close()
    
    return {
        'id': result['id'],
        'slug': result['slug'],
        'status': result['status'],
        'created_at': result['created_at'].isoformat()
    }, 201


def get_posts(user: Optional[dict], params: dict) -> dict:
    """Получение списка постов с фильтрами"""
    author_id = params.get('author')
    status = params.get('status')
    related_event = params.get('related_event')
    date_from = params.get('date_from')
    date_to = params.get('date_to')
    limit = min(int(params.get('limit', 20)), 100)
    offset = int(params.get('offset', 0))
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Базовый запрос
    where_clauses = ["archived = FALSE"]
    query_params = []
    
    # Фильтр по видимости
    if user:
        # Авторизованный пользователь видит:
        # - все public
        # - свои посты
        # - администраторы видят всё
        if user['role'] != 'admin':
            where_clauses.append(
                "(visibility = 'public' OR author_id = %s OR "
                "(visibility = 'followers' AND author_id = %s))"
            )
            query_params.extend([user['id'], user['id']])
    else:
        # Неавторизованный видит только public + published
        where_clauses.append("visibility = 'public' AND status = 'published'")
    
    # Фильтры
    if author_id:
        where_clauses.append("author_id = %s")
        query_params.append(int(author_id))
    
    if status and user and user['role'] == 'admin':
        where_clauses.append("status = %s")
        query_params.append(status)
    
    if related_event:
        where_clauses.append("related_event_id = %s")
        query_params.append(int(related_event))
    
    if date_from:
        where_clauses.append("date >= %s")
        query_params.append(date_from)
    
    if date_to:
        where_clauses.append("date <= %s")
        query_params.append(date_to)
    
    where_sql = " AND ".join(where_clauses)
    
    # Подсчет общего количества
    cursor.execute(f"""
        SELECT COUNT(*) as total FROM blog_posts
        WHERE {where_sql}
    """, query_params)
    total = cursor.fetchone()['total']
    
    # Получение постов
    cursor.execute(f"""
        SELECT 
            p.id, p.slug, p.title, p.excerpt, p.content, p.image_url,
            p.author_id, p.author, p.status, p.visibility,
            p.views_count, p.created_at, p.published_at,
            u.avatar_url as author_avatar
        FROM blog_posts p
        LEFT JOIN users u ON u.id = p.author_id
        WHERE {where_sql}
        ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
        LIMIT %s OFFSET %s
    """, query_params + [limit, offset])
    
    posts = cursor.fetchall()
    conn.close()
    
    return {
        'posts': [dict(post) for post in posts],
        'total': total,
        'limit': limit,
        'offset': offset
    }, 200


def get_post(slug: str, user: Optional[dict]) -> dict:
    """Получение конкретного поста"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            p.*,
            u.avatar_url as author_avatar,
            u.email as author_email
        FROM blog_posts p
        LEFT JOIN users u ON u.id = p.author_id
        WHERE p.slug = %s AND p.archived = FALSE
    """, (slug,))
    
    post = cursor.fetchone()
    
    if not post:
        conn.close()
        return {'error': 'Пост не найден'}, 404
    
    post = dict(post)
    
    # Проверка прав доступа
    if post['visibility'] != 'public':
        if not user:
            conn.close()
            return {'error': 'Доступ запрещен'}, 403
        
        if post['author_id'] != user['id'] and user['role'] != 'admin':
            conn.close()
            return {'error': 'Доступ запрещен'}, 403
    
    # Увеличение счетчика просмотров
    cursor.execute("""
        UPDATE blog_posts SET views_count = views_count + 1
        WHERE id = %s
    """, (post['id'],))
    conn.commit()
    conn.close()
    
    return post, 200


def update_post(slug: str, user: dict, data: dict) -> dict:
    """Обновление поста"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM blog_posts
        WHERE slug = %s AND archived = FALSE
    """, (slug,))
    
    post = cursor.fetchone()
    
    if not post:
        conn.close()
        return {'error': 'Пост не найден'}, 404
    
    # Проверка прав: только автор или администратор
    if post['author_id'] != user['id'] and user['role'] != 'admin':
        conn.close()
        return {'error': 'Нет прав на редактирование'}, 403
    
    # Обновляемые поля
    update_fields = []
    update_params = []
    
    if 'title' in data:
        update_fields.append("title = %s")
        update_params.append(data['title'])
    
    if 'content' in data:
        update_fields.append("content = %s")
        update_params.append(data['content'])
    
    if 'visibility' in data:
        update_fields.append("visibility = %s")
        update_params.append(data['visibility'])
    
    if 'status' in data and user['role'] == 'admin':
        update_fields.append("status = %s")
        update_params.append(data['status'])
        
        if data['status'] == 'published' and not post['published_at']:
            update_fields.append("published_at = NOW()")
    
    if not update_fields:
        conn.close()
        return {'error': 'Нет полей для обновления'}, 400
    
    update_fields.append("updated_at = NOW()")
    update_params.append(post['id'])
    
    cursor.execute(f"""
        UPDATE blog_posts
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, slug, status
    """, update_params)
    
    result = cursor.fetchone()
    conn.commit()
    conn.close()
    
    return dict(result), 200


def moderate_post(post_id: int, moderator: dict, data: dict) -> dict:
    """Модерация поста (только для администраторов)"""
    if moderator['role'] != 'admin':
        return {'error': 'Недостаточно прав'}, 403
    
    action = data.get('action')  # publish, hide, block
    reason = data.get('reason', '')
    
    if action not in ['publish', 'hide', 'block']:
        return {'error': 'Недопустимое действие'}, 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM blog_posts WHERE id = %s", (post_id,))
    post = cursor.fetchone()
    
    if not post:
        conn.close()
        return {'error': 'Пост не найден'}, 404
    
    old_status = post['status']
    new_status = action.replace('publish', 'published').replace('hide', 'hidden')
    
    cursor.execute("""
        UPDATE blog_posts
        SET status = %s, updated_at = NOW()
        WHERE id = %s
    """, (new_status, post_id))
    
    # Лог модерации
    cursor.execute("""
        INSERT INTO blog_moderation_log
        (post_id, moderator_id, action, old_status, new_status, reason)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (post_id, moderator['id'], action, old_status, new_status, reason))
    
    conn.commit()
    conn.close()
    
    return {'status': 'success', 'new_status': new_status}, 200


def handler(event: dict, context) -> dict:
    """Главный обработчик"""
    method = event.get('httpMethod', 'GET')
    headers = event.get('headers', {})
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user = get_user_from_token(headers)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            slug = params.get('slug')
            
            if slug:
                result, status = get_post(slug, user)
            else:
                result, status = get_posts(user, params)
        
        elif method == 'POST':
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'moderate':
                post_id = body.get('post_id')
                result, status = moderate_post(post_id, user, body)
            else:
                result, status = create_post(user, body)
        
        elif method == 'PUT':
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'}),
                    'isBase64Encoded': False
                }
            
            params = event.get('queryStringParameters') or {}
            slug = params.get('slug')
            
            if not slug:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется параметр slug'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            result, status = update_post(slug, user, body)
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': status,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, default=str, ensure_ascii=False),
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
