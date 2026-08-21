"use client";

import React from "react";
import Link from "next/link";
import { Search, Pencil, Image as ImageIcon, ChevronLeft, ChevronRight, Filter, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/helpers/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteProduct } from "@/lib/actions/products";
import { SearchInput, TableRow, TableHeader, AnimatedStatusBadge, IconActionButton } from "@/components/admin/shared/admin-interactions";

const PAGE_SIZE = 30;

function getPageItems(current: number, total: number): (number | string)[] {
  if (total <= 1) return [1];
  const items: (number | string)[] = [];
  const windowSize = 2;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - windowSize && i <= current + windowSize)) {
      items.push(i);
    } else if (items[items.length - 1] !== "...") {
      items.push("...");
    }
  }
  return items;
}

export function ProductsTable({
  products,
  soldByProduct,
}: {
  products: any[];
  soldByProduct?: Record<string, number>;
}) {
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [brandFilter, setBrandFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [sortBy, setSortBy] = React.useState("newest");
  const [page, setPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);

  // Extract unique categories and brands dynamically
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set).sort();
  }, [products]);

  const brands = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand?.name) set.add(p.brand.name);
    });
    return Array.from(set).sort();
  }, [products]);

  const q = query.trim().toLowerCase();

  const filtered = React.useMemo(() => {
    let result = products.filter((p) => {
      // Search query
      if (q) {
        const matchesQuery =
          (p.name || "").toLowerCase().includes(q) ||
          (p.slug || "").toLowerCase().includes(q) ||
          (p.brand?.name || "").toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Category filter
      if (categoryFilter && (p.category?.name || "").toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Brand filter
      if (brandFilter && (p.brand?.name || "").toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }

      // Status filter
      if (statusFilter === "published" && !p.is_published) return false;
      if (statusFilter === "draft" && p.is_published) return false;

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "price_asc") return (a.base_price || 0) - (b.base_price || 0);
      if (sortBy === "price_desc") return (b.base_price || 0) - (a.base_price || 0);
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "sold_desc") return (soldByProduct?.[b.id] ?? 0) - (soldByProduct?.[a.id] ?? 0);
      if (sortBy === "oldest") return (a.created_at || "").localeCompare(b.created_at || "");
      return 0; // Default order (newest first as fetched)
    });

    return result;
  }, [products, q, categoryFilter, brandFilter, statusFilter, sortBy, soldByProduct]);

  React.useEffect(() => {
    setPage(1);
  }, [query, categoryFilter, brandFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters = Boolean(query || categoryFilter || brandFilter || statusFilter || sortBy !== "newest");

  function resetFilters() {
    setQuery("");
    setCategoryFilter("");
    setBrandFilter("");
    setStatusFilter("");
    setSortBy("newest");
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Search (always visible) + mobile filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchInput
            value={query}
            onChange={(val) => {
              setQuery(val);
              setPage(1);
            }}
            placeholder="Search by product name, brand, or category..."
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="sm:hidden shrink-0 min-h-[44px] min-w-[44px]"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Controls */}
      <div className={cn(
        "flex-col sm:flex-row flex-wrap gap-2.5 items-stretch sm:items-center",
        showFilters ? "flex" : "hidden sm:flex"
      )}>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Brand Dropdown */}
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
          <option value="sold_desc">Most Sold</option>
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-10 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
        <span>
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {products.length} products
          {hasActiveFilters && <span className="text-primary ml-1">(filtered)</span>}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <div className="py-12 text-center text-muted-foreground text-sm space-y-3">
            <p>No products match your search and filter criteria.</p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <TableHeader className="w-12 pl-4">#</TableHeader>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader className="text-right">Price</TableHeader>
                  <TableHeader className="text-center">Sold</TableHeader>
                  <TableHeader className="text-center">Status</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {paged.map((product: any, idx: number) => {
                  const serialNumber = (currentPage - 1) * PAGE_SIZE + idx;
                  return (
                    <TableRow key={product.id}>
                      <td className="py-3 pl-4 text-xs font-mono text-muted-foreground w-12">
                        {serialNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted shrink-0 overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 m-2 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">{product.category?.name || "—"}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatPKR(product.base_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {soldByProduct?.[product.id] ?? 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <AnimatedStatusBadge 
                          status={product.is_published ? "Published" : "Draft"} 
                          variant={product.is_published ? "success" : "secondary"} 
                          isPositiveState={product.is_published}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <Link href={`/admin/products/${product.id}`}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#82B63F] hover:bg-[#6FA032] text-white shadow-xs transition-all duration-150 hover:shadow-sm active:scale-95 cursor-pointer">
                              <Pencil className="h-3 w-3" />
                              <span>Edit</span>
                            </span>
                          </Link>
                        </div>
                      </td>
                    </TableRow>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden flex flex-col gap-4">
            {paged.map((product: any, idx: number) => {
              const serialNumber = (currentPage - 1) * PAGE_SIZE + idx;
              return (
                <div key={product.id} className="rounded-lg border border-border overflow-hidden bg-card">
                  <div className="flex items-start gap-3 p-4 border-b border-border">
                    <div className="w-12 h-12 rounded-md bg-muted shrink-0 overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 m-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-muted-foreground">#{serialNumber}</span>
                        <AnimatedStatusBadge
                          status={product.is_published ? "Published" : "Draft"}
                          variant={product.is_published ? "success" : "secondary"}
                          isPositiveState={product.is_published}
                        />
                      </div>
                      <p className="font-medium leading-tight mt-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.brand?.name}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="text-sm">{product.category?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border py-3">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-sm font-medium">{formatPKR(product.base_price)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-muted-foreground">Sold</span>
                      <span className="text-sm font-medium">{soldByProduct?.[product.id] ?? 0}</span>
                    </div>
                    <div className="pt-3">
                      <Link href={`/admin/products/${product.id}`}>
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-[#82B63F] hover:bg-[#6FA032] text-white w-full">
                          <Pencil className="h-3 w-3" />
                          Edit Product
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageItems(currentPage, totalPages).map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === currentPage ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 text-sm"
                    onClick={() => setPage(item as number)}
                  >
                    {item}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
