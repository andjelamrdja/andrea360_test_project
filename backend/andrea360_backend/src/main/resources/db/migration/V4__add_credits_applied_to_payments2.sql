ALTER TABLE payments
    ADD COLUMN credits_applied numeric(19,2) NOT NULL DEFAULT 0;
