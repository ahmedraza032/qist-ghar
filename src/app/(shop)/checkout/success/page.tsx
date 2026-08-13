"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Download, Home, Receipt } from "lucide-react";
import { formatPKR, formatDate } from "@/lib/helpers/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { downloadReceipt } from "@/components/shop/receipt-pdf";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <CheckoutSuccessPageInner />
    </Suspense>
  );
}

function CheckoutSuccessPageInner() {
  const searchParams = useSearchParams();

  const ref = searchParams.get("reference") || "";
  const paymentMethod = searchParams.get("payment_method") || "";
  const customerName = searchParams.get("name") || "";
  const customerPhone = searchParams.get("phone") || "";
  const productName = searchParams.get("product_name") || "";
  const total = parseInt(searchParams.get("total") || "0");
  const monthly = parseInt(searchParams.get("monthly") || "0");
  const duration = parseInt(searchParams.get("duration") || "3");
  const orderId = `MOCK-${Date.now()}`;

  const allInstallments = Array.from({ length: duration }, (_, i) => ({
    number: i + 1,
    product: productName,
    dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: monthly,
    status: i === 0 ? "paid" : "pending",
  }));

  function handleDownload() {
    downloadReceipt({
      orderId,
      productName,
      durationMonths: duration,
      downPayment: Math.round(total * 0.2),
      monthlyAmount: monthly,
      totalAmount: total,
      paymentMethod: paymentMethod === "jazzcash" ? "JazzCash" : paymentMethod === "easypaisa" ? "Easypaisa" : paymentMethod === "bank" ? "Bank Transfer" : "Card",
      date: new Date().toISOString(),
      customerName,
      customerPhone,
      customerAddress: searchParams.get("address") || "",
      installments: allInstallments,
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Your order has been placed successfully.
        </p>
      </div>

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Details</CardTitle>
          <CardDescription>Reference: {ref}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{formatDate(new Date())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer</span>
            <span className="font-medium">{customerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{customerPhone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium capitalize">{paymentMethod}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-semibold">Total Amount</span>
            <span className="text-xl font-bold text-primary">{formatPKR(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Product Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{productName}</p>
              <p className="text-sm text-muted-foreground">
                {duration} months · {formatPKR(monthly)}/mo
              </p>
            </div>
            <span className="font-semibold">{formatPKR(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Installment Schedule */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Installment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Product</th>
                  <th className="text-left py-2 font-medium">Due Date</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                  <th className="text-right py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {allInstallments.map((inst: any, idx: number) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="py-2">{inst.number}</td>
                    <td className="py-2 text-xs max-w-[100px] truncate">{inst.product}</td>
                    <td className="py-2">{formatDate(inst.dueDate)}</td>
                    <td className="py-2 text-right">{formatPKR(inst.amount)}</td>
                    <td className="py-2 text-right">
                      <Badge variant={inst.status === "paid" ? "success" : "warning"}>
                        {inst.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleDownload} variant="outline" className="gap-2 flex-1">
          <Download className="h-4 w-4" /> Download Receipt (PDF)
        </Button>
        <Link href="/" className="flex-1">
          <Button className="w-full gap-2">
            <Home className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
