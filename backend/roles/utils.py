"""Утилиты для работы с ролями"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_connection():
    """Получение подключения к БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_by_token(token: str) -> dict | None:
    """Получение пользователя по access токену"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT u.* FROM t_p13705114_spa_community_portal.users u
                   JOIN t_p13705114_spa_community_portal.user_sessions s ON u.id = s.user_id
                   WHERE s.session_token = %s 
                   AND s.expires_at > NOW() 
                   AND u.is_active = true""",
                (token,)
            )
            user = cur.fetchone()
            return dict(user) if user else None
    finally:
        conn.close()
