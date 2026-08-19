"use client";

import React from "react";
import Link from "next/link";
import { Loader2, Search, ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchInput, TableRow, TableHeader, AnimatedStatusBadge } from "@/components/admin/shared/admin-interactions";
import { PrintReceiptButton } from "@/components/admin/print-receipt-button";

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
  const [showFilters, setShowFilters] = React.useState(false);

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
          <div className="sm:hidden mb-4">
            <Button
              variant="outline"
              className="w-full gap-2 min-h-[44px]"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" /> 
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          <div className={cn(
            "flex-col sm:flex-row flex-wrap gap-3 mb-4",
            showFilters ? "flex" : "hidden sm:flex"
          )}>
            <div className="relative flex-1 w-full sm:w-auto min-w-[200px]">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search by customer, product, or order #..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto min-h-[44px] sm:h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {["active", "completed"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full sm:w-auto min-h-[44px] sm:h-10 rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
            >
              <option value="">All methods</option>
              {["jazzcash", "easypaisa", "bank", "card", "cash", "whatsapp"].map((m) => (
                <option key={m} value={m}>{m === "bank" ? "Bank Transfer" : m === "card" ? "Card" : m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:items-center">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-xs font-medium text-muted-foreground sm:hidden">From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full sm:w-auto min-h-[44px] sm:h-10 rounded-md border border-input bg-background px-3 py-2 text-[16px] sm:text-sm"
                />
              </div>
              <span className="hidden sm:inline text-muted-foreground text-sm">to</span>
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-xs font-medium text-muted-foreground sm:hidden">To</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full sm:w-auto min-h-[44px] sm:h-10 rounded-md border border-input bg-background px-3 py-2 text-[16px] sm:text-sm"
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-border">
              <div className="py-8 text-center text-muted-foreground text-sm">
                No orders match your search.
              </div>
            </div>
          ) : (
            <div className="rounded-lg sm:border sm:border-border sm:bg-card">
              <div className="hidden sm:block overflow-x-auto w-full">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground text-left whitespace-nowrap">
                      <TableHeader className="py-2.5 px-3 font-semibold w-12">#</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold">Order</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold">Customer</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold">Contact</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold">Product</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold text-right">Total</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold text-right">Down Payment</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold">Payment</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold">Date</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold text-right">Status</TableHeader>
                      <TableHeader className="py-2.5 px-3 font-semibold text-right">Receipt</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((order, idx) => {
                      const serialNumber = (currentPage - 1) * PAGE_SIZE + idx;
                      return (
                        <TableRow key={order.id}>
                          <td className="py-2.5 px-3 text-xs font-mono text-muted-foreground w-12">
                            {serialNumber}
                          </td>
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
                            <div className="line-clamp-1">{order.product?.name || "—"}</div>
                          </td>
  
                          <td className="py-2.5 px-3 text-right font-medium">
                            {formatPKR(order.total_amount)}
                          </td>
  
                          <td className="py-2.5 px-3 text-right">
                            <div className="font-semibold text-emerald-600">
                              {formatPKR(order.down_payment_amount || 0)}
                            </div>
                          </td>
  
                          <td className="py-2.5 px-3 capitalize">{order.payment_method}</td>
  
                          <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{formatDate(order.created_at)}</td>
  
                          <td className="py-2.5 px-3 text-right">
                            <AnimatedStatusBadge
                              status={order.status}
                              isPositiveState={order.status === "active" || order.status === "completed"}
                              variant={
                                order.status === "active" || order.status === "completed"
                                  ? "success"
                                  : order.status === "pending"
                                  ? "default"
                                  : "warning"
                              }
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <PrintReceiptButton orderId={order.id} />
                          </td>
                        </TableRow>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden flex flex-col gap-4">
                {paged.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <div className="bg-muted/40 px-4 py-3 border-b border-border flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-medium mb-1">Order #</span>
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm text-primary hover:underline font-bold">
                          #{order.id.slice(0, 8)}
                        </Link>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground font-medium mb-1">Status</span>
                        <AnimatedStatusBadge 
                          status={order.status}
                          isPositiveState={order.status === "active" || order.status === "completed"}
                          variant={
                            order.status === "active" || order.status === "completed"
                              ? "success"
                              : order.status === "pending"
                              ? "default"
                              : "warning"
                          } 
                        />
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="text-sm text-muted-foreground">Customer</span>
                        <div className="text-right">
                          <Link href={`/admin/customers/${order.customer_id}`} className="font-bold text-foreground hover:text-primary hover:underline block text-sm">
                            {order.customer?.full_name || "Customer"}
                          </Link>
                          {order.customer?.phone && <div className="text-xs text-muted-foreground mt-0.5">{order.customer.phone}</div>}
                          <div className="text-xs text-muted-foreground mt-0.5">{order.customer?.city || "—"}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="text-sm text-muted-foreground">Product</span>
                        <div className="text-right max-w-[160px]">
                          <span className="text-sm font-medium line-clamp-2">{order.product?.name || "—"}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-sm font-medium">{formatPKR(order.total_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="text-sm text-muted-foreground">Down Payment</span>
                        <span className="text-sm font-semibold text-emerald-600">{formatPKR(order.down_payment_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="text-sm text-muted-foreground">Payment</span>
                        <span className="text-sm capitalize">{order.payment_method}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Date</span>
                        <span className="text-sm text-right">{formatDate(order.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
