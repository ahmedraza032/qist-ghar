-- Migration: 004_simplify_order_status.sql
-- Simplify the order lifecycle to two states:
--   active    = installments remaining (payment in progress)
--   completed = fully paid, order closed
-- Legacy pending/approved/rejected values are backfilled into the new model.

-- 1. Backfill legacy statuses
UPDATE orders SET status = 'active' WHERE status IN ('pending', 'approved');
UPDATE orders SET status = 'active' WHERE status = 'rejected';

-- 2. Recreate the enum with only active/completed
CREATE TYPE order_status_new AS ENUM ('active', 'completed');

ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN status TYPE order_status_new USING status::text::order_status_new;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'active'::order_status_new;

DROP TYPE order_status;
ALTER TYPE order_status_new RENAME TO order_status;