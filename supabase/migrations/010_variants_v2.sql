-- Migration: 010_variants_v2.sql
-- Parent/child variant model: a "variant" is a full product linked to a base product.
--   parent_product_id NULL -> base / standalone product
--   parent_product_id SET  -> this row is a variant of the base product
--   has_variants          -> admin toggle: base product has (or will have) variants
--   variant_label         -> short label shown in the storefront variant selector

ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_label TEXT;

CREATE INDEX IF NOT EXISTS idx_products_parent ON products(parent_product_id);
