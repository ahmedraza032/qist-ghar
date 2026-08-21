import { createServiceClient } from "@/lib/supabase/server";
import { formatPKR } from "@/lib/helpers/format";
import { Card, CardContent } from "@/components/ui/card";
import { InstallmentsTable } from "@/components/admin/installments-table";
import { deriveInstallmentStatus } from "@/lib/helpers/installments";

import { Clock, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/stat-card";

export const dynamic = "force-dynamic";

export default async function AdminInstallmentsPage() {
  const supabase = await createServiceClient();

  const [instRes, payRes] = await Promise.all([
    supabase
      .from("installments")
      .select("id, due_date, amount, status, paid_date, order:orders(id, product:products(name), customer:customers(full_name))")
      .order("due_date"),
    supabase.from("payments").select("installment_id, amount"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const installments = (instRes.data || []) as any[];

  const paidByInstallment = new Map<string, number>();
  (payRes.data || []).forEach((p: any) => {
    if (p.installment_id) {
      paidByInstallment.set(p.installment_id, (paidByInstallment.get(p.installment_id) || 0) + (p.amount || 0));
    }
  });

  const list = installments.map((i) => {
    const paidTotal = paidByInstallment.get(i.id) || 0;
    return { ...i, paidTotal, remaining: Math.max(0, i.amount - paidTotal) };
  });

  const now = new Date();
  const isThisMonth = (dueDate: string) => {
    const d = new Date(dueDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const active = list.filter((i) => deriveInstallmentStatus(i.status, i.due_date, i.paidTotal, i.amount) === "pending" || deriveInstallmentStatus(i.status, i.due_date, i.paidTotal, i.amount) === "partial");
  const completed = list.filter((i) => deriveInstallmentStatus(i.status, i.due_date, i.paidTotal, i.amount) === "paid");
  const overdue = list.filter((i) => deriveInstallmentStatus(i.status, i.due_date, i.paidTotal, i.amount) === "overdue");
  const dueThisMonth = list.filter((i) => deriveInstallmentStatus(i.status, i.due_date, i.paidTotal, i.amount) !== "paid" && isThisMonth(i.due_date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Installment Tracker</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Installments"
          value={active.length}
          subtitle={`${formatPKR(active.reduce((s: number, i: any) => s + (i.amount || 0), 0))} outstanding`}
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          valueClassName="text-amber-600"
          delayMs={0}
        />
        <StatCard
          title="Completed Installments"
          value={completed.length}
          subtitle={`${formatPKR(completed.reduce((s: number, i: any) => s + (i.amount || 0), 0))} collected`}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          valueClassName="text-emerald-600"
          delayMs={40}
        />
        <StatCard
          title="Overdue"
          value={overdue.length}
          subtitle={`${formatPKR(overdue.reduce((s: number, i: any) => s + (i.amount || 0), 0))} outstanding`}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          valueClassName="text-destructive"
          delayMs={80}
        />
        <StatCard
          title="Due This Month"
          value={dueThisMonth.length}
          subtitle={`${formatPKR(dueThisMonth.reduce((s: number, i: any) => s + (i.amount || 0), 0))} expected`}
          icon={<Calendar className="h-4 w-4 text-amber-600" />}
          valueClassName="text-amber-600"
          delayMs={120}
        />
      </div>

      <InstallmentsTable installments={list} />
    </div>
  );
}
