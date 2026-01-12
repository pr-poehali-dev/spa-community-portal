-- Таблица для rate limiting
CREATE TABLE t_p13705114_spa_community_portal.rate_limits (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    attempts INTEGER DEFAULT 1,
    first_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP
);

CREATE INDEX idx_rate_limits_identifier ON t_p13705114_spa_community_portal.rate_limits(identifier, action);
CREATE INDEX idx_rate_limits_blocked ON t_p13705114_spa_community_portal.rate_limits(blocked_until);

-- Автоматическая очистка старых записей (старше 24 часов)
CREATE INDEX idx_rate_limits_cleanup ON t_p13705114_spa_community_portal.rate_limits(first_attempt);
