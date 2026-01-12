-- Обновление паролей тестовых пользователей (пароль: test123)
UPDATE t_p13705114_spa_community_portal.users 
SET password_hash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' 
WHERE email IN ('user@test.ru', 'master@test.ru', 'partner@test.ru', 'organizer@test.ru', 'editor@test.ru');
