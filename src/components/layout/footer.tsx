import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?category=smartphones", label: "Smartphones" },
    { href: "/products?category=laptops", label: "Laptops" },
    { href: "/products?category=tvs", label: "TVs" },
  ],
  Account: [
    { href: "/account", label: "My Account" },
    { href: "/account/orders", label: "My Orders" },
    { href: "/cart", label: "Cart" },
  ],
  Company: [
    { href: "#", label: "About Us" },
    { href: "#", label: "Contact" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Privacy Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-primary">Qist</span>
              <span>Ghar</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Buy phones and electronics on easy installments. Pay monthly with JazzCash, Easypaisa, or bank transfer.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} QistGhar. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Accepted payments:</span>
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
