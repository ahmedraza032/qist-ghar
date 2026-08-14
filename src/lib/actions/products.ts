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
  variantsJson?: string;
}

export interface ProductResult {
  success: boolean;
  error?: string;
}

export async function createProduct(data: ProductInput): Promise<ProductResult> {
  const supabase = await createServiceClient();

  let images: string[] = [];
  let specs: Record<string, string> = {};
  let variants: any = { attributes: [], combinations: [] };
  try { images = JSON.parse(data.imagesJson || "[]"); } catch { /* keep default */ }
  try { specs = JSON.parse(data.specsJson || "{}"); } catch { /* keep default */ }
  try { variants = JSON.parse(data.variantsJson || "{}"); } catch { /* keep default */ }

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
  }).select("id").single();

  if (error || !product) {
    return { success: false, error: error?.message || "Failed to create" };
  }

  await syncVariants(supabase, product.id, variants);

  return { success: true };
}

export async function updateProduct(id: string, data: ProductInput): Promise<ProductResult> {
  const supabase = await createServiceClient();

  let images: string[] = [];
  let specs: Record<string, string> = {};
  let variants: any = { attributes: [], combinations: [] };
  try { images = JSON.parse(data.imagesJson || "[]"); } catch { /* keep default */ }
  try { specs = JSON.parse(data.specsJson || "{}"); } catch { /* keep default */ }
  try { variants = JSON.parse(data.variantsJson || "{}"); } catch { /* keep default */ }

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

  await syncVariants(supabase, id, variants);

  return { success: true };
}

async function syncVariants(supabase: any, productId: string, variants: any) {
  if (!variants || !variants.attributes) return;

  // For simplicity, we hard-delete attributes and combinations if this is an update, 
  // and insert fresh ones. This implies that orders should ideally snapshot the 
  // variant string rather than solely relying on the foreign key if strict historical 
  // integrity of deleted variants is required.
  await supabase.from("product_variant_attributes").delete().eq("product_id", productId);
  await supabase.from("product_variant_combinations").delete().eq("product_id", productId);

  if (variants.attributes.length === 0) return;

  // 1. Insert attributes and their options
  const optionMap = new Map<string, string>(); // value -> new option id

  for (let i = 0; i < variants.attributes.length; i++) {
    const attr = variants.attributes[i];
    const { data: dbAttr } = await supabase.from("product_variant_attributes").insert({
      product_id: productId,
      name: attr.name,
      display_order: i
    }).select("id").single();

    if (dbAttr && attr.options) {
      for (let j = 0; j < attr.options.length; j++) {
        const opt = attr.options[j];
        const { data: dbOpt } = await supabase.from("product_variant_options").insert({
          attribute_id: dbAttr.id,
          value: opt.value,
          display_order: j
        }).select("id").single();

        if (dbOpt) {
          optionMap.set(opt.value.toLowerCase(), dbOpt.id);
        }
      }
    }
  }

  // 2. Insert combinations
  if (variants.combinations && variants.combinations.length > 0) {
    for (const combo of variants.combinations) {
      // Find the option IDs for this combination's string values
      const comboOptionIds = combo.options
        .map((optVal: string) => optionMap.get(optVal.toLowerCase()))
        .filter(Boolean);

      if (comboOptionIds.length === combo.options.length) {
        const { data: dbCombo } = await supabase.from("product_variant_combinations").insert({
          product_id: productId,
          price_adjustment: combo.price_adjustment || 0,
          stock_qty: combo.stock_qty || 0,
        }).select("id").single();

        if (dbCombo) {
          // Link options
          const mappings = comboOptionIds.map((optId: string) => ({
            combination_id: dbCombo.id,
            option_id: optId,
          }));
          await supabase.from("product_variant_combination_options").insert(mappings);
        }
      }
    }
  }
}
