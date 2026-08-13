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
  const [saving, setSaving] = React.useState(false);

  const amountNum = parseFloat(amount) || 0;
  const isPartial = remaining > 0 && amountNum < remaining;

  function openDialog() {
    setAmount(String(remaining));
    setMethod("cash");
    setPaidDate(new Date().toISOString().split("T")[0]);
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

          <div className="space-y-4 py-2">
            <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Due Amount:</span>
                <span className="font-medium text-foreground">{formatPKR(dueAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Remaining:</span>
                <span className="font-medium text-foreground">{formatPKR(remaining)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount Received (Rs)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(remaining)}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setAmount(String(remaining))}>
                  Full ({formatPKR(remaining)})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>{m === "bank" ? "Bank Transfer" : m === "card" ? "Card" : m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving || amountNum <= 0 || amountNum > remaining}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isPartial ? "Record Partial Payment" : "Record Full Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
