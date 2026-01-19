-- Добавляем поля bathhouse_id и master_id в таблицу events
ALTER TABLE t_p13705114_spa_community_portal.events
ADD COLUMN bathhouse_id INTEGER NULL,
ADD COLUMN master_id INTEGER NULL;

-- Создаем индексы для улучшения производительности
CREATE INDEX idx_events_bathhouse_id ON t_p13705114_spa_community_portal.events(bathhouse_id);
CREATE INDEX idx_events_master_id ON t_p13705114_spa_community_portal.events(master_id);

-- Комментарии к полям
COMMENT ON COLUMN t_p13705114_spa_community_portal.events.bathhouse_id IS 'ID бани где проходит событие';
COMMENT ON COLUMN t_p13705114_spa_community_portal.events.master_id IS 'ID мастера который ведет событие';