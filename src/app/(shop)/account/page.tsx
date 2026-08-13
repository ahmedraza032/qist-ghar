"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  ChevronRight,
  User,
  Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPKR } from "@/lib/helpers/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface OrderSummary {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  product: { name: string; images: string[] };
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [orders, setOrders] = React.useState<OrderSummary[]>([]);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const [profileRes, ordersRes, notifRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("orders")
          .select("id, status, total_amount, created_at, product:products(name, images)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setProfile(profileRes.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setOrders((ordersRes.data || []) as any[]);
      setNotifications(notifRes.data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function markRead(notifId: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {profile?.full_name || user.email}
          </h1>
          <p className="text-muted-foreground mt-1">Manage your orders and account settings.</p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}

            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNotifications(false)}
                >
                  Close
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 border-b border-border text-sm cursor-pointer hover:bg-muted/50 ${
                        !notif.is_read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => markRead(notif.id)}
                    >
                      <p className={!notif.is_read ? "font-medium" : ""}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600" },
          { label: "Pending", value: statusCounts.pending || 0, icon: Clock, color: "text-amber-600" },
          { label: "Active", value: statusCounts.active || 0, icon: CheckCircle, color: "text-emerald-600" },
          { label: "Completed", value: statusCounts.completed || 0, icon: Package, color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[
          { href: "/account/orders", label: "My Orders", desc: "View order history and installment schedules", icon: ShoppingBag },
          { href: "/account/profile", label: "Profile Settings", desc: "Update your personal information", icon: User },
          { href: "/products", label: "Browse Products", desc: "Continue shopping", icon: Package },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{link.label}</p>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        <Link href="/account/orders" className="text-sm text-primary hover:underline font-medium">
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-muted-foreground" />}
          title="No orders yet"
          description="Browse products and place your first order."
          action={
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded bg-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="font-medium truncate max-w-[200px]">
                        {order.product?.name || "Product"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-semibold text-sm">
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
                          : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
