import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("SET search_path TO t_p13705114_spa_community_portal, public")
    cur.close()
    return conn

def handler(event: dict, context) -> dict:
    '''API для управления блогом: посты, комментарии, лайки'''
    
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'list')
    post_id = params.get('post_id')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET' and action == 'comments' and post_id:
            return get_post_comments(post_id)
        
        elif method == 'GET' and action == 'get' and post_id:
            return get_post_by_id(post_id)
        
        elif method == 'GET' and action == 'list':
            return get_posts(params)
        
        elif method == 'POST' and action == 'create':
            body = json.loads(event.get('body', '{}'))
            return create_post(body, event)
        
        elif method == 'PUT' and action == 'update' and post_id:
            body = json.loads(event.get('body', '{}'))
            return update_post(post_id, body, event)
        
        elif method == 'POST' and action == 'like' and post_id:
            return toggle_post_like(post_id, event)
        
        elif method == 'POST' and action == 'comment':
            body = json.loads(event.get('body', '{}'))
            return create_comment(body, event)
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Not found: {method} action={action}'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_posts(query_params: dict) -> dict:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    tag = query_params.get('tag')
    is_draft = query_params.get('draft', 'false').lower() == 'true'
    limit = int(query_params.get('limit', 50))
    offset = int(query_params.get('offset', 0))
    
    if tag:
        cur.execute('''
            SELECT DISTINCT p.*, u.name as author_name, u.avatar_url as author_avatar,
                   ARRAY_AGG(DISTINCT t.tag) FILTER (WHERE t.tag IS NOT NULL) as tags
            FROM blog_posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN blog_post_tags t ON p.id = t.post_id
            WHERE p.is_draft = %s AND p.id IN (
                SELECT post_id FROM blog_post_tags WHERE tag = %s
            )
            GROUP BY p.id, u.name, u.avatar_url
            ORDER BY p.published_at DESC
            LIMIT %s OFFSET %s
        ''', (is_draft, tag, limit, offset))
    else:
        cur.execute('''
            SELECT p.*, u.name as author_name, u.avatar_url as author_avatar,
                   ARRAY_AGG(DISTINCT t.tag) FILTER (WHERE t.tag IS NOT NULL) as tags
            FROM blog_posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN blog_post_tags t ON p.id = t.post_id
            WHERE p.is_draft = %s
            GROUP BY p.id, u.name, u.avatar_url
            ORDER BY p.published_at DESC
            LIMIT %s OFFSET %s
        ''', (is_draft, limit, offset))
    
    posts = cur.fetchall()
    
    for post in posts:
        if post['tags'] is None:
            post['tags'] = []
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'posts': posts}, default=str),
        'isBase64Encoded': False
    }

def get_post_by_id(post_id: str) -> dict:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        SELECT p.*, u.name as author_name, u.avatar_url as author_avatar, u.bio as author_bio,
               ARRAY_AGG(DISTINCT t.tag) FILTER (WHERE t.tag IS NOT NULL) as tags
        FROM blog_posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN blog_post_tags t ON p.id = t.post_id
        WHERE p.id = %s
        GROUP BY p.id, u.name, u.avatar_url, u.bio
    ''', (post_id,))
    
    post = cur.fetchone()
    
    if not post:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Post not found'}),
            'isBase64Encoded': False
        }
    
    if post['tags'] is None:
        post['tags'] = []
    
    cur.execute('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = %s', (post_id,))
    conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'post': post}, default=str),
        'isBase64Encoded': False
    }

def create_post(body: dict, event: dict) -> dict:
    user_id = get_user_id_from_token(event)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    content = body.get('content')
    excerpt = body.get('excerpt', '')
    cover_image = body.get('cover_image', '')
    tags = body.get('tags', [])
    is_draft = body.get('is_draft', True)
    reading_time = calculate_reading_time(content)
    
    if not title or not content:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Title and content are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        INSERT INTO blog_posts (title, excerpt, content, author_id, cover_image, is_draft, reading_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    ''', (title, excerpt, content, user_id, cover_image, is_draft, reading_time))
    
    post_id = cur.fetchone()['id']
    
    for tag in tags:
        cur.execute('''
            INSERT INTO blog_post_tags (post_id, tag)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
        ''', (post_id, tag))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'post': {'id': post_id}}),
        'isBase64Encoded': False
    }

def update_post(post_id: str, body: dict, event: dict) -> dict:
    user_id = get_user_id_from_token(event)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('SELECT author_id FROM blog_posts WHERE id = %s', (post_id,))
    result = cur.fetchone()
    
    if not result or result[0] != user_id:
        cur.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'}),
            'isBase64Encoded': False
        }
    
    title = body.get('title')
    content = body.get('content')
    excerpt = body.get('excerpt')
    cover_image = body.get('cover_image')
    is_draft = body.get('is_draft')
    
    if content:
        reading_time = calculate_reading_time(content)
    else:
        reading_time = None
    
    update_fields = []
    params = []
    
    if title:
        update_fields.append('title = %s')
        params.append(title)
    if content:
        update_fields.append('content = %s')
        params.append(content)
    if excerpt is not None:
        update_fields.append('excerpt = %s')
        params.append(excerpt)
    if cover_image is not None:
        update_fields.append('cover_image = %s')
        params.append(cover_image)
    if is_draft is not None:
        update_fields.append('is_draft = %s')
        params.append(is_draft)
    if reading_time:
        update_fields.append('reading_time = %s')
        params.append(reading_time)
    
    if update_fields:
        params.append(post_id)
        cur.execute(f'''
            UPDATE blog_posts
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', params)
    
    if 'tags' in body:
        cur.execute('DELETE FROM blog_post_tags WHERE post_id = %s', (post_id,))
        for tag in body['tags']:
            cur.execute('''
                INSERT INTO blog_post_tags (post_id, tag)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            ''', (post_id, tag))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def toggle_post_like(post_id: str, event: dict) -> dict:
    user_id = get_user_id_from_token(event)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
        SELECT id FROM blog_post_likes
        WHERE post_id = %s AND user_id = %s
    ''', (post_id, user_id))
    
    existing_like = cur.fetchone()
    
    if existing_like:
        cur.execute('''
            DELETE FROM blog_post_likes
            WHERE post_id = %s AND user_id = %s
        ''', (post_id, user_id))
        liked = False
    else:
        cur.execute('''
            INSERT INTO blog_post_likes (post_id, user_id)
            VALUES (%s, %s)
        ''', (post_id, user_id))
        liked = True
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'liked': liked}),
        'isBase64Encoded': False
    }

def get_post_comments(post_id: str) -> dict:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        SELECT c.*, u.name as user_name, u.avatar_url as user_avatar
        FROM blog_comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = %s
        ORDER BY c.created_at DESC
    ''', (post_id,))
    
    comments = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'comments': comments}, default=str),
        'isBase64Encoded': False
    }

def create_comment(body: dict, event: dict) -> dict:
    user_id = get_user_id_from_token(event)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    post_id = body.get('post_id')
    content = body.get('content')
    
    if not post_id or not content:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'post_id and content are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        INSERT INTO blog_comments (post_id, user_id, content)
        VALUES (%s, %s, %s)
        RETURNING id
    ''', (post_id, user_id, content))
    
    comment_id = cur.fetchone()['id']
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'comment': {'id': comment_id}}),
        'isBase64Encoded': False
    }

def get_user_id_from_token(event: dict) -> int:
    headers = event.get('headers', {})
    auth_header = headers.get('X-Authorization', headers.get('x-authorization', ''))
    
    if not auth_header:
        return None
    
    token = auth_header.replace('Bearer ', '').strip()
    
    if not token:
        return None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT user_id FROM user_sessions
            WHERE session_token = %s AND expires_at > CURRENT_TIMESTAMP
        ''', (token,))
        
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if result:
            return result[0]
    except:
        pass
    
    return None

def calculate_reading_time(content: str) -> int:
    words = len(content.split())
    minutes = max(1, words // 200)
    return minutes