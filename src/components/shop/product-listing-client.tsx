"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Grid3X3, List, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/helpers/format";
import { calculateInstallment } from "@/lib/helpers/installments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>

        {/* View toggle */}
        <div className="hidden md:flex items-center border border-input rounded-md">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2",
              view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2",
              view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
            <Badge key={f.key} variant="secondary" className="gap-1 pr-1">
              {f.label}
              <button
                onClick={() => clearFilter(f.key)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:text-foreground ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar Filters — desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Category</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={cn(
                    "block w-full text-left px-2 py-1.5 rounded text-sm",
                    !selectedCategory
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={cn(
                      "block w-full text-left px-2 py-1.5 rounded text-sm",
                      selectedCategory === cat.slug
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Brand</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedBrand("")}
                  className={cn(
                    "block w-full text-left px-2 py-1.5 rounded text-sm",
                    !selectedBrand
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.name)}
                    className={cn(
                      "block w-full text-left px-2 py-1.5 rounded text-sm",
                      selectedBrand === brand.name
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Price Range (PKR)</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, min: e.target.value }))
                  }
                  className="h-9"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((p) => ({ ...p, max: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile filters overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div
              className="absolute right-0 top-0 bottom-0 w-80 bg-background p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Category</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setSelectedCategory(""); setShowFilters(false); }}
                      className={cn(
                        "block w-full text-left px-2 py-1.5 rounded text-sm",
                        !selectedCategory ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); setShowFilters(false); }}
                        className={cn(
                          "block w-full text-left px-2 py-1.5 rounded text-sm",
                          selectedCategory === cat.slug ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Brand</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setSelectedBrand(""); setShowFilters(false); }}
                      className={cn(
                        "block w-full text-left px-2 py-1.5 rounded text-sm",
                        !selectedBrand ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      All Brands
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => { setSelectedBrand(brand.name); setShowFilters(false); }}
                        className={cn(
                          "block w-full text-left px-2 py-1.5 rounded text-sm",
                          selectedBrand === brand.name ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Price Range (PKR)</h3>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" value={priceRange.min} onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))} className="h-9" />
                    <Input placeholder="Max" type="number" value={priceRange.max} onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))} className="h-9" />
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
                <Button variant="outline" onClick={clearAll}>
                  Clear Filters
                </Button>
              }
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <ProductListCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const installment = calculateInstallment(product.base_price, 3);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No image
          </div>
        )}
        {product.stock_qty <= 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Out of Stock
          </Badge>
        )}
      </div>
      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.brand.name}
          </p>
        )}
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="mt-2">
          <p className="text-lg font-bold">{formatPKR(product.base_price)}</p>
          <p className="text-xs text-primary font-medium mt-0.5">
            From {formatPKR(installment.monthlyPayment)}/month
          </p>
        </div>
        <div className="mt-3">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
            Buy on Installments
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductListCard({ product }: { product: Product }) {
  const installment = calculateInstallment(product.base_price, 3);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex gap-4 rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow p-4"
    >
      <div className="relative w-32 h-32 bg-muted rounded-md overflow-hidden shrink-0">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="128px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {product.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.brand.name}
          </p>
        )}
        <h3 className="font-medium group-hover:text-primary transition-colors mt-0.5">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-3">
          <p className="text-xl font-bold">{formatPKR(product.base_price)}</p>
          <p className="text-sm text-primary font-medium">
            From {formatPKR(installment.monthlyPayment)}/mo
          </p>
        </div>
        <div className="mt-2">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
            Buy on Installments
          </span>
        </div>
      </div>
    </Link>
  );
}
