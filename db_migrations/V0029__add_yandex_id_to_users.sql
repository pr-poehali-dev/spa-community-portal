-- Add yandex_id column to users table for Yandex OAuth integration
ALTER TABLE users ADD COLUMN IF NOT EXISTS yandex_id VARCHAR(100);

-- Create unique index on yandex_id for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS users_yandex_id_idx ON users(yandex_id) WHERE yandex_id IS NOT NULL;