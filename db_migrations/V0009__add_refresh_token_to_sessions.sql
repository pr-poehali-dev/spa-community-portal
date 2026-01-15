-- Добавление refresh_token и refresh_expires_at к user_sessions

ALTER TABLE t_p13705114_spa_community_portal.user_sessions
ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS refresh_expires_at TIMESTAMP;

-- Создание индекса для быстрого поиска по refresh_token
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token 
ON t_p13705114_spa_community_portal.user_sessions(refresh_token);

-- Обновление существующих сессий (выдаём им refresh токены на 30 дней)
UPDATE t_p13705114_spa_community_portal.user_sessions
SET refresh_expires_at = expires_at + INTERVAL '29 days'
WHERE refresh_token IS NULL;
