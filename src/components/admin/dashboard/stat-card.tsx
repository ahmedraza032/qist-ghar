"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/helpers/format";

interface StatCardProps {
  title: string;
  value: number;
  formatType?: "currency" | "number";
  subtitle: string;
  icon: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  delayMs?: number;
}

export function StatCard({ title, value, formatType = "number", subtitle, icon, iconClassName, valueClassName, delayMs = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Only animate if prefers-reduced-motion is not reduce
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 320; // --duration-slow
    
    // ease-out: cubic-bezier(0, 0, 0.2, 1) equivalent
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.max(0, timestamp - startTimestamp - delayMs);
      
      if (progress === 0 && timestamp - startTimestamp < delayMs) {
        window.requestAnimationFrame(step);
        return;
      }
      
      if (progress < duration) {
        const easeProgress = easeOut(progress / duration);
        setDisplayValue(Math.floor(value * easeProgress));
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    const anim = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(anim);
  }, [value, delayMs]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const formattedValue = formatType === "currency" ? formatPKR(displayValue) : displayValue;

  return (
    <Card 
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-border hover:border-[#205EA3]/60 hover:-translate-y-1 shadow-[0_1px_2px_rgba(20,24,31,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(32,94,163,0.22),0_4px_12px_rgba(32,94,163,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2 bg-card cursor-default"
    >
      {/* Dynamic Blue Radial Spotlight Glow following cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(32, 94, 163, 0.15), transparent 70%)`,
        }}
      />

      {/* Blue top edge glow line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#205EA3] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium transition-colors duration-200 group-hover:text-foreground">{title}</CardTitle>
        <div className={cn("transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100", iconClassName)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className={cn("text-2xl font-bold tabular-nums", valueClassName)}>
          {formattedValue}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
