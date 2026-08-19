import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingCart, AlertTriangle } from "lucide-react";
import { formatPKR } from "@/lib/helpers/format";
import { outstandingForOrder } from "@/lib/helpers/installments";
import Link from "next/link";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { RecentOrdersTable } from "@/components/admin/dashboard/recent-orders-table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServiceClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalOrders },
    { count: activeOrdersCount },
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
      .select("id, customer_id, status, total_amount, down_payment_amount, payment_method, created_at, product:products(name), customer:customers(full_name)")
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

  // Calculate remaining amount owed per order (only for active orders)
  let totalRemainingOwed = 0;
  (allOrdersData || []).forEach((o) => {
    if (o.status !== "completed") {
      totalRemainingOwed += outstandingForOrder(o, paymentsByOrder.get(o.id) || 0);
    }
  });

  const orders = recentOrders || [];
  const totalOrdersCount = totalOrders || 0;
  const completedOrdersCount = completedOrders || 0;
  const activeOrdersCountFinal = activeOrdersCount || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your store performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders Placed"
          value={totalOrdersCount}
          subtitle="This month"
          icon={<ShoppingCart className="h-4 w-4 text-primary" />}
          delayMs={0}
        />
        <StatCard
          title="Fully Completed Orders"
          value={completedOrdersCount}
          subtitle="Completed this month"
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          valueClassName="text-emerald-600"
          delayMs={40}
        />
        <StatCard
          title="Active Orders"
          value={activeOrdersCountFinal}
          subtitle="Installments remaining"
          icon={<Users className="h-4 w-4 text-amber-600" />}
          valueClassName="text-amber-600"
          delayMs={80}
        />
        <StatCard
          title="Total Remaining Owed"
          value={totalRemainingOwed}
          formatType="currency"
          subtitle="Outstanding on this month's orders"
          icon={<AlertTriangle className="h-4 w-4 text-amount" />}
          valueClassName="text-amount"
          delayMs={120}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link 
            href="/admin/orders" 
            className="relative text-sm font-medium text-primary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm inline-block"
          >
            View all
            <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-primary origin-left scale-x-0 transition-transform duration-150 ease-[cubic-bezier(0,0,0.2,1)] group-hover:scale-x-100" />
          </Link>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
