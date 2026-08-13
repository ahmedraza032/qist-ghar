// generate-image-urls.js
// Generates base64 SVG data URIs for each product

const products = [
  { name: 'iPhone 15 Pro Max', brand: 'Apple', sub: '256GB · Titanium' },
  { name: 'Galaxy S24 Ultra', brand: 'Samsung', sub: '256GB · S Pen' },
  { name: 'iPhone 15', brand: 'Apple', sub: '128GB · Dynamic Island' },
  { name: 'Galaxy A54 5G', brand: 'Samsung', sub: '128GB · 5G Ready' },
  { name: 'Redmi Note 13 Pro+', brand: 'Xiaomi', sub: '200MP · 120W' },
  { name: 'OnePlus 12', brand: 'OnePlus', sub: '16GB · Hasselblad' },
  { name: 'Oppo Reno 11 Pro', brand: 'Oppo', sub: '50MP Portrait' },
  { name: 'MacBook Air M3', brand: 'Apple', sub: '15.3" · M3 Chip' },
  { name: 'Dell Inspiron 15', brand: 'Dell', sub: 'i5 · 512GB SSD' },
  { name: 'HP Pavilion 15', brand: 'HP', sub: 'i7 · 16GB RAM' },
  { name: 'ThinkPad E14', brand: 'Lenovo', sub: 'Ryzen 5 · Business' },
  { name: 'Asus VivoBook 15', brand: 'Asus', sub: 'i3 · 256GB SSD' },
  { name: 'Samsung 55" 4K UHD', brand: 'Samsung', sub: 'Crystal UHD · Smart TV' },
  { name: 'Sony Bravia 65" OLED', brand: 'Sony', sub: '4K OLED · 120Hz' },
  { name: 'TCL 43" 4K Android', brand: 'TCL', sub: 'Android TV · Dolby' },
  { name: 'Haier 32" HD LED', brand: 'Haier', sub: 'HD Ready · HDMI' },
  { name: 'Gree 1.5 Ton AC', brand: 'Gree', sub: 'DC Inverter · 5 Star' },
  { name: 'Haier 1 Ton AC', brand: 'Haier', sub: 'DC Inverter · 4 Star' },
  { name: 'Dawlance 1.5 Ton AC', brand: 'Dawlance', sub: 'Inverter · 4 Star' },
  { name: 'Haier 10kg Washer', brand: 'Haier', sub: 'Fully Automatic' },
  { name: 'Dawlance 8kg Washer', brand: 'Dawlance', sub: 'Semi Automatic' },
  { name: 'Kenwood 9kg Front Load', brand: 'Kenwood', sub: 'Steam Wash' },
  { name: 'AirPods Pro 2', brand: 'Apple', sub: 'ANC · USB-C' },
  { name: 'Galaxy Watch 6', brand: 'Samsung', sub: 'Health · AMOLED' },
  { name: 'Samsung 25W Charger', brand: 'Samsung', sub: 'USB-C PD' },
  { name: 'JBL Tune 770NC', brand: 'JBL', sub: 'ANC · 40hr Battery' },
];

const brandColors = {
  'Apple': { bg: '#1a1a1a', fg: '#ffffff' },
  'Samsung': { bg: '#1428a0', fg: '#ffffff' },
  'Xiaomi': { bg: '#ff6900', fg: '#ffffff' },
  'Oppo': { bg: '#1ba784', fg: '#ffffff' },
  'OnePlus': { bg: '#eb0028', fg: '#ffffff' },
  'HP': { bg: '#0096d6', fg: '#ffffff' },
  'Dell': { bg: '#007db8', fg: '#ffffff' },
  'Lenovo': { bg: '#e2231a', fg: '#ffffff' },
  'Asus': { bg: '#00539b', fg: '#ffffff' },
  'Sony': { bg: '#1a1a1a', fg: '#ffffff' },
  'TCL': { bg: '#d40d1c', fg: '#ffffff' },
  'Haier': { bg: '#005baa', fg: '#ffffff' },
  'Dawlance': { bg: '#0d4d8c', fg: '#ffffff' },
  'Gree': { bg: '#0066b3', fg: '#ffffff' },
  'Kenwood': { bg: '#e32636', fg: '#ffffff' },
  'JBL': { bg: '#ef2b2c', fg: '#ffffff' },
};

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function generateSvg(name, brand, sub, w = 800, h = 800) {
  const colors = brandColors[brand] || { bg: '#1a1a1a', fg: '#ffffff' };
  const safeName = escapeXml(name);
  const safeSub = escapeXml(sub);
  const safeBrand = escapeXml(brand);

  // Pick emoji icon based on category keywords in name
  let icon = '⚡';
  const ln = name.toLowerCase();
  if (ln.includes('iphone') || ln.includes('galaxy') || ln.includes('redmi') || ln.includes('oneplus') || ln.includes('oppo')) icon = '📱';
  else if (ln.includes('macbook') || ln.includes('inspiron') || ln.includes('pavilion') || ln.includes('thinkpad') || ln.includes('vivobook')) icon = '💻';
  else if (ln.includes('tv') || ln.includes('bravia') || ln.includes('uhd') || ln.includes('oled') || ln.includes('led')) icon = '📺';
  else if (ln.includes('ac') || ln.includes('ton')) icon = '❄️';
  else if (ln.includes('washer') || ln.includes('washing')) icon = '🧺';
  else if (ln.includes('airpods')) icon = '🎧';
  else if (ln.includes('watch')) icon = '⌚';
  else if (ln.includes('charger')) icon = '🔌';
  else if (ln.includes('jbl') || ln.includes('headphone')) icon = '🎧';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bg}"/>
      <stop offset="100%" stop-color="${colors.bg}" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="0" y="0" width="100%" height="100%" fill="${colors.bg}" opacity="0.85"/>
  <text x="50%" y="35%" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="120" text-anchor="middle" fill="${colors.fg}">${icon}</text>
  <text x="50%" y="58%" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="48" font-weight="700" text-anchor="middle" fill="${colors.fg}">${safeBrand}</text>
  <text x="50%" y="72%" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="32" font-weight="600" text-anchor="middle" fill="${colors.fg}">${safeName}</text>
  <text x="50%" y="82%" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="22" text-anchor="middle" fill="${colors.fg}" opacity="0.85">${safeSub}</text>
</svg>`;
  return svg;
}

const urls = {};
for (const p of products) {
  urls[p.name] = `data:image/svg+xml;base64,${Buffer.from(generateSvg(p.name, p.brand, p.sub)).toString('base64')}`;
  urls[p.name + ' back'] = `data:image/svg+xml;base64,${Buffer.from(generateSvg(p.name + ' (Back)', p.brand, p.sub)).toString('base64')}`;
}

// Print as JS for the seed
console.log(JSON.stringify(urls, null, 2));
