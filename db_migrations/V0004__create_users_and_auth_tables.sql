-- Создание таблицы пользователей с ролями
CREATE TABLE t_p13705114_spa_community_portal.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    telegram VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'participant',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по email
CREATE INDEX idx_users_email ON t_p13705114_spa_community_portal.users(email);
CREATE INDEX idx_users_role ON t_p13705114_spa_community_portal.users(role);

-- Таблица сессий для авторизации
CREATE TABLE t_p13705114_spa_community_portal.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON t_p13705114_spa_community_portal.user_sessions(session_token);
CREATE INDEX idx_sessions_user ON t_p13705114_spa_community_portal.user_sessions(user_id);

-- Таблица профилей мастеров
CREATE TABLE t_p13705114_spa_community_portal.master_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
    master_id INTEGER REFERENCES t_p13705114_spa_community_portal.masters(id),
    specialization TEXT,
    experience INTEGER DEFAULT 0,
    bio TEXT,
    portfolio_images TEXT[],
    available_from TIME,
    available_to TIME,
    working_days INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица профилей партнёров
CREATE TABLE t_p13705114_spa_community_portal.partner_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
    bath_id INTEGER REFERENCES t_p13705114_spa_community_portal.baths(id),
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица избранного
CREATE TABLE t_p13705114_spa_community_portal.favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX idx_favorites_user ON t_p13705114_spa_community_portal.favorites(user_id);

-- Таблица отзывов
CREATE TABLE t_p13705114_spa_community_portal.reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_entity ON t_p13705114_spa_community_portal.reviews(entity_type, entity_id);

-- Таблица уведомлений
CREATE TABLE t_p13705114_spa_community_portal.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON t_p13705114_spa_community_portal.notifications(user_id, is_read);

-- Обновление таблицы bookings для связи с пользователем
ALTER TABLE t_p13705114_spa_community_portal.bookings 
ADD COLUMN user_id INTEGER REFERENCES t_p13705114_spa_community_portal.users(id);

-- Вставка тестовых пользователей (пароль: test123)
INSERT INTO t_p13705114_spa_community_portal.users (email, password_hash, name, phone, telegram, role) VALUES
('user@test.ru', '$2b$10$rQ7LhYKjE5RV8n4KXGZZOeP4K8xP9YqV4T6Wk7lM3Nv9Xz5Qw1E2S', 'Иван Участников', '+79991234567', '@ivan_test', 'participant'),
('master@test.ru', '$2b$10$rQ7LhYKjE5RV8n4KXGZZOeP4K8xP9YqV4T6Wk7lM3Nv9Xz5Qw1E2S', 'Алексей Парильщиков', '+79991234568', '@alex_master', 'master'),
('partner@test.ru', '$2b$10$rQ7LhYKjE5RV8n4KXGZZOeP4K8xP9YqV4T6Wk7lM3Nv9Xz5Qw1E2S', 'Ольга Партнерова', '+79991234569', '@olga_partner', 'partner'),
('organizer@test.ru', '$2b$10$rQ7LhYKjE5RV8n4KXGZZOeP4K8xP9YqV4T6Wk7lM3Nv9Xz5Qw1E2S', 'Мария Организаторова', '+79991234570', '@maria_org', 'organizer'),
('editor@test.ru', '$2b$10$rQ7LhYKjE5RV8n4KXGZZOeP4K8xP9YqV4T6Wk7lM3Nv9Xz5Qw1E2S', 'Дмитрий Редакторов', '+79991234571', '@dmitry_editor', 'editor');