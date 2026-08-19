"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Slide 1: Choose Product ───────────────── */
function SlideChooseProduct() {
  const products = [
    { icon: "phone", label: "iPhone 15 Pro", sub: "256GB · Blue", price: "Rs 1.3L", active: true },
    { icon: "laptop", label: "MacBook Air M2", sub: "8GB RAM · 256GB", price: "Rs 2.4L", active: false },
    { icon: "tv", label: "Samsung QLED 55\"", sub: "4K · Smart TV", price: "Rs 1.8L", active: false },
  ];
  return (
    <div className="h-full flex flex-col px-3 pt-9 pb-3 gap-2">
      {/* Search bar */}
      <div className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 mb-1"
        style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8B93A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <div className="h-[6px] w-20 rounded-full" style={{ background: "rgba(139,147,161,0.25)" }} />
      </div>
      <div className="text-[8px] font-sans font-medium text-text-tertiary uppercase tracking-wide">Browse Products</div>
      {products.map((p) => (
        <div key={p.label} className="rounded-[10px] px-2.5 py-2 flex items-center gap-2"
          style={{
            background: p.active ? "rgba(32,94,163,0.07)" : "var(--color-surface)",
            border: `1.5px solid ${p.active ? "rgba(32,94,163,0.30)" : "var(--color-border)"}`,
          }}>
          <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
            style={{ background: p.active ? "rgba(32,94,163,0.12)" : "rgba(20,24,31,0.05)" }}>
            {p.icon === "phone" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.active ? "#205EA3" : "#8B93A1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>}
            {p.icon === "laptop" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.active ? "#205EA3" : "#8B93A1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M1 21h22"/></svg>}
            {p.icon === "tv" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={p.active ? "#205EA3" : "#8B93A1"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l-5 5-5-5"/></svg>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[8.5px] font-heading font-semibold leading-tight" style={{ color: p.active ? "var(--color-primary)" : "var(--color-text-primary)" }}>{p.label}</div>
            <div className="text-[7.5px] text-text-tertiary">{p.sub}</div>
          </div>
          <div className="text-[8.5px] font-heading font-semibold shrink-0" style={{ color: p.active ? "var(--color-primary)" : "var(--color-text-secondary)" }}>{p.price}</div>
        </div>
      ))}
      <div className="mt-auto rounded-[8px] flex items-center justify-center gap-1.5 py-2" style={{ background: "var(--color-primary)" }}>
        <span className="text-[9px] font-heading font-semibold text-white">Select Product</span>
        <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  );
}

/* ─── Slide 2: Choose Installment ───────────── */
function SlideChooseInstallment() {
  return (
    <div className="h-full flex flex-col px-3 pt-9 pb-3 gap-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "rgba(32,94,163,0.08)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#205EA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-[7px] w-16 rounded-full mb-1" style={{ background: "rgba(20,24,31,0.10)" }} />
          <div className="h-[6px] w-10 rounded-full" style={{ background: "rgba(91,100,114,0.10)" }} />
        </div>
        <div className="text-[10px] font-heading font-semibold text-text-primary shrink-0">Rs 1.3L</div>
      </div>
      <div className="text-[8px] font-sans font-medium text-text-tertiary uppercase tracking-wide mt-1">Choose Installment</div>
      {[
        { label: "3 mo",  price: "43,917", active: false },
        { label: "6 mo",  price: "21,958", active: true  },
        { label: "9 mo",  price: "14,639", active: false },
        { label: "12 mo", price: "10,979", active: false },
      ].map((plan) => (
        <div key={plan.label} className="rounded-[10px] px-2.5 py-2 flex items-center justify-between"
          style={{
            background: plan.active ? "rgba(32,94,163,0.08)" : "var(--color-surface)",
            border: `1.5px solid ${plan.active ? "rgba(32,94,163,0.35)" : "var(--color-border)"}`,
          }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-[1.5px] flex items-center justify-center"
              style={{ borderColor: plan.active ? "var(--color-primary)" : "var(--color-border-strong)" }}>
              {plan.active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-primary)" }} />}
            </div>
            <span className="text-[9px] font-heading font-semibold" style={{ color: plan.active ? "var(--color-primary)" : "var(--color-text-secondary)" }}>
              {plan.label}
            </span>
          </div>
          <span className="text-[9px] font-sans" style={{ color: plan.active ? "var(--color-primary)" : "var(--color-text-tertiary)" }}>
            Rs {plan.price}
          </span>
        </div>
      ))}
      <div className="mt-auto rounded-[8px] flex items-center justify-center gap-1.5 py-2" style={{ background: "var(--color-primary)" }}>
        <span className="text-[9px] font-heading font-semibold text-white">Confirm Plan</span>
        <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  );
}

/* ─── Slide 3: Choose Payment & Order ─────── */
function SlideChoosePayment() {
  const methods = [
    { id: "jazz", label: "JazzCash", sub: "0% markup", active: true, color: "#205EA3", bg: "rgba(32,94,163,0.10)" },
    { id: "easy", label: "Easypaisa", sub: "Instant transfer", active: false, color: "#4A7A1E", bg: "rgba(74,122,30,0.09)" },
    { id: "bank", label: "Bank Transfer", sub: "All major banks", active: false, color: "#5B6472", bg: "rgba(91,100,114,0.08)" },
  ];
  return (
    <div className="h-full flex flex-col px-3 pt-9 pb-3 gap-2">
      <div className="text-[8px] font-sans font-medium text-text-tertiary uppercase tracking-wide">Choose Payment</div>
      {methods.map((m) => (
        <div key={m.id} className="rounded-[10px] px-2.5 py-2.5 flex items-center gap-2"
          style={{
            background: m.active ? m.bg : "var(--color-surface)",
            border: `1.5px solid ${m.active ? m.color + "55" : "var(--color-border)"}`,
          }}>
          <div className="w-2.5 h-2.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0"
            style={{ borderColor: m.active ? m.color : "var(--color-border-strong)" }}>
            {m.active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />}
          </div>
          <div className="flex-1">
            <div className="text-[9px] font-heading font-semibold" style={{ color: m.active ? m.color : "var(--color-text-secondary)" }}>{m.label}</div>
            <div className="text-[7.5px] text-text-tertiary">{m.sub}</div>
          </div>
        </div>
      ))}
      {/* Order summary */}
      <div className="w-full h-px mt-1" style={{ background: "var(--color-border)" }} />
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-[8px] text-text-secondary">Product</span>
          <span className="text-[8px] font-medium text-text-primary">iPhone 15 Pro</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[8px] text-text-secondary">Plan</span>
          <span className="text-[8px] font-medium text-text-primary">6 months</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[8px] text-text-secondary">Monthly</span>
          <span className="text-[8px] font-semibold" style={{ color: "var(--color-primary)" }}>Rs 21,958</span>
        </div>
      </div>
      <div className="mt-auto rounded-[8px] flex items-center justify-center gap-1.5 py-2" style={{ background: "var(--color-primary)" }}>
        <span className="text-[9px] font-heading font-semibold text-white">Place Order</span>
        <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Floating cards
───────────────────────────────────────────── */

function BottomLeftCard({ slide }: { slide: number }) {
  const cards = [
    // Slide 0 — product count
    { icon: "star", label: "1,200+ Products", sub: "across 5 categories" },
    // Slide 1 — selected plan
    { icon: "check", label: "Rs 21,958/mo", sub: "6-month plan selected" },
    // Slide 2 — order confirmed
    { icon: "check", label: "Order Placed!", sub: "Delivery in 3–5 days" },
  ];
  const card = cards[slide];
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-card)] px-4 py-3 flex items-center gap-3"
      style={{ boxShadow: "0 8px 24px rgba(20,24,31,0.10), 0 1px 3px rgba(20,24,31,0.06)" }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: card.icon === "check" ? "rgba(74,122,30,0.12)" : "rgba(32,94,163,0.10)" }}>
        {card.icon === "check" ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="#4A7A1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#205EA3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        )}
      </div>
      <div>
        <div className="text-[11px] text-text-tertiary font-sans leading-none mb-0.5">{card.sub}</div>
        <div className="text-[14px] font-heading font-semibold text-text-primary leading-tight">{card.label}</div>
      </div>
    </div>
  );
}

function TopRightCard({ slide }: { slide: number }) {
  const cards = [
    { label: "Free Delivery", sub: "Nationwide", color: "#4A7A1E", bg: "rgba(74,122,30,0.10)", icon: "truck" },
    { label: "0% Hidden Fees", sub: "No extra charges", color: "#205EA3", bg: "rgba(32,94,163,0.10)", icon: "shield" },
    { label: "Secure Payment", sub: "256-bit encrypted", color: "#205EA3", bg: "rgba(32,94,163,0.10)", icon: "lock" },
  ];
  const card = cards[slide];
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-card)] px-3 py-2.5 flex items-center gap-2"
      style={{ boxShadow: "0 6px 20px rgba(20,24,31,0.09), 0 1px 3px rgba(20,24,31,0.05)" }}>
      <div className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0" style={{ background: card.bg }}>
        {card.icon === "truck" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/></svg>}
        {card.icon === "shield" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
        {card.icon === "lock" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
      </div>
      <div>
        <div className="text-[10px] font-sans font-medium text-text-primary leading-none">{card.label}</div>
        <div className="text-[9px] text-text-tertiary">{card.sub}</div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────
   Main exported component
───────────────────────────────────────────── */

const SLIDE_SCREENS = [SlideChooseProduct, SlideChooseInstallment, SlideChoosePayment];
const FADE_DURATION = 0.35;

export function HeroMockup() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Advance slide
  function goNext() {
    setCurrent((c) => (c + 1) % 3);
  }

  // Auto-advance every 2s, pauses when user manually clicked a dot
  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(goNext, 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reducedMotion]);

  const SlideScreen = SLIDE_SCREENS[current];

  return (
    <>
    {/* Bubble keyframes */}
    <style>{`
      @keyframes water-ripple {
        0%   { width: 20px; height: 20px; opacity: 0.7; border-width: 2px; }
        100% { width: 320px; height: 320px; opacity: 0;   border-width: 1px; }
      }
      .water-ring {
        position: absolute;
        border-radius: 9999px;
        pointer-events: none;
        border: 2px solid rgba(130, 182, 63, 0.55);
        background: transparent;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: water-ripple var(--dur, 2s) cubic-bezier(0.15, 0.5, 0.25, 1) var(--delay, 0ms) infinite;
      }
    `}</style>
    <motion.div
      aria-hidden="true"
      className="flex-1 flex flex-col items-center justify-center gap-5 relative w-full max-w-[380px] md:max-w-none mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
    >
      {/* Background accent blob */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none motion-reduce:hidden" style={{ zIndex: 0 }}>
        <div className="w-[320px] h-[320px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(32,94,163,0.09) 0%, rgba(130,182,63,0.06) 55%, transparent 75%)", filter: "blur(32px)" }} />
      </div>

      {/* Fixed-size composition container — clickable to advance */}
      <div
        className="relative cursor-pointer select-none"
        style={{ width: 280, height: 460 }}
        onClick={goNext}
        role="button"
        tabIndex={-1}
      >
        {/* Continuous water-ripple rings from phone center */}
        {!reducedMotion && [0, 500, 1000, 1500].map((delay, i) => (
          <div
            key={i}
            className="water-ring"
            style={{
              zIndex: 1,
              ["--delay" as string]: `${delay}ms`,
              ["--dur" as string]: "2s",
            }}
          />
        ))}

        {/* Floating bottom-left card */}
        <div className="absolute -left-4 bottom-8 md:-left-10 z-30">
          <AnimatePresence mode="wait">
            <motion.div
              key={`bl-${current}`}
              initial={reducedMotion ? false : { opacity: 0, x: -8, y: 4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, x: -8, y: 4 }}
              transition={{ duration: FADE_DURATION, ease: [0.25, 1, 0.5, 1] }}
            >
              <BottomLeftCard slide={current} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Phone frame */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20" style={{ width: 220, height: 420 }}>
          <div className="absolute inset-0 rounded-[36px] border-[7px] border-[#1E2533] bg-[#0D1117]"
            style={{ boxShadow: "0 20px 48px rgba(20,24,31,0.18), 0 4px 12px rgba(20,24,31,0.12), inset 0 1px 0 rgba(255,255,255,0.06)" }} />
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-16 h-[18px] rounded-full bg-[#0D1117] z-30 border border-[#1E2533]" />
          <div className="absolute inset-[7px] rounded-[30px] overflow-hidden" style={{ background: "var(--color-bg)" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`screen-${current}`}
                className="h-full"
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reducedMotion ? {} : { opacity: 0 }}
                transition={{ duration: FADE_DURATION, ease: "easeInOut" }}
              >
                <SlideScreen />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floating top-right card */}
        <div className="absolute -right-4 top-14 md:-right-8 z-30">
          <AnimatePresence mode="wait">
            <motion.div
              key={`tr-${current}`}
              initial={reducedMotion ? false : { opacity: 0, x: 8, y: -4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, x: 8, y: -4 }}
              transition={{ duration: FADE_DURATION, ease: [0.25, 1, 0.5, 1] }}
            >
              <TopRightCard slide={current} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot navigation */}
      <div className="flex items-center gap-2 mt-1 relative z-10">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(i);
              setPaused(true);
              setTimeout(() => setPaused(false), 8000);
            }}
            className="transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              background: i === current ? "var(--color-primary)" : "var(--color-border-strong)",
              opacity: i === current ? 1 : 0.45,
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
    </>
  );
}
