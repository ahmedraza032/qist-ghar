import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Percent, RotateCcw } from "lucide-react";

const categories = [
  { name: "Smartphones", slug: "smartphones", emoji: "📱" },
  { name: "Laptops", slug: "laptops", emoji: "💻" },
  { name: "TVs", slug: "tvs", emoji: "📺" },
  { name: "Home Appliances", slug: "home-appliances", emoji: "🏠" },
  { name: "Accessories", slug: "accessories", emoji: "🎧" },
];

const steps = [
  {
    step: "01",
    title: "Browse Products",
    desc: "Find phones, laptops, TVs and more from top brands.",
  },
  {
    step: "02",
    title: "Choose Your Plan",
    desc: "Pick a 3, 6, 9, or 12 month installment plan.",
  },
  {
    step: "03",
    title: "Pay Monthly",
    desc: "Pay via JazzCash, Easypaisa, bank transfer, or card.",
  },
];

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Percent, label: "0% Hidden Fees" },
  { icon: RotateCcw, label: "Easy Returns" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[80vh] flex items-center bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 w-full">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
              Pakistan&apos;s Installment Marketplace
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Buy Now, Pay in{" "}
              <span className="text-primary">Easy Installments</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Get phones, laptops, TVs, and appliances delivered to your door.
              Pay monthly with JazzCash, Easypaisa, or bank transfer.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  Browse Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline">
                  View Installment Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="text-sm font-medium text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-4 p-6 rounded-lg border border-border"
            >
              <div className="rounded-full bg-primary/10 p-3">
                <badge.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to start buying on installments?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">
            No credit card required. No hidden fees. Just pick a product, choose
            a plan, and pay monthly.
          </p>
          <Link href="/products" className="mt-8 inline-block">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
