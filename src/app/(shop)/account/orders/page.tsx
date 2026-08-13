"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface OrderItem {
  id: string;
  status: string;
  total_amount: number;
  monthly_amount: number;
  payment_method: string;
  created_at: string;
  product: { name: string; base_price: number };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  React.useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select(
          "id, status, total_amount, monthly_amount, payment_method, created_at, product:products(name, base_price)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setOrders((data || []) as any[]);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-32" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="p-2 hover:bg-muted rounded-md">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["all", "pending", "approved", "active", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-muted-foreground" />}
          title="No orders found"
          description={
            statusFilter !== "all"
              ? `No ${statusFilter} orders.`
              : "You haven't placed any orders yet."
          }
          action={
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)} &middot; {formatDate(order.created_at)}
                      </p>
                      <p className="font-semibold mt-1">
                        {order.product?.name || "Product"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {order.payment_method} &middot; {formatPKR(order.monthly_amount)}/mo
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-lg">
                        {formatPKR(order.total_amount)}
                      </span>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "success"
                            : order.status === "pending"
                            ? "warning"
                            : order.status === "active"
                            ? "default"
                            : order.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
