import { createServiceClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ parent?: string }>;
}) {
  const supabase = await createServiceClient();
  const { parent } = await searchParams;

  const [catRes, brandRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parentProduct: any = null;
  if (parent) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", parent)
      .single();
    parentProduct = data ?? null;
  }

  return (
    <ProductForm
      categories={catRes.data || []}
      brands={brandRes.data || []}
      product={null}
      parentProduct={parentProduct}
    />
  );
}
