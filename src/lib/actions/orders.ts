"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface CreateOrderInput {
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  productId: string;
  durationMonths: number;
  downPaymentAmount: number;
  monthlyAmount: number;
  totalAmount: number;
  paymentMethod: string;
  startDate: string;
  variantCombinationId?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const supabase = await createServiceClient();

  // Resolve (or create) the customer
  let customerId = input.customerId || null;

  if (!customerId) {
    const phone = (input.customerPhone || "").trim();
    if (!phone) {
      return { success: false, error: "A phone number is required to create a customer." };
    }

    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: created, error: createErr } = await supabase
        .from("customers")
        .insert({
          full_name: input.customerName?.trim() || phone,
          phone,
          address: input.customerAddress || null,
          city: input.customerCity || null,
        })
        .select("id")
        .single();

      if (createErr || !created) {
        return { success: false, error: "Failed to create customer: " + (createErr?.message || "unknown") };
      }
      customerId = created.id;
    }
  }

  // Find or create the installment plan for this product + duration
  let { data: plan } = await supabase
    .from("installment_plans")
    .select("id")
    .eq("product_id", input.productId)
    .eq("duration_months", input.durationMonths)
    .maybeSingle();

  if (!plan) {
    const { data: newPlan, error: planErr } = await supabase
      .from("installment_plans")
      .insert({
        product_id: input.productId,
        duration_months: input.durationMonths,
        markup_percent: 0,
        down_payment_percent: 25,
      })
      .select("id")
      .single();

    if (planErr || !newPlan) {
      return { success: false, error: "Failed to create plan: " + (planErr?.message || "unknown") };
    }
    plan = newPlan;
  }

  // Create the order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      product_id: input.productId,
      plan_id: plan.id,
      status: "active",
      down_payment_amount: input.downPaymentAmount,
      monthly_amount: input.monthlyAmount,
      total_amount: input.totalAmount,
      payment_method: input.paymentMethod,
      variant_combination_id: input.variantCombinationId || null,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return { success: false, error: "Failed to create order: " + (orderErr?.message || "unknown") };
  }

  // Generate installments from the start date
  const start = new Date(input.startDate);
  const installments = [];
  for (let i = 1; i <= input.durationMonths; i++) {
    const due = new Date(start);
    due.setMonth(due.getMonth() + i);
    installments.push({
      order_id: order.id,
      due_date: due.toISOString().split("T")[0],
      amount: input.monthlyAmount,
      status: "pending" as const,
    });
  }

  const { error: instErr } = await supabase.from("installments").insert(installments);
  if (instErr) {
    return { success: false, error: "Failed to create installments: " + instErr.message };
  }

  // Record the down payment (if any)
  if (input.downPaymentAmount > 0) {
    await supabase.from("payments").insert({
      order_id: order.id,
      amount: input.downPaymentAmount,
      method: input.paymentMethod,
      reference_no: `DP-${order.id.slice(0, 8)}`,
      paid_at: new Date().toISOString(),
    });
  }

  return { success: true, orderId: order.id };
}
