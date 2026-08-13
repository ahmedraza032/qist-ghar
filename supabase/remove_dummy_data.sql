-- ============================================================
-- Remove dummy customers, orders (instalments & payments cascade)
-- ============================================================

DELETE FROM orders
WHERE customer_id IN (
  SELECT id FROM customers WHERE phone IN ('0300-1111111','0300-2222222','0300-3333333')
);

DELETE FROM customers
WHERE phone IN ('0300-1111111','0300-2222222','0300-3333333');
