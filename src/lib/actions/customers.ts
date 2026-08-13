"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface CustomerInput {
  full_name: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface CustomerResult {
  success: boolean;
  error?: string;
}

export async function createCustomer(data: CustomerInput): Promise<CustomerResult> {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("customers").insert({
    full_name: data.full_name,
    phone: data.phone,
    address: data.address || null,
    city: data.city || null,
    notes: data.notes || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateCustomer(id: string, data: CustomerInput): Promise<CustomerResult> {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("customers").update({
    full_name: data.full_name,
    phone: data.phone,
    address: data.address || null,
    city: data.city || null,
    notes: data.notes || null,
  }).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteCustomer(id: string): Promise<CustomerResult> {
  const supabase = await createServiceClient();

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", id);

  if ((count || 0) > 0) {
    return { success: false, error: "Cannot delete a customer with existing orders." };
  }

  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
