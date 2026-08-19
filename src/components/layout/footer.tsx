"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const footerLinks = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?category=smartphones", label: "Smartphones" },
    { href: "/products?category=laptops", label: "Laptops" },
    { href: "/products?category=tvs", label: "TVs" },
  ],
  Account: [
    { href: "/products", label: "All Products" },
    { href: "/", label: "How It Works" },
    { href: "#", label: "Contact" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="border-t border-border bg-bg-tinted">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
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
              <Image src="/logo-cropped.png" alt="QistGhar Logo" width={420} height={140} className="h-10 md:h-[48px] w-auto object-contain mix-blend-multiply" quality={100} />
            </Link>
            <p className="text-sm text-text-secondary mt-2 max-w-xs">
              Buy phones and electronics on easy installments. Pay monthly with JazzCash, Easypaisa, or bank transfer.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} QistGhar. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-secondary">Accepted payments:</span>
            <div className="flex items-center gap-3">
              <div className="h-6 px-2 rounded bg-[#E31B23] flex items-center justify-center text-white text-xs font-bold">JazzCash</div>
              <div className="h-6 px-2 rounded bg-[#07A800] flex items-center justify-center text-white text-xs font-bold">Easypaisa</div>
              <img src="https://cdn.simpleicons.org/visa/1A1F71" alt="Visa" className="h-5" />
              <img src="https://cdn.simpleicons.org/mastercard/EB001B" alt="Mastercard" className="h-5" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
