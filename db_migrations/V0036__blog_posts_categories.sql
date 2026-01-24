-- ============================================================================
-- BLOG SYSTEM - PART 1: Posts and Categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
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

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);

CREATE TABLE IF NOT EXISTS blog_categories_v2 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts_categories (
    post_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag);

CREATE TABLE IF NOT EXISTS blog_post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post ON blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_user ON blog_post_likes(user_id);

CREATE TABLE IF NOT EXISTS blog_moderation_log (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    moderator_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moderation_post ON blog_moderation_log(post_id);

CREATE TABLE IF NOT EXISTS blog_rate_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    posts_count INTEGER DEFAULT 0,
    last_post_at TIMESTAMP,
    limit_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, limit_date)
);

CREATE TABLE IF NOT EXISTS blog_reports (
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

CREATE INDEX IF NOT EXISTS idx_reports_post ON blog_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON blog_reports(status);