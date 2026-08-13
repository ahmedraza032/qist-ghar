export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
}

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  description: string | null;
  specs: Json;
  base_price: number;
  stock_qty: number;
  markup_percent: number;
  down_payment_percent: number;
  is_published: boolean;
  images: string[];
  created_at: string;
  brand?: Brand | null;
  category?: Category | null;
  installment_plans?: InstallmentPlan[];
}

export type SupabaseProduct = Omit<Product, "brand" | "category"> & {
  brand: { id: string; name: string } | null;
  category: { name: string; slug: string } | null;
};

export interface InstallmentPlan {
  id: string;
  product_id: string;
  duration_months: number;
  markup_percent: number;
  down_payment_percent: number;
}

export type OrderStatus = "active" | "completed";

export interface Order {
  id: string;
  customer_id: string;
  product_id: string;
  plan_id: string;
  status: OrderStatus;
  down_payment_amount: number;
  monthly_amount: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
  product?: Product;
  installment_plan?: InstallmentPlan;
  installments?: Installment[];
  payments?: Payment[];
  customer?: Customer;
}

export type InstallmentStatus = "pending" | "paid" | "overdue";

export interface Installment {
  id: string;
  order_id: string;
  due_date: string;
  amount: number;
  paid_date: string | null;
  status: InstallmentStatus;
}

export interface Payment {
  id: string;
  order_id: string;
  installment_id: string | null;
  amount: number;
  method: string;
  reference_no: string;
  paid_at: string;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  sort_order: number;
}
