import { createServiceClient } from "@/lib/supabase/server";
import { NewOrderForm } from "@/components/admin/new-order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const supabase = await createServiceClient();

  const [custRes, prodRes] = await Promise.all([
    supabase.from("customers").select("id, full_name, phone").order("full_name"),
    supabase
      .from("products")
      .select("id, name, base_price")
      .order("name"),
  ]);

  return (
    <NewOrderForm
      customers={(custRes.data || []) as any[]}
      products={(prodRes.data || []) as any[]}
    />
  );
}
