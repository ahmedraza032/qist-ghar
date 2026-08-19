"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { deriveInstallmentStatus } from "@/lib/helpers/installments";
import type { ReceiptData } from "@/types/receipt";

export async function getReceiptData(orderId: string): Promise<ReceiptData | null> {
  const supabase = await createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, customer_id, status, down_payment_amount, monthly_amount, total_amount, payment_method, created_at, product:products(name), plan:installment_plans(duration_months, markup_percent), customer:customers(full_name, phone, address)"
    )
    .eq("id", orderId)
    .single();

  if (!order) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = order as any;

  const { data: installments } = await supabase
    .from("installments")
    .select("*")
    .eq("order_id", orderId)
    .order("due_date");

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("paid_at", { ascending: false });

  const instList = installments || [];
  const payList = payments || [];

  const paidByInstallment = new Map<string, number>();
  payList.forEach((p: any) => {
    if (p.installment_id) {
      paidByInstallment.set(p.installment_id, (paidByInstallment.get(p.installment_id) || 0) + (p.amount || 0));
    }
  });

  const instRows = instList.map((inst: any) => {
    const paidTotal = paidByInstallment.get(inst.id) || 0;
    return { ...inst, paidTotal, remaining: Math.max(0, inst.amount - paidTotal) };
  });

  return {
    orderId: o.id,
    productName: o.product?.name || "—",
    quantity: 1,
    durationMonths: o.plan?.duration_months || 0,
    downPayment: o.down_payment_amount,
    monthlyAmount: o.monthly_amount,
    totalAmount: o.total_amount,
    paymentMethod: o.payment_method,
    date: o.created_at,
    startDate: instList.length > 0 ? instList[0].due_date : undefined,
    endDate: instList.length > 0 ? instList[instList.length - 1].due_date : undefined,
    customerName: o.customer?.full_name || "—",
    customerPhone: o.customer?.phone || "—",
    customerAddress: o.customer?.address || "—",
    installments: instRows.map((inst: any, i: number) => ({
      number: i + 1,
      dueDate: inst.due_date,
      amount: inst.amount,
      status: deriveInstallmentStatus(inst.status, inst.due_date, inst.paidTotal, inst.amount) === "paid" ? "paid" : "pending",
    })),
    payments: payList.map((pmt: any) => ({
      date: pmt.paid_at,
      reference: pmt.reference_no,
      method: pmt.method,
      amount: pmt.amount,
    })),
  };
}
