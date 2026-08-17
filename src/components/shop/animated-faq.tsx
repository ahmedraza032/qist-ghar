"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { TextShimmerWave } from "@/components/core/text-shimmer-wave";

export function AnimatedFAQ() {
  const faqs = [
    {
      q: "Are there any hidden fees?",
      a: "No! What you see is what you pay. We don't charge any processing fees or hidden markup beyond the listed installment price."
    },
    {
      q: "How do I pay my installments?",
      a: "You can easily pay your monthly installments through JazzCash, Easypaisa, or a direct bank transfer right from your dashboard."
    },
    {
      q: "What if I miss a payment?",
      a: "We offer a 3-day grace period. After that, a small late fee applies. You can always contact our support team if you need to adjust your payment date."
    },
    {
      q: "Do I need a credit card?",
      a: "Absolutely not! Our service is designed to be accessible to everyone. We only require basic identity verification to get you approved."
    }
  ];

  const [showFaqs, setShowFaqs] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col items-center">
      <motion.button 
        whileHover="hover"
        initial="initial"
        onClick={() => setShowFaqs(!showFaqs)}
        className="group w-full md:w-auto flex items-center justify-between md:justify-center gap-4 px-8 py-4 bg-surface border border-border shadow-[var(--shadow-sm)] rounded-[var(--radius-card)] hover:border-primary hover:bg-primary-subtle hover:-translate-y-[2px] active:animate-press-spring transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:animate-none"
      >
        <span className="font-heading text-xl md:text-2xl font-semibold text-text-primary group-hover:text-primary transition-colors">
          Frequently Asked Questions
        </span>
        <motion.div animate={{ rotate: showFaqs ? 180 : 0 }} transition={{ type: "spring", bounce: 0.2 }}>
          <ChevronDown className="h-6 w-6 text-text-tertiary group-hover:text-primary transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showFaqs && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-full overflow-hidden"
          >
            <div className="w-full flex flex-col space-y-3 pt-8 pb-4">
              {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className="border border-border rounded-[var(--radius-card)] bg-surface overflow-hidden shadow-[var(--shadow-xs)]">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:bg-surface-hover hover:bg-surface-hover transition-colors group/item"
                    >
                      <span className="font-heading font-medium text-[16px] text-text-primary group-hover/item:text-primary transition-colors">{faq.q}</span>
                      <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ type: "spring", bounce: 0.2 }}>
                        <ChevronRight className="h-5 w-5 text-text-tertiary transition-colors group-hover/item:text-primary" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        >
                          <div className="px-5 pb-5 pt-0 text-[15px] text-text-secondary font-sans leading-relaxed">
                            {faq.a}
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
