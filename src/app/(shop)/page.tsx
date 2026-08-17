"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Percent, RotateCcw, Smartphone, Laptop, Tv, Home, Headphones, Search, CalendarDays, Wallet, ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedFAQ } from "@/components/shop/animated-faq";
import { InfiniteSlider } from "@/components/shop/infinite-slider";

const categories = [
  { name: "Smartphones", slug: "smartphones", icon: Smartphone },
  { name: "Laptops", slug: "laptops", icon: Laptop },
  { name: "TVs", slug: "tvs", icon: Tv },
  { name: "Home Appliances", slug: "home-appliances", icon: Home },
  { name: "Accessories", slug: "accessories", icon: Headphones },
];

const BRANDS = ["Apple", "Samsung", "Dawlance", "Haier", "Oppo", "Vivo", "TCL", "Infinix", "Xiaomi", "Dell", "HP"];

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
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Percent, label: "0% Hidden Fees" },
  { icon: RotateCcw, label: "Easy Returns" },
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
          <div className="max-w-2xl">
            <h1 className="font-heading text-[34px] leading-[40px] md:text-[48px] md:leading-[56px] font-semibold text-text-primary">
              Buy Now, Pay in{" "}
              <span className="relative inline-block">
                <motion.span
                  className="inline-block bg-gradient-to-r from-text-primary via-primary to-text-primary bg-[length:200%_auto] text-transparent bg-clip-text"
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
        </div>
      </section>

      {/* Infinite Brands Slider */}
      <section className="bg-bg py-8 overflow-hidden border-t border-border/50">
        <InfiniteSlider>
          {BRANDS.map((brand, idx) => (
            <span key={idx} className="font-heading font-bold text-2xl md:text-3xl text-text-tertiary/40 uppercase tracking-widest">
              {brand}
            </span>
          ))}
        </InfiniteSlider>
      </section>

      {/* Featured Categories */}
      <section className="bg-bg-tinted py-16 border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-8 text-text-primary">
            Shop by Category
          </h2>
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.slug}
                variants={{
                  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.8, type: 'spring', bounce: 0.3 },
                  },
                }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group category-card active:animate-press-spring motion-reduce:transition-none motion-reduce:hover:transform-none"
                >
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[var(--radius-card)]">
                     <div className="absolute top-0 bottom-0 -left-full w-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.6)_50%,transparent_70%)] group-hover:animate-shimmer-sweep motion-reduce:hidden" />
                  </div>
                  <div className="category-card-icon-wrapper">
                    <div className="category-card-icon-bg motion-reduce:transition-none" />
                    <cat.icon className="category-card-icon" />
                  </div>
                  <span className="relative z-10 text-sm font-medium text-center text-text-primary">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-bg border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-12 text-center text-text-primary">
            How It Works
          </h2>
          <motion.div 
            className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {steps.map((s, idx) => (
              <motion.div 
                key={s.step}
                className="flex-1 relative"
                variants={{
                  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.8, type: 'spring', bounce: 0.3 },
                  },
                }}
              >
                {(() => {
                  const content = (
                    <>
                      <div className="absolute top-4 left-5 text-[14px] font-heading font-semibold text-text-tertiary/40 tracking-wider">
                        {s.step}
                      </div>
                      <div className="category-card-icon-wrapper mt-4">
                        <div className="category-card-icon-bg motion-reduce:transition-none" />
                        <s.icon className="category-card-icon h-7 w-7" />
                      </div>
                      <div className="mt-5">
                        <h3 className="font-heading text-lg font-semibold text-text-primary">{s.title}</h3>
                        <p className="mt-2 text-[15px] text-text-secondary leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </>
                  );

                  return s.href ? (
                    <Link 
                      href={s.href} 
                      className="group category-card h-full text-center justify-center pt-8 pb-10 cursor-pointer active:animate-press-spring motion-reduce:transition-none motion-reduce:hover:transform-none block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div 
                      tabIndex={0}
                      className="group category-card h-full text-center justify-center pt-8 pb-10 cursor-pointer active:animate-press-spring motion-reduce:transition-none motion-reduce:hover:transform-none block"
                    >
                      {content}
                    </div>
                  );
                })()}
                
                {/* Arrow Connector */}
                {idx < steps.length - 1 && (
                  <>
                    {/* Desktop Arrow */}
                    <div className="hidden md:flex absolute top-1/2 -right-8 -translate-y-1/2 text-border-strong z-10 w-8 items-center justify-center pointer-events-none">
                      <ChevronRight className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    {/* Mobile Arrow */}
                    <div className="md:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-border-strong z-10 h-6 flex items-center justify-center pointer-events-none">
                      <ChevronDown className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-bg-tinted py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
          {trustBadges.map((badge) => (
            <motion.div 
              key={badge.label} 
              className="flex-1 border border-border rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-xs)] p-6"
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
                },
              }}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary-subtle flex items-center justify-center mb-2">
                  <badge.icon className="h-6 w-6 text-primary" strokeWidth={2} />
                </div>
                <span className="font-heading font-medium text-lg text-text-primary">{badge.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden bg-[#0A0D11] rounded-[var(--radius-card)] p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-[var(--shadow-md)] border border-secondary/20">
            {/* Subtle green gradient glow */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-xl relative z-10">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-white">
                Ready to start buying on installments?
              </h2>
              <p className="mt-4 text-white/80 text-lg">
                No credit card required. No hidden fees. Just pick a product, choose
                a plan, and pay monthly.
              </p>
            </div>
            <Link href="/products" className="shrink-0 relative z-10">
              <Button
                size="lg"
                className="gap-2 bg-white text-[#0A0D11] hover:bg-gray-100 rounded-[var(--radius-control)] border-none font-medium h-12 px-8
                  transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[1px] hover:shadow-[var(--shadow-sm)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D11]
                  active:animate-press-spring motion-reduce:transition-none motion-reduce:hover:transform-none"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-bg border-y border-border py-16">
        <div className="max-w-3xl mx-auto px-4">
          <AnimatedFAQ />
        </div>
      </section>
    </div>
  );
}
