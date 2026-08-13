-- QistGhar Demo Seed Data
-- Run in Supabase SQL Editor after the initial migration
-- Safe to re-run: truncates existing data first
-- Product images are verified-working Unsplash photo IDs (tech products)

TRUNCATE TABLE payments, installments, orders, installment_plans, banners, settings, customers, products, brands, categories CASCADE;

-- SETTINGS
INSERT INTO settings (key, value) VALUES
  ('whatsapp_number', '923000000000');

-- CUSTOMERS (sample ledger entries)
INSERT INTO customers (full_name, phone, address, city, notes) VALUES
  ('Ahmed Khan', '0300-1234567', 'House 12, Street 5, Gulberg III', 'Lahore', ''),
  ('Fatima Noor', '0312-7654321', 'Flat 7, Block B, Clifton', 'Karachi', ''),
  ('Bilal Hussain', '0333-9988776', 'P-45, Satellite Town', 'Rawalpindi', '');

-- CATEGORIES
INSERT INTO categories (name, slug, image_url) VALUES
  ('Smartphones', 'smartphones', 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800'),
  ('Laptops', 'laptops', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'),
  ('TVs', 'tvs', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800'),
  ('Air Conditioners', 'air-conditioners', 'https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800'),
  ('Washing Machines', 'washing-machines', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800'),
  ('Accessories', 'accessories', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800');

-- BRANDS
INSERT INTO brands (name) VALUES
  ('Samsung'), ('Apple'), ('Xiaomi'), ('Oppo'), ('Vivo'), ('OnePlus'),
  ('HP'), ('Dell'), ('Lenovo'), ('Asus'), ('Acer'),
  ('Sony'), ('TCL'), ('Haier'), ('Gree'), ('Kenwood'), ('Dawlance'), ('JBL');

-- PRODUCTS
INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'iPhone 15 Pro Max', 'iphone-15-pro-max',
  (SELECT id FROM brands WHERE name='Apple'),
  (SELECT id FROM categories WHERE slug='smartphones'),
  'The most powerful iPhone ever. A17 Pro chip, 48MP camera system, and titanium design.',
  '{"Display": "6.7-inch Super Retina XDR OLED", "Processor": "A17 Pro", "RAM": "8GB", "Storage": "256GB", "Camera": "48MP + 12MP + 12MP", "Battery": "4441 mAh"}'::jsonb,
  399999, 15, true,
  ARRAY['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800', 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra',
  (SELECT id FROM brands WHERE name='Samsung'),
  (SELECT id FROM categories WHERE slug='smartphones'),
  'Galaxy AI is here. The ultimate Galaxy experience with S Pen, 200MP camera, and titanium frame.',
  '{"Display": "6.8-inch Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 3", "RAM": "12GB", "Storage": "256GB", "Camera": "200MP + 50MP + 12MP + 10MP", "Battery": "5000 mAh"}'::jsonb,
  379999, 20, true,
  ARRAY['https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?w=800', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'iPhone 15', 'iphone-15',
  (SELECT id FROM brands WHERE name='Apple'),
  (SELECT id FROM categories WHERE slug='smartphones'),
  'Dynamic Island. 48MP main camera. A16 Bionic. USB-C. A huge leap forward.',
  '{"Display": "6.1-inch Super Retina XDR OLED", "Processor": "A16 Bionic", "RAM": "6GB", "Storage": "128GB", "Camera": "48MP + 12MP", "Battery": "3349 mAh"}'::jsonb,
  309999, 25, true,
  ARRAY['https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Samsung Galaxy A54 5G', 'samsung-galaxy-a54-5g',
  (SELECT id FROM brands WHERE name='Samsung'),
  (SELECT id FROM categories WHERE slug='smartphones'),
  'Premium features at a mid-range price. 50MP camera, 120Hz display, long-lasting battery.',
  '{"Display": "6.4-inch Super AMOLED 120Hz", "Processor": "Exynos 1380", "RAM": "8GB", "Storage": "128GB", "Camera": "50MP + 12MP + 5MP", "Battery": "5000 mAh"}'::jsonb,
  104999, 30, true,
  ARRAY['https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Xiaomi Redmi Note 13 Pro+', 'xiaomi-redmi-note-13-pro-plus',
  (SELECT id FROM brands WHERE name='Xiaomi'),
  (SELECT id FROM categories WHERE slug='smartphones'),
  'The Redmi Note series redefined. 200MP camera with OIS, 120W fast charging.',
  '{"Display": "6.67-inch AMOLED 120Hz", "Processor": "Dimensity 7200 Ultra", "RAM": "12GB", "Storage": "256GB", "Camera": "200MP + 8MP + 2MP", "Battery": "5000 mAh"}'::jsonb,
  94999, 40, true,
  ARRAY['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'OnePlus 12', 'oneplus-12',
  (SELECT id FROM brands WHERE name='OnePlus'),
  (SELECT id FROM categories WHERE slug='smartphones'),
  'A decade of OnePlus. Hasselblad camera, Snapdragon 8 Gen 3, 100W charging.',
  '{"Display": "6.82-inch LTPO AMOLED", "Processor": "Snapdragon 8 Gen 3", "RAM": "16GB", "Storage": "256GB", "Camera": "50MP + 64MP + 48MP", "Battery": "5400 mAh"}'::jsonb,
  259999, 10, true,
  ARRAY['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Oppo Reno 11 Pro', 'oppo-reno-11-pro',
  (SELECT id FROM brands WHERE name='Oppo'),
  (SELECT id FROM categories WHERE slug='smartphones'),
  'Portrait expert. 50MP telephoto portrait camera, 80W SUPERVOOC charging.',
  '{"Display": "6.7-inch AMOLED 120Hz", "Processor": "Dimensity 8200", "RAM": "12GB", "Storage": "256GB", "Camera": "50MP + 32MP + 8MP", "Battery": "4600 mAh"}'::jsonb,
  119999, 20, true,
  ARRAY['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'MacBook Air M3', 'macbook-air-m3',
  (SELECT id FROM brands WHERE name='Apple'),
  (SELECT id FROM categories WHERE slug='laptops'),
  'Lightness redefined. M3 chip, 15.3-inch Liquid Retina display, up to 18 hours battery.',
  '{"Display": "15.3-inch Liquid Retina", "Processor": "Apple M3", "RAM": "8GB", "Storage": "256GB SSD", "Battery": "Up to 18 hours", "Weight": "1.51 kg"}'::jsonb,
  329999, 10, true,
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Dell Inspiron 15', 'dell-inspiron-15',
  (SELECT id FROM brands WHERE name='Dell'),
  (SELECT id FROM categories WHERE slug='laptops'),
  'Everyday productivity laptop. 12th Gen Intel Core i5, 15.6-inch FHD display.',
  '{"Display": "15.6-inch FHD IPS", "Processor": "Intel Core i5-1235U", "RAM": "8GB DDR4", "Storage": "512GB SSD", "Battery": "Up to 8 hours", "Weight": "1.65 kg"}'::jsonb,
  114999, 15, true,
  ARRAY['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'HP Pavilion 15', 'hp-pavilion-15',
  (SELECT id FROM brands WHERE name='HP'),
  (SELECT id FROM categories WHERE slug='laptops'),
  'Stylish and powerful. 13th Gen Intel Core i7, 16GB RAM, 512GB SSD.',
  '{"Display": "15.6-inch FHD IPS", "Processor": "Intel Core i7-1355U", "RAM": "16GB DDR4", "Storage": "512GB SSD", "Battery": "Up to 8 hours", "Weight": "1.75 kg"}'::jsonb,
  169999, 12, true,
  ARRAY['https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Lenovo ThinkPad E14', 'lenovo-thinkpad-e14',
  (SELECT id FROM brands WHERE name='Lenovo'),
  (SELECT id FROM categories WHERE slug='laptops'),
  'Business-ready laptop. Military-grade durability, AMD Ryzen 5, 14-inch display.',
  '{"Display": "14-inch FHD IPS", "Processor": "AMD Ryzen 5 7530U", "RAM": "16GB DDR4", "Storage": "512GB SSD", "Battery": "Up to 10 hours", "Weight": "1.59 kg"}'::jsonb,
  154999, 18, true,
  ARRAY['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Asus VivoBook 15', 'asus-vivobook-15',
  (SELECT id FROM brands WHERE name='Asus'),
  (SELECT id FROM categories WHERE slug='laptops'),
  'Affordable and reliable. Intel Core i3, 8GB RAM, 256GB SSD.',
  '{"Display": "15.6-inch FHD", "Processor": "Intel Core i3-1215U", "RAM": "8GB DDR4", "Storage": "256GB SSD", "Battery": "Up to 6 hours", "Weight": "1.7 kg"}'::jsonb,
  84999, 25, true,
  ARRAY['https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Samsung 55-inch Crystal UHD 4K', 'samsung-55-crystal-uhd-4k',
  (SELECT id FROM brands WHERE name='Samsung'),
  (SELECT id FROM categories WHERE slug='tvs'),
  'Crystal clear 4K UHD resolution with PurColor technology. Built-in smart TV.',
  '{"Display": "55-inch 4K UHD", "Resolution": "3840 x 2160", "Refresh Rate": "60Hz", "Smart TV": "Tizen OS", "HDMI": "3 ports", "USB": "2 ports"}'::jsonb,
  154999, 8, true,
  ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Sony Bravia 65-inch 4K OLED', 'sony-bravia-65-4k-oled',
  (SELECT id FROM brands WHERE name='Sony'),
  (SELECT id FROM categories WHERE slug='tvs'),
  'OLED picture quality with Cognitive Processor XR. Perfect for PlayStation 5.',
  '{"Display": "65-inch 4K OLED", "Resolution": "3840 x 2160", "Refresh Rate": "120Hz", "Smart TV": "Google TV", "HDMI": "4 ports", "USB": "2 ports"}'::jsonb,
  449999, 5, true,
  ARRAY['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'TCL 43-inch 4K Android TV', 'tcl-43-4k-android-tv',
  (SELECT id FROM brands WHERE name='TCL'),
  (SELECT id FROM categories WHERE slug='tvs'),
  'Affordable 4K experience. Dolby Audio, Android TV with Google Assistant.',
  '{"Display": "43-inch 4K UHD", "Resolution": "3840 x 2160", "Refresh Rate": "60Hz", "Smart TV": "Android TV", "HDMI": "2 ports", "USB": "1 port"}'::jsonb,
  79499, 20, true,
  ARRAY['https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Haier 32-inch HD LED TV', 'haier-32-hd-led-tv',
  (SELECT id FROM brands WHERE name='Haier'),
  (SELECT id FROM categories WHERE slug='tvs'),
  'Compact and perfect for bedrooms. HD Ready, USB playback, HDMI connectivity.',
  '{"Display": "32-inch HD Ready", "Resolution": "1366 x 768", "Refresh Rate": "60Hz", "HDMI": "2 ports", "USB": "1 port"}'::jsonb,
  34999, 30, true,
  ARRAY['https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Gree 1.5 Ton DC Inverter AC', 'gree-15-ton-dc-inverter-ac',
  (SELECT id FROM brands WHERE name='Gree'),
  (SELECT id FROM categories WHERE slug='air-conditioners'),
  'Energy-efficient DC inverter AC with Turbo cooling. 4D airflow for uniform cooling.',
  '{"Type": "Split AC", "Capacity": "1.5 Ton", "Cooling": "Turbo", "Energy Rating": "5 Star", "Compressor": "DC Inverter", "Coverage": "180 sq. ft"}'::jsonb,
  149999, 12, true,
  ARRAY['https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Haier 1 Ton DC Inverter AC', 'haier-1-ton-dc-inverter-ac',
  (SELECT id FROM brands WHERE name='Haier'),
  (SELECT id FROM categories WHERE slug='air-conditioners'),
  'Reliable Haier AC with DC inverter technology. Self-cleaning, low noise operation.',
  '{"Type": "Split AC", "Capacity": "1 Ton", "Cooling": "Fast Cool", "Energy Rating": "4 Star", "Compressor": "DC Inverter", "Coverage": "120 sq. ft"}'::jsonb,
  109999, 15, true,
  ARRAY['https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Dawlance 1.5 Ton Inverter AC', 'dawlance-15-ton-inverter-ac',
  (SELECT id FROM brands WHERE name='Dawlance'),
  (SELECT id FROM categories WHERE slug='air-conditioners'),
  'Pakistans trusted brand. Inverter technology with 30% more energy saving.',
  '{"Type": "Split AC", "Capacity": "1.5 Ton", "Cooling": "Rapid Cool", "Energy Rating": "4 Star", "Compressor": "Inverter", "Coverage": "180 sq. ft"}'::jsonb,
  134999, 10, true,
  ARRAY['https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Haier 10kg Fully Automatic', 'haier-10kg-fully-automatic',
  (SELECT id FROM brands WHERE name='Haier'),
  (SELECT id FROM categories WHERE slug='washing-machines'),
  'Large capacity fully automatic washing machine. Multiple wash programs, quick wash option.',
  '{"Type": "Fully Automatic", "Capacity": "10kg", "Spin Speed": "1200 RPM", "Wash Programs": "12", "Energy Rating": "A++", "Digital Display": "Yes"}'::jsonb,
  59999, 10, true,
  ARRAY['https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Dawlance 8kg Semi Automatic', 'dawlance-8kg-semi-automatic',
  (SELECT id FROM brands WHERE name='Dawlance'),
  (SELECT id FROM categories WHERE slug='washing-machines'),
  'Affordable and durable semi-automatic washing machine. Twin tub design.',
  '{"Type": "Semi Automatic", "Capacity": "8kg", "Spin Speed": "1450 RPM", "Wash Programs": "3", "Twin Tub": "Yes", "Energy Rating": "A"}'::jsonb,
  34999, 20, true,
  ARRAY['https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Kenwood 9kg Front Load', 'kenwood-9kg-front-load',
  (SELECT id FROM brands WHERE name='Kenwood'),
  (SELECT id FROM categories WHERE slug='washing-machines'),
  'European-style front load washing machine. Silent inverter motor, steam wash.',
  '{"Type": "Front Load", "Capacity": "9kg", "Spin Speed": "1400 RPM", "Wash Programs": "15", "Inverter Motor": "Yes", "Steam Wash": "Yes"}'::jsonb,
  104999, 8, true,
  ARRAY['https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Apple AirPods Pro 2', 'apple-airpods-pro-2',
  (SELECT id FROM brands WHERE name='Apple'),
  (SELECT id FROM categories WHERE slug='accessories'),
  'Active Noise Cancellation with Transparency mode. Personalized Spatial Audio.',
  '{"Type": "In-Ear", "Connectivity": "Bluetooth 5.3", "Battery": "6 hours (30 with case)", "ANC": "Yes", "Water Resistance": "IPX4"}'::jsonb,
  64999, 25, true,
  ARRAY['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Samsung Galaxy Watch 6', 'samsung-galaxy-watch-6',
  (SELECT id FROM brands WHERE name='Samsung'),
  (SELECT id FROM categories WHERE slug='accessories'),
  'Advanced health tracking. ECG, blood pressure, body composition analysis.',
  '{"Type": "Smartwatch", "Display": "1.5-inch Super AMOLED", "Battery": "Up to 40 hours", "Sensors": "ECG, BIA, HRM", "Water Resistance": "IP68"}'::jsonb,
  52999, 15, true,
  ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'Samsung 25W Fast Charger', 'samsung-25w-fast-charger',
  (SELECT id FROM brands WHERE name='Samsung'),
  (SELECT id FROM categories WHERE slug='accessories'),
  'Fast charge your Samsung devices. USB-C PD compatible.',
  '{"Type": "Wall Charger", "Output": "25W USB-C PD", "Cable": "USB-C to USB-C", "Compatibility": "Android & iPhone 15"}'::jsonb,
  2499, 50, true,
  ARRAY['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800']::text[]
);

INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  'JBL Tune 770NC Headphones', 'jbl-tune-770nc-headphones',
  (SELECT id FROM brands WHERE name='JBL'),
  (SELECT id FROM categories WHERE slug='accessories'),
  'JBL Pure Bass sound with adaptive noise cancelling. 40 hours battery life.',
  '{"Type": "Over-Ear", "Connectivity": "Bluetooth 5.0", "Battery": "40 hours", "ANC": "Yes", "Foldable": "Yes"}'::jsonb,
  24999, 20, true,
  ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']::text[]
);


-- INSTALLMENT PLANS
INSERT INTO installment_plans (product_id, duration_months, markup_percent, down_payment_percent)
SELECT p.id, d.months, d.markup, 20
FROM products p, (VALUES (3, 0), (6, 5), (12, 10), (18, 15), (24, 20)) AS d(months, markup)
WHERE p.is_published = true;

-- BANNERS
INSERT INTO banners (title, image_url, cta_text, cta_link, is_active, sort_order) VALUES
  ('Buy Now, Pay in Easy Installments', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 'Shop Now', '/products', true, 0),
  ('New Smartphone Collection', 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800', 'Explore', '/products?category=smartphones', true, 1),
  ('Summer AC Sale', 'https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800', 'View Deals', '/products?category=air-conditioners', true, 2);
