import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { ProductListingClient } from "@/components/shop/product-listing-client";

export const revalidate = 60;

export default async function ProductsPage() {
  const supabase = createPublicClient();

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, base_price, images, stock_qty, created_at, tenure_pricing, brand:brands(name), category:categories(name, slug)")
      .eq("is_published", true)
      .is("parent_product_id", null)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true }),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (productsRes.data || []) as any[];

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <ProductListingClient
        products={products}
        categories={categoriesRes.data || []}
        brands={brandsRes.data || []}
      />
    </Suspense>
  );
}
