"use client";

import Link from "next/link";
import { motion } from "motion/react";

interface LogoProps {
  href?: string;
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { text: "text-xl",   urdu: "text-[11px]" },
  md: { text: "text-2xl",  urdu: "text-[12px]" },
  lg: { text: "text-3xl",  urdu: "text-sm" },
};

export function Logo({ href, className = "", size = "md" }: LogoProps) {
  const { text, urdu } = sizeMap[size];

  const inner = (
    <span className={`inline-flex flex-col items-start gap-0.5 select-none ${className}`}>
      {/* Urdu label above */}
      <span
        className={`${urdu} font-semibold leading-none`}
        dir="rtl"
        style={{
          background: "linear-gradient(90deg, #205EA3, #82B63F, #205EA3)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        قسط گھر
      </span>
      {/* Main wordmark */}
      <motion.span
        className={`${text} font-bold font-heading leading-none tracking-tight inline-block`}
        style={{
          background: "linear-gradient(90deg, #205EA3, #82B63F, #205EA3)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        animate={{ backgroundPosition: ["200% center", "-200% center"] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      >
        QiSTGhar
      </motion.span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {inner}
      </Link>
    );
  }

  return inner;
}
