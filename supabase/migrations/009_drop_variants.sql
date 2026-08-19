-- Migration: 009_drop_variants.sql
-- Removes the product variant system: tables, junction table, and the orders FK column.

ALTER TABLE orders DROP COLUMN IF EXISTS variant_combination_id;

DROP TABLE IF EXISTS product_variant_combination_options;
DROP TABLE IF EXISTS product_variant_combinations;
DROP TABLE IF EXISTS product_variant_options;
DROP TABLE IF EXISTS product_variant_attributes;
DROP TABLE IF EXISTS category_default_variant_attributes;
