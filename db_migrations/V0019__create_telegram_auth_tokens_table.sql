CREATE TABLE IF NOT EXISTS telegram_auth_tokens (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    telegram_id BIGINT NOT NULL,
    telegram_username VARCHAR(255),
    telegram_first_name VARCHAR(255),
    telegram_last_name VARCHAR(255),
    telegram_photo_url TEXT,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telegram_auth_tokens_hash ON telegram_auth_tokens(token_hash);
CREATE INDEX idx_telegram_auth_tokens_expires ON telegram_auth_tokens(expires_at);
