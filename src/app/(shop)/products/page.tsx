import { createClient } from "@/lib/supabase/server";
import { ProductListingClient } from "@/components/shop/product-listing-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, base_price, images, stock_qty, created_at, brand:brands(name), category:categories(name, slug)")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (productsRes.data || []) as any[];

  return (
    <ProductListingClient
      products={products}
      categories={categoriesRes.data || []}
      brands={brandsRes.data || []}
    />
  );
}
