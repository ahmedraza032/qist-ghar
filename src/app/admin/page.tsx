import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, ShoppingCart, AlertTriangle } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServiceClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: completedOrders },
    { data: allOrdersData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "active").gte("created_at", monthStart),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed").gte("created_at", monthStart),
    supabase.from("orders").select("id, status, total_amount, down_payment_amount").gte("created_at", monthStart),
    supabase
      .from("orders")
      .select("id, status, total_amount, down_payment_amount, payment_method, created_at, product:products(name), profile:profiles(full_name)")
      .gte("created_at", monthStart)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const { data: paymentsData } = await supabase.from("payments").select("order_id, amount");
  
  // Calculate payments per order
  const paymentsByOrder = new Map<string, number>();
  (paymentsData || []).forEach((p) => {
    paymentsByOrder.set(p.order_id, (paymentsByOrder.get(p.order_id) || 0) + (p.amount || 0));
  });

  // Calculate remaining amount owed per order (only for active/pending orders)
  let totalRemainingOwed = 0;
  (allOrdersData || []).forEach((o) => {
    if (o.status !== "completed") {
      const paidSoFar = (paymentsByOrder.get(o.id) || 0) + (o.down_payment_amount || 0);
      const remainingOwed = Math.max(0, (o.total_amount || 0) - paidSoFar);
      totalRemainingOwed += remainingOwed;
    }
  });

  const orders = recentOrders || [];
  const totalOrdersCount = totalOrders || 0;
  const completedOrdersCount = completedOrders || 0;
  const pendingOrdersCount = pendingOrders || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your store performance.</p>
      </div>

      {/* Synchronized Dashboard KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Placed</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrdersCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Completed Orders</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{completedOrdersCount}</div>
            <p className="text-xs text-muted-foreground">Completed this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">Installments remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Remaining Owed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amount" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amount">{formatPKR(totalRemainingOwed)}</div>
            <p className="text-xs text-muted-foreground">Outstanding on this month's orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Order</th>
                    <th className="text-left py-2 font-medium">Customer</th>
                    <th className="text-left py-2 font-medium">Product</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id} className="border-b border-border">
                      <td className="py-2">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:text-primary">
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-2 text-xs font-medium">
                        <Link
                          href={`/admin/customers/${encodeURIComponent(order.profile?.full_name || order.customer_email || "Customer")}`}
                          className="hover:text-primary hover:underline flex items-center gap-1"
                          title="View customer installment details"
                        >
                          {order.profile?.full_name || order.customer_email || "Customer"}
                        </Link>
                      </td>
                      <td className="py-2 text-xs truncate max-w-[150px]">
                        {order.product?.name || "—"}
                      </td>
                      <td className="py-2 text-right text-xs font-medium">
                        {formatPKR(order.total_amount)}
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "success"
                              : "warning"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
