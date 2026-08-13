"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Check, Loader2 } from "lucide-react";
import { formatPKR } from "@/lib/helpers/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkoutWithWhatsApp } from "@/lib/actions/checkout-whatsapp";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>}>
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productParam = searchParams.get("product_id");

  // Build checkout item from query params (direct purchase)
  const checkoutItem = productParam
    ? {
        productId: productParam,
        productName: searchParams.get("product_name") || "",
        productSlug: searchParams.get("product_slug") || "",
        productImage: searchParams.get("product_image") || "",
        basePrice: parseInt(searchParams.get("base_price") || "0"),
        durationMonths: parseInt(searchParams.get("duration") || "3"),
        markupPercent: parseInt(searchParams.get("markup") || "0"),
        downPayment: parseInt(searchParams.get("down_payment") || "0"),
        monthlyPayment: parseInt(searchParams.get("monthly") || "0"),
        totalPrice: parseInt(searchParams.get("total") || "0"),
      }
    : null;

  const basePrice = checkoutItem?.basePrice || 0;
  const minDownPayment = Math.ceil(basePrice * 0.25);
  const initialDP = checkoutItem?.downPayment && checkoutItem.downPayment >= minDownPayment
    ? checkoutItem.downPayment
    : minDownPayment;

  const [customDownPayment, setCustomDownPayment] = React.useState<number>(initialDP);

  const durationMonths = checkoutItem?.durationMonths || 3;
  const totalPrice = checkoutItem?.totalPrice || 0;
  const activeDownPayment = Math.max(minDownPayment, customDownPayment || minDownPayment);
  const calculatedMonthly = Math.round(Math.max(0, totalPrice - activeDownPayment) / durationMonths);
  const dueToday = activeDownPayment;

  const items = checkoutItem ? [checkoutItem] : [];

  // Calculate installment dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + (checkoutItem?.durationMonths || 3));

  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [waLink, setWaLink] = React.useState("");

  React.useEffect(() => {
    if (!checkoutItem) {
      router.push("/products");
    }
  }, [checkoutItem, router]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!checkoutItem) return;

    setIsSubmitting(true);
    try {
      const result = await checkoutWithWhatsApp({
        productId: checkoutItem.productId,
        productName: checkoutItem.productName,
        duration: checkoutItem.durationMonths,
        downPayment: activeDownPayment,
        monthly: calculatedMonthly,
        total: checkoutItem.totalPrice,
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
      });

      setWaLink(result.url);
      setIsSuccess(true);

      // Attempt to open WhatsApp
      window.open(result.url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!checkoutItem) return null;

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold">Order Sent to WhatsApp!</h1>
        <p className="text-muted-foreground text-lg">
          Your order has been placed and handed off to our team via WhatsApp for confirmation.
        </p>
        <Card className="bg-muted/50 mt-8 text-left">
          <CardContent className="pt-6">
            <p className="text-sm mb-4 text-center">If WhatsApp didn&apos;t open automatically, click the button below:</p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md text-sm font-medium bg-[#25D366] hover:bg-[#128C7E] text-white w-full"
            >
              <MessageCircle className="h-5 w-5" />
              Open WhatsApp
            </a>
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => router.push("/products")}>
                Return to Shop
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ahmed Khan"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="03XX XXXXXXX"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="House #, Street, Area"
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <MessageCircle className="h-5 w-5" /> Continue to WhatsApp
              </>
            )}
          </Button>
        </form>

        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.productId}>
                  <p className="font-medium">{item.productName}</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Price</span>
                      <span>{formatPKR(item.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{item.durationMonths} months</span>
                    </div>

                    <div className="space-y-1 py-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Down Payment</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground font-mono">Rs</span>
                          <Input
                            type="number"
                            min={minDownPayment}
                            className="h-8 w-28 text-right font-semibold text-foreground text-sm"
                            value={customDownPayment}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setCustomDownPayment(val);
                            }}
                            onBlur={() => {
                              if (customDownPayment < minDownPayment) {
                                setCustomDownPayment(minDownPayment);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground text-right">
                        Min 25% required: <span className="font-medium text-foreground">{formatPKR(minDownPayment)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Installment</span>
                      <span className="font-medium text-primary">{formatPKR(calculatedMonthly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost</span>
                      <span className="font-medium">{formatPKR(customDownPayment + calculatedMonthly * item.durationMonths)}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Starts</span>
                        <span className="font-medium">{startDate.toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ends</span>
                        <span className="font-medium">{endDate.toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-3">
                    <span className="font-semibold">Due Today</span>
                    <span className="font-bold text-lg">{formatPKR(dueToday)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
