-- Создаем новую таблицу для бронирований бань и мастеров
CREATE TABLE IF NOT EXISTS t_p13705114_spa_community_portal.bath_master_bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
  booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('bath', 'master')),
  entity_id INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  guests_count INTEGER DEFAULT 1 CHECK (guests_count > 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled')),
  notes TEXT,
  canceled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индексы для оптимизации поиска
CREATE INDEX idx_bath_master_bookings_user_id ON t_p13705114_spa_community_portal.bath_master_bookings(user_id);
CREATE INDEX idx_bath_master_bookings_type ON t_p13705114_spa_community_portal.bath_master_bookings(booking_type);
CREATE INDEX idx_bath_master_bookings_entity_id ON t_p13705114_spa_community_portal.bath_master_bookings(entity_id);
CREATE INDEX idx_bath_master_bookings_date ON t_p13705114_spa_community_portal.bath_master_bookings(booking_date);
CREATE INDEX idx_bath_master_bookings_status ON t_p13705114_spa_community_portal.bath_master_bookings(status);

-- Создаем уникальный индекс для предотвращения двойного бронирования
CREATE UNIQUE INDEX idx_bath_master_bookings_unique_slot ON t_p13705114_spa_community_portal.bath_master_bookings(
  booking_type, entity_id, booking_date, start_time, end_time
) WHERE status IN ('pending', 'confirmed');

-- Создаем таблицу для доступных слотов бронирования
CREATE TABLE IF NOT EXISTS t_p13705114_spa_community_portal.availability_slots (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('bath', 'master')),
  entity_id INTEGER NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, slot_date, start_time)
);

CREATE INDEX idx_availability_entity ON t_p13705114_spa_community_portal.availability_slots(entity_type, entity_id);
CREATE INDEX idx_availability_date ON t_p13705114_spa_community_portal.availability_slots(slot_date);
CREATE INDEX idx_availability_available ON t_p13705114_spa_community_portal.availability_slots(is_available);

-- Добавляем комментарии
COMMENT ON TABLE t_p13705114_spa_community_portal.bath_master_bookings IS 'Бронирования бань и услуг мастеров';
COMMENT ON TABLE t_p13705114_spa_community_portal.availability_slots IS 'Доступные временные слоты для бронирования';
COMMENT ON COLUMN t_p13705114_spa_community_portal.bath_master_bookings.status IS 'pending - ожидает подтверждения, confirmed - подтверждено, completed - завершено, canceled - отменено';
COMMENT ON COLUMN t_p13705114_spa_community_portal.bath_master_bookings.booking_type IS 'bath - баня, master - мастер';