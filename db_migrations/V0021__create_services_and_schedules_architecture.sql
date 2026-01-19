-- Создаём таблицу services (универсальная для событий, массажей, СПА)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('EVENT', 'MASSAGE', 'SPA', 'RITUAL', 'RENTAL')),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    base_price INTEGER NOT NULL,
    
    -- Связи с баней и мастером (nullable)
    bathhouse_id INTEGER,
    master_id INTEGER,
    
    -- Метаданные
    gender_type VARCHAR(20) CHECK (gender_type IN ('male', 'female', 'mixed')) DEFAULT 'mixed',
    city VARCHAR(100),
    program JSONB,
    rules JSONB,
    images JSONB,
    
    -- Статус
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_bathhouse ON services(bathhouse_id);
CREATE INDEX IF NOT EXISTS idx_services_master ON services(master_id);
CREATE INDEX IF NOT EXISTS idx_services_city ON services(city);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Создаём таблицу service_schedules (расписание для услуг)
CREATE TABLE IF NOT EXISTS service_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL,
    
    -- Время
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    
    -- Вместимость
    capacity_total INTEGER NOT NULL CHECK (capacity_total > 0),
    capacity_available INTEGER NOT NULL CHECK (capacity_available >= 0),
    
    -- Переопределение цены (опционально)
    price_override INTEGER,
    
    -- Статус
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'completed')) DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Бизнес-правило: capacity_available <= capacity_total
    CONSTRAINT check_capacity CHECK (capacity_available <= capacity_total)
);

CREATE INDEX IF NOT EXISTS idx_schedules_service ON service_schedules(service_id);
CREATE INDEX IF NOT EXISTS idx_schedules_datetime ON service_schedules(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON service_schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_availability ON service_schedules(capacity_available) WHERE capacity_available > 0;

-- Обновляем таблицу bookings для связи с расписанием
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS schedule_id UUID;
CREATE INDEX IF NOT EXISTS idx_bookings_schedule ON bookings(schedule_id);

-- Миграция данных: преобразуем старые события в новую архитектуру
INSERT INTO services (
    id,
    type,
    title,
    slug,
    description,
    duration_minutes,
    base_price,
    gender_type,
    program,
    rules,
    images,
    is_active,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    'EVENT',
    title,
    slug,
    description,
    120, 
    price,
    CASE 
        WHEN type = 'male' THEN 'male'
        WHEN type = 'female' THEN 'female'
        ELSE 'mixed'
    END,
    program,
    rules,
    CASE 
        WHEN image_url IS NOT NULL THEN jsonb_build_array(jsonb_build_object('url', image_url))
        ELSE NULL
    END,
    true,
    created_at,
    updated_at
FROM events
ON CONFLICT (slug) DO NOTHING;

-- Создаём расписание для каждого старого события
INSERT INTO service_schedules (
    service_id,
    start_datetime,
    end_datetime,
    capacity_total,
    capacity_available,
    status,
    created_at
)
SELECT 
    s.id,
    (e.date + e.time)::TIMESTAMP,
    (e.date + e.time + INTERVAL '2 hours')::TIMESTAMP,
    e.total_spots,
    e.available_spots,
    CASE 
        WHEN e.date < CURRENT_DATE THEN 'completed'
        WHEN e.available_spots = 0 THEN 'active'
        ELSE 'active'
    END,
    e.created_at
FROM events e
JOIN services s ON s.slug = e.slug
ON CONFLICT DO NOTHING;

COMMENT ON TABLE services IS 'Универсальная таблица услуг (события, массажи, СПА, ритуалы)';
COMMENT ON TABLE service_schedules IS 'Расписание услуг с учётом вместимости и доступности';
COMMENT ON COLUMN service_schedules.capacity_available IS 'Уменьшается при бронировании, увеличивается при отмене';