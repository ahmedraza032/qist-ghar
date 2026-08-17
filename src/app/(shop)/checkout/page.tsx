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
import { AnimatedFAQ } from "@/components/shop/animated-faq";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-secondary font-sans bg-bg min-h-screen">Loading...</div>}>
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
        variantId: searchParams.get("variant_id") || "",
        variantName: searchParams.get("variant_name") || "",
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
  
  const nextPaymentDate = new Date(startDate);
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

  const finalPaymentDate = new Date(startDate);
  finalPaymentDate.setMonth(finalPaymentDate.getMonth() + (checkoutItem?.durationMonths || 3));

  const formatDate = (date: Date) => date.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });

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
        variantId: checkoutItem.variantId,
        variantName: checkoutItem.variantName,
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
      <div className="min-h-screen bg-bg">
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary-subtle text-primary rounded-full flex items-center justify-center mb-6 shadow-[var(--shadow-sm)]">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-[32px] font-heading font-semibold text-text-primary">Order Sent to WhatsApp!</h1>
          <p className="text-text-secondary font-sans text-lg">
            Your order has been placed and handed off to our team via WhatsApp for confirmation.
          </p>
          <div className="bg-surface border border-border shadow-[var(--shadow-xs)] rounded-[var(--radius-card)] p-8 mt-8 text-left">
            <p className="text-[15px] font-sans text-text-primary mb-6 text-center font-medium">If WhatsApp didn&apos;t open automatically, click the button below:</p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-[var(--radius-control)] text-[16px] font-sans font-medium bg-[#25D366] hover:bg-[#128C7E] text-white w-full transition-colors shadow-[var(--shadow-sm)]"
            >
              <MessageCircle className="h-5 w-5 text-white" />
              Open WhatsApp
            </a>
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={() => router.push("/products")} className="font-sans text-text-secondary hover:text-text-primary hover:bg-surface-alt">
                Return to Shop
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6 font-sans font-medium"
        >
          <ArrowLeft className="h-[14px] w-[14px]" /> Back to products
        </Link>

        <h1 className="font-heading font-semibold text-[32px] text-text-primary mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
            <div className="interactive-card-blue bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-xs)] p-6 md:p-8 space-y-6 border border-border">
              <h2 className="font-heading font-semibold text-[18px] text-text-primary">Delivery Information</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-sans font-medium text-[13px] text-text-primary">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Ahmed Khan"
                    className="h-12 px-3 bg-surface border border-border rounded-[var(--radius-control)] hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-0 placeholder:text-text-tertiary transition-all duration-200 font-sans text-[15px] text-text-primary shadow-none"
                  />
                  {errors.name && (
                    <p className="text-[13px] text-destructive font-sans font-medium mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-sans font-medium text-[13px] text-text-primary">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="03XX XXXXXXX"
                    className="h-12 px-3 bg-surface border border-border rounded-[var(--radius-control)] hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-0 placeholder:text-text-tertiary transition-all duration-200 font-sans text-[15px] text-text-primary shadow-none"
                  />
                  {errors.phone && (
                    <p className="text-[13px] text-destructive font-sans font-medium mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-sans font-medium text-[13px] text-text-primary">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Karachi"
                    className="h-12 px-3 bg-surface border border-border rounded-[var(--radius-control)] hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-0 placeholder:text-text-tertiary transition-all duration-200 font-sans text-[15px] text-text-primary shadow-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-sans font-medium text-[13px] text-text-primary">Delivery Address</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="House #, Street, Area"
                    className="h-12 px-3 bg-surface border border-border rounded-[var(--radius-control)] hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-0 placeholder:text-text-tertiary transition-all duration-200 font-sans text-[15px] text-text-primary shadow-none"
                  />
                  {errors.address && (
                    <p className="text-[13px] text-destructive font-sans font-medium mt-1">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <Button type="submit" size="lg" className="gap-2.5 bg-[#25D366] hover:bg-[#22bf5b] text-white rounded-full shadow-sm font-sans font-medium h-12 px-6 text-[16px] border-none transition-all active:scale-[0.98]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      <path d="M16.5 16c-1.5 1-3.5 0-5.5-2s-3-4-2-5.5c.3-.5.8-.8 1.4-.8.4 0 .8.3 1 .7.2.5.4 1.1.6 1.6.1.3.1.7-.1 1-.2.3-.5.5-.8.7-.1.1-.1.3 0 .4.4.8 1.1 1.6 1.9 2.4.8.8 1.6 1.5 2.4 1.9.1.1.3.1.4 0 .2-.3.4-.6.7-.8.3-.2.7-.2 1-.1.5.2 1.1.4 1.6.6.4.2.7.6.7 1-.1.6-.4 1.1-.9 1.4z"/>
                    </svg>
                    Order on WhatsApp
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="lg:col-span-2">
            <div className="interactive-card-blue bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-xs)] p-6 md:p-8 border border-border sticky top-24">
              <h2 className="font-heading font-semibold text-[18px] text-text-primary mb-6">Order Summary</h2>
              
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.productId}>
                    <p className="font-sans font-semibold text-[15px] text-text-primary leading-tight">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-[13px] text-text-tertiary mt-1 font-sans font-medium uppercase tracking-wide">{item.variantName}</p>
                    )}
                    
                    <div className="mt-6 space-y-0">
                      {/* Row: Original Price */}
                      <div className="flex justify-between items-center py-3.5 border-b border-border">
                        <span className="text-text-secondary font-sans text-[14px]">Original Price</span>
                        <span className="font-sans font-medium text-text-primary tabular-nums text-[14px]">{formatPKR(item.basePrice)}</span>
                      </div>
                      
                      {/* Row: Duration */}
                      <div className="flex justify-between items-center py-3.5 border-b border-border">
                        <span className="text-text-secondary font-sans text-[14px]">Duration</span>
                        <span className="font-sans font-medium text-text-primary tabular-nums text-[14px]">{item.durationMonths} months</span>
                      </div>
                      
                      {/* Row: Down Payment */}
                      <div className="flex justify-between items-center py-3.5 border-b border-border">
                        <span className="text-text-secondary font-sans text-[14px]">Down Payment</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[13px] text-text-tertiary font-sans">Rs</span>
                          <Input
                            type="number"
                            min={minDownPayment}
                            className="h-[36px] w-[100px] text-right font-sans font-medium text-text-primary tabular-nums bg-surface border border-border rounded-[var(--radius-control)] hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-subtle focus-visible:ring-offset-0 transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-none text-[14px]"
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
                      
                      {/* Row: Monthly Installment */}
                      <div className="flex justify-between items-center py-3.5 border-b border-border">
                        <span className="text-text-secondary font-sans text-[14px]">Monthly Installment</span>
                        <span className="font-sans font-medium text-secondary-text tabular-nums text-[14px]">{formatPKR(calculatedMonthly)}</span>
                      </div>
                      
                      {/* Row: Total Cost */}
                      <div className="flex justify-between items-center py-3.5 border-b border-border">
                        <span className="text-text-secondary font-sans text-[14px]">Total Cost</span>
                        <span className="font-sans font-medium text-text-primary tabular-nums text-[14px]">{formatPKR(customDownPayment + calculatedMonthly * item.durationMonths)}</span>
                      </div>

                      {/* Timeline (no border-b) */}
                      <div className="py-5">
                        <div className="relative pl-[22px] py-0.5 space-y-[18px] before:absolute before:left-[4px] before:top-[8px] before:bottom-[8px] before:w-[1.5px] before:bg-border-strong">
                          {/* Due Today */}
                          <div className="flex justify-between items-center relative">
                            <div className="absolute -left-[22px] w-[8px] h-[8px] rounded-full bg-primary ring-[4px] ring-surface" />
                            <span className="text-[14px] text-text-secondary font-sans">Due Today</span>
                            <span className="font-sans font-medium text-text-secondary tabular-nums text-[14px]">{formatDate(startDate)}</span>
                          </div>
                          {/* Next Payment */}
                          <div className="flex justify-between items-center relative">
                            <div className="absolute -left-[22px] w-[8px] h-[8px] rounded-full border-[1.5px] border-border-strong bg-surface ring-[4px] ring-surface" />
                            <span className="text-[14px] text-text-secondary font-sans">Next Payment</span>
                            <span className="font-sans font-medium text-text-secondary tabular-nums text-[14px]">{formatDate(nextPaymentDate)}</span>
                          </div>
                          {/* Final Payment */}
                          <div className="flex justify-between items-center relative">
                            <div className="absolute -left-[22px] w-[8px] h-[8px] rounded-full border-[1.5px] border-border-strong bg-surface ring-[4px] ring-surface" />
                            <span className="text-[14px] text-text-secondary font-sans">Final Payment</span>
                            <span className="font-sans font-medium text-text-secondary tabular-nums text-[14px]">{formatDate(finalPaymentDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Row: Due Today (special emphasis) */}
                      <div className="flex justify-between items-center bg-secondary-subtle px-4 py-3 rounded-[var(--radius-control)] mt-2">
                        <span className="font-sans font-medium text-[15px] text-text-primary">Due Today</span>
                        <span className="font-heading font-semibold text-[20px] text-text-primary tabular-nums">{formatPKR(dueToday)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-16 md:mt-24 max-w-3xl mx-auto pb-8">
          <AnimatedFAQ />
        </div>
      </div>
    </div>
  );
}
