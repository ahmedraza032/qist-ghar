"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { InstallmentBreakdown } from "@/lib/helpers/installments";

export interface PlaceOrderInput {
  userId: string;
  productId: string;
  planId: string;
  durationMonths: number;
  downPaymentAmount: number;
  monthlyAmount: number;
  totalAmount: number;
  paymentMethod: string;
}

export async function placeOrder(input: PlaceOrderInput) {
  const supabase = await createServiceClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      product_id: input.productId,
      plan_id: input.planId,
      status: "active",
      down_payment_amount: input.downPaymentAmount,
      monthly_amount: input.monthlyAmount,
      total_amount: input.totalAmount,
      payment_method: input.paymentMethod,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    throw new Error(orderErr?.message || "Failed to create order");
  }

  // Generate installment schedule
  const now = new Date();
  const installments = [];
  for (let i = 1; i <= input.durationMonths; i++) {
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + i);
    installments.push({
      order_id: order.id,
      due_date: dueDate.toISOString().split("T")[0],
      amount: input.monthlyAmount,
      status: "pending" as const,
      paid_date: null,
    });
  }

  const { error: instErr } = await supabase
    .from("installments")
    .insert(installments);

  if (instErr) throw new Error(instErr.message);

  // Record first payment (down payment)
  await supabase.from("payments").insert({
    order_id: order.id,
    amount: input.downPaymentAmount,
    method: input.paymentMethod,
    reference_no: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    paid_at: new Date().toISOString(),
  });

  // Create notification for the user
  await supabase.from("notifications").insert({
    user_id: input.userId,
    message: `Your order has been placed. Order #${order.id.slice(0, 8)}`,
  });

  return order.id;
}
