-- Add telegram_id column to users table
ALTER TABLE t_p13705114_spa_community_portal.users 
ADD COLUMN telegram_id BIGINT UNIQUE;

-- Create index on telegram_id for fast lookups
CREATE INDEX idx_users_telegram_id ON t_p13705114_spa_community_portal.users(telegram_id);
