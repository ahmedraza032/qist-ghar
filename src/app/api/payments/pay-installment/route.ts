import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { installment_id, order_id, payment_method } = body;

    if (!installment_id || !order_id) {
      return NextResponse.json({ error: "Missing installment_id or order_id" }, { status: 400 });
    }

    const supabaseAuth = await createClient();
    const { data: authData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !authData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = await createServiceClient();

    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", order_id)
      .single();

    if (!order || order.user_id !== authData.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: installment } = await supabase
      .from("installments")
      .select("id, amount, status")
      .eq("id", installment_id)
      .eq("order_id", order_id)
      .single();

    if (!installment) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 });
    }

    if (installment.status === "paid") {
      return NextResponse.json({ error: "Installment already paid" }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const refNo = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { error: instErr } = await supabase
      .from("installments")
      .update({ status: "paid", paid_date: new Date().toISOString() })
      .eq("id", installment_id);

    if (instErr) {
      return NextResponse.json({ error: instErr.message }, { status: 500 });
    }

    const { error: pmtErr } = await supabase.from("payments").insert({
      order_id,
      installment_id,
      amount: installment.amount,
      method: payment_method || "mock",
      reference_no: refNo,
      paid_at: new Date().toISOString(),
    });

    if (pmtErr) {
      return NextResponse.json({ error: pmtErr.message }, { status: 500 });
    }

    const { data: pending } = await supabase
      .from("installments")
      .select("id")
      .eq("order_id", order_id)
      .neq("status", "paid");

    if (pending && pending.length === 0) {
      await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order_id);
    } else {
      await supabase
        .from("orders")
        .update({ status: "active" })
        .eq("id", order_id)
        .eq("status", "pending");
    }

    return NextResponse.json({ success: true, referenceNo: refNo });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
