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
}

export interface ProductResult {
  success: boolean;
  error?: string;
}

export async function createProduct(data: ProductInput): Promise<ProductResult> {
  const supabase = await createServiceClient();

  let images: string[] = [];
  let specs: Record<string, string> = {};
  try { images = JSON.parse(data.imagesJson || "[]"); } catch { /* keep default */ }
  try { specs = JSON.parse(data.specsJson || "{}"); } catch { /* keep default */ }

  const { error } = await supabase.from("products").insert({
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
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateProduct(id: string, data: ProductInput): Promise<ProductResult> {
  const supabase = await createServiceClient();

  let images: string[] = [];
  let specs: Record<string, string> = {};
  try { images = JSON.parse(data.imagesJson || "[]"); } catch { /* keep default */ }
  try { specs = JSON.parse(data.specsJson || "{}"); } catch { /* keep default */ }

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
  }).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
