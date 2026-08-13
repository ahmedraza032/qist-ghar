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
      "id, name, slug, base_price, description, specs, images, stock_qty, category_id, brand:brands(id, name), category:categories(name, slug)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!raw) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = raw as any;

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
