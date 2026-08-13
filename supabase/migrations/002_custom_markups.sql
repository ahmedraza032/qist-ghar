-- Migration: 002_custom_markups.sql
-- Per-Customer Per-Product Custom Markup Pricing Table

CREATE TABLE IF NOT EXISTS customer_product_markups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  markup_type TEXT NOT NULL CHECK (markup_type IN ('flat', 'percent')),
  markup_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_product_markup UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cpm_user_product ON customer_product_markups(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_cpm_dates ON customer_product_markups(start_date, end_date);

-- Enable RLS
ALTER TABLE customer_product_markups ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own active markups
CREATE POLICY "Users can read own markups" ON customer_product_markups
  FOR SELECT USING (auth.uid() = user_id);
