import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/admin/customer-form";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  return <CustomerForm customer={customer} />;
}
