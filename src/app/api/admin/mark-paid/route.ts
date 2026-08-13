import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { installmentId, orderId } = await request.json();

    if (!installmentId || !orderId) {
      return NextResponse.json({ error: "Missing installmentId or orderId" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const now = new Date().toISOString().split("T")[0];

    // Mark installment paid
    const { error: instErr } = await supabase
      .from("installments")
      .update({ status: "paid", paid_date: now })
      .eq("id", installmentId);

    if (instErr) {
      return NextResponse.json({ error: instErr.message }, { status: 500 });
    }

    // Create payment record
    await supabase.from("payments").insert({
      order_id: orderId,
      installment_id: installmentId,
      amount: 0,
      method: "Manual",
      reference_no: `MANUAL-${Date.now()}`,
      paid_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
