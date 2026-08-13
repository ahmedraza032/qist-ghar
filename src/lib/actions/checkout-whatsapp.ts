"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface CheckoutWhatsAppInput {
  productId: string;
  duration: number;
  downPayment: number;
  monthly: number;
  total: number;
  name: string;
  phone: string;
  address: string;
  city: string;
}

export async function checkoutWithWhatsApp(input: CheckoutWhatsAppInput) {
  const { productId, duration, downPayment, monthly, total, name, phone, address, city } = input;

  const supabaseAuth = await createClient();
  const { data: authData, error: userErr } = await supabaseAuth.auth.getUser();
  
  if (userErr || !authData.user) {
    throw new Error(userErr?.message || "Not authenticated");
  }
  
  const userId = authData.user.id;
  const supabase = await createServiceClient();

  // 1. Update or Create Profile with delivery info
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    await supabase
      .from("profiles")
      .update({
        full_name: name,
        phone: phone,
        address: address,
        city: city,
      })
      .eq("id", userId);
  } else {
    await supabase.from("profiles").insert({
      id: userId,
      full_name: name,
      phone: phone,
      address: address,
      city: city,
    });
  }

  // 2. Find or Create Installment Plan
  let { data: plan } = await supabase
    .from("installment_plans")
    .select("id")
    .eq("product_id", productId)
    .eq("duration_months", duration)
    .maybeSingle();

  if (!plan) {
    const { data: newPlan, error: createPlanErr } = await supabase
      .from("installment_plans")
      .insert({
        product_id: productId,
        duration_months: duration,
        markup_percent: 0,
        down_payment_percent: 25, // default min
      })
      .select("id")
      .single();

    if (createPlanErr) {
      throw new Error("Failed to create plan: " + createPlanErr.message);
    }
    plan = newPlan;
  }

  if (!plan) {
    throw new Error("No installment plan found");
  }

  // 3. Create Order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      product_id: productId,
      plan_id: plan.id,
      status: "active",
      down_payment_amount: downPayment,
      monthly_amount: monthly,
      total_amount: total,
      payment_method: "whatsapp",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    throw new Error("Order error: " + (orderErr?.message || "unknown"));
  }

  // 4. Generate future installments
  const now = new Date();
  const installments = [];
  for (let i = 1; i <= duration; i++) {
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + i);
    installments.push({
      order_id: order.id,
      due_date: dueDate.toISOString().split("T")[0],
      amount: monthly,
      status: "pending" as const,
    });
  }
  
  const { error: instErr } = await supabase.from("installments").insert(installments);
  if (instErr) {
    throw new Error("Installments error: " + instErr.message);
  }

  // 5. Create Notification
  await supabase.from("notifications").insert({
    user_id: userId,
    message: `Your order has been placed via WhatsApp. Order #${order.id.slice(0, 8)}`,
  });

  return { orderId: order.id };
}
