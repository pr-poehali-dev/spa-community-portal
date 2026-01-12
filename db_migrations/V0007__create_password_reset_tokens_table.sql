-- Таблица для токенов восстановления пароля
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- Индекс для быстрого поиска по токену
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token) WHERE NOT used;

-- Индекс для очистки истёкших токенов
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);