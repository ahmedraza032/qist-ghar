import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomersTable } from "@/components/admin/customers-table";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const supabase = await createServiceClient();

  const [custRes, ordersRes, payRes] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("customer_id, total_amount, down_payment_amount"),
    supabase.from("payments").select("order_id, amount"),
  ]);

  const customers = custRes.data || [];
  const orders = ordersRes.data || [];
  const payments = payRes.data || [];

  const paidByOrder = new Map<string, number>();
  payments.forEach((p: any) => {
    paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) || 0) + (p.amount || 0));
  });

  const statsByCustomer = new Map<string, { orders: number; spent: number; outstanding: number }>();
  orders.forEach((o: any) => {
    const cur = statsByCustomer.get(o.customer_id) || { orders: 0, spent: 0, outstanding: 0 };
    cur.orders += 1;
    cur.spent += o.total_amount || 0;
    const paid = (paidByOrder.get(o.id) || 0) + (o.down_payment_amount || 0);
    cur.outstanding += Math.max(0, (o.total_amount || 0) - paid);
    statsByCustomer.set(o.customer_id, cur);
  });

  const rows = customers.map((c: any) => {
    const s = statsByCustomer.get(c.id) || { orders: 0, spent: 0, outstanding: 0 };
    return { ...c, orders_count: s.orders, total_spent: s.spent, outstanding: s.outstanding };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">{rows.length} customers in ledger</p>
        </div>
        <Link href="/admin/customers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </Link>
      </div>

      <CustomersTable customers={rows} />
    </div>
  );
}
