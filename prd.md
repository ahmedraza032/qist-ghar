# QistGhar — Product Requirements Document (MVP Demo / Prototype)

**Version:** 1.0  
**Date:** August 2026  
**Prepared for:** Client Demo & Prototype Review  
**Status:** Pre-Development

---

## 1. Executive Summary

QistGhar ("Installment Home") is a local Pakistani e-commerce platform enabling customers to purchase phones and electronic appliances through structured installment plans. Payments are processed via JazzCash, Easypaisa, Bank Transfer, and Credit/Debit Card.

This document defines the scope, features, and design direction for the **MVP Demo Prototype** — a fully functional-looking but non-production application built for client presentation and feedback. All payment flows in the demo will be **simulated/mocked** with no real money movement.

---

## 2. Goals of the MVP Demo

- Give the client a realistic, interactive preview of the final product
- Validate the user journey: Browse → Select Plan → Checkout → Confirmation
- Showcase the Admin Panel's core capabilities
- Gather client feedback before full development begins
- Demonstrate mobile responsiveness and UI quality

### Out of Scope for Demo
- Real payment gateway integration (JazzCash API, Easypaisa API)
- Real user authentication with OTP/SMS
- Production database with live inventory
- Email/SMS notification delivery
- Legal documents (Terms of Service, Privacy Policy — placeholders only)

---

## 3. Tech Stack Decision

### Supabase vs Firebase

**Recommendation: Supabase**

| Factor | Supabase | Firebase |
|---|---|---|
| Image/File Storage | Built-in (S3-compatible) | Firebase Storage (separate but integrated) |
| Database | PostgreSQL (structured, great for installment logic) | Firestore (NoSQL, less ideal for relational finance data) |
| Auth | Built-in, supports magic link + phone | Built-in, strong phone auth |
| Admin queries | SQL — easy reporting & finance queries | Requires custom aggregation |
| Self-hosting option | Yes | No |
| Cost | More generous free tier | Storage can get costly |
| Next.js integration | Excellent (official SDK) | Excellent |

**Verdict:** Supabase wins for this use case. Installment plans, payment records, and financial reports are inherently relational. PostgreSQL will let you write straightforward SQL queries for revenue reports and installment tracking. Supabase Storage handles product images in the same dashboard, removing the need for any third-party image host.

### Full Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes / Server Actions |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## 4. JazzCash Business Account — Usage Notes

The client's existing JazzCash Business Account is highly relevant and will be used in production as follows:

- **JazzCash Merchant API** allows direct payment collection from JazzCash wallets and Debit/Credit Cards via their payment gateway
- It supports both **redirect** (hosted page) and **in-page** checkout flows
- For the demo, the JazzCash flow will be **mocked**: a simulated screen that mimics JazzCash's UI, shows a "Payment Successful" confirmation, and redirects back to the order confirmation page
- In production, the existing Business Account credentials (Merchant ID, Password, Integrity Salt) would be used to initialize the real API

---

## 5. User Roles

### 5.1 Customer (Public User)
- Browse products without an account
- Must register/login to place an order
- Can view their order history and installment schedule

### 5.2 Admin
- Full access to the Admin Panel
- Manages products, orders, installment plans, and content
- Views financial reports and revenue dashboards

---

## 6. Customer-Facing Features (MVP Demo)

### 6.1 Homepage
- **Hero Banner** with promotional slider (e.g., "Buy Now, Pay in Easy Installments")
- **Featured Categories**: Smartphones, Laptops, TVs, Home Appliances, Accessories
- **Featured Products** grid with installment price prominently shown (e.g., "From PKR 2,999/month")
- **How It Works** section: 3-step visual (Browse → Choose Plan → Pay Monthly)
- **Trust Badges**: Secure Payments, 0% Hidden Fees, Easy Returns (demo copy)
- **Footer**: Links, contact info, payment method logos (JazzCash, Easypaisa, Visa, Mastercard)

### 6.2 Product Listing Page
- Grid/list view toggle
- Filters: Category, Brand, Price Range, Installment Duration (3/6/12/18/24 months)
- Sort: Price (Low–High), Newest, Most Popular
- Product card shows: Image, Name, Original Price, Monthly Installment Price, "Buy on Installments" CTA

### 6.3 Product Detail Page
- High-quality image gallery (main image + thumbnails)
- Product name, brand, SKU
- Full price vs. installment breakdown table:
  - 3 months: PKR X/month (Total: PKR Y)
  - 6 months: PKR X/month (Total: PKR Y)
  - 12 months: PKR X/month (Total: PKR Y)
  - etc.
- Installment plan selector (interactive, updates summary dynamically)
- Down payment amount shown clearly
- Specifications tab, Description tab
- Stock availability badge
- "Add to Cart" / "Apply for Installment" CTA button
- Related products section

### 6.4 Installment Plan Logic (Demo)

Each product will have a base price. The demo will use a simple markup model:

| Duration | Interest/Markup |
|---|---|
| 3 months | 0% (full price ÷ 3) |
| 6 months | 5% |
| 12 months | 10% |
| 18 months | 15% |
| 24 months | 20% |

Down payment: 20% of product price (configurable per product in admin).

Monthly installment = (Total Price after markup − Down Payment) ÷ Duration

This logic is visible and interactive on the product page.

### 6.5 User Authentication
- Register with Name, Phone Number, Email, Password
- Login with Email + Password
- "Forgot Password" flow (mock email in demo)
- Session persists via Supabase Auth JWT

### 6.6 Cart & Order Flow
- Cart shows selected product + chosen installment plan summary
- Customer fills Delivery Information (Name, Address, City, Phone)
- Payment Method Selection:
  - JazzCash (mocked)
  - Easypaisa (mocked)
  - Bank Transfer (shows mock account details)
  - Credit/Debit Card (mocked Stripe-style card form)
- Order Review screen before confirmation
- **Simulated Payment Screen**: Branded mock UI for the chosen payment method, "Processing..." animation, then success
- **Order Confirmation Page**: Order ID, product summary, installment schedule table, "Download Receipt" (PDF mock)

### 6.7 Customer Dashboard (My Account)
- **My Orders**: List of all orders with status badges (Pending, Active, Completed, Overdue)
- **Installment Schedule**: Per-order, shows each installment with due date, amount, and payment status
- **Profile Settings**: Update name, phone, address, password
- **Payment History**: Log of all payments made

### 6.8 Notifications (Demo — Visual Only)
- In-app notification bell with mock notifications (installment due, order confirmed)
- No real SMS/email in demo

---

## 7. Admin Panel Features (MVP Demo)

Accessible at `/admin`. Protected by a separate admin login.

### 7.1 Dashboard Overview
- Total Revenue (this month / all time)
- Active Installment Customers
- Pending Orders
- Overdue Installments
- Revenue chart (monthly bar chart — mock data)
- Recent Orders table

### 7.2 Product Management
- Add / Edit / Delete products
- Fields: Name, Brand, Category, Description, Specifications (key-value), Images (upload to Supabase Storage), Base Price, Stock Quantity
- Set available installment durations per product
- Toggle product visibility (Published / Draft)
- Bulk actions (delete, publish)

### 7.3 Category & Brand Management
- Add/edit/delete categories and brands
- Assign category image/icon

### 7.4 Order Management
- View all orders with filters (status, date range, payment method)
- Order detail view: customer info, product, installment plan, payment history
- Update order status: Pending → Approved → Active → Completed / Rejected
- Manual mark installment as paid (for cash/bank transfer cases)

### 7.5 Installment Management
- View all active installment schedules across all customers
- Filter by: Overdue, Due This Month, Paid
- Manually mark individual installments as paid
- Send reminder (mock button — no real SMS in demo)

### 7.6 Customer Management
- List of all registered customers
- Customer profile: personal info, order history, total amount paid, outstanding balance
- Ability to flag / suspend customers (demo)

### 7.7 Finance & Revenue Reports
- Total collected revenue by time period
- Outstanding receivables (sum of all pending installments)
- Revenue breakdown by category / product
- Overdue installments report
- Payment method breakdown (how much via JazzCash vs card etc.)
- Export to CSV (mock in demo — generates a sample file)

### 7.8 Banner / Content Management
- Add/edit/remove homepage hero banners
- Upload banner images to Supabase Storage
- Set banner CTA link and text

### 7.9 Admin Settings
- Business information (name, contact, address)
- Installment markup rates (editable per duration tier)
- Default down payment percentage
- Payment method enable/disable toggles

---

## 8. Database Schema (Supabase / PostgreSQL — Demo)

### Tables

**users** — managed by Supabase Auth + profile extension  
**profiles** (id, full_name, phone, address, city, created_at)  
**categories** (id, name, slug, image_url, parent_id)  
**brands** (id, name, logo_url)  
**products** (id, name, slug, brand_id, category_id, description, specs JSONB, base_price, stock_qty, is_published, images TEXT[], created_at)  
**installment_plans** (id, product_id, duration_months, markup_percent, down_payment_percent)  
**orders** (id, user_id, product_id, plan_id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at)  
**installments** (id, order_id, due_date, amount, paid_date, status [pending/paid/overdue])  
**payments** (id, order_id, installment_id, amount, method, reference_no, paid_at)  
**banners** (id, title, image_url, cta_text, cta_link, is_active, sort_order)  
**notifications** (id, user_id, message, is_read, created_at)

---

## 9. Simulated Payment Flows (Demo)

### JazzCash Mock Flow
1. Customer clicks "Pay via JazzCash"
2. Page shows a JazzCash-branded modal with mobile number field
3. Mock "OTP sent" screen
4. Enter any 4-digit code → "Verifying..."
5. Success animation → redirect to confirmation

### Easypaisa Mock Flow
- Same pattern with Easypaisa branding

### Bank Transfer Mock Flow
- Display static mock bank details (Bank: Habib Bank, Account: XXXX-XXXX)
- Customer clicks "I've transferred the amount"
- Order is placed with status "Pending Verification"

### Card Mock Flow
- Card form with card number, expiry, CVV fields
- On submit: loading spinner for 2s → success redirect
- No real processing, no card data stored

---

## 10. Mobile Responsiveness Requirements

- All pages must be fully functional on 320px–428px (mobile) widths
- Bottom navigation bar on mobile for: Home, Categories, Cart, Account
- Touch-friendly tap targets (min 44×44px)
- Product images optimized with Next.js Image component
- Sticky "Buy on Installments" CTA on mobile product page (fixed bottom bar)
- Admin panel: collapsible sidebar on mobile, card-based tables

---

## 11. Performance & UX Requirements (Demo)

- Page loads should feel fast — use Next.js static generation where possible
- Skeleton loaders on product listings (no blank screens)
- Toast notifications for actions (added to cart, order placed, etc.)
- Form validations with inline error messages
- Empty states for all list views (no products, no orders, etc.)
- 404 page with navigation

---

## 12. Demo Data / Seeding Plan

For the client presentation, the demo database will be seeded with:
- 5–6 product categories (Smartphones, Laptops, TVs, ACs, Washing Machines, Accessories)
- 4–5 brands per category
- 20–30 sample products with realistic Pakistani pricing
- 2–3 sample customer accounts with existing orders and installment schedules
- Mock financial data for admin dashboard charts

---

## 13. Pages & Routes Summary

### Customer Pages
| Route | Page |
|---|---|
| `/` | Homepage |
| `/products` | Product Listing |
| `/products/[slug]` | Product Detail |
| `/cart` | Cart |
| `/checkout` | Checkout (address + payment) |
| `/checkout/payment` | Payment Method (mock) |
| `/checkout/success` | Order Confirmation |
| `/account` | Customer Dashboard |
| `/account/orders` | My Orders |
| `/account/orders/[id]` | Order Detail + Installment Schedule |
| `/account/profile` | Profile Settings |
| `/login` | Login |
| `/register` | Register |

### Admin Pages
| Route | Page |
|---|---|
| `/admin` | Dashboard |
| `/admin/products` | Product List |
| `/admin/products/new` | Add Product |
| `/admin/products/[id]` | Edit Product |
| `/admin/orders` | Order Management |
| `/admin/orders/[id]` | Order Detail |
| `/admin/installments` | Installment Tracker |
| `/admin/customers` | Customer List |
| `/admin/customers/[id]` | Customer Profile |
| `/admin/finance` | Finance & Revenue |
| `/admin/banners` | Banner Management |
| `/admin/settings` | Admin Settings |

---

## 14. Milestones (Suggested)

| Phase | Scope | Estimated Duration |
|---|---|---|
| Phase 1 | Project setup, DB schema, Auth, Layout shells | 3–4 days |
| Phase 2 | Product listing, detail page, installment calculator | 3–4 days |
| Phase 3 | Cart, Checkout, Mock payment flows, Confirmation | 3–4 days |
| Phase 4 | Customer dashboard, order tracking | 2–3 days |
| Phase 5 | Admin panel (products, orders, installments) | 4–5 days |
| Phase 6 | Admin finance dashboard, reports | 2–3 days |
| Phase 7 | Seed data, polish, mobile QA, demo prep | 2–3 days |
| **Total** | | **~3–4 weeks** |

---

## 15. Success Criteria for Demo

- [ ] Client can browse products and see installment options
- [ ] Client can complete a mock checkout end-to-end
- [ ] Admin can add a product with images and see it on the storefront
- [ ] Admin dashboard shows revenue and installment data
- [ ] Site is fully usable on a mobile phone
- [ ] UI feels polished and professional — not like a template