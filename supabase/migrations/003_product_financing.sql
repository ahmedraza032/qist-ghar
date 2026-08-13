-- Migration: 003_product_financing.sql
-- Per-product financing settings: custom markup percentage and minimum down payment percentage

ALTER TABLE products ADD COLUMN IF NOT EXISTS markup_percent NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS down_payment_percent NUMERIC(5,2) NOT NULL DEFAULT 25;
