"use client";

import React from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUSES = ["pending", "paid", "overdue"];
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

export function InstallmentsTable({ installments }: { installments: any[] }) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [page, setPage] = React.useState(1);

  const q = query.trim().toLowerCase();
  const filtered = installments.filter((i) => {
    if (statusFilter && i.status !== statusFilter) return false;
    const date = (i.due_date || "").slice(0, 10);
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    if (!q) return true;
    return (
      (i.order?.profile?.full_name || "").toLowerCase().includes(q) ||
      (i.order?.product?.name || "").toLowerCase().includes(q) ||
      (i.order?.id || "").toLowerCase().includes(q)
    );
  });

  React.useEffect(() => {
    setPage(1);
  }, [query, statusFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
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
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
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
          <p className="text-sm text-muted-foreground py-4 text-center">
            No installments found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-2.5 px-3 font-medium">Customer</th>
                  <th className="py-2.5 px-3 font-medium">Product</th>
                  <th className="py-2.5 px-3 font-medium">Due Date</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 px-3 font-medium text-right">Paid</th>
                  <th className="py-2.5 px-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((inst: any) => (
                  <tr key={inst.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-2.5 px-3 text-sm">
                      <Link href={`/admin/orders/${inst.order?.id}`} className="hover:text-primary hover:underline font-medium">
                        {inst.order?.profile?.full_name || "—"}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-sm truncate max-w-[180px]">
                      {inst.order?.product?.name || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-sm">{formatDate(inst.due_date)}</td>
                    <td className="py-2.5 px-3 text-sm text-right font-medium">
                      {formatPKR(inst.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-sm text-right text-muted-foreground">
                      {inst.paid_date ? formatDate(inst.paid_date) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge
                        variant={
                          inst.status === "paid"
                            ? "success"
                            : inst.status === "overdue"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {inst.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
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
      </CardContent>
    </Card>
  );
}
