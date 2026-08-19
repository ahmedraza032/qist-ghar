"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Percent, RotateCcw, Search, CalendarDays, Wallet, ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedFAQ } from "@/components/shop/animated-faq";
import { HeroMockup } from "@/components/shop/hero-mockup";

const categories = [
  { name: "Smartphones",    slug: "smartphones",    image: "/categories/smartphones.jpg" },
  { name: "Laptops",        slug: "laptops",        image: "/categories/laptops.jpg" },
  { name: "TVs",            slug: "tvs",            image: "/categories/tvs.jpg" },
  { name: "Home Appliances",slug: "home-appliances",image: "/categories/home-appliances.jpg" },
  { name: "Accessories",    slug: "accessories",    image: "/categories/accessories.jpg" },
];


const steps = [
  {
    step: "01",
    title: "Browse Products",
    desc: "Find phones, laptops, TVs and more from top brands.",
    icon: Search,
    href: "/products",
  },
  {
    step: "02",
    title: "Choose Your Plan",
    desc: "Pick a 3, 6, 9, or 12 month installment plan.",
    icon: CalendarDays,
  },
  {
    step: "03",
    title: "Pay Monthly",
    desc: "Pay via JazzCash, Easypaisa, bank transfer, or card.",
    icon: Wallet,
  },
];

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Payments",  desc: "Every transaction is encrypted and processed securely.",  color: "#205EA3", ring: "rgba(32,94,163,0.18)",  bg: "rgba(32,94,163,0.05)",  glow: "rgba(32,94,163,0.12)"  },
  { icon: Percent,     label: "0% Hidden Fees",   desc: "What you see is what you pay. No surprises, ever.",        color: "#82B63F", ring: "rgba(130,182,63,0.22)", bg: "rgba(130,182,63,0.05)", glow: "rgba(130,182,63,0.14)" },
  { icon: RotateCcw,  label: "Easy Returns",      desc: "Hassle-free returns within 7 days of delivery.",          color: "#205EA3", ring: "rgba(32,94,163,0.18)",  bg: "rgba(32,94,163,0.05)",  glow: "rgba(32,94,163,0.12)"  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-bg text-text-primary">
      {/* Hero */}
      <section className="min-h-[80vh] flex items-center bg-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 w-full relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-8 lg:gap-16">
            {/* Left: Text + CTAs — unchanged */}
            <div className="flex-1 max-w-xl">
              <h1 className="font-heading text-[34px] leading-[40px] md:text-[48px] md:leading-[56px] font-semibold text-text-primary">
                Buy Now, Pay in{" "}
                <span className="relative inline-block">
                  <motion.span
                    className="inline-block bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] text-transparent bg-clip-text"
                    animate={{ backgroundPosition: ["200% center", "-200% center"] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  >
                    Easy Installments
                  </motion.span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-[14px] overflow-visible pointer-events-none"
                    viewBox="0 0 300 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2,10 Q60,-2 130,8 T298,6"
                      stroke="var(--color-secondary-text)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="transparent"
                      style={{
                        strokeDasharray: 320,
                        strokeDashoffset: mounted ? 0 : 320,
                        transition: "stroke-dashoffset 600ms cubic-bezier(0.25, 1, 0.5, 1) 100ms"
                      }}
                      className="motion-reduce:transition-none motion-reduce:stroke-dashoffset-0"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mt-6 text-lg text-text-secondary max-w-lg">
                Get phones, laptops, TVs, and appliances delivered to your door.
                Pay monthly with JazzCash, Easypaisa, or bank transfer.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button 
                    size="lg" 
                    className="gap-2 bg-primary hover:bg-primary-hover text-white rounded-[var(--radius-control)] border-none"
                  >
                    Browse Products <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-transparent border-[1.5px] border-border-strong text-text-primary hover:border-primary hover:bg-primary-subtle hover:text-primary rounded-[var(--radius-control)] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[1px] hover:shadow-[var(--shadow-sm)]"
                  >
                    View Installment Plans
                  </Button>
                </Link>
              </div>
            </div>

            <HeroMockup />
          </div>
        </div>
      </section>


      {/* Featured Categories */}
      <section className="bg-bg-tinted py-16 border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-8 text-text-primary">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative block overflow-hidden rounded-[var(--radius-card)] aspect-[4/3] shadow-[var(--shadow-sm)] border border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2"
                aria-label={`Shop ${cat.name}`}
              >
                {/* Photo */}
                <Image
                  src={cat.image}
                  alt={`Shop ${cat.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Label */}
                <span className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 text-white font-semibold text-sm leading-tight drop-shadow-sm">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="bg-bg border-y border-border overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          {/* Section header */}
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4"
              style={{ background: "rgba(32,94,163,0.08)", color: "#205EA3" }}>
              Simple Process
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              How It Works
            </h2>
          </div>

          {/* Cards row */}
          <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-5 relative">
            {steps.map((s, idx) => {
              // Per-step accent colors: blue → green → blue-green teal
              const accent =
                s.step === "01" ? { color: "#205EA3", ring: "rgba(32,94,163,0.18)",  bg: "rgba(32,94,163,0.05)",  glow: "rgba(32,94,163,0.14)"  }
              : s.step === "02" ? { color: "#82B63F", ring: "rgba(130,182,63,0.22)", bg: "rgba(130,182,63,0.05)", glow: "rgba(130,182,63,0.16)" }
              :                   { color: "#205EA3", ring: "rgba(32,94,163,0.18)",  bg: "rgba(32,94,163,0.05)",  glow: "rgba(32,94,163,0.14)"  };

              const card = (
                <div
                  className="group relative flex flex-col items-center text-center rounded-2xl border px-6 pt-10 pb-10 h-full transition-all duration-300 ease-out hover:-translate-y-1 active:scale-[0.98] cursor-pointer motion-reduce:transition-none motion-reduce:hover:transform-none"
                  style={{
                    background: accent.bg,
                    borderColor: accent.ring,
                    boxShadow: `0 4px 24px ${accent.glow}`,
                  }}
                >
                  {/* Ring badge */}
                  <div className="relative flex items-center justify-center mb-7 shrink-0">
                    {/* Outer thin ring */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        inset: "-10px",
                        border: `1.5px dashed ${accent.color}`,
                        opacity: 0.25,
                      }}
                    />
                    {/* Inner solid ring */}
                    <div
                      className="w-[88px] h-[88px] rounded-full flex flex-col items-center justify-center"
                      style={{
                        border: `3px solid ${accent.color}`,
                        boxShadow: `0 0 0 6px ${accent.ring}`,
                        background: "#fff",
                      }}
                    >
                      <span
                        className="font-heading font-bold leading-none text-[28px] tracking-tight"
                        style={{ color: accent.color }}
                      >
                        {s.step}
                      </span>
                      <span
                        className="text-[8px] font-semibold tracking-[0.2em] uppercase mt-0.5"
                        style={{ color: accent.color, opacity: 0.65 }}
                      >
                        STEP
                      </span>
                    </div>
                  </div>

                  {/* Title in accent color */}
                  <h3
                    className="font-heading text-[18px] font-bold leading-snug mb-3"
                    style={{ color: accent.color }}
                  >
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[14px] text-text-secondary leading-relaxed max-w-[200px]">
                    {s.desc}
                  </p>

                  {/* Search overlay for step 01 */}
                  {s.step === "01" && (
                    <form
                      id="search-step-form"
                      action="/products"
                      className="absolute inset-0 bg-surface rounded-2xl hidden flex-col items-center justify-center p-6 z-30"
                    >
                      <input
                        name="q"
                        placeholder="What are you looking for?"
                        className="w-full text-center text-lg border-b-2 border-primary bg-transparent focus:outline-none pb-2 text-text-primary"
                        onBlur={(e) => {
                          if (!e.target.value) {
                            const f = document.getElementById("search-step-form");
                            if (f) { f.classList.add("hidden"); f.classList.remove("flex"); }
                          }
                        }}
                      />
                      <button type="submit" className="mt-4 text-sm font-medium hover:underline" style={{ color: "#205EA3" }}>
                        Search
                      </button>
                    </form>
                  )}
                </div>
              );

              const cardWithClick =
                s.step === "01" ? (
                  <div
                    key={s.step}
                    className="flex-1 relative"
                    onClick={() => {
                      const f = document.getElementById("search-step-form");
                      if (f) {
                        f.classList.remove("hidden"); f.classList.add("flex");
                        const inp = f.querySelector("input");
                        if (inp) inp.focus();
                      }
                    }}
                  >
                    {card}
                  </div>
                ) : s.href ? (
                  <Link key={s.step} href={s.href} className="flex-1 relative block">
                    {card}
                  </Link>
                ) : (
                  <div key={s.step} className="flex-1 relative" tabIndex={0}>
                    {card}
                  </div>
                );

              return (
                <React.Fragment key={s.step}>
                  {cardWithClick}
                  {/* Chevron separator */}
                  {idx < steps.length - 1 && (
                    <>
                      <div className="hidden md:flex items-center justify-center shrink-0 w-8 text-border-strong self-center pointer-events-none">
                        <ChevronRight className="h-7 w-7" strokeWidth={1.5} />
                      </div>
                      <div className="md:hidden flex items-center justify-center h-6 text-border-strong pointer-events-none">
                        <ChevronDown className="h-7 w-7" strokeWidth={1.5} />
                      </div>
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-bg-tinted py-16 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-5">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex-1 flex flex-col items-center text-center rounded-2xl border px-6 pt-10 pb-10 transition-all duration-300 ease-out hover:-translate-y-1 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:transform-none"
                style={{
                  background: badge.bg,
                  borderColor: badge.ring,
                  boxShadow: `0 4px 24px ${badge.glow}`,
                }}
              >
                {/* Ring icon badge */}
                <div className="relative flex items-center justify-center mb-7 shrink-0">
                  {/* Outer dashed ring */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      inset: "-10px",
                      border: `1.5px dashed ${badge.color}`,
                      opacity: 0.25,
                    }}
                  />
                  {/* Inner solid ring */}
                  <div
                    className="w-[80px] h-[80px] rounded-full flex items-center justify-center"
                    style={{
                      border: `3px solid ${badge.color}`,
                      boxShadow: `0 0 0 6px ${badge.ring}`,
                      background: "#fff",
                    }}
                  >
                    <badge.icon
                      className="h-7 w-7"
                      strokeWidth={1.75}
                      style={{ color: badge.color }}
                    />
                  </div>
                </div>

                {/* Label in accent color */}
                <h3
                  className="font-heading text-[17px] font-bold leading-snug mb-2"
                  style={{ color: badge.color }}
                >
                  {badge.label}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-text-secondary leading-relaxed max-w-[180px]">
                  {badge.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-16 pb-8 bg-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-secondary rounded-[var(--radius-card)] p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-[var(--shadow-md)]">
            <div className="max-w-xl">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-text-primary">
                Ready to start buying on installments?
              </h2>
              <p className="mt-4 text-text-primary/90 text-lg">
                No credit card required. No hidden fees. Just pick a product, choose
                a plan, and pay monthly.
              </p>
            </div>
            <Link href="/products" className="shrink-0">
              <Button
                size="lg"
                className="gap-2 bg-text-primary text-white hover:bg-[#0A0D11] rounded-[var(--radius-control)] border-none font-medium h-12 px-8
                  transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[1px] hover:shadow-[var(--shadow-sm)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                  active:animate-press-spring motion-reduce:transition-none motion-reduce:hover:transform-none"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-bg-tinted py-16 border-t border-border">
        <div className="max-w-2xl mx-auto px-4">
          <AnimatedFAQ />
        </div>
      </section>
    </div>
  );
}
