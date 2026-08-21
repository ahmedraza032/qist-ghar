"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDate, formatPKR } from "@/lib/helpers/format";
import { deleteCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { SearchInput, TableRow, TableHeader, IconActionButton } from "@/components/admin/shared/admin-interactions";

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

interface CustomerRow {
  id: string;
  full_name: string;
  phone: string;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
  outstanding: number;
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = React.useState<CustomerRow | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? customers.filter(
        (c) =>
          (c.full_name || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q) ||
          (c.city || "").toLowerCase().includes(q)
      )
    : customers;

  React.useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function handleConfirmDelete() {
    if (!customerToDelete) return;
    const id = customerToDelete.id;
    setDeletingId(id);
    const result = await deleteCustomer(id);
    setDeletingId(null);
    if (result.success) {
      addToast({ title: "Deleted", description: `${customerToDelete.full_name} removed.` });
      setCustomerToDelete(null);
      router.refresh();
    } else {
      addToast({ title: "Error", description: result.error || "Failed to delete", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by name, phone, or city..."
      />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border">
          <div className="py-8 text-center text-muted-foreground text-sm">No customers found.</div>
        </div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground text-left">
                  <TableHeader className="w-12 pl-4">#</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Phone</TableHeader>
                  <TableHeader>City</TableHeader>
                  <TableHeader className="text-center">Orders</TableHeader>
                  <TableHeader className="text-right">Total</TableHeader>
                  <TableHeader className="text-right">Outstanding</TableHeader>
                  <TableHeader className="text-right">Joined</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {paged.map((c, idx) => {
                  const serialNumber = (currentPage - 1) * PAGE_SIZE + idx;
                  return (
                    <TableRow key={c.id}>
                      <td className="py-3 pl-4 text-xs font-mono text-muted-foreground w-12">
                        {serialNumber}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-primary hover:underline">
                          {c.full_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs">{c.phone}</td>
                      <td className="py-3 px-4 text-xs">{c.city || "—"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-xs">{c.orders_count}</td>
                      <td className="py-3 px-4 text-right font-medium text-xs">{formatPKR(c.total_spent)}</td>
                      <td className="py-3 px-4 text-right font-medium text-xs text-amount">{formatPKR(c.outstanding)}</td>
                      <td className="py-3 px-4 text-right text-xs text-muted-foreground">{formatDate(c.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/customers/${c.id}/edit`}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#82B63F] hover:bg-[#6FA032] text-white shadow-xs transition-all duration-150 hover:shadow-sm active:scale-95 cursor-pointer">
                              <Pencil className="h-3 w-3" />
                              <span>Edit</span>
                            </span>
                          </Link>
                          <IconActionButton
                            onClick={() => setCustomerToDelete(c)}
                            disabled={deletingId === c.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconActionButton>
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
            {paged.map((c, idx) => {
              const serialNumber = (currentPage - 1) * PAGE_SIZE + idx;
              return (
                <div key={c.id} className="rounded-lg border border-border overflow-hidden bg-card">
                  <div className="flex items-start justify-between gap-3 p-4 border-b border-border">
                    <div className="min-w-0">
                      <span className="text-xs font-mono text-muted-foreground">#{serialNumber}</span>
                      <Link href={`/admin/customers/${c.id}`} className="font-medium block leading-tight mt-1 hover:text-primary">{c.full_name}</Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.phone}</p>
                    </div>
                    <span className="text-sm font-semibold text-amount shrink-0">{formatPKR(c.outstanding)}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">City</span>
                      <span className="text-sm">{c.city || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border py-3">
                      <span className="text-sm text-muted-foreground">Orders</span>
                      <span className="text-sm font-semibold">{c.orders_count}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border py-3">
                      <span className="text-sm text-muted-foreground">Total Spent</span>
                      <span className="text-sm font-medium">{formatPKR(c.total_spent)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <span className="text-sm text-muted-foreground">{formatDate(c.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/admin/customers/${c.id}/edit`} className="flex-1">
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-[#82B63F] hover:bg-[#6FA032] text-white w-full">
                          <Pencil className="h-3 w-3" />
                          Edit
                        </span>
                      </Link>
                      <IconActionButton
                        onClick={() => setCustomerToDelete(c)}
                        disabled={deletingId === c.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete customer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </IconActionButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
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
                  <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">...</span>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {customerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deletingId && setCustomerToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-md bg-white text-zinc-900 rounded-2xl border border-zinc-200 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-full bg-red-50 text-red-600 border border-red-200 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-lg font-bold font-heading text-zinc-900">Delete Customer</h3>
                  <p className="text-sm text-zinc-600">
                    Are you sure you want to delete <span className="font-semibold text-zinc-900">{customerToDelete.full_name}</span>?
                  </p>
                </div>
              </div>

              {customerToDelete.orders_count > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                    <span>⚠️</span> Notice:
                  </p>
                  <p className="leading-relaxed">This customer has {customerToDelete.orders_count} order(s). All associated orders, installments, and payment records will also be permanently deleted.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={() => setCustomerToDelete(null)}
                  className="bg-[#82B63F] hover:bg-[#71A233] text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={handleConfirmDelete}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Customer</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
