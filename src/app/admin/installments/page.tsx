import { createServiceClient } from "@/lib/supabase/server";
import { formatPKR } from "@/lib/helpers/format";
import { Card, CardContent } from "@/components/ui/card";
import { InstallmentsTable } from "@/components/admin/installments-table";

export const dynamic = "force-dynamic";

export default async function AdminInstallmentsPage() {
  const supabase = await createServiceClient();

  const { data: installments } = await supabase
    .from("installments")
    .select("id, due_date, amount, status, paid_date, order:orders(id, product:products(name), profile:profiles(full_name))")
    .order("due_date");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = (installments || []) as any[];

  const now = new Date();
  const isThisMonth = (dueDate: string) => {
    const d = new Date(dueDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const active = list.filter((i) => i.status === "pending");
  const completed = list.filter((i) => i.status === "paid");
  const overdue = list.filter((i) => i.status === "overdue");
  const dueThisMonth = list.filter((i) => i.status === "pending" && isThisMonth(i.due_date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Installment Tracker</h1>
        <p className="text-muted-foreground mt-1">{list.length} total installments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Active Installments</p>
            <p className="text-3xl font-bold text-amber-600">{active.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPKR(active.reduce((s: number, i: any) => s + (i.amount || 0), 0))} outstanding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Completed Installments</p>
            <p className="text-3xl font-bold text-primary">{completed.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPKR(completed.reduce((s: number, i: any) => s + (i.amount || 0), 0))} collected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-3xl font-bold text-destructive">{overdue.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPKR(overdue.reduce((s: number, i: any) => s + (i.amount || 0), 0))} outstanding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Due This Month</p>
            <p className="text-3xl font-bold text-amber-600">{dueThisMonth.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPKR(dueThisMonth.reduce((s: number, i: any) => s + (i.amount || 0), 0))} expected
            </p>
          </CardContent>
        </Card>
      </div>

      <InstallmentsTable installments={list} />
    </div>
  );
}
