-- ============================================================================
-- USER ROLES AND REPUTATION SYSTEM
-- ============================================================================

-- User roles
CREATE TABLE IF NOT EXISTS user_roles (
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

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type ON user_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_status ON user_roles(status);

-- Role applications
CREATE TABLE IF NOT EXISTS role_applications (
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

CREATE INDEX IF NOT EXISTS idx_role_applications_user_id ON role_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_role_applications_status ON role_applications(status);

-- User reputation
CREATE TABLE IF NOT EXISTS user_reputation (
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

CREATE INDEX IF NOT EXISTS idx_user_reputation_user_id ON user_reputation(user_id);

-- Reputation history
CREATE TABLE IF NOT EXISTS reputation_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    points INTEGER NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reputation_history_user_id ON reputation_history(user_id);

-- Master profiles
CREATE TABLE IF NOT EXISTS master_profiles (
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

-- Master levels
CREATE TABLE IF NOT EXISTS master_levels (
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

-- Organizer levels
CREATE TABLE IF NOT EXISTS organizer_levels (
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

-- Partner profiles
CREATE TABLE IF NOT EXISTS partner_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    bath_id INTEGER,
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner types
CREATE TABLE IF NOT EXISTS partner_types (
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

-- Editor levels
CREATE TABLE IF NOT EXISTS editor_levels (
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