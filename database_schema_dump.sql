-- ============================================================================
-- COMPLETE DATABASE SCHEMA DUMP
-- Generated: 2026-01-25
-- Database: PostgreSQL
-- Schema: Complete database structure for migration
-- Total Tables: 43
-- ============================================================================

-- ============================================================================
-- TABLE: users
-- Description: Main users table with authentication and profile information
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    telegram VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'participant',
    is_active BOOLEAN DEFAULT TRUE,
    reputation_score INTEGER DEFAULT 0,
    telegram_id BIGINT UNIQUE,
    yandex_id VARCHAR(100),
    email_verified BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE UNIQUE INDEX users_yandex_id_idx ON users(yandex_id) WHERE yandex_id IS NOT NULL;

-- ============================================================================
-- TABLE: user_sessions
-- Description: User authentication sessions with access and refresh tokens
-- ============================================================================
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    refresh_token VARCHAR(255),
    refresh_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_sessions
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);

-- ============================================================================
-- TABLE: refresh_tokens
-- Description: Refresh tokens for user authentication
-- ============================================================================
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for refresh_tokens
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ============================================================================
-- TABLE: email_verification_tokens
-- Description: Tokens for email verification
-- ============================================================================
CREATE TABLE email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for email_verification_tokens
CREATE INDEX idx_email_verification_tokens_hash ON email_verification_tokens(token_hash);

-- ============================================================================
-- TABLE: password_reset_tokens
-- Description: Tokens for password reset functionality
-- ============================================================================
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- Indexes for password_reset_tokens
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token) WHERE NOT used;
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- ============================================================================
-- TABLE: telegram_auth_tokens
-- Description: Telegram authentication tokens
-- ============================================================================
CREATE TABLE telegram_auth_tokens (
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

-- Indexes for telegram_auth_tokens
CREATE INDEX idx_telegram_auth_tokens_hash ON telegram_auth_tokens(token_hash);
CREATE INDEX idx_telegram_auth_tokens_expires ON telegram_auth_tokens(expires_at);

-- ============================================================================
-- TABLE: telegram_refresh_tokens
-- Description: Telegram refresh tokens for authentication
-- ============================================================================
CREATE TABLE telegram_refresh_tokens (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for telegram_refresh_tokens
CREATE INDEX idx_telegram_refresh_tokens_hash ON telegram_refresh_tokens(token_hash);
CREATE INDEX idx_telegram_refresh_tokens_user ON telegram_refresh_tokens(user_id);
CREATE INDEX idx_telegram_refresh_tokens_expires ON telegram_refresh_tokens(expires_at);

-- ============================================================================
-- TABLE: rate_limits
-- Description: Rate limiting for API actions
-- ============================================================================
CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    attempts INTEGER DEFAULT 1,
    first_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP
);

-- Indexes for rate_limits
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, action);
CREATE INDEX idx_rate_limits_blocked ON rate_limits(blocked_until);
CREATE INDEX idx_rate_limits_cleanup ON rate_limits(first_attempt);

-- ============================================================================
-- TABLE: user_roles
-- Description: User role assignments (organizer, master, partner, editor)
-- ============================================================================
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('organizer', 'master', 'partner', 'editor')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'graduated', 'rejected')),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_type)
);

-- Indexes for user_roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_type ON user_roles(role_type);
CREATE INDEX idx_user_roles_status ON user_roles(status);

-- ============================================================================
-- TABLE: role_applications
-- Description: Applications for user roles
-- ============================================================================
CREATE TABLE role_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('organizer', 'master', 'partner', 'editor')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
    application_data JSONB NOT NULL DEFAULT '{}',
    reviewer_id INTEGER REFERENCES users(id),
    reviewer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for role_applications
CREATE INDEX idx_role_applications_user_id ON role_applications(user_id);
CREATE INDEX idx_role_applications_status ON role_applications(status);

-- ============================================================================
-- TABLE: user_reputation
-- Description: User reputation system tracking
-- ============================================================================
CREATE TABLE user_reputation (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    total_score INTEGER DEFAULT 0,
    level VARCHAR(50) DEFAULT 'newcomer' CHECK (level IN ('newcomer', 'active', 'expert', 'leader', 'legend')),
    events_attended INTEGER DEFAULT 0,
    events_organized INTEGER DEFAULT 0,
    articles_published INTEGER DEFAULT 0,
    helpful_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Indexes for user_reputation
CREATE INDEX idx_user_reputation_user_id ON user_reputation(user_id);

-- ============================================================================
-- TABLE: reputation_history
-- Description: History of reputation changes
-- ============================================================================
CREATE TABLE reputation_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    points INTEGER NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for reputation_history
CREATE INDEX idx_reputation_history_user_id ON reputation_history(user_id);

-- ============================================================================
-- TABLE: master_profiles
-- Description: Profiles for master users
-- ============================================================================
CREATE TABLE master_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    master_id INTEGER,
    specialization TEXT,
    experience INTEGER DEFAULT 0,
    bio TEXT,
    portfolio_images TEXT[],
    available_from TIME,
    available_to TIME,
    working_days INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: master_levels
-- Description: Master skill levels and progress
-- ============================================================================
CREATE TABLE master_levels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    level VARCHAR(50) DEFAULT 'apprentice' CHECK (level IN ('apprentice', 'master', 'mentor')),
    specializations TEXT[] DEFAULT '{}',
    portfolio_urls TEXT[] DEFAULT '{}',
    trial_session_completed BOOLEAN DEFAULT FALSE,
    trial_session_rating DECIMAL(3,2),
    sessions_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================================================
-- TABLE: organizer_levels
-- Description: Event organizer levels and progress
-- ============================================================================
CREATE TABLE organizer_levels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    level VARCHAR(50) DEFAULT 'novice' CHECK (level IN ('novice', 'experienced', 'leading')),
    events_organized INTEGER DEFAULT 0,
    preferred_formats TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    test_passed BOOLEAN DEFAULT FALSE,
    test_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================================================
-- TABLE: partner_profiles
-- Description: Profiles for partner users
-- ============================================================================
CREATE TABLE partner_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    bath_id INTEGER,
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: partner_types
-- Description: Partner type classifications
-- ============================================================================
CREATE TABLE partner_types (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    sauna_id INTEGER,
    partnership_type VARCHAR(50) DEFAULT 'basic' CHECK (partnership_type IN ('basic', 'premium', 'exclusive')),
    contract_signed BOOLEAN DEFAULT FALSE,
    contract_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, sauna_id)
);

-- ============================================================================
-- TABLE: editor_levels
-- Description: Editor levels and progress
-- ============================================================================
CREATE TABLE editor_levels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    level VARCHAR(50) DEFAULT 'proofreader' CHECK (level IN ('proofreader', 'author', 'section_editor', 'chief_editor')),
    articles_published INTEGER DEFAULT 0,
    articles_edited INTEGER DEFAULT 0,
    specialization VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================================================
-- TABLE: saunas
-- Description: Sauna/bathhouse entities
-- ============================================================================
CREATE TABLE saunas (
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

-- ============================================================================
-- TABLE: baths
-- Description: Legacy bath table (for compatibility)
-- ============================================================================
CREATE TABLE baths (
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

-- Indexes for baths
CREATE INDEX idx_baths_slug ON baths(slug);

-- ============================================================================
-- TABLE: masters
-- Description: Legacy masters table (for compatibility)
-- ============================================================================
CREATE TABLE masters (
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

-- Indexes for masters
CREATE INDEX idx_masters_slug ON masters(slug);

-- ============================================================================
-- TABLE: events
-- Description: Legacy events table
-- ============================================================================
CREATE TABLE events (
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

-- Indexes for events
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_bathhouse_id ON events(bathhouse_id);
CREATE INDEX idx_events_master_id ON events(master_id);

-- ============================================================================
-- TABLE: services
-- Description: Universal services table (events, massages, SPA, rituals)
-- ============================================================================
CREATE TABLE services (
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

-- Indexes for services
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_bathhouse ON services(bathhouse_id);
CREATE INDEX idx_services_master ON services(master_id);
CREATE INDEX idx_services_city ON services(city);
CREATE INDEX idx_services_active ON services(is_active);

COMMENT ON TABLE services IS 'Универсальная таблица услуг (события, массажи, СПА, ритуалы)';

-- ============================================================================
-- TABLE: service_schedules
-- Description: Service schedules with capacity tracking
-- ============================================================================
CREATE TABLE service_schedules (
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

-- Indexes for service_schedules
CREATE INDEX idx_schedules_service ON service_schedules(service_id);
CREATE INDEX idx_schedules_datetime ON service_schedules(start_datetime, end_datetime);
CREATE INDEX idx_schedules_status ON service_schedules(status);
CREATE INDEX idx_schedules_availability ON service_schedules(capacity_available) WHERE capacity_available > 0;

COMMENT ON TABLE service_schedules IS 'Расписание услуг с учётом вместимости и доступности';
COMMENT ON COLUMN service_schedules.capacity_available IS 'Уменьшается при бронировании, увеличивается при отмене';

-- ============================================================================
-- TABLE: bookings
-- Description: Legacy bookings for events
-- ============================================================================
CREATE TABLE bookings (
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

-- Indexes for bookings
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_schedule ON bookings(schedule_id);

-- ============================================================================
-- TABLE: event_registrations
-- Description: User registrations for events
-- ============================================================================
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP NULL,
    UNIQUE(event_id, user_id),
    CONSTRAINT check_registration_status CHECK (status IN ('registered', 'canceled', 'completed'))
);

-- Indexes for event_registrations
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);

-- ============================================================================
-- TABLE: bath_master_bookings
-- Description: Bookings for baths and master services
-- ============================================================================
CREATE TABLE bath_master_bookings (
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

-- Indexes for bath_master_bookings
CREATE INDEX idx_bath_master_bookings_user_id ON bath_master_bookings(user_id);
CREATE INDEX idx_bath_master_bookings_type ON bath_master_bookings(booking_type);
CREATE INDEX idx_bath_master_bookings_entity_id ON bath_master_bookings(entity_id);
CREATE INDEX idx_bath_master_bookings_date ON bath_master_bookings(booking_date);
CREATE INDEX idx_bath_master_bookings_status ON bath_master_bookings(status);
CREATE UNIQUE INDEX idx_bath_master_bookings_unique_slot ON bath_master_bookings(
    booking_type, entity_id, booking_date, start_time, end_time
) WHERE status IN ('pending', 'confirmed');

COMMENT ON TABLE bath_master_bookings IS 'Бронирования бань и услуг мастеров';
COMMENT ON COLUMN bath_master_bookings.status IS 'pending - ожидает подтверждения, confirmed - подтверждено, completed - завершено, canceled - отменено';
COMMENT ON COLUMN bath_master_bookings.booking_type IS 'bath - баня, master - мастер';

-- ============================================================================
-- TABLE: availability_slots
-- Description: Available time slots for bookings
-- ============================================================================
CREATE TABLE availability_slots (
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

-- Indexes for availability_slots
CREATE INDEX idx_availability_entity ON availability_slots(entity_type, entity_id);
CREATE INDEX idx_availability_date ON availability_slots(slot_date);
CREATE INDEX idx_availability_available ON availability_slots(is_available);

COMMENT ON TABLE availability_slots IS 'Доступные временные слоты для бронирования';

-- ============================================================================
-- TABLE: payments
-- Description: Payment records for bookings and events
-- ============================================================================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    booking_id INTEGER REFERENCES bath_master_bookings(id),
    event_registration_id INTEGER REFERENCES event_registrations(id),
    amount INTEGER NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'canceled', 'refunded')),
    payment_method VARCHAR(50),
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('yookassa', 'stripe', 'manual')),
    provider_payment_id VARCHAR(255),
    provider_response JSONB,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_entity_check CHECK (
        (booking_id IS NOT NULL AND event_registration_id IS NULL) OR
        (booking_id IS NULL AND event_registration_id IS NOT NULL)
    )
);

-- Indexes for payments
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_event_reg_id ON payments(event_registration_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider ON payments(provider);
CREATE INDEX idx_payments_provider_payment_id ON payments(provider_payment_id);

COMMENT ON TABLE payments IS 'Платежи за бронирования и события';
COMMENT ON COLUMN payments.status IS 'pending - ожидает оплаты, processing - обрабатывается, succeeded - успешно, canceled - отменен, refunded - возвращен';
COMMENT ON COLUMN payments.provider IS 'yookassa - ЮKassa, stripe - Stripe, manual - ручной платеж';
COMMENT ON COLUMN payments.provider_payment_id IS 'ID платежа в системе провайдера';
COMMENT ON COLUMN payments.provider_response IS 'Полный ответ от платежной системы в JSON';

-- ============================================================================
-- TABLE: payment_webhooks
-- Description: Payment provider webhooks
-- ============================================================================
CREATE TABLE payment_webhooks (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    payment_id INTEGER REFERENCES payments(id),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for payment_webhooks
CREATE INDEX idx_webhooks_provider ON payment_webhooks(provider);
CREATE INDEX idx_webhooks_processed ON payment_webhooks(processed);
CREATE INDEX idx_webhooks_payment_id ON payment_webhooks(payment_id);

COMMENT ON TABLE payment_webhooks IS 'Webhooks от платежных систем для обработки';

-- ============================================================================
-- TABLE: favorites
-- Description: User favorites for various entities
-- ============================================================================
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entity_type, entity_id)
);

-- Indexes for favorites
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ============================================================================
-- TABLE: reviews
-- Description: User reviews for various entities
-- ============================================================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for reviews
CREATE INDEX idx_reviews_entity ON reviews(entity_type, entity_id);

-- ============================================================================
-- TABLE: notifications
-- Description: User notifications
-- ============================================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================================================
-- TABLE: blog_posts
-- Description: Blog posts with content and metadata
-- ============================================================================
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('rituals', 'health', 'diy', 'history')),
    author VARCHAR(255) NOT NULL,
    author_id INTEGER,
    date DATE NOT NULL,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'public',
    related_event_id INTEGER,
    published_at TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    is_draft BOOLEAN DEFAULT TRUE,
    cover_image VARCHAR(500),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for blog_posts
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_author ON blog_posts(author_id);
CREATE INDEX idx_blog_status ON blog_posts(status);

-- ============================================================================
-- TABLE: blog_categories_v2
-- Description: Blog post categories
-- ============================================================================
CREATE TABLE blog_categories_v2 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: blog_posts_categories
-- Description: Many-to-many relationship between posts and categories
-- ============================================================================
CREATE TABLE blog_posts_categories (
    post_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, category_id)
);

-- ============================================================================
-- TABLE: blog_post_tags
-- Description: Tags associated with blog posts
-- ============================================================================
CREATE TABLE blog_post_tags (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, tag)
);

-- Indexes for blog_post_tags
CREATE INDEX idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX idx_blog_post_tags_tag ON blog_post_tags(tag);

-- ============================================================================
-- TABLE: blog_comments
-- Description: Comments on blog posts
-- ============================================================================
CREATE TABLE blog_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    parent_comment_id INTEGER REFERENCES blog_comments(id),
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for blog_comments
CREATE INDEX idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_user ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent ON blog_comments(parent_comment_id);

-- ============================================================================
-- TABLE: blog_post_likes
-- Description: Likes on blog posts
-- ============================================================================
CREATE TABLE blog_post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Indexes for blog_post_likes
CREATE INDEX idx_blog_post_likes_post ON blog_post_likes(post_id);
CREATE INDEX idx_blog_post_likes_user ON blog_post_likes(user_id);

-- ============================================================================
-- TABLE: blog_comment_likes
-- Description: Likes on blog comments
-- ============================================================================
CREATE TABLE blog_comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES blog_comments(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- Indexes for blog_comment_likes
CREATE INDEX idx_blog_comment_likes_comment ON blog_comment_likes(comment_id);
CREATE INDEX idx_blog_comment_likes_user ON blog_comment_likes(user_id);

-- ============================================================================
-- TABLE: blog_moderation_log
-- Description: Blog post moderation history
-- ============================================================================
CREATE TABLE blog_moderation_log (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    moderator_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for blog_moderation_log
CREATE INDEX idx_moderation_post ON blog_moderation_log(post_id);

-- ============================================================================
-- TABLE: blog_rate_limits
-- Description: Rate limiting for blog post creation
-- ============================================================================
CREATE TABLE blog_rate_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    posts_count INTEGER DEFAULT 0,
    last_post_at TIMESTAMP,
    limit_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, limit_date)
);

-- ============================================================================
-- TABLE: blog_reports
-- Description: Reports on blog posts
-- ============================================================================
CREATE TABLE blog_reports (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER
);

-- Indexes for blog_reports
CREATE INDEX idx_reports_post ON blog_reports(post_id);
CREATE INDEX idx_reports_status ON blog_reports(status);

-- ============================================================================
-- END OF SCHEMA DUMP
-- ============================================================================
