-- Таблица для регистраций на события
CREATE TABLE IF NOT EXISTS t_p13705114_spa_community_portal.event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES t_p13705114_spa_community_portal.events(id),
  user_id INTEGER NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  canceled_at TIMESTAMP NULL,
  UNIQUE(event_id, user_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON t_p13705114_spa_community_portal.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON t_p13705114_spa_community_portal.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON t_p13705114_spa_community_portal.event_registrations(status);

-- Добавим constraint на статус
ALTER TABLE t_p13705114_spa_community_portal.event_registrations
ADD CONSTRAINT check_registration_status 
CHECK (status IN ('registered', 'canceled', 'completed'));