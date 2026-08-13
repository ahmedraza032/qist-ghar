"use client";

import React from "react";
import { X, CheckCircle, Loader2, Smartphone, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { cn } from "@/lib/utils";

interface PayInstallmentModalProps {
  installmentId: string;
  orderId: string;
  amount: number;
  dueDate: string;
  installmentNumber: number;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = "jazzcash" | "easypaisa" | "bank" | "card";
type Step = "select-method" | "details" | "otp" | "processing" | "success" | "error";

const methods: {
  id: PaymentMethod;
  name: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "jazzcash", name: "JazzCash", icon: Smartphone, color: "#E31B23" },
  { id: "easypaisa", name: "Easypaisa", icon: Smartphone, color: "#07A800" },
  { id: "bank", name: "Bank Transfer", icon: Building2, color: "#1E40AF" },
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, color: "#6366F1" },
];

export function PayInstallmentModal({
  installmentId,
  orderId,
  amount,
  dueDate,
  installmentNumber,
  onClose,
  onSuccess,
}: PayInstallmentModalProps) {
  const [step, setStep] = React.useState<Step>("select-method");
  const [method, setMethod] = React.useState<PaymentMethod | null>(null);
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [error, setError] = React.useState("");
  const [refNo, setRefNo] = React.useState("");

  function selectMethod(m: PaymentMethod) {
    setMethod(m);
    if (m === "bank") {
      setStep("processing");
    } else if (m === "card") {
      setStep("details");
    } else {
      setStep("details");
    }
  }

  function handleProceed() {
    setStep("otp");
  }

  function handleOtpSubmit() {
    setStep("processing");
    setTimeout(() => executePayment(), 1500);
  }

  function handleCardSubmit() {
    setStep("processing");
    setTimeout(() => executePayment(), 2000);
  }

  function handleBankConfirm() {
    setTimeout(() => executePayment(), 1500);
  }

  async function executePayment() {
    setError("");
    try {
      const res = await fetch("/api/payments/pay-installment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installment_id: installmentId,
          order_id: orderId,
          payment_method: method,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Payment failed");
        setStep("error");
        return;
      }

      setRefNo(data.referenceNo);
      setStep("success");
    } catch {
      setError("Network error. Please try again.");
      setStep("error");
    }
  }

  function handleDone() {
    onSuccess();
    onClose();
  }

  function handleBack() {
    setStep("select-method");
    setMethod(null);
    setError("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-xl shadow-xl border border-border w-full max-w-sm mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {step === "select-method" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pay Installment</h3>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Installment</span>
                <span className="font-medium">#{installmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">{formatDate(dueDate)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">{formatPKR(amount)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">Choose payment method</p>
            <div className="grid gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectMethod(m.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left",
                    method === m.id && "border-primary bg-primary/5"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: m.color }}
                  >
                    <m.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{m.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "details" && (method === "jazzcash" || method === "easypaisa") && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{method === "jazzcash" ? "JazzCash" : "Easypaisa"}</h3>
              <button onClick={handleBack} className="p-1 hover:bg-muted rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatPKR(amount)}</span>
              </div>
              <Button onClick={handleProceed} className="w-full">
                Proceed
              </Button>
            </div>
          </>
        )}

        {step === "details" && method === "card" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Card Payment</h3>
              <button onClick={handleBack} className="p-1 hover:bg-muted rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatPKR(amount)}</span>
              </div>
              <Button onClick={handleCardSubmit} className="w-full">
                Pay {formatPKR(amount)}
              </Button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Verification</h3>
              <button onClick={handleBack} className="p-1 hover:bg-muted rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter the 4-digit code sent to your mobile (simulated).
              </p>
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <Input
                  type="text"
                  maxLength={4}
                  placeholder="1234 (any 4 digits)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatPKR(amount)}</span>
              </div>
              <Button onClick={handleOtpSubmit} className="w-full" disabled={otp.length !== 4}>
                Verify &amp; Pay {formatPKR(amount)}
              </Button>
            </div>
          </>
        )}

        {step === "processing" && method === "bank" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bank Transfer</h3>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="rounded-md bg-muted p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">HBL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-medium">XXXX-1902</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">{formatPKR(amount)}</span>
                </div>
              </div>
              <Button onClick={handleBankConfirm} className="w-full">
                I&apos;ve transferred the amount
              </Button>
            </div>
          </>
        )}

        {step === "processing" && method !== "bank" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Processing Payment</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-4">
            <CheckCircle className="h-14 w-14 text-green-500 mb-4" />
            <p className="text-lg font-semibold">Payment Successful!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Installment #{installmentNumber} paid
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-2">{refNo}</p>
            <Button onClick={handleDone} className="w-full mt-6">
              Done
            </Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center py-4">
            <X className="h-14 w-14 text-destructive mb-4" />
            <p className="text-lg font-semibold">Payment Failed</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <div className="flex gap-2 mt-6 w-full">
              <Button variant="outline" onClick={() => setStep("select-method")} className="flex-1">
                Try Again
              </Button>
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
