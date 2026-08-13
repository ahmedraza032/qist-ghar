"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/helpers/format";
import { calculateInstallment, getAllInstallmentOptions, MIN_DOWN_PAYMENT_PCT } from "@/lib/helpers/installments";
import type { InstallmentBreakdown } from "@/lib/helpers/installments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Spec {
  [key: string]: string;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  description: string | null;
  specs: Spec;
  images: string[];
  stock_qty: number;
  brand?: { name: string; id: string };
  category?: { name: string; slug: string };
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  images: string[];
}

interface ProductDetailClientProps {
  product: ProductDetail;
  related: RelatedProduct[];
}

const DURATIONS = [3, 6, 9, 12];

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedDuration, setSelectedDuration] = React.useState(3);
  const [activeTab, setActiveTab] = React.useState<"specs" | "description">("specs");
  const effectiveBasePrice = product.base_price;

  const minDownPayment = Math.ceil(effectiveBasePrice * (MIN_DOWN_PAYMENT_PCT / 100));
  const [customDownPayment, setCustomDownPayment] = React.useState<number | "">("");

  const activeDownPayment = typeof customDownPayment === "number" && customDownPayment >= minDownPayment
    ? customDownPayment
    : minDownPayment;

  const breakdown = calculateInstallment(effectiveBasePrice, selectedDuration, undefined, activeDownPayment);
  const allOptions = getAllInstallmentOptions(effectiveBasePrice, activeDownPayment);
  const inStock = product.stock_qty > 0;

  const buyerParams = new URLSearchParams({
    product_id: product.id,
    product_name: product.name,
    product_slug: product.slug,
    product_image: product.images?.[0] || '',
    base_price: String(effectiveBasePrice),
    duration: String(selectedDuration),
    markup: String(breakdown.markupPercent),
    down_payment: String(breakdown.downPayment),
    monthly: String(breakdown.monthlyPayment),
    total: String(breakdown.totalPrice),
  }).toString();

  async function handleBuyNow() {
    if (!inStock) return;
    router.push(`/checkout?${buyerParams}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <a href="/products" className="hover:text-foreground">Products</a>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <a href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </a>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.images?.[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image available
              </div>
            )}
            {!inStock && (
              <Badge variant="destructive" className="absolute top-3 left-3">
                Out of Stock
              </Badge>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-16 h-16 rounded-md border-2 bg-muted overflow-hidden shrink-0",
                    i === selectedImage ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.brand && (
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
              {product.brand.name}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
          <p className="text-3xl font-bold text-primary mt-3">
            {formatPKR(effectiveBasePrice)}
          </p>

          {/* Installment Plan Selector */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-3">Choose your installment plan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDuration(d)}
                  className={cn(
                    "px-3 py-2 rounded-md border text-sm font-medium transition-colors",
                    d === selectedDuration
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:border-primary/50 hover:bg-muted"
                  )}
                >
                  {d} mo
                </button>
              ))}
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedDuration} x {formatPKR(breakdown.monthlyPayment)}</span>
                </div>

                <div className="space-y-1 py-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Down Payment</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground font-mono">Rs</span>
                      <Input
                        type="number"
                        min={minDownPayment}
                        className="h-8 w-28 text-right font-semibold text-foreground text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={customDownPayment === "" ? activeDownPayment : customDownPayment}
                        onChange={(e) => {
                          const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                          setCustomDownPayment(val);
                        }}
                        onBlur={() => {
                          if (typeof customDownPayment === "number" && customDownPayment < minDownPayment) {
                            setCustomDownPayment(minDownPayment);
                          }
                        }}
                      />
                    </div>
                  </div>
                  {typeof customDownPayment === "number" && customDownPayment < minDownPayment && (
                    <div className="text-[11px] text-destructive text-right">
                      Min {MIN_DOWN_PAYMENT_PCT}% required
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All plans quick view */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Duration</th>
                    <th className="text-right py-2 font-medium">Total Installments</th>
                  </tr>
                </thead>
                <tbody>
                  {allOptions.map((opt) => (
                    <tr
                      key={opt.duration}
                      className={cn(
                        "border-b border-border cursor-pointer hover:bg-muted/50",
                        opt.duration === selectedDuration && "bg-primary/5"
                      )}
                      onClick={() => setSelectedDuration(opt.duration)}
                    >
                      <td className="py-2">{opt.duration} months</td>
                      <td className="py-2 text-right font-medium">
                        {formatPKR(opt.monthlyPayment)} x {opt.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Buy on Installments CTA */}
          <div className="mt-6">
            <Button
              size="lg"
              className="w-full gap-2"
              disabled={!inStock}
              onClick={handleBuyNow}
            >
              <ShoppingBag className="h-4 w-4" />
              {inStock
                ? `Buy on Installments — ${formatPKR(breakdown.monthlyPayment)}/mo`
                : "Out of Stock"}
            </Button>
          </div>

          {!inStock && (
            <p className="text-sm text-destructive mt-2 text-center">
              This product is currently out of stock.
            </p>
          )}

          <div className="flex items-center gap-4 justify-center mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Secure Payment
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" /> Free Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Specs / Description */}
      <div className="mt-12">
        <div className="flex border-b border-border gap-0">
          {(["specs", "description"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "specs" ? "Specifications" : "Description"}
            </button>
          ))}
        </div>
        <div className="mt-6 max-w-2xl">
          {activeTab === "specs" ? (
            product.specs && Object.keys(product.specs).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[300px]">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="border-b border-border">
                      <td className="py-3 pr-6 text-sm text-muted-foreground font-medium w-1/3">
                        {key}
                      </td>
                      <td className="py-3 text-sm">{value}</td>
                    </tr>
                  ))}
                </tbody>
                              </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No specifications available.</p>
            )
          ) : (
            product.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">No description available.</p>
            )
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((rp) => {
              const inst = calculateInstallment(rp.base_price, 3);
              return (
                <a
                  key={rp.id}
                  href={`/products/${rp.slug}`}
                  className="group rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {rp.images?.[0] ? (
                      <Image
                        src={rp.images[0]}
                        alt={rp.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {rp.name}
                    </h3>
                    <p className="text-sm font-bold mt-1">{formatPKR(rp.base_price)}</p>
                    <p className="text-xs text-primary mt-0.5">
                      From {formatPKR(inst.monthlyPayment)}/mo
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-background border-t border-border p-3 md:hidden">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-xs text-muted-foreground">
              {selectedDuration}mo · {formatPKR(breakdown.monthlyPayment)}/mo
            </p>
            <p className="text-sm font-bold text-primary">{formatPKR(breakdown.downPayment)} down</p>
          </div>
          <Button size="lg" className="flex-1 ml-3" disabled={!inStock} onClick={handleBuyNow}>
            Buy on Installments
          </Button>
        </div>
      </div>
    </div>
  );
}
