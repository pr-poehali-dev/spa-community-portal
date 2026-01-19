-- Добавляем поле organizer_id в таблицу services
ALTER TABLE t_p13705114_spa_community_portal.services
ADD COLUMN organizer_id INTEGER NULL;

-- Обновляем событие "Женское wellness-парение" - привязываем к мастеру Мария Соколова и бане Баня на Пресне
UPDATE t_p13705114_spa_community_portal.services
SET 
  master_id = 2,
  bathhouse_id = 1,
  organizer_id = 1
WHERE slug = 'zhenskoe-wellness-parenie';

-- Обновляем остальные события с привязками
UPDATE t_p13705114_spa_community_portal.services
SET 
  bathhouse_id = 1,
  organizer_id = 1
WHERE slug = 'muzhskoe-venichnoe-parenie';

UPDATE t_p13705114_spa_community_portal.services
SET 
  master_id = 1,
  bathhouse_id = 2,
  organizer_id = 1
WHERE slug = 'banya-dlya-nachinayushih';

UPDATE t_p13705114_spa_community_portal.services
SET 
  bathhouse_id = 2,
  organizer_id = 1
WHERE slug = 'test-event';
