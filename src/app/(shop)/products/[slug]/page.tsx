import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/shop/product-detail-client";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw } = await supabase
    .from("products")
    .select(
      "id, name, slug, base_price, description, specs, images, stock_qty, category_id, markup_percent, down_payment_percent, brand:brands(id, name), category:categories(name, slug)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!raw) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = raw as any;

  // Fetch variant attributes with options
  const { data: variantAttributes } = await supabase
    .from("product_variant_attributes")
    .select(`
      id,
      product_id,
      name,
      display_order,
      created_at,
      options:product_variant_options(id, attribute_id, value, display_order, created_at)
    `)
    .eq("product_id", product.id)
    .order("display_order");

  // Fetch variant combinations with options
  const { data: variantCombinations } = await supabase
    .from("product_variant_combinations")
    .select(`
      id,
      product_id,
      price_adjustment,
      absolute_price,
      stock_qty,
      is_active,
      created_at,
      combination_options:product_variant_combination_options(
        option_id,
        option:product_variant_options(id, attribute_id, value, display_order, created_at)
      )
    `)
    .eq("product_id", product.id)
    .eq("is_active", true);

  // Format combinations with their options
  const formattedCombinations = (variantCombinations || []).map((vc: any) => ({
    ...vc,
    options: vc.combination_options?.map((co: any) => co.option).filter(Boolean) || [],
  }));

  product.variant_attributes = variantAttributes || [];
  product.variant_combinations = formattedCombinations;

  const { data: related } = await supabase
    .from("products")
    .select("id, name, slug, base_price, images")
    .eq("is_published", true)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  return (
    <ProductDetailClient
      product={product}
      related={(related || []) as any[]}
    />
  );
}
