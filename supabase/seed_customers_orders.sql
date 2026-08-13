-- ============================================================
-- Seed dummy customers + their orders (instalments & payments)
-- Safe to run: does NOT touch products, categories, brands,
-- banners, or anything you manually configured.
--
-- NOTE: edit the product slugs below to match slugs that exist
-- in YOUR products table. The script only inserts orders for
-- products it can find (and skips them otherwise).
-- ============================================================

-- 1) Customers (deduped by phone)
INSERT INTO customers (full_name, phone, address, city, notes) VALUES
  ('Ahmed Khan',   '0300-1111111', 'House 12, Street 5, Gulberg III', 'Lahore',     'Regular customer'),
  ('Fatima Noor',  '0300-2222222', 'Flat 7, Block B, Clifton',         'Karachi',    ''),
  ('Bilal Hussain','0300-3333333', 'P-45, Satellite Town',             'Rawalpindi', '')
ON CONFLICT (phone) DO NOTHING;

-- 2) Ensure instalment plans exist for the products/durations used below
INSERT INTO installment_plans (product_id, duration_months, markup_percent, down_payment_percent)
SELECT p.id, d.months, d.markup, 25
FROM products p
CROSS JOIN (VALUES (3,0),(6,5),(12,10)) AS d(months, markup)
WHERE p.slug IN (
  'iphone-15-pro-max',
  'samsung-galaxy-s24-ultra',
  'samsung-galaxy-a54-5g',
  'xiaomi-redmi-note-13-pro-plus',
  'iphone-15'
)
  AND NOT EXISTS (
    SELECT 1 FROM installment_plans ip
    WHERE ip.product_id = p.id AND ip.duration_months = d.months
  );

-- 3) Create orders + instalments + payments
DO $$
DECLARE
  cid        uuid;
  pid        uuid;
  plid       uuid;
  oid        uuid;
  dur        int;
  dp         int;
  mon        int;
  tot        int;
  mth        text;
  paid_upto  int;
  start_date date;
  i          int;
BEGIN
  -- ================= Order 1: Ahmed -> iPhone 15 Pro Max (6 mo) =================
  SELECT id INTO cid FROM customers WHERE phone = '0300-1111111';
  SELECT id INTO pid FROM products WHERE slug = 'iphone-15-pro-max';
  SELECT id INTO plid FROM installment_plans WHERE product_id = pid AND duration_months = 6;
  IF pid IS NOT NULL AND plid IS NOT NULL THEN
    dur := 6; dp := 100000; mon := 53333; tot := 420000; mth := 'cash'; paid_upto := 1;
    start_date := current_date - 45;
    INSERT INTO orders (customer_id, product_id, plan_id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at)
    VALUES (cid, pid, plid, 'active', dp, mon, tot, mth, start_date) RETURNING id INTO oid;
    FOR i IN 1..dur LOOP
      INSERT INTO installments (order_id, due_date, amount, status, paid_date)
      VALUES (oid, (start_date + i * interval '1 month')::date, mon,
              (CASE WHEN i <= paid_upto THEN 'paid' ELSE 'pending' END)::installment_status,
              CASE WHEN i <= paid_upto THEN (start_date + i * interval '1 month')::date ELSE NULL END);
    END LOOP;
    INSERT INTO payments (order_id, amount, method, reference_no, paid_at)
    VALUES (oid, dp, mth, 'DEMO-DP-1', start_date::timestamptz);
    INSERT INTO payments (order_id, installment_id, amount, method, reference_no, paid_at)
    SELECT oid, id, mon, mth, 'DEMO-INST-1', due_date::timestamptz
    FROM installments WHERE order_id = oid AND status = 'paid';
  END IF;

  -- ================= Order 2: Ahmed -> Samsung Galaxy S24 Ultra (12 mo) =================
  SELECT id INTO cid FROM customers WHERE phone = '0300-1111111';
  SELECT id INTO pid FROM products WHERE slug = 'samsung-galaxy-s24-ultra';
  SELECT id INTO plid FROM installment_plans WHERE product_id = pid AND duration_months = 12;
  IF pid IS NOT NULL AND plid IS NOT NULL THEN
    dur := 12; dp := 95000; mon := 27000; tot := 419000; mth := 'jazzcash'; paid_upto := 0;
    start_date := current_date - 15;
    INSERT INTO orders (customer_id, product_id, plan_id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at)
    VALUES (cid, pid, plid, 'active', dp, mon, tot, mth, start_date) RETURNING id INTO oid;
    FOR i IN 1..dur LOOP
      INSERT INTO installments (order_id, due_date, amount, status, paid_date)
      VALUES (oid, (start_date + i * interval '1 month')::date, mon, 'pending', NULL);
    END LOOP;
    INSERT INTO payments (order_id, amount, method, reference_no, paid_at)
    VALUES (oid, dp, mth, 'DEMO-DP-2', start_date::timestamptz);
  END IF;

  -- ================= Order 3: Fatima -> Samsung Galaxy A54 5G (6 mo) =================
  SELECT id INTO cid FROM customers WHERE phone = '0300-2222222';
  SELECT id INTO pid FROM products WHERE slug = 'samsung-galaxy-a54-5g';
  SELECT id INTO plid FROM installment_plans WHERE product_id = pid AND duration_months = 6;
  IF pid IS NOT NULL AND plid IS NOT NULL THEN
    dur := 6; dp := 26000; mon := 14000; tot := 110000; mth := 'bank'; paid_upto := 0;
    start_date := current_date - 30;
    INSERT INTO orders (customer_id, product_id, plan_id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at)
    VALUES (cid, pid, plid, 'active', dp, mon, tot, mth, start_date) RETURNING id INTO oid;
    FOR i IN 1..dur LOOP
      INSERT INTO installments (order_id, due_date, amount, status, paid_date)
      VALUES (oid, (start_date + i * interval '1 month')::date, mon, 'pending', NULL);
    END LOOP;
    INSERT INTO payments (order_id, amount, method, reference_no, paid_at)
    VALUES (oid, dp, mth, 'DEMO-DP-3', start_date::timestamptz);
  END IF;

  -- ================= Order 4: Fatima -> Xiaomi Redmi Note 13 Pro+ (3 mo) =================
  SELECT id INTO cid FROM customers WHERE phone = '0300-2222222';
  SELECT id INTO pid FROM products WHERE slug = 'xiaomi-redmi-note-13-pro-plus';
  SELECT id INTO plid FROM installment_plans WHERE product_id = pid AND duration_months = 3;
  IF pid IS NOT NULL AND plid IS NOT NULL THEN
    dur := 3; dp := 24000; mon := 25000; tot := 99000; mth := 'card'; paid_upto := 0;
    start_date := current_date - 5;
    INSERT INTO orders (customer_id, product_id, plan_id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at)
    VALUES (cid, pid, plid, 'active', dp, mon, tot, mth, start_date) RETURNING id INTO oid;
    FOR i IN 1..dur LOOP
      INSERT INTO installments (order_id, due_date, amount, status, paid_date)
      VALUES (oid, (start_date + i * interval '1 month')::date, mon, 'pending', NULL);
    END LOOP;
    INSERT INTO payments (order_id, amount, method, reference_no, paid_at)
    VALUES (oid, dp, mth, 'DEMO-DP-4', start_date::timestamptz);
  END IF;

  -- ================= Order 5: Bilal -> iPhone 15 (6 mo, 2 instalments paid) =================
  SELECT id INTO cid FROM customers WHERE phone = '0300-3333333';
  SELECT id INTO pid FROM products WHERE slug = 'iphone-15';
  SELECT id INTO plid FROM installment_plans WHERE product_id = pid AND duration_months = 6;
  IF pid IS NOT NULL AND plid IS NOT NULL THEN
    dur := 6; dp := 78000; mon := 41000; tot := 324000; mth := 'cash'; paid_upto := 2;
    start_date := current_date - 60;
    INSERT INTO orders (customer_id, product_id, plan_id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at)
    VALUES (cid, pid, plid, 'active', dp, mon, tot, mth, start_date) RETURNING id INTO oid;
    FOR i IN 1..dur LOOP
      INSERT INTO installments (order_id, due_date, amount, status, paid_date)
      VALUES (oid, (start_date + i * interval '1 month')::date, mon,
              (CASE WHEN i <= paid_upto THEN 'paid' ELSE 'pending' END)::installment_status,
              CASE WHEN i <= paid_upto THEN (start_date + i * interval '1 month')::date ELSE NULL END);
    END LOOP;
    INSERT INTO payments (order_id, amount, method, reference_no, paid_at)
    VALUES (oid, dp, mth, 'DEMO-DP-5', start_date::timestamptz);
    INSERT INTO payments (order_id, installment_id, amount, method, reference_no, paid_at)
    SELECT oid, id, mon, mth, 'DEMO-INST-5', due_date::timestamptz
    FROM installments WHERE order_id = oid AND status = 'paid';
  END IF;
END $$;
