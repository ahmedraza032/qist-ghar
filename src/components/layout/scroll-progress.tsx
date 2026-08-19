"use client";

import { motion, useScroll } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-[100] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
