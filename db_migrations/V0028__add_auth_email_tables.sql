-- Добавляем недостающие поля в users для auth-email расширения
ALTER TABLE t_p13705114_spa_community_portal.users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Таблица для refresh токенов
CREATE TABLE IF NOT EXISTS t_p13705114_spa_community_portal.refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p13705114_spa_community_portal.users(id),
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для токенов подтверждения email
CREATE TABLE IF NOT EXISTS t_p13705114_spa_community_portal.email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p13705114_spa_community_portal.users(id),
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON t_p13705114_spa_community_portal.users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON t_p13705114_spa_community_portal.refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_hash ON t_p13705114_spa_community_portal.email_verification_tokens(token_hash);