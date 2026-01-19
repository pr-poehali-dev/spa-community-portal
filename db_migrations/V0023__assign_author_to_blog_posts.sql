-- Назначаем автора для постов блога (первого доступного пользователя)
UPDATE t_p13705114_spa_community_portal.blog_posts 
SET author_id = (SELECT id FROM t_p13705114_spa_community_portal.users LIMIT 1)
WHERE author_id IS NULL;