"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, Grid3X3, List, ChevronDown, X } from "lucide-react";
import { TextShimmerWave } from "@/components/core/text-shimmer-wave";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/helpers/format";
import { calculateInstallment, getAllInstallmentOptions } from "@/lib/helpers/installments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  images: string[];
  stock_qty: number;
  created_at?: string;
  brand?: { name: string } | null;
  category?: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ProductListingClientProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export function ProductListingClient({
  products,
  categories,
  brands,
}: ProductListingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [search, setSearch] = React.useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = React.useState(
    searchParams.get("category") || ""
  );
  const [selectedBrand, setSelectedBrand] = React.useState(
    searchParams.get("brand") || ""
  );
  const [sortBy, setSortBy] = React.useState(searchParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = React.useState({
    min: searchParams.get("min_price") || "",
    max: searchParams.get("max_price") || "",
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.name.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (p) => p.category?.slug === selectedCategory
      );
    }

    if (selectedBrand) {
      result = result.filter(
        (p) => p.brand?.name === selectedBrand
      );
    }

    if (priceRange.min) {
      result = result.filter(
        (p) => p.base_price >= parseInt(priceRange.min)
      );
    }

    if (priceRange.max) {
      result = result.filter(
        (p) => p.base_price <= parseInt(priceRange.max)
      );
    }

    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.base_price - b.base_price);
        break;
      case "price_high":
        result.sort((a, b) => b.base_price - a.base_price);
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at ?? "").getTime() -
            new Date(a.created_at ?? "").getTime()
        );
        break;
    }

    return result;
  }, [products, search, selectedCategory, selectedBrand, sortBy, priceRange]);

  const activeFilters = [
    selectedCategory && {
      key: "category",
      label: categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory,
    },
    selectedBrand && {
      key: "brand",
      label: selectedBrand,
    },
    priceRange.min && { key: "min_price", label: `Min ${formatPKR(parseInt(priceRange.min))}` },
    priceRange.max && { key: "max_price", label: `Max ${formatPKR(parseInt(priceRange.max))}` },
  ].filter(Boolean) as { key: string; label: string }[];

  function clearFilter(key: string) {
    if (key === "category") setSelectedCategory("");
    if (key === "brand") setSelectedBrand("");
    if (key === "min_price") setPriceRange((p) => ({ ...p, min: "" }));
    if (key === "max_price") setPriceRange((p) => ({ ...p, max: "" }));
  }

  function clearAll() {
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange({ min: "", max: "" });
    setSearch("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-bg min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <motion.h1
            className="font-heading text-3xl font-semibold bg-gradient-to-r from-text-primary via-primary to-text-primary bg-[length:200%_auto] text-transparent bg-clip-text inline-block"
            animate={{ backgroundPosition: ["200% center", "-200% center"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          >
            Products
          </motion.h1>
          <p className="text-text-secondary mt-1 text-sm">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface border-border rounded-[var(--radius-control)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 text-text-primary placeholder:text-text-tertiary transition-all"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 lg:hidden bg-surface border-border text-text-primary rounded-[var(--radius-control)] hover:bg-surface-alt"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs bg-primary-subtle text-primary border-none">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-[var(--radius-control)] border border-border bg-surface px-3 pr-8 text-sm appearance-none cursor-pointer text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-text-secondary" />
        </div>

        {/* View toggle */}
        <div className="hidden md:flex items-center border border-border rounded-[var(--radius-control)] overflow-hidden bg-surface">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2 transition-colors",
              view === "grid" ? "bg-primary-subtle text-primary" : "text-text-secondary hover:bg-surface-alt"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2 transition-colors",
              view === "list" ? "bg-primary-subtle text-primary" : "text-text-secondary hover:bg-surface-alt"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {activeFilters.map((f) => (
            <Badge key={f.key} variant="secondary" className="gap-1 pr-1 bg-surface border border-border text-text-primary rounded-full hover:bg-surface-alt font-sans">
              {f.label}
              <button
                onClick={() => clearFilter(f.key)}
                className="ml-1 rounded-full hover:bg-border p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={clearAll}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors ml-2 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar Filters — desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="font-heading font-semibold text-[14px] text-text-primary mb-3">Category</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={cn(
                    "block w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-sm font-sans transition-colors",
                    !selectedCategory
                      ? "bg-primary-subtle text-primary font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={cn(
                      "block w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-sm font-sans transition-colors",
                      selectedCategory === cat.slug
                        ? "bg-primary-subtle text-primary font-medium"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="font-heading font-semibold text-[14px] text-text-primary mb-3">Brand</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedBrand("")}
                  className={cn(
                    "block w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-sm font-sans transition-colors",
                    !selectedBrand
                      ? "bg-primary-subtle text-primary font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                  )}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.name)}
                    className={cn(
                      "block w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-sm font-sans transition-colors",
                      selectedBrand === brand.name
                        ? "bg-primary-subtle text-primary font-medium"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                    )}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-heading font-semibold text-[14px] text-text-primary mb-3">Price Range (PKR)</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, min: e.target.value }))
                  }
                  className="h-9 bg-surface border-border rounded-[var(--radius-control)] focus-visible:ring-2 focus-visible:ring-primary text-text-primary"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, max: e.target.value }))
                  }
                  className="h-9 bg-surface border-border rounded-[var(--radius-control)] focus-visible:ring-2 focus-visible:ring-primary text-text-primary"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile filters overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div
              className="absolute right-0 top-0 bottom-0 w-80 bg-surface p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading font-semibold text-lg text-text-primary">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="text-text-secondary hover:text-text-primary">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="font-heading font-semibold text-[14px] text-text-primary mb-3">Category</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setSelectedCategory(""); setShowFilters(false); }}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-sm font-sans transition-colors",
                        !selectedCategory ? "bg-primary-subtle text-primary font-medium" : "text-text-secondary hover:bg-surface-alt"
                      )}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); setShowFilters(false); }}
                        className={cn(
                          "block w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-sm font-sans transition-colors",
                          selectedCategory === cat.slug ? "bg-primary-subtle text-primary font-medium" : "text-text-secondary hover:bg-surface-alt"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-[14px] text-text-primary mb-3">Brand</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setSelectedBrand(""); setShowFilters(false); }}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-sm font-sans transition-colors",
                        !selectedBrand ? "bg-primary-subtle text-primary font-medium" : "text-text-secondary hover:bg-surface-alt"
                      )}
                    >
                      All Brands
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => { setSelectedBrand(brand.name); setShowFilters(false); }}
                        className={cn(
                          "block w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-sm font-sans transition-colors",
                          selectedBrand === brand.name ? "bg-primary-subtle text-primary font-medium" : "text-text-secondary hover:bg-surface-alt"
                        )}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-[14px] text-text-primary mb-3">Price Range (PKR)</h3>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" value={priceRange.min} onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))} className="h-9 bg-surface border-border rounded-[var(--radius-control)] text-text-primary" />
                    <Input placeholder="Max" type="number" value={priceRange.max} onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))} className="h-9 bg-surface border-border rounded-[var(--radius-control)] text-text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search query."
              action={
                <Button variant="outline" onClick={clearAll} className="bg-surface border-border rounded-[var(--radius-control)] text-text-primary hover:bg-surface-alt">
                  Clear Filters
                </Button>
              }
            />
          ) : view === "grid" ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.8, type: 'spring', bounce: 0.3 },
                    },
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.8, type: 'spring', bounce: 0.3 },
                    },
                  }}
                >
                  <ProductListCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const installment = calculateInstallment(product.base_price, 3);
  const planOptions = getAllInstallmentOptions(product.base_price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group interactive-card-green flex flex-col rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-xs)]"
    >
      <div className="shimmer-overlay" />
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-image)] m-2 shrink-0 z-10">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-surface-alt text-text-tertiary text-sm">
            No image
          </div>
        )}
        {product.stock_qty <= 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 rounded-full px-3 py-1">
            Out of Stock
          </Badge>
        )}
      </div>
      <div className="p-4 pt-3 flex flex-col flex-1">
        {product.brand && (
          <p className="text-text-tertiary text-[12px] uppercase tracking-[0.04em] mb-1 font-sans font-medium">
            {product.brand.name}
          </p>
        )}
        <h3 className="font-medium font-sans text-text-primary text-[15px] leading-snug line-clamp-2 transition-colors relative z-10">
          {product.name}
        </h3>
        <div className="mt-auto pt-4 relative z-10">
          <p className="font-heading font-medium text-secondary-text tabular-nums text-xl">
            {formatPKR(product.base_price)}
          </p>
          
          {/* Signature Element: 4-tick bar representing plans */}
          <div className="flex items-center gap-[4px] mt-1.5 mb-2">
            {planOptions.map((plan, i) => (
              <div
                key={plan.duration}
                className={cn(
                  "w-[3px] h-[12px] rounded-sm",
                  i === 0 ? "bg-primary" : "border-[1.5px] border-border-strong bg-transparent"
                )}
              />
            ))}
          </div>

          <p className="text-[13px] text-text-secondary font-sans">
            From <span className="font-medium tabular-nums text-text-primary">{formatPKR(installment.monthlyPayment)}/mo</span>
          </p>
        </div>
        <div className="mt-4 pt-1">
          <motion.span 
            className="text-[13px] border-[1.5px] border-border-strong text-text-primary px-3 py-2 rounded-[var(--radius-control)] font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] w-full flex items-center justify-center group-hover:border-primary group-hover:text-primary group-hover:bg-primary-subtle hover:!bg-primary hover:!text-white hover:-translate-y-[1px] hover:shadow-[var(--shadow-sm)] active:scale-[0.98]"
            whileHover="hover"
            initial="initial"
          >
            <TextShimmerWave>Buy on Installments</TextShimmerWave>
          </motion.span>
        </div>
      </div>
    </Link>
  );
}

function ProductListCard({ product }: { product: Product }) {
  const installment = calculateInstallment(product.base_price, 3);
  const planOptions = getAllInstallmentOptions(product.base_price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group interactive-card-green flex flex-col sm:flex-row gap-4 rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-xs)] p-3"
    >
      <div className="shimmer-overlay" />
      <div className="relative w-full sm:w-48 h-48 sm:h-auto rounded-[var(--radius-image)] overflow-hidden shrink-0 z-10">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 200px"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-surface-alt text-text-tertiary text-sm">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 py-1 pr-2">
        <div>
          {product.brand && (
            <p className="text-text-tertiary text-[12px] uppercase tracking-[0.04em] mb-1 font-sans font-medium">
              {product.brand.name}
            </p>
          )}
          <h3 className="font-medium font-sans text-text-primary text-[16px] leading-snug transition-colors relative z-10">
            {product.name}
          </h3>
        </div>
        
        <div className="mt-auto pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
          <div>
            <p className="font-heading font-medium text-secondary-text tabular-nums text-2xl">
              {formatPKR(product.base_price)}
            </p>
            
            <div className="flex items-center gap-[4px] mt-2 mb-2">
              {planOptions.map((plan, i) => (
                <div
                  key={plan.duration}
                  className={cn(
                    "w-[3px] h-[12px] rounded-sm",
                    i === 0 ? "bg-primary" : "border-[1.5px] border-border-strong bg-transparent"
                  )}
                />
              ))}
            </div>

            <p className="text-[13px] text-text-secondary font-sans">
              From <span className="font-medium tabular-nums text-text-primary">{formatPKR(installment.monthlyPayment)}/mo</span>
            </p>
          </div>
          
          <div className="sm:self-end">
            <motion.span 
              className="text-[13px] border-[1.5px] border-border-strong text-text-primary px-4 py-2 rounded-[var(--radius-control)] font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] inline-block w-full sm:w-auto text-center group-hover:border-primary group-hover:text-primary group-hover:bg-primary-subtle hover:!bg-primary hover:!text-white hover:-translate-y-[1px] hover:shadow-[var(--shadow-sm)] active:scale-[0.98]"
              whileHover="hover"
              initial="initial"
            >
              <TextShimmerWave>Buy on Installments</TextShimmerWave>
            </motion.span>
          </div>
        </div>
      </div>
    </Link>
  );
}
