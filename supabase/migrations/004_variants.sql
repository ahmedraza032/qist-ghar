-- Migration: 004_variants.sql
-- Product variant system: attributes, options, and combinations with price adjustments and stock

-- Variant Attributes (e.g., "Color", "Storage", "Capacity")
CREATE TABLE product_variant_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- e.g., "Color", "Storage"
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_variant_attributes_product ON product_variant_attributes(product_id);

-- Variant Options per attribute (e.g., Color -> "Natural Titanium", "Blue", "Black", "White")
CREATE TABLE product_variant_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attribute_id UUID NOT NULL REFERENCES product_variant_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,                    -- e.g., "Natural Titanium", "256GB"
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_variant_options_attribute ON product_variant_options(attribute_id);

-- Variant Combinations (specific combinations of options with price/stock overrides)
-- e.g., (Color: Blue, Storage: 256GB) -> price_adjustment: +20000, stock: 5
CREATE TABLE product_variant_combinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price_adjustment INTEGER NOT NULL DEFAULT 0,        -- positive or negative adjustment in PKR
  absolute_price INTEGER,                             -- optional: if set, overrides base_price + adjustment
  stock_qty INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_variant_combinations_product ON product_variant_combinations(product_id);

-- Junction: which options belong to which combination
CREATE TABLE product_variant_combination_options (
  combination_id UUID NOT NULL REFERENCES product_variant_combinations(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES product_variant_options(id) ON DELETE CASCADE,
  PRIMARY KEY (combination_id, option_id)
);

-- Category default variant attributes (for pre-filling when creating products)
CREATE TABLE category_default_variant_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  attribute_name TEXT NOT NULL,        -- e.g., "Color", "Storage"
  display_order INTEGER NOT NULL DEFAULT 0,
  default_options TEXT[] NOT NULL DEFAULT '{}',  -- array of default option values
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, attribute_name)
);

CREATE INDEX idx_category_default_attrs_category ON category_default_variant_attributes(category_id);

-- Add variant_combination_id to orders to track selected variant
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_combination_id UUID REFERENCES product_variant_combinations(id) ON DELETE SET NULL;

-- Seed default variant attributes per category
INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Color', 1, ARRAY['Natural Titanium', 'Blue', 'Black', 'White']
FROM categories c WHERE c.slug = 'smartphones'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Storage', 2, ARRAY['128GB', '256GB', '512GB', '1TB']
FROM categories c WHERE c.slug = 'smartphones'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Color', 1, ARRAY['Space Gray', 'Silver', 'Midnight', 'Starlight']
FROM categories c WHERE c.slug = 'laptops'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'RAM', 2, ARRAY['8GB', '16GB', '32GB']
FROM categories c WHERE c.slug = 'laptops'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Storage', 3, ARRAY['256GB SSD', '512GB SSD', '1TB SSD']
FROM categories c WHERE c.slug = 'laptops'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Capacity', 1, ARRAY['1 Ton', '1.5 Ton', '2 Ton']
FROM categories c WHERE c.slug = 'air-conditioners'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Type', 2, ARRAY['Inverter', 'Non-Inverter']
FROM categories c WHERE c.slug = 'air-conditioners'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Screen Size', 1, ARRAY['32"', '43"', '55"', '65"']
FROM categories c WHERE c.slug = 'tvs'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Resolution', 2, ARRAY['HD', '4K']
FROM categories c WHERE c.slug = 'tvs'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Capacity', 1, ARRAY['7kg', '8kg', '10kg']
FROM categories c WHERE c.slug = 'washing-machines'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Type', 2, ARRAY['Top Load', 'Front Load', 'Semi-Automatic']
FROM categories c WHERE c.slug = 'washing-machines'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

INSERT INTO category_default_variant_attributes (category_id, attribute_name, display_order, default_options)
SELECT c.id, 'Color', 1, ARRAY['Black', 'White', 'Silver']
FROM categories c WHERE c.slug = 'accessories'
ON CONFLICT (category_id, attribute_name) DO NOTHING;

-- RLS Policies
ALTER TABLE product_variant_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_combination_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_default_variant_attributes ENABLE ROW LEVEL SECURITY;

-- Public read for published products' variants
CREATE POLICY "Public can read variant attributes of published products" ON product_variant_attributes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_variant_attributes.product_id AND products.is_published = true)
  );

CREATE POLICY "Public can read variant options of published products" ON product_variant_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM product_variant_attributes a
      JOIN products p ON p.id = a.product_id
      WHERE a.id = product_variant_options.attribute_id AND p.is_published = true
    )
  );

CREATE POLICY "Public can read variant combinations of published products" ON product_variant_combinations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_variant_combinations.product_id AND products.is_published = true)
  );

CREATE POLICY "Public can read variant combination options of published products" ON product_variant_combination_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM product_variant_combinations vc
      JOIN products p ON p.id = vc.product_id
      WHERE vc.id = product_variant_combination_options.combination_id AND p.is_published = true
    )
  );

CREATE POLICY "Public can read category default variant attributes" ON category_default_variant_attributes
  FOR SELECT USING (true);