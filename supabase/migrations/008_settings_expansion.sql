-- Migration: 008_settings_expansion.sql
-- Extends the settings table with new key/value rows for the expanded Settings page.
-- All inserts use ON CONFLICT DO NOTHING so existing data is never overwritten.

INSERT INTO settings (key, value) VALUES
  -- General
  ('business_hours',             'Mon–Sat, 10am–8pm'),
  ('social_facebook',            ''),
  ('social_instagram',           ''),
  ('social_tiktok',              ''),

  -- Payments
  ('bank_account_title',         ''),
  ('bank_name',                  ''),
  ('bank_iban',                  ''),
  ('jazzcash_number',            ''),
  ('easypaisa_number',           ''),
  ('default_down_payment_pct',   '20'),
  ('default_installment_durations', '3,6,9,12'),

  -- Reminders
  ('reminders_enabled',          'false'),
  ('reminder_days_before',       '3'),
  ('reminder_template',          'Dear {customer_name}, your installment of Rs {amount} is due on {due_date}. Please arrange payment. Thank you – QistGhar.'),

  -- Branding
  ('brand_primary_color',        '#205EA3'),
  ('brand_accent_color',         '#82B63F'),

  -- Page Content (new pages)
  ('page_faq',                   ''),
  ('page_shipping_policy',       ''),
  ('page_refund_policy',         ''),

  -- Delivery
  ('delivery_areas',             '[]'),
  ('delivery_flat_charge',       '0'),
  ('free_delivery_threshold',    '0')

ON CONFLICT (key) DO NOTHING;
