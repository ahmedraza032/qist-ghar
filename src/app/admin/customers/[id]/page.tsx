"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Check,
} from "lucide-react";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const decodedId = decodeURIComponent(rawId);

  const [loading, setLoading] = React.useState(true);
  const [customerData, setCustomerData] = React.useState<any>(null);
  
  // Extension state
  const [editInstallment, setEditInstallment] = React.useState<any>(null);
  const [paidAmount, setPaidAmount] = React.useState<string>("");
  const [newDueDate, setNewDueDate] = React.useState<string>("");
  const [savingExtension, setSavingExtension] = React.useState(false);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(decodedId)}`);
      const json = await res.json();
      const userOrders = json.orders || [];
      const installments = json.installments || [];
      const payments = json.payments || [];

      const primaryProfile = userOrders[0]?.profile || {
        full_name: decodedId.includes("@") ? decodedId.split("@")[0] : decodedId,
        phone: "0300-1234567",
        city: "Lahore",
        address: "Gulberg III",
      };

      const email = userOrders[0]?.customer_email || decodedId;

      const purchases = userOrders.map((o: any) => {
        const orderInstallments = installments.filter((i: any) => i.order_id === o.id);
        const orderPayments = payments.filter((p: any) => p.order_id === o.id);
        
        const total = o.total_amount || 0;
        const downPayment = o.down_payment_amount || 0;
        
        const pendingInsts = orderInstallments.filter((i: any) => i.status === 'pending').sort((a:any, b:any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        const activeNextDue = pendingInsts.length > 0 ? pendingInsts[0] : null;

        const totalPaidInstallments = orderInstallments.filter((i: any) => i.status === 'paid').length;
        const totalInstallments = orderInstallments.length;

        const totalInstallmentPayments = orderPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const remainingAmount = Math.max(0, total - (downPayment + totalInstallmentPayments));

        const lastPayment = orderPayments.length > 0 ? orderPayments[orderPayments.length - 1] : null;

        // Collect extensions specifically for this order
        const extensions = orderPayments
           .map((p: any) => {
             try {
               const meta = JSON.parse(p.reference_no);
               if (meta && meta.type === "extension") {
                 return { ...meta, date: formatDate(p.paid_at), installment_id: p.installment_id };
               }
             } catch (e) { return null; }
             return null;
           })
           .filter(Boolean);

        return {
          id: o.id,
          productName: o.product?.name || "Purchased Product",
          totalAmount: total,
          downPayment: downPayment,
          downPaymentDate: formatDate(o.created_at),
          lastPaidDate: lastPayment ? formatDate(lastPayment.paid_at) : formatDate(o.created_at),
          lastPaidAmount: lastPayment ? lastPayment.amount : downPayment,
          activeNextDue: activeNextDue,
          extensions: extensions,
          paidInstallmentsCount: Math.max(totalPaidInstallments, orderPayments.length),
          remainingInstallmentsCount: Math.max(0, Math.max(totalInstallments, o.installment_plans?.duration_months || 3) - Math.max(totalPaidInstallments, orderPayments.length)),
          durationMonths: Math.max(totalInstallments, o.installment_plans?.duration_months || 3),
          status: o.status,
          remainingAmount,
        };
      });

      setCustomerData({
        id: decodedId,
        full_name: primaryProfile.full_name || "Customer",
        email: email,
        phone: primaryProfile.phone || "0300-1234567",
        city: primaryProfile.city || "Lahore",
        address: primaryProfile.address || "Gulberg III",
        purchases: purchases,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedId]);

  const handleExtend = async () => {
    if (!editInstallment || !paidAmount || !newDueDate) return;
    setSavingExtension(true);
    try {
      const res = await fetch("/api/admin/installments/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installment_id: editInstallment.id,
          paid_amount: parseFloat(paidAmount),
          new_due_date: newDueDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditInstallment(null);
        setPaidAmount("");
        setNewDueDate("");
        await loadCustomer();
      } else {
        alert("Failed to extend: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setSavingExtension(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const customer = customerData || {};
  const purchasesList = customer.purchases || [];

  const totalSpent = purchasesList.reduce((sum: number, p: any) => sum + p.totalAmount, 0);
  const totalDownPaymentsPaid = purchasesList.reduce((sum: number, p: any) => sum + p.downPayment, 0);
  const totalRemainingOwed = purchasesList.reduce((sum: number, p: any) => sum + p.remainingAmount, 0);
  
  // Find all active next dues across all purchases
  const allNextDuesWithMeta = purchasesList
    .filter((p: any) => p.activeNextDue)
    .map((p: any) => {
      const isExtended = p.extensions?.some((e: any) => e.installment_id === p.activeNextDue.id);
      return {
        ...p.activeNextDue,
        productName: p.productName,
        isExtended,
      };
    });

  // Prioritize active next dues that have been extended, otherwise sort by due date ascending
  const extendedDues = allNextDuesWithMeta.filter((d: any) => d.isExtended);
  
  const globalNextDue = extendedDues.length > 0
    ? extendedDues.sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
    : (allNextDuesWithMeta.length > 0
        ? allNextDuesWithMeta.sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
        : null);

  const totalNextDueAmount = globalNextDue ? globalNextDue.amount : 0;
  const isEarliestExtended = globalNextDue ? globalNextDue.isExtended : false;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      {/* Header Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/orders" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{customer.full_name}</span>
      </div>

      {/* Profile Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-card border border-border p-6 rounded-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            {customer.full_name?.charAt(0).toUpperCase() || "C"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{customer.full_name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {customer.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {customer.city}, {customer.address}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="w-fit text-xs px-3 py-1 bg-primary/5 text-primary border-primary/30">
          Verified Customer
        </Badge>
      </div>

      {/* Key Financial Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchasesList.length} Items</div>
            <p className="text-xs text-muted-foreground mt-0.5">Total: {formatPKR(totalSpent)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Paid Upfront</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{formatPKR(totalDownPaymentsPaid)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Down payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Next Due Installment</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500 flex items-center gap-2">
              {globalNextDue ? formatPKR(totalNextDueAmount) : "Rs 0"}
              {isEarliestExtended && (
                <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Extended
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Due Date: <span className="font-semibold text-foreground">{globalNextDue ? formatDate(globalNextDue.due_date) : "None"}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Remaining Owed</CardTitle>
            <AlertCircle className="h-4 w-4 text-amount" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amount">{formatPKR(totalRemainingOwed)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Outstanding balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Purchases & Installment Timeline Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Purchase & Installment Timeline Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground text-left">
                  <th className="py-3 px-3 font-medium">Order ID & Product</th>
                  <th className="py-3 px-3 font-medium text-right">Total Price</th>
                  <th className="py-3 px-3 font-medium text-right">Down Payment</th>
                  <th className="py-3 px-3 font-medium text-center">Last Payment</th>
                  <th className="py-3 px-3 font-medium text-left">Next Due Date</th>
                  <th className="py-3 px-3 font-medium text-center">Installments Status</th>
                  <th className="py-3 px-3 font-medium text-right">Order Status</th>
                </tr>
              </thead>
              <tbody>
                {purchasesList.map((p: any) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/20">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{p.productName}</div>
                      <div className="font-mono text-xs text-muted-foreground">#{p.id.slice(0, 8)}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium">{formatPKR(p.totalAmount)}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-medium text-emerald-500">{formatPKR(p.downPayment)}</div>
                      <div className="text-[10px] text-muted-foreground">Paid on {p.downPaymentDate}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="font-medium text-foreground">{formatPKR(p.lastPaidAmount)}</div>
                      <div className="text-[10px] text-muted-foreground">{p.lastPaidDate}</div>
                    </td>
                    <td className="py-3 px-3 text-left">
                      {p.status === "completed" ? (
                        <span className="text-xs text-emerald-500 font-medium">Completed</span>
                      ) : p.activeNextDue ? (
                        <div className="flex flex-col gap-2">
                          {p.extensions?.filter((ext:any) => ext.installment_id === p.activeNextDue.id).map((ext: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 opacity-60 line-through decoration-muted-foreground text-muted-foreground">
                              <div className="font-semibold">{formatDate(ext.original_due_date)}</div>
                              <div className="text-xs">{formatPKR(ext.original_amount)}</div>
                              <Badge variant="outline" className="text-[9px] px-1 h-4 ml-1">→ Extended</Badge>
                            </div>
                          ))}
                          <div className="flex items-center justify-between bg-muted/40 p-2 rounded-md border border-border">
                            <div>
                              <div className="font-bold text-amber-500 flex items-center gap-2">
                                {formatDate(p.activeNextDue.due_date)}
                                {p.extensions?.some((e:any) => e.installment_id === p.activeNextDue.id) && (
                                  <Badge variant="outline" className="text-[9px] px-1 h-4 bg-amber-500/10 text-amber-500 border-amber-500/20">Extended Date</Badge>
                                )}
                              </div>
                              <div className="text-xs font-medium text-foreground">{formatPKR(p.activeNextDue.amount)}</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 hover:bg-background"
                              onClick={() => setEditInstallment(p.activeNextDue)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No pending installments</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="outline" className="text-xs">
                        {p.paidInstallmentsCount} of {p.durationMonths} Paid ({p.remainingInstallmentsCount} Remaining)
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Badge variant={p.status === "completed" ? "success" : "default"}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Installment Dialog */}
      <Dialog open={!!editInstallment} onOpenChange={(open) => !open && setEditInstallment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Due Installment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-3 rounded-md text-sm mb-4">
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Current Due Amount:</span>
                <span className="font-medium text-foreground">{editInstallment ? formatPKR(editInstallment.amount) : "0"}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Current Due Date:</span>
                <span className="font-medium text-foreground">{editInstallment ? formatDate(editInstallment.due_date) : "N/A"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount Received Today</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">Rs</span>
                <Input
                  type="number"
                  className="pl-8"
                  placeholder="e.g. 30000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  max={editInstallment ? editInstallment.amount - 1 : 0}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the partial payment amount. The remaining balance will be pushed to the new date.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>New Extended Due Date</Label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditInstallment(null)}>Cancel</Button>
            <Button onClick={handleExtend} disabled={savingExtension || !paidAmount || !newDueDate || parseFloat(paidAmount) >= editInstallment?.amount}>
              {savingExtension ? "Saving..." : "Save Extension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
