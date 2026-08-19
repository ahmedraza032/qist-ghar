"use client";

import React from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Check, Filter } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { deriveInstallmentStatus } from "@/lib/helpers/installments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordPaymentButton } from "@/components/admin/record-payment-button";
import { cn } from "@/lib/utils";
import { SearchInput, TableRow, TableHeader, AnimatedStatusBadge } from "@/components/admin/shared/admin-interactions";

const FILTERS = [
  { value: "due", label: "Due (Pending / Partial)" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];
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
  const [statusFilter, setStatusFilter] = React.useState("due");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);

  const q = query.trim().toLowerCase();
  const filtered = installments
    .map((i) => ({
      ...i,
      paidTotal: i.paidTotal ?? 0,
      remaining: i.remaining ?? (i.amount ?? 0),
      derivedStatus: deriveInstallmentStatus(i.status, i.due_date, i.paidTotal ?? 0, i.amount ?? 0),
    }))
    .filter((i) => {
      if (statusFilter === "due") {
        if (i.derivedStatus !== "pending" && i.derivedStatus !== "partial") return false;
      } else if (statusFilter && i.derivedStatus !== statusFilter) {
        return false;
      }
      const date = (i.due_date || "").slice(0, 10);
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      if (!q) return true;
      return (
        (i.order?.customer?.full_name || "").toLowerCase().includes(q) ||
        (i.order?.product?.name || "").toLowerCase().includes(q) ||
        String(i.order?.id || "").toLowerCase().includes(q)
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
        <div className="sm:hidden mb-2">
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
          "flex-col sm:flex-row flex-wrap gap-3",
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
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
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
          <p className="text-sm text-muted-foreground py-4 text-center">
            No installments found.
          </p>
        ) : (
          <div className="rounded-lg sm:border sm:border-border sm:bg-card">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full text-sm table-fixed min-w-[1000px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <TableHeader className="w-12">#</TableHeader>
                    <TableHeader className="w-24">Order #</TableHeader>
                    <TableHeader>Customer</TableHeader>
                    <TableHeader className="w-44">Product</TableHeader>
                    <TableHeader className="w-28">Due Date</TableHeader>
                    <TableHeader className="text-right w-28">Amount</TableHeader>
                    <TableHeader className="text-right w-24">Paid</TableHeader>
                    <TableHeader className="text-right w-28">Remaining</TableHeader>
                    <TableHeader className="text-right w-24">Status</TableHeader>
                    <TableHeader className="text-right w-28">Action</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((inst: any, idx: number) => {
                    const serialNumber = (currentPage - 1) * PAGE_SIZE + idx;
                    return (
                      <TableRow key={inst.id}>
                        <td className="py-2.5 px-3 text-xs font-mono text-muted-foreground w-12">
                          {serialNumber}
                        </td>
                        <td className="py-2.5 px-3 text-sm">
                          <Link href={`/admin/orders/${inst.order?.id}`} className="font-mono text-sm text-primary hover:underline font-medium">
                            {inst.order?.id ? `#${inst.order.id.slice(0, 8)}` : "—"}
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 text-sm">
                          <Link href={`/admin/orders/${inst.order?.id}`} className="hover:text-primary hover:underline font-medium">
                            {inst.order?.customer?.full_name || "—"}
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 text-sm truncate max-w-[180px]">
                          {inst.order?.product?.name || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-sm">{formatDate(inst.due_date)}</td>
                        <td className="py-2.5 px-3 text-sm text-right font-medium">
                          {formatPKR(inst.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-sm text-right text-emerald-600 font-medium">
                          {formatPKR(inst.paidTotal)}
                        </td>
                        <td className="py-2.5 px-3 text-sm text-right text-amount font-bold">
                          {formatPKR(inst.remaining)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <AnimatedStatusBadge
                            status={inst.derivedStatus}
                            isPositiveState={inst.derivedStatus === "paid"}
                            variant={
                              inst.derivedStatus === "paid"
                                ? "success"
                                : inst.derivedStatus === "pending"
                                ? "default"
                                : inst.derivedStatus === "overdue"
                                ? "destructive"
                                : "warning"
                            }
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {inst.derivedStatus !== "paid" ? (
                              <RecordPaymentButton
                                installmentId={inst.id}
                                dueAmount={inst.amount}
                                remaining={inst.remaining}
                              />
                            ) : (
                              <Button variant="outline" size="sm" disabled className="gap-1">
                                <Check className="h-3 w-3" /> Paid
                              </Button>
                            )}
                          </div>
                        </td>
                      </TableRow>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden flex flex-col gap-4">
              {paged.map((inst: any) => (
                <Card key={inst.id} className="overflow-hidden">
                  <div className="bg-muted/40 px-4 py-3 border-b border-border flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-medium mb-1">Order #</span>
                      <Link href={`/admin/orders/${inst.order?.id}`} className="font-mono text-sm text-primary hover:underline font-bold">
                        {inst.order?.id ? `#${inst.order.id.slice(0, 8)}` : "—"}
                      </Link>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground font-medium mb-1">Status</span>
                      <AnimatedStatusBadge
                        status={inst.derivedStatus}
                        isPositiveState={inst.derivedStatus === "paid"}
                        variant={
                          inst.derivedStatus === "paid"
                            ? "success"
                            : inst.derivedStatus === "pending"
                            ? "default"
                            : inst.derivedStatus === "overdue"
                            ? "destructive"
                            : "warning"
                        }
                      />
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">Customer</span>
                      <Link href={`/admin/orders/${inst.order?.id}`} className="font-bold text-foreground hover:text-primary hover:underline block text-sm text-right">
                        {inst.order?.customer?.full_name || "—"}
                      </Link>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">Product</span>
                      <span className="text-sm font-medium text-right line-clamp-2 max-w-[160px]">{inst.order?.product?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">Due Date</span>
                      <span className="text-sm">{formatDate(inst.due_date)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-sm font-medium">{formatPKR(inst.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">Paid</span>
                      <span className="text-sm text-emerald-600 font-medium">{formatPKR(inst.paidTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <span className="text-sm text-muted-foreground">Remaining</span>
                      <span className="text-sm text-amount font-bold">{formatPKR(inst.remaining)}</span>
                    </div>
                    <div className="pt-1">
                      {inst.derivedStatus !== "paid" ? (
                        <div className="w-full">
                          <RecordPaymentButton
                            installmentId={inst.id}
                            dueAmount={inst.amount}
                            remaining={inst.remaining}
                          />
                        </div>
                      ) : (
                        <Button variant="outline" size="lg" disabled className="w-full gap-2">
                          <Check className="h-4 w-4" /> Paid
                        </Button>
                      )}
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
      </CardContent>
    </Card>
  );
}
