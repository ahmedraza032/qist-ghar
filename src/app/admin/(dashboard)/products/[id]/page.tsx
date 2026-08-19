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

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product || productError) {
    notFound();
  }

  const [catRes, brandRes, defaultVarsRes, attrsRes, combosRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("category_default_variant_attributes").select("*"),
    supabase
      .from("product_variant_attributes")
      .select("id, name, display_order, options:product_variant_options(id, value, display_order)")
      .eq("product_id", id)
      .order("display_order"),
    supabase
      .from("product_variant_combinations")
      .select("id, price_adjustment, absolute_price, stock_qty, combination_options:product_variant_combination_options(option_id)")
      .eq("product_id", id),
  ]);

  const productWithVariants = {
    ...product,
    variant_attributes: attrsRes.data || [],
    variant_combinations: combosRes.data || [],
  };

  return (
    <ProductForm
      categories={catRes.data || []}
      brands={brandRes.data || []}
      product={productWithVariants as any}
    />
  );
}
