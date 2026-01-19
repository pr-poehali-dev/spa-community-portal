-- Добавляем slug событиям, у которых его нет
UPDATE t_p13705114_spa_community_portal.services
SET slug = 'test-event'
WHERE title = 'Тест' AND (slug IS NULL OR slug = '');

-- Генерируем slug для всех событий без него
UPDATE t_p13705114_spa_community_portal.services
SET slug = 
  CASE 
    WHEN title ILIKE '%мужск%' AND title ILIKE '%пар%' THEN 'tradicionnyy-muzhskoy-par'
    WHEN title ILIKE '%женск%' AND title ILIKE '%wellness%' THEN 'zhenskoe-wellness-parenie'
    WHEN title ILIKE '%совмест%' AND title ILIKE '%ритуал%' THEN 'sovmestnyy-bannyy-ritual'
    WHEN title ILIKE '%фестиваль%' THEN 'festival'
    ELSE LOWER(REGEXP_REPLACE(TRANSLATE(title, 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ ', 'abvgdezhziyklmnoprstufhccssyeuaABVGDEZHZIYKLMNOPRSTUFHCCSSYEUA-'), '[^a-zA-Z0-9-]', '', 'g'))
  END
WHERE type = 'EVENT' AND (slug IS NULL OR slug = '');