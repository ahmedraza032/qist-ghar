import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Image as ImageIcon } from "lucide-react";
import { ProductsTable } from "@/components/admin/products-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createServiceClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, base_price, is_published, images, brand:brands(name), category:categories(name)")
    .is("parent_product_id", null)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  const { data: orders } = await supabase
    .from("orders")
    .select("product_id");

  const soldByProduct: Record<string, number> = {};
  (orders || []).forEach((o: any) => {
    soldByProduct[o.product_id] = (soldByProduct[o.product_id] || 0) + 1;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = (products || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">{list.length} products</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No products yet.</p>
            <Link href="/admin/products/new" className="mt-2 inline-block">
              <Button variant="outline" size="sm">Add your first product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ProductsTable products={list} soldByProduct={soldByProduct} />
      )}
    </div>
  );
}
