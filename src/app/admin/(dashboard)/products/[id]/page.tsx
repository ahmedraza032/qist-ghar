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
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const [catRes, brandRes, variantsRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase
      .from("products")
      .select("id, name, variant_label, base_price")
      .eq("parent_product_id", id)
      .order("created_at", { ascending: true }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = product as any;
  const variants = variantsRes.data || [];

  return (
    <ProductForm
      categories={catRes.data || []}
      brands={brandRes.data || []}
      product={p}
      variants={variants}
    />
  );
}
