-- Публикуем существующие посты блога
UPDATE t_p13705114_spa_community_portal.blog_posts 
SET 
  is_draft = false,
  status = 'published',
  published_at = COALESCE(published_at, created_at)
WHERE is_draft = true;