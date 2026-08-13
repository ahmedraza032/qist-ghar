import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServiceClient();

    // 1. Fetch orders with products and profiles
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("id, user_id, product_id, status, total_amount, monthly_amount, payment_method, created_at, product:products(id, name), profile:profiles(id, full_name, phone, city, address)")
      .order("created_at", { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    // 2. Fetch auth users to get emails
    const { data: authUsersData } = await supabase.auth.admin.listUsers();
    const userEmailMap = new Map<string, string>();
    (authUsersData?.users || []).forEach((u) => {
      userEmailMap.set(u.id, u.email || "");
    });

    const orders = (ordersData || []).map((o: any) => ({
      ...o,
      customer_email: userEmailMap.get(o.user_id) || o.profile?.full_name || o.user_id || "Customer",
    }));

    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
