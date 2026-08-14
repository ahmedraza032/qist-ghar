-- Migration: 005_ledger_architecture.sql
-- Reshape the app into an admin-managed ledger (khata):
--   - Customers are standalone records (no Supabase Auth linkage).
--   - Orders belong to customers and carry a sequential order_number starting at 1.
--   - Settings table stores the WhatsApp number used by the storefront handoff.

-- Drop auth-coupled tables and types (recreated below).
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS installments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customer_product_markups CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS installment_status CASCADE;

-- ============================================================
-- CUSTOMERS (ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SETTINGS (key/value)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value)
VALUES ('whatsapp_number', '923000000000')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- ORDER NUMBER SEQUENCE (starts at 1)
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE order_status AS ENUM ('active', 'completed');
CREATE TYPE installment_status AS ENUM ('pending', 'paid', 'overdue');

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number INTEGER NOT NULL UNIQUE DEFAULT nextval('order_number_seq'),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id),
  plan_id UUID NOT NULL REFERENCES installment_plans(id),
  variant_combination_id UUID REFERENCES product_variant_combinations(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'active',
  down_payment_amount INTEGER NOT NULL,
  monthly_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- ============================================================
-- INSTALLMENTS
-- ============================================================
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  amount INTEGER NOT NULL,
  paid_date DATE,
  status installment_status NOT NULL DEFAULT 'pending'
);

CREATE INDEX idx_installments_order ON installments(order_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_due ON installments(due_date);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  installment_id UUID REFERENCES installments(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  reference_no TEXT NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Admin operations use the service role (bypasses RLS). There is no
-- customer auth, so no user-scoped policies are needed.
-- ============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
