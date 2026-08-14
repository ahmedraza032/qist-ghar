-- Migration: 007_restore_variant_combination_id.sql
-- Migration 005 dropped and recreated `orders` without the
-- `variant_combination_id` FK added by 004_variants.sql, which broke
-- the orders API/detail pages. Restore it.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS variant_combination_id UUID
  REFERENCES product_variant_combinations(id) ON DELETE SET NULL;
