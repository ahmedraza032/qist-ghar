import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServiceClient();

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, customer_id, product_id, status, total_amount, monthly_amount, down_payment_amount, payment_method, created_at, product:products(id, name), customer:customers(id, full_name, phone, city, address)"
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    return NextResponse.json({ orders: ordersData || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
