-- Migration: 008_tenure_pricing.sql
-- Per-tenure markup and minimum down payment percentages stored as JSONB.
-- Shape: [{"duration_months": 3, "markup_percent": 0, "down_payment_percent": 25}, ...]

ALTER TABLE products ADD COLUMN IF NOT EXISTS tenure_pricing JSONB;
