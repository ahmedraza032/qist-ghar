import { createServiceClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { formatPKR, formatDate, formatReference } from "@/lib/helpers/format";
import { deriveInstallmentStatus, outstandingForOrder } from "@/lib/helpers/installments";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordPaymentButton } from "@/components/admin/record-payment-button";
import { DownloadReceiptButton } from "@/components/admin/download-receipt-button";
import type { ReceiptData } from "@/components/admin/receipt-pdf";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, customer_id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at, product:products(name, images, base_price), plan:installment_plans(duration_months, markup_percent), customer:customers(full_name, phone, address, city, created_at)"
    )
    .eq("id", id)
    .single();

  if (!order) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = order as any;

  const { data: installments } = await supabase
    .from("installments")
    .select("*")
    .eq("order_id", id)
    .order("due_date");

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", id)
    .order("paid_at", { ascending: false });

  const instList = installments || [];
  const payList = payments || [];

  const paidByInstallment = new Map<string, number>();
  (payList || []).forEach((p: any) => {
    if (p.installment_id) {
      paidByInstallment.set(p.installment_id, (paidByInstallment.get(p.installment_id) || 0) + (p.amount || 0));
    }
  });

  const instRows = instList.map((inst: any) => {
    const paidTotal = paidByInstallment.get(inst.id) || 0;
    return { ...inst, paidTotal, remaining: Math.max(0, inst.amount - paidTotal) };
  });

  // Get customer order stats
  const { data: customerOrders } = await supabase
    .from("orders")
    .select("id, status, total_amount, down_payment_amount")
    .eq("customer_id", o.customer_id as string);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const custOrders = (customerOrders || []) as any[];
  const custOrderIds = custOrders.map((co: any) => co.id);

  const { data: customerPayments } = custOrderIds.length > 0
    ? await supabase.from("payments").select("order_id, installment_id, amount").in("order_id", custOrderIds)
    : { data: [] };

  const installmentPaymentsByOrder = new Map<string, number>();
  (customerPayments || []).forEach((p: any) => {
    if (p.installment_id) {
      installmentPaymentsByOrder.set(p.order_id, (installmentPaymentsByOrder.get(p.order_id) || 0) + (p.amount || 0));
    }
  });

  const totalSpent = custOrders.reduce((s: number, co: any) => s + (co.total_amount || 0), 0);
  const activeOrders = custOrders.filter((co: any) => co.status === "active").length;
  const completedOrders = custOrders.filter((co: any) => co.status === "completed").length;
  const totalOutstanding = custOrders.reduce(
    (s: number, co: any) => s + outstandingForOrder(co, installmentPaymentsByOrder.get(co.id) || 0),
    0
  );

  const receiptData: ReceiptData = {
    orderId: o.id,
    productName: o.product?.name || "—",
    durationMonths: o.plan?.duration_months || 0,
    downPayment: o.down_payment_amount,
    monthlyAmount: o.monthly_amount,
    totalAmount: o.total_amount,
    paymentMethod: o.payment_method,
    date: o.created_at,
    customerName: o.customer?.full_name || "—",
    customerPhone: o.customer?.phone || "—",
    customerAddress: o.customer?.address || "—",
    installments: instRows.map((inst: any, i: number) => ({
      number: i + 1,
      dueDate: inst.due_date,
      amount: inst.amount,
      status: deriveInstallmentStatus(inst.status, inst.due_date, inst.paidTotal, inst.amount) === "paid" ? "paid" : "pending",
    })),
  };

  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as string;
    const sup = await createServiceClient();
    await sup.from("orders").update({ status: newStatus }).eq("id", id);
    redirect(`/admin/orders/${id}?updated=1`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 hover:bg-muted rounded-md">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Order #{o.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(o.created_at)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DownloadReceiptButton data={receiptData} />
          <Badge
            variant={
              o.status === "completed"
                ? "success"
                : "warning"
            }
          >
            {o.status}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{o.product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{o.plan?.duration_months} months ({o.plan?.markup_percent}% markup)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium capitalize">{o.payment_method}</span>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Down Payment</span>
                  <span>{formatPKR(o.down_payment_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span>{formatPKR(o.monthly_amount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPKR(o.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Installment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">#</th>
                    <th className="text-left py-2 font-medium">Due Date</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium">Paid</th>
                    <th className="text-right py-2 font-medium">Remaining</th>
                    <th className="text-right py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {instRows.map((inst: any, i) => {
                    const derived = deriveInstallmentStatus(inst.status, inst.due_date, inst.paidTotal, inst.amount);
                    return (
                    <tr key={inst.id} className="border-b border-border">
                      <td className="py-2">{i + 1}</td>
                      <td className="py-2">{formatDate(inst.due_date)}</td>
                      <td className="py-2 text-right">{formatPKR(inst.amount)}</td>
                      <td className="py-2 text-right text-emerald-600">{formatPKR(inst.paidTotal)}</td>
                      <td className="py-2 text-right text-amount">{formatPKR(inst.remaining)}</td>
                      <td className="py-2 text-right">
                        <Badge
                          variant={
                            derived === "paid" ? "success" : derived === "overdue" ? "destructive" : derived === "partial" ? "outline" : "warning"
                          }
                        >
                          {derived}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        {derived !== "paid" ? (
                          <RecordPaymentButton installmentId={inst.id} dueAmount={inst.amount} remaining={inst.remaining} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold text-base">{o.customer?.full_name || "—"}</p>
              </div>
              <div className="border-t border-border pt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="font-medium">{o.customer?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">City</p>
                  <p className="font-medium">{o.customer?.city || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Address</p>
                  <p className="font-medium">{o.customer?.address || "—"}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-muted-foreground text-xs">Customer Since</p>
                <p className="font-medium text-sm">{o.customer?.created_at ? formatDate(o.customer.created_at) : "—"}</p>
              </div>
              <div className="border-t border-border pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-lg font-bold">{custOrders.length}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{completedOrders}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-600">{activeOrders}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="border-t border-border pt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-primary">{formatPKR(totalSpent)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Outstanding</p>
                  <p className="text-xl font-bold text-amount">{formatPKR(totalOutstanding)}</p>
                </div>
              </div>
              <a
                href={`/admin/customers/${o.customer_id}`}
                className="block w-full text-center text-sm text-primary hover:underline font-medium pt-1"
              >
                View Full Ledger
              </a>
            </CardContent>
          </Card>

          {/* Status update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateStatus} className="space-y-3">
                <select
                  name="status"
                  defaultValue={o.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <Button type="submit" className="w-full">
                  Update Status
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payment History */}
          {payList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {payList.map((pmt: any) => (
                  <div key={pmt.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <div>
                      <p className="text-xs text-muted-foreground">{formatDate(pmt.paid_at)}</p>
                      <p className="font-mono text-xs">{formatReference(pmt.reference_no)}</p>
                    </div>
                    <span className="font-medium">{formatPKR(pmt.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
