"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface ProductInput {
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  description: string;
  base_price: number;
  stock_qty: number;
  markup_percent: number;
  down_payment_percent: number;
  is_published: boolean;
  imagesJson: string;
  specsJson: string;
  tenurePricingJson?: string;
  has_variants?: boolean;
  parent_product_id?: string | null;
  variant_label?: string | null;
}

export interface ProductResult {
  success: boolean;
  error?: string;
}

export async function createProduct(data: ProductInput): Promise<ProductResult> {
  const supabase = await createServiceClient();

  let images: string[] = [];
  let specs: Record<string, string> = {};
  let tenurePricing: any = null;
  try { images = JSON.parse(data.imagesJson || "[]"); } catch { /* keep default */ }
  try { specs = JSON.parse(data.specsJson || "{}"); } catch { /* keep default */ }
  try { tenurePricing = JSON.parse(data.tenurePricingJson || "null"); } catch { /* keep null */ }

  const { data: product, error } = await supabase.from("products").insert({
    name: data.name,
    slug: data.slug,
    brand_id: data.brand_id,
    category_id: data.category_id,
    description: data.description || null,
    base_price: data.base_price,
    stock_qty: data.stock_qty,
    markup_percent: data.markup_percent,
    down_payment_percent: data.down_payment_percent,
    is_published: data.is_published,
    images,
    specs,
    tenure_pricing: tenurePricing,
    has_variants: data.has_variants ?? false,
    parent_product_id: data.parent_product_id ?? null,
    variant_label: data.variant_label || null,
  }).select("id").single();

  if (error || !product) {
    return { success: false, error: error?.message || "Failed to create" };
  }

  return { success: true };
}

export async function updateProduct(id: string, data: ProductInput): Promise<ProductResult> {
  const supabase = await createServiceClient();

  let images: string[] = [];
  let specs: Record<string, string> = {};
  let tenurePricing: any = null;
  try { images = JSON.parse(data.imagesJson || "[]"); } catch { /* keep default */ }
  try { specs = JSON.parse(data.specsJson || "{}"); } catch { /* keep default */ }
  try { tenurePricing = JSON.parse(data.tenurePricingJson || "null"); } catch { /* keep null */ }

  const { error } = await supabase.from("products").update({
    name: data.name,
    slug: data.slug,
    brand_id: data.brand_id,
    category_id: data.category_id,
    description: data.description || null,
    base_price: data.base_price,
    stock_qty: data.stock_qty,
    markup_percent: data.markup_percent,
    down_payment_percent: data.down_payment_percent,
    is_published: data.is_published,
    images,
    specs,
    tenure_pricing: tenurePricing,
    has_variants: data.has_variants ?? false,
    parent_product_id: data.parent_product_id ?? null,
    variant_label: data.variant_label || null,
  }).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteProduct(id: string): Promise<ProductResult> {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
