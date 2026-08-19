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

  const formattedValue = formatType === "currency" ? formatPKR(displayValue) : displayValue;

  return (
    <Card 
      tabIndex={0}
      className="group relative overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] border-border hover:border-[#CBD0D8] shadow-[0_1px_2px_rgba(20,24,31,0.04)] hover:shadow-[0_1px_3px_rgba(20,24,31,0.06),0_1px_2px_rgba(20,24,31,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100", iconClassName)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold tabular-nums", valueClassName)}>
          {formattedValue}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
