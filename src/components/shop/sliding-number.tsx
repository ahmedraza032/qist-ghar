"use client";

import { motion, AnimatePresence } from "motion/react";

export function SlidingNumber({ value }: { value: string | number }) {
  const characters = value.toString().split("");

  return (
    <span className="inline-flex overflow-hidden relative">
      <AnimatePresence mode="popLayout" initial={false}>
        {characters.map((char, index) => (
          <motion.span
            key={`${index}-${char}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
