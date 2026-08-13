import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, duration, down_payment, monthly, total, payment_method } = body;

    const supabaseAuth = await createClient();
    const { data: authData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !authData.user) {
      return NextResponse.json(
        { error: userErr?.message || "Not authenticated" },
        { status: 401 }
      );
    }
    const userId = authData.user.id;

    if (!product_id || duration == null || down_payment == null || monthly == null || total == null) {
      return NextResponse.json(
        { error: "Missing order details" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Ensure profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: userId,
        full_name: authData.user.email || "",
        phone: null,
        address: null,
        city: null,
      });
      if (profileErr) {
        return NextResponse.json({ error: "Failed to create profile: " + profileErr.message }, { status: 500 });
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const refNo = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Find plan
    let { data: plan, error: planErr } = await supabase
      .from("installment_plans")
      .select("id")
      .eq("product_id", product_id)
      .eq("duration_months", duration)
      .maybeSingle();

    if (planErr) {
      return NextResponse.json({ error: "Plan lookup error: " + planErr.message }, { status: 500 });
    }

    if (!plan) {
      const { data: newPlan, error: createPlanErr } = await supabase
        .from("installment_plans")
        .insert({
          product_id,
          duration_months: duration,
          markup_percent: 0,
          down_payment_percent: 20,
        })
        .select("id")
        .single();

      if (createPlanErr) {
        return NextResponse.json({ error: "Failed to create plan: " + createPlanErr.message }, { status: 500 });
      }
      plan = newPlan;
    }

    if (!plan) {
      return NextResponse.json({ error: "No installment plan found" }, { status: 400 });
    }

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        product_id,
        plan_id: plan.id,
        status: "active",
        down_payment_amount: down_payment,
        monthly_amount: monthly,
        total_amount: total,
        payment_method,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order error: " + (orderErr?.message || "unknown") }, { status: 500 });
    }

    // Generate installments
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
      return NextResponse.json({ error: "Installments error: " + instErr.message }, { status: 500 });
    }

    // Record payment
    const { error: pmtErr } = await supabase.from("payments").insert({
      order_id: order.id,
      amount: down_payment,
      method: payment_method,
      reference_no: refNo,
      paid_at: new Date().toISOString(),
    });
    if (pmtErr) {
      return NextResponse.json({ error: "Payment record error: " + pmtErr.message }, { status: 500 });
    }

    // Notification
    await supabase.from("notifications").insert({
      user_id: userId,
      message: `Your order has been placed. Order #${order.id.slice(0, 8)}`,
    });

    return NextResponse.json({
      success: true,
      referenceNo: refNo,
      orderId: order.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
