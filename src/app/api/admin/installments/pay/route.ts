import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { installment_id, amount, method, paid_date, new_due_date } = body;

    if (!installment_id || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Missing or invalid payment details" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // 1. Fetch the installment
    const { data: installment, error: fetchError } = await supabase
      .from("installments")
      .select("id, order_id, amount, status, due_date")
      .eq("id", installment_id)
      .single();

    if (fetchError || !installment) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 });
    }

    // 2. Compute what has already been paid toward this installment
    const { data: existingPayments } = await supabase
      .from("payments")
      .select("amount")
      .eq("installment_id", installment_id);

    const paidTotal = (existingPayments || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
    const remaining = Math.max(0, installment.amount - paidTotal);

    if (amount > remaining) {
      return NextResponse.json(
        { error: `Amount exceeds remaining balance (${remaining})` },
        { status: 400 }
      );
    }

    const paidDate = paid_date || new Date().toISOString().split("T")[0];
    const paidAt = new Date(paidDate).toISOString();
    const refNo = amount >= remaining ? "Full Installment" : "Partial Payment";

    // 3. Record the payment
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: installment.order_id,
      installment_id: installment.id,
      amount,
      method: method || "cash",
      reference_no: refNo,
      paid_at: paidAt,
    });

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    const newPaidTotal = paidTotal + amount;
    const isFullyPaid = newPaidTotal >= installment.amount;

    // 4. Update the installment (only status/paid_date/due_date — never `amount`)
    const installmentUpdate: Record<string, any> = {};
    if (isFullyPaid) {
      installmentUpdate.status = "paid";
      installmentUpdate.paid_date = paidDate;
    }
    if (new_due_date) {
      installmentUpdate.due_date = new_due_date;
    }
    if (Object.keys(installmentUpdate).length > 0) {
      await supabase.from("installments").update(installmentUpdate).eq("id", installment_id);
    }

    // 5. Transition the order (completed only when every installment is fully paid)
    const { data: unpaidInsts } = await supabase
      .from("installments")
      .select("id, amount")
      .eq("order_id", installment.order_id);

    const { data: orderPayments } = await supabase
      .from("payments")
      .select("installment_id, amount")
      .eq("order_id", installment.order_id);

    const paidByInstallment = new Map<string, number>();
    (orderPayments || []).forEach((p: any) => {
      if (p.installment_id) {
        paidByInstallment.set(p.installment_id, (paidByInstallment.get(p.installment_id) || 0) + p.amount);
      }
    });

    const anyUnpaid = (unpaidInsts || []).some(
      (inst: any) => (paidByInstallment.get(inst.id) || 0) < inst.amount
    );

    await supabase
      .from("orders")
      .update({ status: anyUnpaid ? "active" : "completed" })
      .eq("id", installment.order_id);

    return NextResponse.json({
      success: true,
      paidTotal: newPaidTotal,
      remaining: Math.max(0, installment.amount - newPaidTotal),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
