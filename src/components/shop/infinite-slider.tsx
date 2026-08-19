"use client";
import { motion } from "motion/react";
import React from "react";

export function InfiniteSlider({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden w-full flex whitespace-nowrap [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-16 min-w-full shrink-0 items-center justify-around pl-16"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      >
        {children}
      </motion.div>
      <motion.div
        className="flex gap-16 min-w-full shrink-0 items-center justify-around pl-16"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
