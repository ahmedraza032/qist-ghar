"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { slugify, formatPKR } from "@/lib/helpers/format";
import { ProductVariantEditor, ProductVariants, VariantAttribute } from "./product-variant-editor";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  brands: Brand[];
  product: any | null;
  defaultVariants?: any[];
}

export function ProductForm({ categories, brands, product, defaultVariants = [] }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const isEdit = !!product;

  const [name, setName] = React.useState(product?.name || "");
  const [slug, setSlug] = React.useState(product?.slug || "");
  const [brandId, setBrandId] = React.useState(product?.brand_id || "");
  const [categoryId, setCategoryId] = React.useState(product?.category_id || "");
  const [description, setDescription] = React.useState(product?.description || "");
  const [basePrice, setBasePrice] = React.useState(product?.base_price?.toString() || "");
  const [markupPercent, setMarkupPercent] = React.useState(product?.markup_percent?.toString() ?? "0");
  const [downPaymentPercent, setDownPaymentPercent] = React.useState(product?.down_payment_percent?.toString() ?? "25");
  const [isPublished, setIsPublished] = React.useState(product?.is_published ?? false);
  const [images, setImages] = React.useState<string[]>(product?.images || []);
  const [imageInput, setImageInput] = React.useState("");
  const [specs, setSpecs] = React.useState<{ key: string; value: string }[]>(
    product?.specs ? Object.entries(product.specs as Record<string, string>).map(([k, v]) => ({ key: k, value: v })) : []
  );

  // Parse existing variants or initialize from defaults if new product
  const initialVariants: ProductVariants = React.useMemo(() => {
    if (product?.variant_attributes && product.variant_attributes.length > 0) {
      const attrs = product.variant_attributes.map((a: any) => ({
        id: a.id,
        name: a.name,
        options: a.options.map((o: any) => ({ id: o.id, value: o.value })),
      }));
      const combos = (product.variant_combinations || []).map((c: any) => ({
        id: c.id,
        options: c.combination_options.map((co: any) => {
          // Find option value from id
          for (const a of attrs) {
            const opt = a.options.find((o: any) => o.id === co.variant_option_id);
            if (opt) return opt.value;
          }
          return "";
        }).filter(Boolean),
        price_adjustment: c.price_adjustment,
        stock_qty: c.stock_qty,
      }));
      return { attributes: attrs, combinations: combos };
    }
    
    if (!isEdit && defaultVariants.length > 0) {
      return {
        attributes: defaultVariants.map((d: any) => ({ name: d.attribute_name, options: [] })),
        combinations: []
      };
    }

    return { attributes: [], combinations: [] };
  }, [product, defaultVariants, isEdit]);

  const [variants, setVariants] = React.useState<ProductVariants>(initialVariants);

  const [saving, setSaving] = React.useState(false);

  const base = parseFloat(basePrice) || 0;
  const markup = parseFloat(markupPercent) || 0;
  const totalPrice = Math.round(base * (1 + markup / 100));
  const dpPct = parseFloat(downPaymentPercent) || 0;
  const minDownPayment = Math.round(base * (dpPct / 100));
  const financeAmount = Math.max(0, totalPrice - minDownPayment);
  const DURATIONS = [3, 6, 9, 12];

  function addImage() {
    if (imageInput.trim()) {
      setImages((prev) => [...prev, imageInput.trim()]);
      setImageInput("");
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function addSpec() {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  }

  function updateSpec(idx: number, field: "key" | "value", val: string) {
    setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  }

  function removeSpec(idx: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);

    const specObj: Record<string, string> = {};
    specs.filter((s) => s.key).forEach((s) => {
      specObj[s.key] = s.value;
    });

    const payload = {
      name,
      slug: slug || slugify(name),
      brand_id: brandId || null,
      category_id: categoryId || null,
      description,
      base_price: parseInt(basePrice) || 0,
      stock_qty: product?.stock_qty || 0,
      markup_percent: parseFloat(markupPercent) || 0,
      down_payment_percent: parseFloat(downPaymentPercent) || 0,
      is_published: isPublished,
      imagesJson: JSON.stringify(images),
      specsJson: JSON.stringify(specObj),
      variantsJson: JSON.stringify(variants),
    };

    try {
      if (isEdit) {
        const result = await updateProduct(product.id, payload);
        if (!result.success) {
          addToast({ title: "Error", description: result.error || "Failed to update", variant: "destructive" });
        } else {
          addToast({ title: "Saved", description: "Product updated." });
          router.push("/admin/products");
          router.refresh();
        }
      } else {
        const result = await createProduct(payload);
        if (!result.success) {
          addToast({ title: "Error", description: result.error || "Failed to create", variant: "destructive" });
        } else {
          addToast({ title: "Created", description: "Product added." });
          router.push("/admin/products");
          router.refresh();
        }
      }
    } catch (err) {
      addToast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-md">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Product" : "Add Product"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Price (PKR)</Label>
              <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="space-y-2">
              <Label>Markup (%)</Label>
              <Input type="number" value={markupPercent} onChange={(e) => setMarkupPercent(e.target.value)} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="space-y-2">
              <Label>Min Down Payment (%)</Label>
              <Input type="number" value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(e.target.value)} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Price (Base + Markup)</span>
              <span className="font-semibold">{formatPKR(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Down Payment ({downPaymentPercent || 0}%)</span>
              <span className="font-semibold">{formatPKR(minDownPayment)}</span>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Duration</th>
                  <th className="text-right py-2 font-medium">Total Installments</th>
                </tr>
              </thead>
              <tbody>
                {DURATIONS.map((d) => (
                  <tr key={d} className="border-b border-border">
                    <td className="py-2">{d} months</td>
                    <td className="py-2 text-right font-medium">{formatPKR(Math.round(financeAmount / d))} x {d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Image URL"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
            />
            <Button type="button" variant="outline" onClick={addImage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded border border-border overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <p className="text-sm text-muted-foreground">No images added.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Specifications</CardTitle>
          <Button variant="outline" size="sm" onClick={addSpec}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder="Key"
                value={spec.key}
                onChange={(e) => updateSpec(i, "key", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => removeSpec(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {specs.length === 0 && (
            <p className="text-sm text-muted-foreground">No specifications.</p>
          )}
        </CardContent>
      </Card>

      <ProductVariantEditor
        value={variants}
        onChange={setVariants}
        basePrice={parseFloat(basePrice) || 0}
      />

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">Published</span>
        </label>
        <Button onClick={handleSave} disabled={saving} className="ml-auto gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
