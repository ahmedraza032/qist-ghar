"use client";

import React from "react";
import Link from "next/link";
import { Loader2, Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 30;

function getPageItems(current: number, total: number): (number | string)[] {
  if (total <= 1) return [1];
  const items: (number | string)[] = [];
  const windowSize = 2;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - windowSize && i <= current + windowSize)) {
      items.push(i);
    } else if (items[items.length - 1] !== "...") {
      items.push("...");
    }
  }
  return items;
}

interface OrderItem {
  id: string;
  customer_id: string;
  product_id: string;
  status: string;
  total_amount: number;
  monthly_amount: number;
  down_payment_amount?: number;
  payment_method: string;
  created_at: string;
  product?: { id: string; name: string };
  customer?: { id: string; full_name: string; phone: string; city: string; address: string };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [page, setPage] = React.useState(1);

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.orders) {
        setOrders(json.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  React.useEffect(() => {
    setPage(1);
  }, [query, statusFilter, methodFilter, fromDate, toDate]);

  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (methodFilter && (o.payment_method || "").toLowerCase() !== methodFilter.toLowerCase()) return false;
    const date = (o.created_at || "").slice(0, 10);
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    if (!q) return true;
    return (
      (o.id || "").toLowerCase().includes(q) ||
      (o.customer?.full_name || "").toLowerCase().includes(q) ||
      (o.customer?.phone || "").toLowerCase().includes(q) ||
      (o.customer?.city || "").toLowerCase().includes(q) ||
      (o.product?.name || "").toLowerCase().includes(q) ||
      (o.payment_method || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {orders.length} orders — click customer name to view their ledger.
          </p>
        </div>
        <Link href="/admin/orders/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Order
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading orders...
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No orders yet.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by customer, product, or order #..."
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {["active", "completed"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
            >
              <option value="">All methods</option>
              {["jazzcash", "easypaisa", "bank", "card", "cash", "whatsapp"].map((m) => (
                <option key={m} value={m}>{m === "bank" ? "Bank Transfer" : m === "card" ? "Card" : m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <span className="self-center text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-border">
              <div className="py-8 text-center text-muted-foreground text-sm">
                No orders match your search.
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground text-left">
                    <th className="py-2.5 px-3 font-semibold">Order</th>
                    <th className="py-2.5 px-3 font-semibold">Customer</th>
                    <th className="py-2.5 px-3 font-semibold">Contact</th>
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Down Payment</th>
                    <th className="py-2.5 px-3 font-semibold">Payment</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((order) => {
                    return (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-2.5 px-3">
                          <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm text-primary hover:underline font-medium">
                            #{order.id.slice(0, 8)}
                          </Link>
                        </td>

                        <td className="py-2.5 px-3">
                          <Link
                            href={`/admin/customers/${order.customer_id}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                            title="View customer ledger"
                          >
                            {order.customer?.full_name || "Customer"}
                          </Link>
                        </td>

                        <td className="py-2.5 px-3 text-xs">
                          {order.customer?.phone && <div>{order.customer.phone}</div>}
                          <div className="text-muted-foreground">{order.customer?.city || "—"}</div>
                        </td>

                        <td className="py-2.5 px-3 font-medium truncate max-w-[130px]">
                          {order.product?.name || "—"}
                        </td>

                        <td className="py-2.5 px-3 text-right font-medium">
                          {formatPKR(order.total_amount)}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="font-semibold text-amount">
                            {formatPKR(order.down_payment_amount || 0)}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 capitalize">{order.payment_method}</td>

                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{formatDate(order.created_at)}</td>

                        <td className="py-2.5 px-3 text-right">
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "success"
                                : "warning"
                            }
                            className="text-xs px-1.5 py-0.5"
                          >
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageItems(currentPage, totalPages).map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === currentPage ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 text-sm"
                    onClick={() => setPage(item as number)}
                  >
                    {item}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
