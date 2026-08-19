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

  // Find all orders for this customer
  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_id", id);

  const orderIds = (orders || []).map((o: any) => o.id);

  if (orderIds.length > 0) {
    // Delete payments for these orders
    await supabase.from("payments").delete().in("order_id", orderIds);
    // Delete installments for these orders
    await supabase.from("installments").delete().in("order_id", orderIds);
    // Delete orders
    const { error: orderError } = await supabase.from("orders").delete().eq("customer_id", id);
    if (orderError) {
      return { success: false, error: orderError.message };
    }
  }

  // Delete customer record
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
