"use client";

import React from "react";
import Link from "next/link";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, formatPKR } from "@/lib/helpers/format";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  status: "active" | "completed" | "inactive";
  joinedDate: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = React.useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    async function loadCustomersData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/orders");
        const json = await res.json();
        const orders = json.orders || [];

        // Aggregate unique customers from live orders API
        const customerMap = new Map<string, CustomerRecord>();

        orders.forEach((order: any) => {
          const rawName = order.profile?.full_name || (order.customer_email ? order.customer_email.split("@")[0] : "Customer");
          const key = rawName.trim().toLowerCase();

          const existing = customerMap.get(key) || {
            id: rawName,
            name: rawName,
            email: order.customer_email || `${rawName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            phone: order.profile?.phone || "0300-1234567",
            city: order.profile?.city || "Lahore",
            ordersCount: 0,
            totalSpent: 0,
            status: "inactive",
            joinedDate: order.created_at || new Date().toISOString(),
          };

          existing.ordersCount += 1;
          existing.totalSpent += (order.total_amount || 0);

          if (order.status === "active") {
            existing.status = "active";
          } else if (order.status === "completed" && existing.status !== "active") {
            existing.status = "completed";
          }

          customerMap.set(key, existing);
        });

        const customerList = Array.from(customerMap.values());
        setCustomers(customerList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomersData();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCustomers = filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            {customers.length} registered customers — synced live with store orders.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name, phone..."
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Synchronizing customer data...
          </CardContent>
        </Card>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No customers matching your search.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-left">
                <th className="py-3 px-4 font-medium">Customer Name</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">City</th>
                <th className="py-3 px-4 font-medium text-center">Orders</th>
                <th className="py-3 px-4 font-medium text-right">Total Spent</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-4 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {pagedCustomers.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(c.name)}`}
                      className="text-foreground hover:text-primary hover:underline font-semibold flex items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div>{c.phone}</div>
                    <div className="text-muted-foreground text-[11px]">{c.email}</div>
                  </td>
                  <td className="py-3 px-4 text-xs">{c.city}</td>
                  <td className="py-3 px-4 text-center font-semibold text-xs">{c.ordersCount}</td>
                  <td className="py-3 px-4 text-right font-medium text-xs">{formatPKR(c.totalSpent)}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      variant={
                        c.status === "active"
                          ? "success"
                          : c.status === "completed"
                          ? "default"
                          : "outline"
                      }
                      className="text-xs px-2 py-0.5"
                    >
                      {c.status === "active" ? "Active Plan" : c.status === "completed" ? "Paid in Full" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-muted-foreground">
                    {formatDate(c.joinedDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredCustomers.length > 0 && totalPages > 1 && (
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
    </div>
  );
}
