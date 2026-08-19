"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Are there any hidden fees?",
    a: "No! What you see is what you pay. We don't charge any processing fees or hidden markup beyond the listed installment price.",
    color: "#205EA3",
    ring: "rgba(32,94,163,0.18)",
    bg: "rgba(32,94,163,0.05)",
    glow: "rgba(32,94,163,0.12)",
    num: "01",
  },
  {
    q: "How do I pay my installments?",
    a: "You can easily pay your monthly installments through JazzCash, Easypaisa, or a direct bank transfer right from your dashboard.",
    color: "#82B63F",
    ring: "rgba(130,182,63,0.22)",
    bg: "rgba(130,182,63,0.05)",
    glow: "rgba(130,182,63,0.14)",
    num: "02",
  },
  {
    q: "What if I miss a payment?",
    a: "We offer a 3-day grace period. After that, a small late fee applies. You can always contact our support team if you need to adjust your payment date.",
    color: "#205EA3",
    ring: "rgba(32,94,163,0.18)",
    bg: "rgba(32,94,163,0.05)",
    glow: "rgba(32,94,163,0.12)",
    num: "03",
  },
  {
    q: "Do I need a credit card?",
    a: "Absolutely not! Our service is designed to be accessible to everyone. We only require basic identity verification to get you approved.",
    color: "#82B63F",
    ring: "rgba(130,182,63,0.22)",
    bg: "rgba(130,182,63,0.05)",
    glow: "rgba(130,182,63,0.14)",
    num: "04",
  },
];

export function AnimatedFAQ() {
  const [showFaqs, setShowFaqs] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Dropdown Header Button */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setShowFaqs(!showFaqs);
          if (showFaqs) setOpenIndex(null);
        }}
        className="group w-full md:w-auto flex items-center justify-between md:justify-center gap-5 px-8 py-4.5 bg-surface border border-border shadow-[var(--shadow-sm)] rounded-[var(--radius-card)] hover:border-primary hover:bg-primary-subtle transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{
          boxShadow: showFaqs ? "0 6px 20px rgba(32,94,163,0.12)" : undefined,
          borderColor: showFaqs ? "rgba(32,94,163,0.4)" : undefined,
          background: showFaqs ? "#FFFFFF" : undefined,
        }}
        aria-expanded={showFaqs}
      >
        <span className="font-heading text-xl md:text-2xl font-semibold text-text-primary group-hover:text-primary transition-colors">
          Frequently Asked Questions
        </span>
        <motion.div
          animate={{ rotate: showFaqs ? 180 : 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
        >
          <ChevronDown className="h-6 w-6 text-text-tertiary group-hover:text-primary transition-colors" />
        </motion.div>
      </motion.button>

      {/* FAQ accordion items */}
      <AnimatePresence>
        {showFaqs && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-full overflow-hidden pt-8"
          >
            <div className="w-full flex flex-col gap-4 pb-2">
              {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;

                return (
                  <div
                    key={idx}
                    className="rounded-2xl border overflow-hidden transition-all duration-300 ease-out"
                    style={{
                      borderColor: isOpen ? faq.ring : "rgba(226,229,234,0.8)",
                      background: isOpen ? faq.bg : "#fff",
                      boxShadow: isOpen
                        ? `0 4px 24px ${faq.glow}`
                        : "0 1px 3px rgba(20,24,31,0.05)",
                    }}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full flex items-center gap-4 px-5 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      aria-expanded={isOpen}
                    >
                      {/* Number ring badge (small) */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        <div
                          className="absolute rounded-full transition-opacity duration-300"
                          style={{
                            inset: "-6px",
                            border: `1.5px dashed ${faq.color}`,
                            opacity: isOpen ? 0.3 : 0.15,
                          }}
                        />
                        <div
                          className="w-[52px] h-[52px] rounded-full flex flex-col items-center justify-center transition-all duration-300"
                          style={{
                            border: `2.5px solid ${faq.color}`,
                            boxShadow: isOpen ? `0 0 0 4px ${faq.ring}` : "none",
                            background: "#fff",
                          }}
                        >
                          <span
                            className="font-heading font-bold text-[15px] leading-none tracking-tight"
                            style={{ color: faq.color }}
                          >
                            {faq.num}
                          </span>
                        </div>
                      </div>

                      {/* Question text */}
                      <span
                        className="flex-1 font-heading font-semibold text-[16px] leading-snug transition-colors duration-200"
                        style={{ color: isOpen ? faq.color : "#14181F" }}
                      >
                        {faq.q}
                      </span>

                      {/* Toggle icon */}
                      <div
                        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                          background: isOpen ? faq.ring : "rgba(226,229,234,0.6)",
                          color: isOpen ? faq.color : "#8B93A1",
                        }}
                      >
                        {isOpen ? (
                          <Minus className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                        )}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                        >
                          <div className="pl-[84px] pr-5 pb-5 pt-0">
                            <p className="text-[14px] text-text-secondary leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
