"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CalendarClock,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/installments", label: "Installments", icon: CalendarClock },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-muted/30">
      <ScrollProgress />
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-background border-r border-border fixed inset-y-0">
        <div className="flex items-center h-16 px-6 border-b border-border">
          <Link href="/admin" className="font-bold text-lg flex items-center">
            <Image src="/logo.png" alt="QistGhar Logo" width={120} height={40} className="h-8 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-[#EAF1FA] hover:text-[#205EA3]"
                )}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[calc(100%-8px)] w-[3px] bg-[#205EA3] origin-center rounded-r-md"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                    />
                  )}
                </AnimatePresence>
                <link.icon className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Link
            href="/api/admin/logout"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-muted-foreground hover:bg-[#EAF1FA] hover:text-[#205EA3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/admin" className="font-bold text-lg flex items-center">
            <Image src="/logo.png" alt="QistGhar Logo" width={120} height={40} className="h-8 w-auto object-contain" />
          </Link>
          <button onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-[#EAF1FA] hover:text-[#205EA3]"
                )}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[calc(100%-8px)] w-[3px] bg-[#205EA3] origin-center rounded-r-md"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                    />
                  )}
                </AnimatePresence>
                <link.icon className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <div className="flex items-center h-16 px-4 border-b border-border bg-background lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 font-bold text-lg">
            <span className="text-primary">Qist</span>Ghar Admin
          </span>
        </div>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
