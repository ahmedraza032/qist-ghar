"use client";

import React from "react";
import Link from "next/link";
import { Search, Pencil, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/helpers/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [page, setPage] = React.useState(1);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? products.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.slug || "").toLowerCase().includes(q) ||
          (p.brand?.name || "").toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q)
      )
    : products;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products by name, brand, or category..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border">
          <div className="py-8 text-center text-muted-foreground text-sm">
            No products match your search.
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Product</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-right py-3 px-4 font-medium">Price</th>
                  <th className="text-center py-3 px-4 font-medium">Sold</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((product: any) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/30">
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
                    <Badge variant={product.is_published ? "success" : "secondary"}>
                      {product.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
