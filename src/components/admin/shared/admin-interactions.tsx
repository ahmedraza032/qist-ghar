"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * 1. Animated Search Input
 */
export function SearchInput({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) {
  return (
    <div className="relative max-w-md group w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-focus-within:text-[#205EA3]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="pl-9 transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:border-[#205EA3] focus-visible:ring-2 focus-visible:ring-[#EAF1FA] focus-visible:ring-offset-0"
      />
    </div>
  );
}

/**
 * 2. Animated Status Badge
 */
export function AnimatedStatusBadge({ 
  status, 
  variant, 
  isPositiveState 
}: { 
  status: string; 
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; 
  isPositiveState: boolean;
}) {
  const [prevStatus, setPrevStatus] = useState(status);
  const [pulse, setPulse] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (status !== prevStatus) {
      setPrevStatus(status);
      if (isPositiveState) {
        setPulse(true);
        const timer = setTimeout(() => setPulse(false), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [status, prevStatus, isPositiveState]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* @ts-ignore generic variant bypass */}
          <Badge variant={variant}>{status}</Badge>
        </motion.div>
      </AnimatePresence>

      {pulse && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute inset-0 rounded-full border-[1.5px] border-[#4A7A1E] pointer-events-none"
        />
      )}
    </div>
  );
}

/**
 * 3. Icon Action Button
 */
export function IconActionButton({ onClick, children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      onClick={onClick} 
      className={cn("relative group/btn p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2 transition-all", className)} 
      {...props}
    >
      <div className="absolute inset-0 rounded-full bg-[#F0F2F5] opacity-0 scale-50 transition-all duration-150 ease-out group-hover/btn:opacity-100 group-hover/btn:scale-100 group-active/btn:scale-110 group-active/btn:opacity-50" />
      <div className="relative z-10 text-muted-foreground transition-colors duration-150 group-hover/btn:text-[#205EA3] flex items-center justify-center">
        {children}
      </div>
    </button>
  );
}

/**
 * 4. Animated Table Row
 */
export function TableRow({ children, className, isNew = false }: { children: React.ReactNode, className?: string, isNew?: boolean }) {
  const baseClasses = cn(
    "group/row border-b border-border transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#F0F2F5]",
    "[&>td:first-child]:relative [&>td:first-child]:before:content-[''] [&>td:first-child]:before:absolute [&>td:first-child]:before:inset-y-0 [&>td:first-child]:before:left-0 [&>td:first-child]:before:w-[3px] [&>td:first-child]:before:bg-[#205EA3] [&>td:first-child]:before:opacity-0 [&>td:first-child]:before:transition-opacity [&>td:first-child]:before:duration-200 hover:[&>td:first-child]:before:opacity-100",
    className
  );

  if (isNew) {
    return (
      <motion.tr
        initial={{ backgroundColor: "#F1F7E9" }}
        animate={{ backgroundColor: "transparent" }}
        transition={{ duration: 1.2, ease: "linear" }}
        className={baseClasses}
      >
        {children}
      </motion.tr>
    );
  }
  
  return (
    <tr className={baseClasses}>
      {children}
    </tr>
  );
}

/**
 * 5. Table Header Cell (Sortable optionally)
 */
export function TableHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <th className={cn("text-left py-3 px-4 font-medium group cursor-default transition-colors duration-150 hover:text-foreground", className)}>
      {children}
    </th>
  );
}

/**
 * 6. Loading Skeleton Table
 */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number, cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-muted-foreground">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="text-left py-3 px-4">
                <div className="h-4 w-24 rounded bg-muted/50" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={rIdx} className="border-b border-border">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <td key={cIdx} className="py-3 px-4">
                  <div className="h-5 w-full rounded bg-[#F0F2F5] relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#E2E5EA] to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
