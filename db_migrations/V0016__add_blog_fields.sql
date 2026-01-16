-- Добавляем недостающие поля в blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5;

-- Обновляем is_draft на основе status
UPDATE blog_posts SET is_draft = (status = 'draft') WHERE is_draft IS NULL;

-- Копируем image_url в cover_image где нужно
UPDATE blog_posts SET cover_image = image_url WHERE cover_image IS NULL AND image_url IS NOT NULL;