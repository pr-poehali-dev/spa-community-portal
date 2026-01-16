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

CREATE TABLE blog_rate_limits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  posts_count INTEGER DEFAULT 0,
  last_post_at TIMESTAMP,
  limit_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, limit_date)
);

CREATE TABLE blog_categories_v2 (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_posts_categories (
  post_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (post_id, category_id)
);

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

CREATE INDEX idx_moderation_post ON blog_moderation_log(post_id);
CREATE INDEX idx_reports_post ON blog_reports(post_id);
CREATE INDEX idx_reports_status ON blog_reports(status);