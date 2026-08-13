"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { formatPKR } from "@/lib/helpers/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const total = items.reduce((sum, i) => sum + i.totalPrice, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-muted-foreground" />}
          title="Your cart is empty"
          description="Browse products and add them to your cart to get started."
          action={
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear cart
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="p-4 flex gap-4">
              <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden shrink-0">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.durationMonths} months · {item.markupPercent}% markup
                </p>
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="text-sm text-amount font-medium">
                    Down: {formatPKR(item.downPayment)}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatPKR(item.monthlyPayment)}/mo
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {formatPKR(item.totalPrice)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="self-start p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total ({items.length} item{items.length > 1 ? "s" : ""})</p>
              <p className="text-2xl font-bold">{formatPKR(total)}</p>
            </div>
            <Link href="/checkout">
              <Button size="lg" className="gap-2">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
