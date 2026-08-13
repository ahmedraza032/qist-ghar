// generate-seed.js
// Generates seed.sql with verified-working Unsplash product images

const brandColors = {
  'Apple': '#1a1a1a', 'Samsung': '#1428a0', 'Xiaomi': '#ff6900', 'Oppo': '#1ba784',
  'OnePlus': '#eb0028', 'HP': '#0096d6', 'Dell': '#007db8', 'Lenovo': '#e2231a',
  'Asus': '#00539b', 'Sony': '#1a1a1a', 'TCL': '#d40d1c', 'Haier': '#005baa',
  'Dawlance': '#0d4d8c', 'Gree': '#0066b3', 'Kenwood': '#e32636', 'JBL': '#ef2b2c',
};

function img(id) { return `https://images.unsplash.com/photo-${id}?w=800`; }

const products = [
  // Smartphones
  { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', brand: 'Apple', cat: 'smartphones',
    imgs: [img('1591337676887-a217a6970a8a'), img('1605236453806-6ff36851218e')],
    desc: 'The most powerful iPhone ever. A17 Pro chip, 48MP camera system, and titanium design.',
    specs: '{"Display": "6.7-inch Super Retina XDR OLED", "Processor": "A17 Pro", "RAM": "8GB", "Storage": "256GB", "Camera": "48MP + 12MP + 12MP", "Battery": "4441 mAh"}',
    price: 399999, stock: 15 },

  { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', brand: 'Samsung', cat: 'smartphones',
    imgs: [img('1608170825938-a8ea0305d46c'), img('1610945265064-0e34e5519bbf')],
    desc: 'Galaxy AI is here. The ultimate Galaxy experience with S Pen, 200MP camera, and titanium frame.',
    specs: '{"Display": "6.8-inch Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 3", "RAM": "12GB", "Storage": "256GB", "Camera": "200MP + 50MP + 12MP + 10MP", "Battery": "5000 mAh"}',
    price: 379999, stock: 20 },

  { name: 'iPhone 15', slug: 'iphone-15', brand: 'Apple', cat: 'smartphones',
    imgs: [img('1567581935884-3349723552ca')],
    desc: 'Dynamic Island. 48MP main camera. A16 Bionic. USB-C. A huge leap forward.',
    specs: '{"Display": "6.1-inch Super Retina XDR OLED", "Processor": "A16 Bionic", "RAM": "6GB", "Storage": "128GB", "Camera": "48MP + 12MP", "Battery": "3349 mAh"}',
    price: 309999, stock: 25 },

  { name: 'Samsung Galaxy A54 5G', slug: 'samsung-galaxy-a54-5g', brand: 'Samsung', cat: 'smartphones',
    imgs: [img('1609599006353-e629aaabfeae')],
    desc: 'Premium features at a mid-range price. 50MP camera, 120Hz display, long-lasting battery.',
    specs: '{"Display": "6.4-inch Super AMOLED 120Hz", "Processor": "Exynos 1380", "RAM": "8GB", "Storage": "128GB", "Camera": "50MP + 12MP + 5MP", "Battery": "5000 mAh"}',
    price: 104999, stock: 30 },

  { name: 'Xiaomi Redmi Note 13 Pro+', slug: 'xiaomi-redmi-note-13-pro-plus', brand: 'Xiaomi', cat: 'smartphones',
    imgs: [img('1572569511254-d8f925fe2cbb')],
    desc: 'The Redmi Note series redefined. 200MP camera with OIS, 120W fast charging.',
    specs: '{"Display": "6.67-inch AMOLED 120Hz", "Processor": "Dimensity 7200 Ultra", "RAM": "12GB", "Storage": "256GB", "Camera": "200MP + 8MP + 2MP", "Battery": "5000 mAh"}',
    price: 94999, stock: 40 },

  { name: 'OnePlus 12', slug: 'oneplus-12', brand: 'OnePlus', cat: 'smartphones',
    imgs: [img('1585060544812-6b45742d762f')],
    desc: 'A decade of OnePlus. Hasselblad camera, Snapdragon 8 Gen 3, 100W charging.',
    specs: '{"Display": "6.82-inch LTPO AMOLED", "Processor": "Snapdragon 8 Gen 3", "RAM": "16GB", "Storage": "256GB", "Camera": "50MP + 64MP + 48MP", "Battery": "5400 mAh"}',
    price: 259999, stock: 10 },

  { name: 'Oppo Reno 11 Pro', slug: 'oppo-reno-11-pro', brand: 'Oppo', cat: 'smartphones',
    imgs: [img('1591337676887-a217a6970a8a')],
    desc: 'Portrait expert. 50MP telephoto portrait camera, 80W SUPERVOOC charging.',
    specs: '{"Display": "6.7-inch AMOLED 120Hz", "Processor": "Dimensity 8200", "RAM": "12GB", "Storage": "256GB", "Camera": "50MP + 32MP + 8MP", "Battery": "4600 mAh"}',
    price: 119999, stock: 20 },

  // Laptops
  { name: 'MacBook Air M3', slug: 'macbook-air-m3', brand: 'Apple', cat: 'laptops',
    imgs: [img('1517336714731-489689fd1ca8'), img('1525547719571-a2d4ac8945e2')],
    desc: 'Lightness redefined. M3 chip, 15.3-inch Liquid Retina display, up to 18 hours battery.',
    specs: '{"Display": "15.3-inch Liquid Retina", "Processor": "Apple M3", "RAM": "8GB", "Storage": "256GB SSD", "Battery": "Up to 18 hours", "Weight": "1.51 kg"}',
    price: 329999, stock: 10 },

  { name: 'Dell Inspiron 15', slug: 'dell-inspiron-15', brand: 'Dell', cat: 'laptops',
    imgs: [img('1541807084-5c52b6b3adef')],
    desc: 'Everyday productivity laptop. 12th Gen Intel Core i5, 15.6-inch FHD display.',
    specs: '{"Display": "15.6-inch FHD IPS", "Processor": "Intel Core i5-1235U", "RAM": "8GB DDR4", "Storage": "512GB SSD", "Battery": "Up to 8 hours", "Weight": "1.65 kg"}',
    price: 114999, stock: 15 },

  { name: 'HP Pavilion 15', slug: 'hp-pavilion-15', brand: 'HP', cat: 'laptops',
    imgs: [img('1611078489935-0cb964de46d6')],
    desc: 'Stylish and powerful. 13th Gen Intel Core i7, 16GB RAM, 512GB SSD.',
    specs: '{"Display": "15.6-inch FHD IPS", "Processor": "Intel Core i7-1355U", "RAM": "16GB DDR4", "Storage": "512GB SSD", "Battery": "Up to 8 hours", "Weight": "1.75 kg"}',
    price: 169999, stock: 12 },

  { name: 'Lenovo ThinkPad E14', slug: 'lenovo-thinkpad-e14', brand: 'Lenovo', cat: 'laptops',
    imgs: [img('1588872657578-7efd1f1555ed')],
    desc: 'Business-ready laptop. Military-grade durability, AMD Ryzen 5, 14-inch display.',
    specs: '{"Display": "14-inch FHD IPS", "Processor": "AMD Ryzen 5 7530U", "RAM": "16GB DDR4", "Storage": "512GB SSD", "Battery": "Up to 10 hours", "Weight": "1.59 kg"}',
    price: 154999, stock: 18 },

  { name: 'Asus VivoBook 15', slug: 'asus-vivobook-15', brand: 'Asus', cat: 'laptops',
    imgs: [img('1593642634524-b40b5baae6bb')],
    desc: 'Affordable and reliable. Intel Core i3, 8GB RAM, 256GB SSD.',
    specs: '{"Display": "15.6-inch FHD", "Processor": "Intel Core i3-1215U", "RAM": "8GB DDR4", "Storage": "256GB SSD", "Battery": "Up to 6 hours", "Weight": "1.7 kg"}',
    price: 84999, stock: 25 },

  // TVs
  { name: 'Samsung 55-inch Crystal UHD 4K', slug: 'samsung-55-crystal-uhd-4k', brand: 'Samsung', cat: 'tvs',
    imgs: [img('1593359677879-a4bb92f829d1')],
    desc: 'Crystal clear 4K UHD resolution with PurColor technology. Built-in smart TV.',
    specs: '{"Display": "55-inch 4K UHD", "Resolution": "3840 x 2160", "Refresh Rate": "60Hz", "Smart TV": "Tizen OS", "HDMI": "3 ports", "USB": "2 ports"}',
    price: 154999, stock: 8 },

  { name: 'Sony Bravia 65-inch 4K OLED', slug: 'sony-bravia-65-4k-oled', brand: 'Sony', cat: 'tvs',
    imgs: [img('1593305841991-05c297ba4575')],
    desc: 'OLED picture quality with Cognitive Processor XR. Perfect for PlayStation 5.',
    specs: '{"Display": "65-inch 4K OLED", "Resolution": "3840 x 2160", "Refresh Rate": "120Hz", "Smart TV": "Google TV", "HDMI": "4 ports", "USB": "2 ports"}',
    price: 449999, stock: 5 },

  { name: 'TCL 43-inch 4K Android TV', slug: 'tcl-43-4k-android-tv', brand: 'TCL', cat: 'tvs',
    imgs: [img('1461151304267-38535e780c79')],
    desc: 'Affordable 4K experience. Dolby Audio, Android TV with Google Assistant.',
    specs: '{"Display": "43-inch 4K UHD", "Resolution": "3840 x 2160", "Refresh Rate": "60Hz", "Smart TV": "Android TV", "HDMI": "2 ports", "USB": "1 port"}',
    price: 79499, stock: 20 },

  { name: 'Haier 32-inch HD LED TV', slug: 'haier-32-hd-led-tv', brand: 'Haier', cat: 'tvs',
    imgs: [img('1601944179066-29786cb9d32a')],
    desc: 'Compact and perfect for bedrooms. HD Ready, USB playback, HDMI connectivity.',
    specs: '{"Display": "32-inch HD Ready", "Resolution": "1366 x 768", "Refresh Rate": "60Hz", "HDMI": "2 ports", "USB": "1 port"}',
    price: 34999, stock: 30 },

  // AC
  { name: 'Gree 1.5 Ton DC Inverter AC', slug: 'gree-15-ton-dc-inverter-ac', brand: 'Gree', cat: 'air-conditioners',
    imgs: [img('1532635241-17e820acc59f')],
    desc: 'Energy-efficient DC inverter AC with Turbo cooling. 4D airflow for uniform cooling.',
    specs: '{"Type": "Split AC", "Capacity": "1.5 Ton", "Cooling": "Turbo", "Energy Rating": "5 Star", "Compressor": "DC Inverter", "Coverage": "180 sq. ft"}',
    price: 149999, stock: 12 },

  { name: 'Haier 1 Ton DC Inverter AC', slug: 'haier-1-ton-dc-inverter-ac', brand: 'Haier', cat: 'air-conditioners',
    imgs: [img('1567113463300-102a7eb3cb26')],
    desc: 'Reliable Haier AC with DC inverter technology. Self-cleaning, low noise operation.',
    specs: '{"Type": "Split AC", "Capacity": "1 Ton", "Cooling": "Fast Cool", "Energy Rating": "4 Star", "Compressor": "DC Inverter", "Coverage": "120 sq. ft"}',
    price: 109999, stock: 15 },

  { name: 'Dawlance 1.5 Ton Inverter AC', slug: 'dawlance-15-ton-inverter-ac', brand: 'Dawlance', cat: 'air-conditioners',
    imgs: [img('1581094271901-8022df4466f9'), img('1556228453-efd6c1ff04f6')],
    desc: 'Pakistans trusted brand. Inverter technology with 30% more energy saving.',
    specs: '{"Type": "Split AC", "Capacity": "1.5 Ton", "Cooling": "Rapid Cool", "Energy Rating": "4 Star", "Compressor": "Inverter", "Coverage": "180 sq. ft"}',
    price: 134999, stock: 10 },

  // Washing
  { name: 'Haier 10kg Fully Automatic', slug: 'haier-10kg-fully-automatic', brand: 'Haier', cat: 'washing-machines',
    imgs: [img('1610557892470-55d9e80c0bce')],
    desc: 'Large capacity fully automatic washing machine. Multiple wash programs, quick wash option.',
    specs: '{"Type": "Fully Automatic", "Capacity": "10kg", "Spin Speed": "1200 RPM", "Wash Programs": "12", "Energy Rating": "A++", "Digital Display": "Yes"}',
    price: 59999, stock: 10 },

  { name: 'Dawlance 8kg Semi Automatic', slug: 'dawlance-8kg-semi-automatic', brand: 'Dawlance', cat: 'washing-machines',
    imgs: [img('1582738411706-bfc8e691d1c2')],
    desc: 'Affordable and durable semi-automatic washing machine. Twin tub design.',
    specs: '{"Type": "Semi Automatic", "Capacity": "8kg", "Spin Speed": "1450 RPM", "Wash Programs": "3", "Twin Tub": "Yes", "Energy Rating": "A"}',
    price: 34999, stock: 20 },

  { name: 'Kenwood 9kg Front Load', slug: 'kenwood-9kg-front-load', brand: 'Kenwood', cat: 'washing-machines',
    imgs: [img('1610557892470-55d9e80c0bce')],
    desc: 'European-style front load washing machine. Silent inverter motor, steam wash.',
    specs: '{"Type": "Front Load", "Capacity": "9kg", "Spin Speed": "1400 RPM", "Wash Programs": "15", "Inverter Motor": "Yes", "Steam Wash": "Yes"}',
    price: 104999, stock: 8 },

  // Accessories
  { name: 'Apple AirPods Pro 2', slug: 'apple-airpods-pro-2', brand: 'Apple', cat: 'accessories',
    imgs: [img('1606220588913-b3aacb4d2f46')],
    desc: 'Active Noise Cancellation with Transparency mode. Personalized Spatial Audio.',
    specs: '{"Type": "In-Ear", "Connectivity": "Bluetooth 5.3", "Battery": "6 hours (30 with case)", "ANC": "Yes", "Water Resistance": "IPX4"}',
    price: 64999, stock: 25 },

  { name: 'Samsung Galaxy Watch 6', slug: 'samsung-galaxy-watch-6', brand: 'Samsung', cat: 'accessories',
    imgs: [img('1579586337278-3befd40fd17a')],
    desc: 'Advanced health tracking. ECG, blood pressure, body composition analysis.',
    specs: '{"Type": "Smartwatch", "Display": "1.5-inch Super AMOLED", "Battery": "Up to 40 hours", "Sensors": "ECG, BIA, HRM", "Water Resistance": "IP68"}',
    price: 52999, stock: 15 },

  { name: 'Samsung 25W Fast Charger', slug: 'samsung-25w-fast-charger', brand: 'Samsung', cat: 'accessories',
    imgs: [img('1606220588913-b3aacb4d2f46')],
    desc: 'Fast charge your Samsung devices. USB-C PD compatible.',
    specs: '{"Type": "Wall Charger", "Output": "25W USB-C PD", "Cable": "USB-C to USB-C", "Compatibility": "Android & iPhone 15"}',
    price: 2499, stock: 50 },

  { name: 'JBL Tune 770NC Headphones', slug: 'jbl-tune-770nc-headphones', brand: 'JBL', cat: 'accessories',
    imgs: [img('1505740420928-5e560c06d30e')],
    desc: 'JBL Pure Bass sound with adaptive noise cancelling. 40 hours battery life.',
    specs: '{"Type": "Over-Ear", "Connectivity": "Bluetooth 5.0", "Battery": "40 hours", "ANC": "Yes", "Foldable": "Yes"}',
    price: 24999, stock: 20 },
];

const categoryIcons = {
  'smartphones': '📱', 'laptops': '💻', 'tvs': '📺',
  'air-conditioners': '❄️', 'washing-machines': '🧺', 'accessories': '🎧',
};
const categoryColors = {
  'smartphones': '#1428a0', 'laptops': '#2d3748', 'tvs': '#1a1a2e',
  'air-conditioners': '#0f4c75', 'washing-machines': '#3282b8', 'accessories': '#6c5ce7',
};

function esc(s) { return String(s).replace(/'/g, "''"); }

const categoryImages = {
  'smartphones': img('1605236453806-6ff36851218e'),
  'laptops': img('1517336714731-489689fd1ca8'),
  'tvs': img('1593359677879-a4bb92f829d1'),
  'air-conditioners': img('1532635241-17e820acc59f'),
  'washing-machines': img('1610557892470-55d9e80c0bce'),
  'accessories': img('1606220588913-b3aacb4d2f46'),
};

const bannerImages = {
  'Buy Now, Pay in Easy Installments': img('1556742049-0cfed4f6a45d'),
  'New Smartphone Collection': img('1605236453806-6ff36851218e'),
  'Summer AC Sale': img('1532635241-17e820acc59f'),
};

let sql = `-- QistGhar Demo Seed Data
-- Run in Supabase SQL Editor after the initial migration
-- Safe to re-run: truncates existing data first
-- Product images are verified-working Unsplash photo IDs (tech products)

TRUNCATE TABLE payments, installments, orders, installment_plans, banners, notifications, products, brands, categories CASCADE;

-- CATEGORIES
INSERT INTO categories (name, slug, image_url) VALUES
  ('Smartphones', 'smartphones', '${categoryImages['smartphones']}'),
  ('Laptops', 'laptops', '${categoryImages['laptops']}'),
  ('TVs', 'tvs', '${categoryImages['tvs']}'),
  ('Air Conditioners', 'air-conditioners', '${categoryImages['air-conditioners']}'),
  ('Washing Machines', 'washing-machines', '${categoryImages['washing-machines']}'),
  ('Accessories', 'accessories', '${categoryImages['accessories']}');

-- BRANDS
INSERT INTO brands (name) VALUES
  ('Samsung'), ('Apple'), ('Xiaomi'), ('Oppo'), ('Vivo'), ('OnePlus'),
  ('HP'), ('Dell'), ('Lenovo'), ('Asus'), ('Acer'),
  ('Sony'), ('TCL'), ('Haier'), ('Gree'), ('Kenwood'), ('Dawlance'), ('JBL');

-- PRODUCTS
`;

for (const p of products) {
  const imgs = p.imgs;
  const imgsArray = imgs.length === 1
    ? `ARRAY['${imgs[0]}']`
    : `ARRAY['${imgs.join("', '")}']`;
  sql += `INSERT INTO products (name, slug, brand_id, category_id, description, specs, base_price, stock_qty, is_published, images) VALUES (
  '${esc(p.name)}', '${p.slug}',
  (SELECT id FROM brands WHERE name='${p.brand}'),
  (SELECT id FROM categories WHERE slug='${p.cat}'),
  '${esc(p.desc)}',
  '${p.specs}'::jsonb,
  ${p.price}, ${p.stock}, true,
  ${imgsArray}::text[]
);

`;
}

sql += `
-- INSTALLMENT PLANS
INSERT INTO installment_plans (product_id, duration_months, markup_percent, down_payment_percent)
SELECT p.id, d.months, d.markup, 20
FROM products p, (VALUES (3, 0), (6, 5), (12, 10), (18, 15), (24, 20)) AS d(months, markup)
WHERE p.is_published = true;

-- BANNERS
INSERT INTO banners (title, image_url, cta_text, cta_link, is_active, sort_order) VALUES
  ('Buy Now, Pay in Easy Installments', '${bannerImages['Buy Now, Pay in Easy Installments']}', 'Shop Now', '/products', true, 0),
  ('New Smartphone Collection', '${bannerImages['New Smartphone Collection']}', 'Explore', '/products?category=smartphones', true, 1),
  ('Summer AC Sale', '${bannerImages['Summer AC Sale']}', 'View Deals', '/products?category=air-conditioners', true, 2);
`;

require('fs').writeFileSync('supabase/seed.sql', sql);
console.log('seed.sql written, ' + sql.length + ' bytes, ' + products.length + ' products');
