-- ============================================================================
-- SAUNAS, BATHS, MASTERS, AND EVENTS
-- ============================================================================

-- Saunas
CREATE TABLE IF NOT EXISTS saunas (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    price_per_hour INTEGER,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Baths (for backward compatibility)
CREATE TABLE IF NOT EXISTS baths (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    price_per_hour INTEGER NOT NULL,
    features JSONB,
    images JSONB,
    rating DECIMAL(2,1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_baths_slug ON baths(slug);

-- Masters
CREATE TABLE IF NOT EXISTS masters (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    experience INTEGER NOT NULL,
    description TEXT,
    avatar_url TEXT,
    services JSONB,
    rating DECIMAL(2,1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_masters_slug ON masters(slug);

-- Events (legacy)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('men', 'women', 'mixed')),
    price INTEGER NOT NULL,
    available_spots INTEGER NOT NULL,
    total_spots INTEGER NOT NULL,
    image_url TEXT,
    program JSONB,
    rules JSONB,
    bathhouse_id INTEGER NULL,
    master_id INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_bathhouse_id ON events(bathhouse_id);
CREATE INDEX IF NOT EXISTS idx_events_master_id ON events(master_id);

-- Universal services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('EVENT', 'MASSAGE', 'SPA', 'RITUAL', 'RENTAL')),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    base_price INTEGER NOT NULL,
    bathhouse_id INTEGER,
    master_id INTEGER,
    organizer_id INTEGER NULL,
    gender_type VARCHAR(20) CHECK (gender_type IN ('male', 'female', 'mixed')) DEFAULT 'mixed',
    city VARCHAR(100),
    program JSONB,
    rules JSONB,
    images JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_bathhouse ON services(bathhouse_id);
CREATE INDEX IF NOT EXISTS idx_services_master ON services(master_id);
CREATE INDEX IF NOT EXISTS idx_services_city ON services(city);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

COMMENT ON TABLE services IS 'Универсальная таблица услуг (события, массажи, СПА, ритуалы)';

-- Service schedules
CREATE TABLE IF NOT EXISTS service_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    capacity_total INTEGER NOT NULL CHECK (capacity_total > 0),
    capacity_available INTEGER NOT NULL CHECK (capacity_available >= 0),
    price_override INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'completed')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_capacity CHECK (capacity_available <= capacity_total)
);

CREATE INDEX IF NOT EXISTS idx_schedules_service ON service_schedules(service_id);
CREATE INDEX IF NOT EXISTS idx_schedules_datetime ON service_schedules(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON service_schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_availability ON service_schedules(capacity_available) WHERE capacity_available > 0;

COMMENT ON TABLE service_schedules IS 'Расписание услуг с учётом вместимости и доступности';
COMMENT ON COLUMN service_schedules.capacity_available IS 'Уменьшается при бронировании, увеличивается при отмене';