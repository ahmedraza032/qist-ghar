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
import { useToast } from "@/components/ui/toast";
import { slugify, formatPKR } from "@/lib/helpers/format";
import { calculateInstallment, DURATIONS, MARKUP_TIERS, DEFAULT_DOWN_PAYMENT_PCT } from "@/lib/helpers/installments";
import { ProductVariantsCard } from "./product-variants-card";

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
  parentProduct?: any | null;
  variants?: any[];
}

export function ProductForm({ categories, brands, product, parentProduct, variants = [] }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const isEdit = !!product;
  const isVariantMode = !!parentProduct;
  const source = parentProduct ?? product;

  const [name, setName] = React.useState(source?.name || "");
  const [slug, setSlug] = React.useState(product?.slug || "");
  const [brandId, setBrandId] = React.useState(source?.brand_id || "");
  const [categoryId, setCategoryId] = React.useState(source?.category_id || "");
  const [description, setDescription] = React.useState(source?.description || "");
  const [basePrice, setBasePrice] = React.useState(source?.base_price?.toString() || "");
  const [variantLabel, setVariantLabel] = React.useState(product?.variant_label || "");
  const [hasVariants, setHasVariants] = React.useState<boolean>(product?.has_variants ?? false);
  const [tenurePricing, setTenurePricing] = React.useState<Record<number, { markup: string; downPayment: string }>>(() => {
    const init: Record<number, { markup: string; downPayment: string }> = {};
    for (const d of DURATIONS) {
      const existing = (source?.tenure_pricing || []).find((p: any) => Number(p.duration_months) === d);
      init[d] = {
        markup: existing != null ? String(existing.markup_percent) : String(MARKUP_TIERS[d] ?? 0),
        downPayment: existing != null ? String(existing.down_payment_percent) : String(DEFAULT_DOWN_PAYMENT_PCT),
      };
    }
    return init;
  });
  const [isPublished, setIsPublished] = React.useState(source?.is_published ?? false);
  const [images, setImages] = React.useState<string[]>(source?.images || []);
  const [imageInput, setImageInput] = React.useState("");
  const [specs, setSpecs] = React.useState<{ key: string; value: string }[]>(
    source?.specs ? Object.entries(source.specs as Record<string, string>).map(([k, v]) => ({ key: k, value: v })) : []
  );

  const [saving, setSaving] = React.useState(false);

  const base = parseFloat(basePrice) || 0;
  const tenureBreakdowns = DURATIONS.map((d) => {
    const markup = parseFloat(tenurePricing[d].markup) || 0;
    const dp = parseFloat(tenurePricing[d].downPayment) || 0;
    return calculateInstallment(base, d, markup, undefined, dp);
  });
  const numberInputClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

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

    const tenurePricingArray = DURATIONS.map((d) => ({
      duration_months: d,
      markup_percent: parseFloat(tenurePricing[d].markup) || 0,
      down_payment_percent: parseFloat(tenurePricing[d].downPayment) || 0,
    }));

    const payload = {
      name,
      slug: slug || slugify(name),
      brand_id: brandId || null,
      category_id: categoryId || null,
      description,
      base_price: parseInt(basePrice) || 0,
      stock_qty: source?.stock_qty || 0,
      markup_percent: parseFloat(tenurePricing[3].markup) || 0,
      down_payment_percent: parseFloat(tenurePricing[3].downPayment) || 0,
      is_published: isPublished,
      imagesJson: JSON.stringify(images),
      specsJson: JSON.stringify(specObj),
      tenurePricingJson: JSON.stringify(tenurePricingArray),
      has_variants: hasVariants,
      parent_product_id: parentProduct?.id ?? product?.parent_product_id ?? null,
      variant_label: variantLabel || null,
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
        <h1 className="text-2xl sm:text-3xl font-bold">{isEdit ? "Edit Product" : isVariantMode ? "Add Variant" : "Add Product"}</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {!isVariantMode && !product?.parent_product_id && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="h-4 w-4" />
              <span className="text-sm">This product has variants</span>
            </label>
          )}
          {(isVariantMode || !!product?.parent_product_id) && (
            <div className="space-y-2">
              <Label>Variant Label (short)</Label>
              <Input value={variantLabel} onChange={(e) => setVariantLabel(e.target.value)} placeholder="e.g. 256GB Blue" />
            </div>
          )}
        </CardContent>
      </Card>

      {hasVariants && isEdit && (
        <ProductVariantsCard baseProductId={product.id} variants={variants} />
      )}
      {hasVariants && !isEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Save this product first, then you&apos;ll be able to add its variants.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Base Price (PKR)</Label>
            <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={numberInputClass} />
          </div>

          <div className="space-y-3">
            <Label>Tenure Pricing</Label>
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th className="text-left py-2 px-3 font-medium">Tenure</th>
                    <th className="text-left py-2 px-3 font-medium">Markup (%)</th>
                    <th className="text-left py-2 px-3 font-medium">Min Down Payment (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {DURATIONS.map((d) => (
                    <tr key={d} className="border-b border-border last:border-b-0">
                      <td className="py-2 px-3 font-medium">{d} months</td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          value={tenurePricing[d].markup}
                          onChange={(e) => setTenurePricing((prev) => ({ ...prev, [d]: { ...prev[d], markup: e.target.value } }))}
                          className={numberInputClass}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          value={tenurePricing[d].downPayment}
                          onChange={(e) => setTenurePricing((prev) => ({ ...prev, [d]: { ...prev[d], downPayment: e.target.value } }))}
                          className={numberInputClass}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3 overflow-x-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan Preview</span>
            </div>
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Duration</th>
                  <th className="text-right py-2 font-medium">Total Price</th>
                  <th className="text-right py-2 font-medium">Down Payment</th>
                  <th className="text-right py-2 font-medium">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {tenureBreakdowns.map((b) => (
                  <tr key={b.duration} className="border-b border-border">
                    <td className="py-2">{b.duration} months</td>
                    <td className="py-2 text-right font-medium">{formatPKR(b.totalPrice)}</td>
                    <td className="py-2 text-right">{formatPKR(b.downPayment)}</td>
                    <td className="py-2 text-right font-medium">{formatPKR(b.monthlyPayment)} x {b.duration}</td>
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
            <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
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
              <Button variant="ghost" size="icon" onClick={() => removeSpec(i)} className="self-end sm:self-auto shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {specs.length === 0 && (
            <p className="text-sm text-muted-foreground">No specifications.</p>
          )}
        </CardContent>
      </Card>

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
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
