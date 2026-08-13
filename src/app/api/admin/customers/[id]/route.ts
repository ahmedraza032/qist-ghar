import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServiceClient();
    const resolvedParams = await params;
    const rawId = resolvedParams?.id || "";
    const decodedId = decodeURIComponent(rawId);

    // 1. Fetch orders with products and profiles
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("id, user_id, product_id, status, total_amount, down_payment_amount, monthly_amount, payment_method, created_at, product:products(id, name), profile:profiles(id, full_name, phone, city, address)")
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

    // Decorate orders with emails
    const allOrders = (ordersData || []).map((o: any) => ({
      ...o,
      customer_email: userEmailMap.get(o.user_id) || o.profile?.full_name || o.user_id || "Customer",
    }));

    // Filter orders for this customer
    const userOrders = allOrders.filter(
      (o: any) => {
        const d = decodedId.toLowerCase().trim();
        const email = (o.customer_email || "").toLowerCase();
        const name = (o.profile?.full_name || "").toLowerCase();
        const uid = (o.user_id || "").toLowerCase();
        
        return uid === d || 
               email === d || 
               email.includes(d) || 
               d.includes(email.split('@')[0]) ||
               name === d || 
               name.includes(d) || 
               d.includes(name);
      }
    );

    if (userOrders.length === 0) {
       return NextResponse.json({ orders: [], installments: [], payments: [] });
    }

    const orderIds = userOrders.map((o: any) => o.id);

    // Fetch installments for these orders
    const { data: installmentsData } = await supabase
      .from("installments")
      .select("*")
      .in("order_id", orderIds)
      .order("due_date", { ascending: true });

    // Fetch payments for these orders
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .in("order_id", orderIds)
      .order("paid_at", { ascending: true });

    return NextResponse.json({
      orders: userOrders,
      installments: installmentsData || [],
      payments: paymentsData || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
