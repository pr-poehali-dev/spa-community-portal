CREATE TABLE IF NOT EXISTS telegram_refresh_tokens (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telegram_refresh_tokens_hash ON telegram_refresh_tokens(token_hash);
CREATE INDEX idx_telegram_refresh_tokens_user ON telegram_refresh_tokens(user_id);
CREATE INDEX idx_telegram_refresh_tokens_expires ON telegram_refresh_tokens(expires_at);
