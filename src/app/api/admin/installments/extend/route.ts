import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { installment_id, paid_amount, new_due_date } = await req.json();

    if (!installment_id || typeof paid_amount !== "number" || !new_due_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // 1. Fetch the installment
    const { data: installment, error: fetchError } = await supabase
      .from("installments")
      .select("*")
      .eq("id", installment_id)
      .single();

    if (fetchError || !installment) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 });
    }

    if (paid_amount >= installment.amount) {
       return NextResponse.json({ error: "Paid amount must be strictly less than the total due amount for an extension" }, { status: 400 });
    }

    // 2. Insert the payment with extension metadata in reference_no
    const extensionMetadata = {
      type: "extension",
      original_due_date: installment.due_date,
      original_amount: installment.amount,
      paid_amount: paid_amount,
    };

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: installment.order_id,
      installment_id: installment.id,
      amount: paid_amount,
      method: "cash", // Or configurable
      reference_no: JSON.stringify(extensionMetadata),
      paid_at: new Date().toISOString(),
    });

    if (paymentError) {
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }

    // 3. Update the installment to reflect the new remaining amount and new due date
    const remainingAmount = installment.amount - paid_amount;

    const { error: updateError } = await supabase
      .from("installments")
      .update({
        amount: remainingAmount,
        due_date: new_due_date,
      })
      .eq("id", installment.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update installment" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
