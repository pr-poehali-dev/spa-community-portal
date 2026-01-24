-- ============================================================================
-- BOOKINGS AND PAYMENTS
-- ============================================================================

-- Legacy bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    user_id INTEGER REFERENCES users(id),
    schedule_id UUID,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    telegram VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule ON bookings(schedule_id);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP NULL,
    UNIQUE(event_id, user_id),
    CONSTRAINT check_registration_status CHECK (status IN ('registered', 'canceled', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- Bath and master bookings
CREATE TABLE IF NOT EXISTS bath_master_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
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

CREATE INDEX IF NOT EXISTS idx_bath_master_bookings_user_id ON bath_master_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bath_master_bookings_type ON bath_master_bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bath_master_bookings_entity_id ON bath_master_bookings(entity_id);
CREATE INDEX IF NOT EXISTS idx_bath_master_bookings_date ON bath_master_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bath_master_bookings_status ON bath_master_bookings(status);

-- Availability slots
CREATE TABLE IF NOT EXISTS availability_slots (
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

CREATE INDEX IF NOT EXISTS idx_availability_entity ON availability_slots(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_availability_available ON availability_slots(is_available);