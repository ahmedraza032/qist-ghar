"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatPKR } from "@/lib/helpers/format";

const METHODS = ["cash", "jazzcash", "easypaisa", "bank", "card"];

export function RecordPaymentButton({
  installmentId,
  dueAmount,
  remaining,
  size = "sm",
}: {
  installmentId: string;
  dueAmount: number;
  remaining: number;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const { addToast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState("cash");
  const [paidDate, setPaidDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [newDueDate, setNewDueDate] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const amountNum = parseFloat(amount) || 0;
  const isPartial = remaining > 0 && amountNum < remaining;

  function openDialog() {
    setAmount(String(remaining));
    setMethod("cash");
    setPaidDate(new Date().toISOString().split("T")[0]);
    setNewDueDate("");
    setOpen(true);
  }

  async function handleSubmit() {
    if (amountNum <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/installments/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installment_id: installmentId,
          amount: amountNum,
          method,
          paid_date: paidDate,
          new_due_date: isPartial && newDueDate ? newDueDate : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast({
          title: "Payment recorded",
          description: `Rs ${amountNum.toLocaleString()} applied. ${data.remaining > 0 ? `Rs ${data.remaining.toLocaleString()} remaining.` : "Installment fully paid."}`,
        });
        setOpen(false);
        router.refresh();
      } else {
        addToast({ title: "Error", description: data.error || "Failed to record payment", variant: "destructive" });
      }
    } catch {
      addToast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="outline" size={size} onClick={openDialog} className="gap-1">
        <Wallet className="h-3 w-3" />
        Pay
      </Button>

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Due Amount:</span>
                <span className="font-medium text-foreground">{formatPKR(dueAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Remaining:</span>
                <span className="font-medium text-foreground">{formatPKR(remaining)}</span>
              </div>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Amount Received (Rs)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(remaining)}
                className="min-h-[44px] text-[16px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" className="min-h-[44px] w-full sm:w-auto" onClick={() => setAmount(String(remaining))}>
                  Full ({formatPKR(remaining)})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label>Payment Method</Label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="min-h-[44px] text-[16px] w-full rounded-md border border-input bg-background px-3 py-2 capitalize"
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>{m === "bank" ? "Bank Transfer" : m === "card" ? "Card" : m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 flex flex-col">
                <Label>Payment Date</Label>
                <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} className="min-h-[44px] text-[16px]" />
              </div>
            </div>

            {isPartial && (
              <div className="space-y-2 flex flex-col border-t border-border pt-5 mt-2">
                <Label className="text-amber-600 font-semibold flex flex-wrap items-center gap-2">
                  Extended Next Due Date
                  <span className="text-xs font-normal text-muted-foreground">(For remaining balance)</span>
                </Label>
                <Input 
                  type="date" 
                  value={newDueDate} 
                  onChange={(e) => setNewDueDate(e.target.value)} 
                  className="min-h-[44px] text-[16px]" 
                />
                <p className="text-xs text-muted-foreground mt-1">Since this is a partial payment, you can log a new due date for the remaining {formatPKR(remaining - amountNum)}.</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button variant="outline" className="min-h-[44px] w-full sm:w-auto" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="min-h-[44px] w-full sm:w-auto" onClick={handleSubmit} disabled={saving || amountNum <= 0 || amountNum > remaining}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isPartial ? "Record Partial Payment" : "Record Full Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
