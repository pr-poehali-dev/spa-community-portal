-- Таблица для платежей
CREATE TABLE IF NOT EXISTS t_p13705114_spa_community_portal.payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p13705114_spa_community_portal.users(id),
  booking_id INTEGER REFERENCES t_p13705114_spa_community_portal.bath_master_bookings(id),
  event_registration_id INTEGER REFERENCES t_p13705114_spa_community_portal.event_registrations(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'canceled', 'refunded')),
  payment_method VARCHAR(50),
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('yookassa', 'stripe', 'manual')),
  provider_payment_id VARCHAR(255),
  provider_response JSONB,
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_entity_check CHECK (
    (booking_id IS NOT NULL AND event_registration_id IS NULL) OR
    (booking_id IS NULL AND event_registration_id IS NOT NULL)
  )
);

-- Индексы для оптимизации
CREATE INDEX idx_payments_user_id ON t_p13705114_spa_community_portal.payments(user_id);
CREATE INDEX idx_payments_booking_id ON t_p13705114_spa_community_portal.payments(booking_id);
CREATE INDEX idx_payments_event_reg_id ON t_p13705114_spa_community_portal.payments(event_registration_id);
CREATE INDEX idx_payments_status ON t_p13705114_spa_community_portal.payments(status);
CREATE INDEX idx_payments_provider ON t_p13705114_spa_community_portal.payments(provider);
CREATE INDEX idx_payments_provider_payment_id ON t_p13705114_spa_community_portal.payments(provider_payment_id);

-- Таблица для webhooks от платежных систем
CREATE TABLE IF NOT EXISTS t_p13705114_spa_community_portal.payment_webhooks (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  payment_id INTEGER REFERENCES t_p13705114_spa_community_portal.payments(id),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_provider ON t_p13705114_spa_community_portal.payment_webhooks(provider);
CREATE INDEX idx_webhooks_processed ON t_p13705114_spa_community_portal.payment_webhooks(processed);
CREATE INDEX idx_webhooks_payment_id ON t_p13705114_spa_community_portal.payment_webhooks(payment_id);

-- Комментарии
COMMENT ON TABLE t_p13705114_spa_community_portal.payments IS 'Платежи за бронирования и события';
COMMENT ON TABLE t_p13705114_spa_community_portal.payment_webhooks IS 'Webhooks от платежных систем для обработки';
COMMENT ON COLUMN t_p13705114_spa_community_portal.payments.status IS 'pending - ожидает оплаты, processing - обрабатывается, succeeded - успешно, canceled - отменен, refunded - возвращен';
COMMENT ON COLUMN t_p13705114_spa_community_portal.payments.provider IS 'yookassa - ЮKassa, stripe - Stripe, manual - ручной платеж';
COMMENT ON COLUMN t_p13705114_spa_community_portal.payments.provider_payment_id IS 'ID платежа в системе провайдера';
COMMENT ON COLUMN t_p13705114_spa_community_portal.payments.provider_response IS 'Полный ответ от платежной системы в JSON';