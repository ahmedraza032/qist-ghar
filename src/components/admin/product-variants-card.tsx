"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatPKR } from "@/lib/helpers/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteProduct } from "@/lib/actions/products";

interface VariantItem {
  id: string;
  name: string;
  variant_label: string | null;
  base_price: number;
}

export function ProductVariantsCard({ baseProductId, variants }: { baseProductId: string; variants: VariantItem[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this variant? This cannot be undone.")) return;
    setDeletingId(id);
    const result = await deleteProduct(id);
    setDeletingId(null);
    if (result.success) {
      addToast({ title: "Deleted", description: "Variant removed." });
      router.refresh();
    } else {
      addToast({ title: "Error", description: result.error || "Failed to delete", variant: "destructive" });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Variants</CardTitle>
        <Link href={`/admin/products/new?parent=${baseProductId}`}>
          <Button size="sm" className="gap-1">
            <Plus className="h-3 w-3" /> Add Variant
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variants yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {variants.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{v.variant_label || v.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPKR(v.base_price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/products/${v.id}`} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                  >
                    {deletingId === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
