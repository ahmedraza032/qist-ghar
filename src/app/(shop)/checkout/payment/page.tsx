"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Smartphone,
  Building2,
  CreditCard,
  Loader2,
} from "lucide-react";
import { formatPKR } from "@/lib/helpers/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PaymentMethod = "jazzcash" | "easypaisa" | "bank" | "card";
type PaymentStep = "select" | "processing" | "otp" | "success" | "error";

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

function PaymentPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <PaymentPageInner />
    </Suspense>
  );
}

function PaymentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const customerName = searchParams.get("name") || "";
  const customerPhone = searchParams.get("phone") || "";
  const customerAddress = searchParams.get("address") || "";
  const customerCity = searchParams.get("city") || "";

  const total = parseInt(searchParams.get("total") || "0");
  const monthly = parseInt(searchParams.get("monthly") || "0");
  const downPayment = parseInt(searchParams.get("down_payment") || "0");
  const dueToday = downPayment;
  const productName = searchParams.get("product_name") || "";

  const [method, setMethod] = React.useState<PaymentMethod | null>(null);
  const [step, setStep] = React.useState<PaymentStep>("select");

  // Mock form state
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [paymentError, setPaymentError] = React.useState("");

  React.useEffect(() => {
    if (total <= 0) {
      router.push("/products");
    }
  }, [total, router]);

  function selectMethod(m: PaymentMethod) {
    setMethod(m);
    if (m === "bank") {
      showBankDetails();
    }
  }

  function showBankDetails() {
    setStep("processing");
  }

  function handleJazzCashSubmit() {
    setStep("otp");
  }

  function handleOtpSubmit() {
    setStep("processing");
    setTimeout(() => {
      processPayment();
    }, 1500);
  }

  function handleCardSubmit() {
    setStep("processing");
    setTimeout(() => {
      processPayment();
    }, 2000);
  }

  function processPayment() {
    setTimeout(async () => {
      try {
        const body = {
          product_id: searchParams.get("product_id"),
          duration: duration,
          down_payment: downPayment,
          monthly: monthly,
          total: total,
          payment_method: method,
        };

        const res = await fetch("/api/payments/mock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (data.success) {
          setPaymentError("");
          const params = new URLSearchParams({
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            city: customerCity,
            payment_method: method || "",
            reference: data.referenceNo,
            product_name: productName,
            total: String(total),
            monthly: String(monthly),
            duration: String(duration),
          });

          setStep("success");
          setTimeout(() => {
            router.push(`/checkout/success?${params.toString()}`);
          }, 1000);
        } else {
          setPaymentError(data.error || "Payment failed");
          setStep("error");
        }
      } catch {
        setPaymentError("Network error — please try again");
        setStep("error");
      }
    }, 500);
  }

  function handleBankConfirm() {
    setStep("processing");
    setTimeout(() => processPayment(), 1500);
  }

  if (total <= 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/checkout"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to delivery info
      </Link>

      <h1 className="text-3xl font-bold mb-2">Payment</h1>
      <p className="text-muted-foreground mb-8">
        Total: <span className="font-bold text-foreground">{formatPKR(dueToday)}</span>
      </p>

      {step === "select" && (
        <div className="grid gap-3">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => selectMethod(m.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left",
                method === m.id && "border-primary bg-primary/5"
              )}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: m.color }}
              >
                <m.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{m.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* JazzCash */}
      {step === "select" && method === "jazzcash" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#E31B23]" /> JazzCash
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>JazzCash Mobile Number</Label>
              <Input
                type="tel"
                placeholder="03XX XXXXXXX"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            <Button onClick={handleJazzCashSubmit} className="w-full bg-[#E31B23] hover:bg-[#C4171D]">
              Proceed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Easypaisa */}
      {step === "select" && method === "easypaisa" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#07A800]" /> Easypaisa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Easypaisa Mobile Number</Label>
              <Input
                type="tel"
                placeholder="03XX XXXXXXX"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            <Button onClick={handleJazzCashSubmit} className="w-full bg-[#07A800] hover:bg-[#068F00]">
              Proceed
            </Button>
          </CardContent>
        </Card>
      )}

      {/* OTP step */}
      {step === "otp" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {method === "jazzcash" ? "JazzCash" : "Easypaisa"} Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the 4-digit code sent to your mobile number (simulated).
            </p>
            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <Input
                type="text"
                maxLength={4}
                placeholder="1234 (any 4 digits in demo)"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <Button
              onClick={handleOtpSubmit}
              className="w-full"
              disabled={otp.length !== 4}
            >
              Verify &amp; Pay {formatPKR(dueToday)}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card */}
      {step === "select" && method === "card" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-500" /> Card Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleCardSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Pay {formatPKR(dueToday)}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bank Transfer */}
      {step === "processing" && method === "bank" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span className="font-medium">Habib Bank Limited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Title</span>
                <span className="font-medium">QistGhar Pvt Ltd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-medium">XXXX-XXXX-1902</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatPKR(dueToday)}</span>
              </div>
            </div>
            <Button onClick={handleBankConfirm} className="w-full">
              I&apos;ve transferred the amount
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing */}
      {step === "processing" && method !== "bank" && (
        <Card className="text-center py-12">
          <CardContent>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold mt-4">Processing Payment</h2>
            <p className="text-muted-foreground mt-2">
              Please wait while we process your payment...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {step === "success" && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mt-4">Payment Successful!</h2>
            <p className="text-muted-foreground mt-2">
              Redirecting to order confirmation...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {step === "error" && (
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-xl font-semibold text-destructive">Payment Failed</h2>
            <p className="text-muted-foreground mt-2">{paymentError || "Something went wrong. Please try again."}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setStep("select")}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
       )}
    </div>
  );
}

export default PaymentPage;
