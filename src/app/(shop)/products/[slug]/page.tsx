import { createPublicClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/shop/product-detail-client";

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw } = await supabase
    .from("products")
    .select(
      "id, name, slug, base_price, description, specs, images, stock_qty, category_id, markup_percent, down_payment_percent, tenure_pricing, has_variants, parent_product_id, variant_label, brand:brands(id, name), category:categories(name, slug)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!raw) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = raw as any;

  const [variantsRes, relatedRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, variant_label, base_price, stock_qty, images, tenure_pricing")
      .eq("parent_product_id", product.id)
      .eq("is_published", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, slug, base_price, images, tenure_pricing")
      .eq("is_published", true)
      .is("parent_product_id", null)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(4),
  ]);

  return (
    <ProductDetailClient
      product={product}
      variants={(variantsRes.data || []) as any[]}
      related={(relatedRes.data || []) as any[]}
    />
  );
}
