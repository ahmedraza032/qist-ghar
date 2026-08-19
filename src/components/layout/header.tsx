"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { Suspense } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products?category=smartphones", label: "Smartphones", category: "smartphones" },
  { href: "/products?category=laptops", label: "Laptops", category: "laptops" },
  { href: "/products?category=tvs", label: "TVs", category: "tvs" },
  { href: "/products?category=home-appliances", label: "Home Appliances", category: "home-appliances" },
  { href: "/products?category=accessories", label: "Accessories", category: "accessories" },
  { href: "/products", label: "All Products" },
];

function HeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const currentCategory = searchParams.get("category");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4">
        <div className="flex-1 flex justify-start">
          <Link 
            href="/" 
            className="flex items-center"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <Image src="/logo-cropped.png" alt="QistGhar Logo" width={420} height={140} className="h-10 md:h-[44px] w-auto object-contain mix-blend-multiply" quality={100} priority />
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-6">
          {navLinks.map((link) => {
            let isActive = false;
            if (link.href === "/") {
              isActive = pathname === "/";
            } else if (link.category) {
              isActive = pathname === "/products" && currentCategory === link.category;
            } else if (link.href === "/products") {
              isActive = pathname === "/products" && !currentCategory;
            } else {
              isActive = pathname.startsWith(link.href);
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-all hover:text-primary relative py-2 active:scale-[0.96]",
                  isActive
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary"
                    : link.label === "Home"
                      ? "text-primary"
                      : "text-text-secondary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 flex justify-end">
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => {
              let isActive = false;
              if (link.href === "/") {
                isActive = pathname === "/";
              } else if (link.category) {
                isActive = pathname === "/products" && currentCategory === link.category;
              } else if (link.href === "/products") {
                isActive = pathname === "/products" && !currentCategory;
              } else {
                isActive = pathname.startsWith(link.href);
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-primary-subtle text-primary border-l-2 border-primary"
                      : link.label === "Home"
                        ? "text-primary hover:bg-surface-alt"
                        : "text-text-secondary hover:bg-surface-alt"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 w-full h-16 border-b border-border bg-surface" />}>
      <HeaderContent />
    </Suspense>
  );
}

