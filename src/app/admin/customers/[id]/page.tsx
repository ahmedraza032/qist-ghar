import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, MapPin, FileText } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, status, total_amount, down_payment_amount, monthly_amount, payment_method, created_at, product:products(name)"
    )
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const orderList = orders || [];
  const orderIds = orderList.map((o: any) => o.id);

  const { data: payments } = orderIds.length
    ? await supabase.from("payments").select("order_id, amount").in("order_id", orderIds)
    : { data: [] };

  const paidByOrder = new Map<string, number>();
  (payments || []).forEach((p: any) => {
    paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) || 0) + (p.amount || 0));
  });

  const rows = orderList.map((o: any) => {
    const paid = (paidByOrder.get(o.id) || 0) + (o.down_payment_amount || 0);
    const outstanding = Math.max(0, (o.total_amount || 0) - paid);
    return { ...o, paid, outstanding };
  });

  const totalSpent = rows.reduce((s: number, r: any) => s + r.total_amount, 0);
  const totalPaid = rows.reduce((s: number, r: any) => s + r.paid, 0);
  const totalOutstanding = rows.reduce((s: number, r: any) => s + r.outstanding, 0);
  const activeCount = rows.filter((r: any) => r.status === "active").length;
  const completedCount = rows.filter((r: any) => r.status === "completed").length;

  const c = customer as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/customers" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Customers
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{c.full_name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            {c.full_name?.charAt(0).toUpperCase() || "C"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{c.full_name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {c.phone}</span>
              {(c.city || c.address) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {[c.city, c.address].filter(Boolean).join(", ")}
                </span>
              )}
              <span>Since {formatDate(c.created_at)}</span>
            </div>
            {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
          </div>
        </div>
        <Link href={`/admin/customers/${c.id}/edit`}>
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total Orders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{rows.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total Spent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatPKR(totalSpent)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total Paid</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{formatPKR(totalPaid)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Outstanding</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amount">{formatPKR(totalOutstanding)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Orders</CardTitle>
          <span className="text-xs text-muted-foreground">
            {activeCount} active · {completedCount} completed
          </span>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="py-2 px-3 font-medium">Order</th>
                    <th className="py-2 px-3 font-medium">Product</th>
                    <th className="py-2 px-3 font-medium text-right">Total</th>
                    <th className="py-2 px-3 font-medium text-right">Paid</th>
                    <th className="py-2 px-3 font-medium text-right">Outstanding</th>
                    <th className="py-2 px-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any) => (
                    <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                      <td className="py-2 px-3">
                        <Link href={`/admin/orders/${r.id}`} className="font-mono text-xs text-primary hover:underline">
                          #{r.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-2 px-3 text-xs truncate max-w-[180px]">{r.product?.name || "—"}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatPKR(r.total_amount)}</td>
                      <td className="py-2 px-3 text-right text-emerald-600">{formatPKR(r.paid)}</td>
                      <td className="py-2 px-3 text-right text-amount">{formatPKR(r.outstanding)}</td>
                      <td className="py-2 px-3 text-right">
                        <Badge variant={r.status === "completed" ? "success" : "warning"}>{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Open an order to print its receipt.</span>
        </div>
      )}
    </div>
  );
}
