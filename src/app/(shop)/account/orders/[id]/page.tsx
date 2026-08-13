"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPKR, formatDate, formatReference } from "@/lib/helpers/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadReceipt } from "@/components/shop/receipt-pdf";
import { PayInstallmentModal } from "@/components/shop/pay-installment-modal";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = React.useState<any>(null);
  const [installments, setInstallments] = React.useState<any[]>([]);
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [payModal, setPayModal] = React.useState<{
    installmentId: string;
    amount: number;
    dueDate: string;
    number: number;
  } | null>(null);

  React.useEffect(() => {
    load();
  }, [params.id, router]);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: orderData } = await supabase
      .from("orders")
      .select(
        "id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at, product:products(name, images, base_price), plan:installment_plans(duration_months, markup_percent)"
      )
      .eq("id", params.id as string)
      .eq("user_id", user.id)
      .single();

    if (!orderData) {
      router.push("/account/orders");
      return;
    }

    setOrder(orderData);

    const [instRes, payRes] = await Promise.all([
      supabase
        .from("installments")
        .select("*")
        .eq("order_id", orderData.id)
        .order("due_date"),
      supabase
        .from("payments")
        .select("*")
        .eq("order_id", orderData.id)
        .order("paid_at", { ascending: false }),
    ]);

    setInstallments(instRes.data || []);
    setPayments(payRes.data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (!order) return null;

  const paidInstallments = installments.filter((i) => i.status === "paid").length;
  const totalInstallments = installments.length;
  const totalPaid = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const remainingAmount = Math.max(0, order.total_amount - totalPaid);
  const nextInstallment = installments.find((i) => i.status === "pending");

  function handleDownload() {
    downloadReceipt({
      orderId: order.id,
      productName: order.product?.name || "Product",
      durationMonths: order.plan?.duration_months || 0,
      downPayment: order.down_payment_amount,
      monthlyAmount: order.monthly_amount,
      totalAmount: order.total_amount,
      paymentMethod: order.payment_method,
      date: order.created_at,
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      installments: installments.map((inst, i) => ({
        number: i + 1,
        dueDate: inst.due_date,
        amount: inst.amount,
        status: inst.status,
      })),
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {payModal && (
        <PayInstallmentModal
          installmentId={payModal.installmentId}
          orderId={order.id}
          amount={payModal.amount}
          dueDate={payModal.dueDate}
          installmentNumber={payModal.number}
          onClose={() => setPayModal(null)}
          onSuccess={() => {
            setPayModal(null);
            load();
          }}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/account/orders" className="p-2 hover:bg-muted rounded-md">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
          </div>
        </div>
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
          className="text-sm px-3 py-1"
        >
          {order.status}
        </Badge>
      </div>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Product</span>
            <span className="font-medium">{order.product?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">
              {order.plan?.duration_months} months ({order.plan?.markup_percent}% markup)
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium capitalize">{order.payment_method}</span>
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Down Payment</span>
              <span className="font-medium">{formatPKR(order.down_payment_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly</span>
              <span className="font-medium">{formatPKR(order.monthly_amount)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPKR(order.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Paid So Far</p>
              <p className="text-lg font-bold text-green-600">{formatPKR(totalPaid)}</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-lg font-bold text-amber-600">{formatPKR(remainingAmount)}</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Installments</p>
              <p className="text-lg font-bold">
                {paidInstallments}/{totalInstallments} paid
              </p>
            </div>
          </div>

          {nextInstallment && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Next Installment</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  #{installments.indexOf(nextInstallment) + 1} — Due {formatDate(nextInstallment.due_date)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary">{formatPKR(nextInstallment.amount)}</span>
                <Button
                  size="sm"
                  onClick={() =>
                    setPayModal({
                      installmentId: nextInstallment.id,
                      amount: nextInstallment.amount,
                      dueDate: nextInstallment.due_date,
                      number: installments.indexOf(nextInstallment) + 1,
                    })
                  }
                >
                  Pay Now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installment Schedule */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Installment Schedule</CardTitle>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1">
            <Download className="h-3 w-3" /> Receipt
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Due Date</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                  <th className="text-right py-2 font-medium">Paid Date</th>
                  <th className="text-right py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {installments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No installments found.
                    </td>
                  </tr>
                ) : (
                  installments.map((inst, i) => (
                    <tr key={inst.id} className="border-b border-border">
                      <td className="py-2">{i + 1}</td>
                      <td className="py-2">{formatDate(inst.due_date)}</td>
                      <td className="py-2 text-right">{formatPKR(inst.amount)}</td>
                      <td className="py-2 text-right">
                        {inst.paid_date ? formatDate(inst.paid_date) : "—"}
                      </td>
                      <td className="py-2 text-right">
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
                      <td className="py-2 text-right">
                        {inst.status !== "paid" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPayModal({
                                installmentId: inst.id,
                                amount: inst.amount,
                                dueDate: inst.due_date,
                                number: i + 1,
                              })
                            }
                          >
                            Pay
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Reference</th>
                    <th className="text-left py-2 font-medium">Method</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="border-b border-border">
                      <td className="py-2">{formatDate(pmt.paid_at)}</td>
                      <td className="py-2 text-xs font-mono">{formatReference(pmt.reference_no)}</td>
                      <td className="py-2 capitalize">{pmt.method}</td>
                      <td className="py-2 text-right font-medium">
                        {formatPKR(pmt.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
