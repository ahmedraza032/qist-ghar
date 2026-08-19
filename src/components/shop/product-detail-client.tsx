"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/helpers/format";
import { calculateInstallment, getAllInstallmentOptions, getTenureConfig } from "@/lib/helpers/installments";
import type { InstallmentBreakdown } from "@/lib/helpers/installments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SlidingNumber } from "@/components/shop/sliding-number";

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
  tenure_pricing?: any[];
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  images: string[];
  tenure_pricing?: any[];
}

interface Variant {
  id: string;
  name: string;
  variant_label?: string | null;
  base_price: number;
  stock_qty: number;
  images: string[];
  tenure_pricing?: any[];
}

interface ProductDetailClientProps {
  product: ProductDetail;
  variants: Variant[];
  related: RelatedProduct[];
}

const DURATIONS = [3, 6, 9, 12];

export function ProductDetailClient({ product, variants, related }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedDuration, setSelectedDuration] = React.useState(3);
  const [activeTab, setActiveTab] = React.useState<"specs" | "description">("specs");

  const hasVariants = variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    hasVariants ? variants[0].id : null
  );

  function selectVariant(id: string) {
    setSelectedVariantId(id);
    setSelectedImage(0);
  }

  const activeProduct = hasVariants
    ? variants.find((v) => v.id === selectedVariantId) ?? variants[0]
    : product;

  const activeImages = activeProduct.images?.length ? activeProduct.images : product.images;

  const effectiveBasePrice = activeProduct.base_price;

  const tenureConfig = getTenureConfig(activeProduct.tenure_pricing ?? product.tenure_pricing);
  const activeTenure = tenureConfig[selectedDuration];
  const activeTotalPrice = Math.round(effectiveBasePrice * (1 + activeTenure.markup / 100));
  const minDownPayment = Math.ceil(activeTotalPrice * (activeTenure.downPayment / 100));
  const maxTenureDownPayment = Math.ceil(
    Math.round(effectiveBasePrice * (1 + tenureConfig[12].markup / 100)) * (tenureConfig[12].downPayment / 100)
  );
  const [customDownPayment, setCustomDownPayment] = React.useState<number | "">("");

  const activeDownPayment = typeof customDownPayment === "number" && customDownPayment >= minDownPayment
    ? customDownPayment
    : minDownPayment;

  const breakdown = calculateInstallment(effectiveBasePrice, selectedDuration, activeTenure.markup, activeDownPayment, activeTenure.downPayment);
  const allOptions = getAllInstallmentOptions(effectiveBasePrice, undefined, tenureConfig);
  
  const inStock = activeProduct.stock_qty > 0;

  const buyerParams = new URLSearchParams({
    product_id: activeProduct.id,
    product_name: activeProduct.name,
    product_slug: product.slug,
    product_image: activeImages[0] || '',
    base_price: String(effectiveBasePrice),
    duration: String(selectedDuration),
    markup: String(breakdown.markupPercent),
    down_payment: String(breakdown.downPayment),
    min_down_payment: String(activeTenure.downPayment),
    monthly: String(breakdown.monthlyPayment),
    total: String(breakdown.totalPrice),
  }).toString();

  async function handleBuyNow() {
    if (!inStock) return;
    router.push(`/checkout?${buyerParams}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-bg min-h-screen">
      {/* Breadcrumb */}
      <nav className="font-sans text-[14px] text-text-secondary mb-8">
        <a href="/products" className="hover:text-text-primary transition-colors">Products</a>
        <span className="mx-2 text-text-tertiary">/</span>
        {product.category && (
          <>
            <a href={`/products?category=${product.category.slug}`} className="hover:text-text-primary transition-colors">
              {product.category.name}
            </a>
            <span className="mx-2 text-text-tertiary">/</span>
          </>
        )}
        <span className="text-text-primary">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-xs)] overflow-hidden border border-border">
            {activeImages?.[selectedImage] ? (
              <Image
                src={activeImages[selectedImage]}
                alt={activeProduct.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-text-tertiary font-sans">
                No image available
              </div>
            )}
            {!inStock && (
              <Badge variant="destructive" className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
          {activeImages && activeImages.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {activeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-[72px] h-[72px] rounded-[var(--radius-image)] border-2 bg-surface overflow-hidden shrink-0 transition-all",
                    i === selectedImage ? "border-primary shadow-[var(--shadow-xs)]" : "border-transparent hover:border-border"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${activeProduct.name} ${i + 1}`}
                    fill
                    className="object-cover p-1"
                    sizes="72px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="text-[12px] text-text-tertiary uppercase tracking-[0.04em] mb-2 font-sans font-medium">
              {product.brand.name}
            </p>
          )}
          <h1 className="font-heading font-semibold text-text-primary text-[28px] leading-tight">
            {product.name}
          </h1>
          <div className="mt-3">
            <p className="text-[12px] text-text-tertiary font-sans">Down Payment</p>
            <p className="font-heading font-medium text-secondary-text text-[32px] tabular-nums flex items-center">
              Rs <SlidingNumber value={maxTenureDownPayment.toLocaleString("en-US")} />
            </p>
          </div>

          {hasVariants && (
            <div className="mt-6">
              <h3 className="font-heading font-semibold text-[14px] text-text-primary mb-3">Select Variant</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const isSelected = v.id === (selectedVariantId ?? variants[0].id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => selectVariant(v.id)}
                      className={cn(
                        "px-4 py-2 text-sm rounded-[var(--radius-control)] border transition-colors font-sans font-medium",
                        isSelected
                          ? "border-primary bg-primary-subtle text-primary"
                          : "border-border bg-surface text-text-secondary hover:bg-surface-alt hover:text-text-primary"
                      )}
                    >
                      {v.variant_label || v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Installment Plan Selector */}
          <div className="mt-10">
            <h3 className="font-heading font-semibold text-[14px] text-text-primary mb-6">Choose your installment plan</h3>
            
            {/* Installment Plan Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
              {allOptions.map((opt) => {
                const isActive = opt.duration === selectedDuration;
                return (
                  <button
                    key={opt.duration}
                    onClick={() => setSelectedDuration(opt.duration)}
                    className={cn(
                      "group flex flex-col items-center justify-center py-3 px-1 sm:p-3 rounded-[var(--radius-card)] border transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none active:animate-press-spring motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:animate-none hover:-translate-y-[2px] hover:shadow-[var(--shadow-sm)]",
                      isActive 
                        ? "border-primary bg-primary-subtle shadow-[var(--shadow-sm)]" 
                        : "border-border bg-surface hover:border-primary"
                    )}
                  >
                    <span className={cn(
                      "font-heading tabular-nums transition-colors",
                      isActive ? "text-[16px] sm:text-[18px] text-primary font-semibold" : "text-[15px] sm:text-[16px] text-text-secondary font-medium group-hover:text-text-primary"
                    )}>
                      {opt.duration}mo
                    </span>
                    <span className={cn(
                      "font-sans font-medium text-[11px] sm:text-[12px] tabular-nums mt-1 transition-colors",
                      isActive ? "text-primary/80" : "text-text-tertiary group-hover:text-text-secondary"
                    )}>
                      {formatPKR(opt.monthlyPayment)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Duration/Down Payment summary row */}
            <div className="bg-surface-alt rounded-[var(--radius-control)] p-4 space-y-4">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-text-secondary font-sans">Duration</span>
                <span className="font-heading font-medium tabular-nums text-text-primary text-[16px] flex items-center gap-1">
                  {selectedDuration} x Rs <SlidingNumber value={breakdown.monthlyPayment.toLocaleString("en-US")} />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[15px] gap-2">
                  <span className="text-text-secondary font-sans whitespace-nowrap">Down Payment</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-text-tertiary font-sans text-sm">Rs</span>
                    <Input
                      type="number"
                      min={minDownPayment}
                      className="h-10 w-28 text-right font-sans font-medium text-text-primary tabular-nums bg-surface border-border rounded-[var(--radius-control)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  <div className="text-[12px] text-destructive text-right font-sans font-medium mt-1">
                    Min {activeTenure.downPayment}% required
                  </div>
                )}
              </div>
            </div>

            {/* Installment breakdown table */}
            <div className="mt-8 bg-surface rounded-[var(--radius-card)] shadow-[var(--shadow-xs)] overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {allOptions.map((opt) => (
                    <tr
                      key={opt.duration}
                      className="border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-surface-alt group"
                      onClick={() => setSelectedDuration(opt.duration)}
                    >
                      <td className="py-4 pl-4 font-sans text-text-secondary group-hover:text-text-primary transition-colors">
                        {opt.duration} months
                      </td>
                      <td className="py-4 pr-4 text-right font-heading font-medium tabular-nums text-text-primary text-[15px]">
                        {formatPKR(opt.monthlyPayment)} x {opt.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Buy on Installments CTA */}
          <div className="mt-8 mb-4">
            <Button
              size="lg"
              className="w-full gap-2 bg-primary hover:bg-primary-hover text-white rounded-[var(--radius-control)] shadow-[var(--shadow-sm)] font-medium h-14 text-[16px] border-none"
              disabled={!inStock}
              onClick={handleBuyNow}
            >
              <ShoppingBag className="h-5 w-5" />
              {inStock
                ? <span className="flex items-center gap-1">Buy on Installments — Rs <SlidingNumber value={breakdown.monthlyPayment.toLocaleString("en-US")} />/mo</span>
                : "Out of Stock"}
            </Button>
          </div>

          <div className="flex items-center gap-6 justify-center mt-2 text-[13px] text-text-tertiary font-sans">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-[14px] w-[14px]" /> Secure Payment
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-[14px] w-[14px]" /> Free Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Specs / Description */}
      <div className="mt-16 md:mt-24">
        <div className="flex border-b border-border gap-6 relative">
          {(["specs", "description"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 px-2 text-[15px] font-sans font-medium transition-colors relative top-[1px]",
                  isActive
                    ? "text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                  />
                )}
                {tab === "specs" ? "Specifications" : "Description"}
              </button>
            );
          })}
        </div>
        <div className="mt-8 max-w-2xl overflow-hidden relative min-h-[200px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {activeTab === "specs" ? (
                product.specs && Object.keys(product.specs).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(product.specs).map(([key, value]) => (
                          <tr key={key} className="border-b border-border last:border-0">
                            <td className="py-4 pr-6 text-[15px] text-text-secondary font-sans w-1/3 align-top">
                              {key}
                            </td>
                            <td className="py-4 text-[15px] text-text-primary font-sans font-medium tabular-nums align-top">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-text-secondary font-sans text-[15px]">No specifications available.</p>
                )
              ) : (
                product.description ? (
                  <p className="text-[15px] text-text-secondary font-sans leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-text-secondary font-sans text-[15px]">No description available.</p>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading font-semibold text-text-primary text-2xl mb-8">Related Products</h2>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {related.map((rp) => {
              const rpTenure = getTenureConfig(rp.tenure_pricing);
              const inst = calculateInstallment(rp.base_price, 3, rpTenure[3].markup, undefined, rpTenure[3].downPayment);
              const planOptions = getAllInstallmentOptions(rp.base_price, undefined, rpTenure);
              return (
                <motion.div
                  key={rp.id}
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.8, type: 'spring', bounce: 0.3 },
                    },
                  }}
                >
                  <Link
                    href={`/products/${rp.slug}`}
                    className="group interactive-card-green flex flex-col h-full rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-xs)]"
                  >
                    <div className="shimmer-overlay" />
                    <div className="relative aspect-square overflow-hidden rounded-[var(--radius-image)] m-2 shrink-0 z-10">
                      {rp.images?.[0] ? (
                        <Image
                          src={rp.images[0]}
                          alt={rp.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-surface-alt text-text-tertiary text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-4 pt-3 flex flex-col flex-1 z-10 relative">
                      <h3 className="font-medium font-sans text-text-primary text-[15px] leading-snug line-clamp-2 transition-colors">
                        {rp.name}
                      </h3>
                      <div className="mt-auto pt-4">
                        <p className="font-heading font-medium text-secondary-text tabular-nums text-xl">
                          {formatPKR(rp.base_price)}
                        </p>
                        
                        {/* Signature Element inside Related Products */}
                        <div className="flex items-center gap-[4px] mt-1.5 mb-2">
                          {planOptions.map((plan, i) => (
                            <div
                              key={plan.duration}
                              className={cn(
                                "w-[3px] h-[12px] rounded-sm",
                                i === 0 ? "bg-primary" : "border-[1.5px] border-border-strong bg-transparent"
                              )}
                            />
                          ))}
                        </div>

                        <p className="text-[13px] text-text-secondary font-sans">
                          From <span className="font-medium tabular-nums text-text-primary">{formatPKR(inst.monthlyPayment)}/mo</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-[64px] left-0 right-0 z-30 bg-surface border-t border-border p-4 md:hidden shadow-[0_-4px_12px_rgba(20,24,31,0.08)] pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
          <div>
            <p className="text-xs text-text-secondary font-sans">
              <span className="font-medium">{selectedDuration}mo</span> · <span className="tabular-nums">{formatPKR(breakdown.monthlyPayment)}/mo</span>
            </p>
            <p className="text-[15px] font-heading font-semibold text-primary tabular-nums">{formatPKR(breakdown.downPayment)} down</p>
          </div>
          <Button 
            size="lg" 
            className="flex-1 min-h-[44px] bg-primary text-white rounded-[var(--radius-control)] shadow-[var(--shadow-sm)] font-medium border-none hover:bg-primary-hover" 
            disabled={!inStock} 
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
