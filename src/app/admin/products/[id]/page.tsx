import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      variant_attributes:product_variant_attributes(
        id, name, display_order,
        options:product_variant_options(id, value, display_order)
      ),
      variant_combinations:product_variant_combinations(
        id, sku, price_adjustment, absolute_price, stock_qty,
        combination_options:product_variant_combination_options(variant_option_id)
      )
    `)
    .eq("id", id)
    .single();

  if (!product) notFound();

  const [catRes, brandRes, defaultVarsRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("category_default_variant_attributes").select("*"),
  ]);

  return (
    <ProductForm
      categories={catRes.data || []}
      brands={brandRes.data || []}
      product={product as any}
      defaultVariants={defaultVarsRes.data || []}
    />
  );
}
