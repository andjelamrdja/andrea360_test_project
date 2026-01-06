ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payment_session;
ALTER TABLE payments DROP COLUMN IF EXISTS session_id;
