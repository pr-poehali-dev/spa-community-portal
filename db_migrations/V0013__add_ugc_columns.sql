ALTER TABLE blog_posts ADD COLUMN author_id INTEGER;
ALTER TABLE blog_posts ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE blog_posts ADD COLUMN visibility VARCHAR(50) DEFAULT 'public';
ALTER TABLE blog_posts ADD COLUMN related_event_id INTEGER;
ALTER TABLE blog_posts ADD COLUMN published_at TIMESTAMP;
ALTER TABLE blog_posts ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE blog_posts ADD COLUMN views_count INTEGER DEFAULT 0;

CREATE INDEX idx_blog_author ON blog_posts(author_id);
CREATE INDEX idx_blog_status ON blog_posts(status);