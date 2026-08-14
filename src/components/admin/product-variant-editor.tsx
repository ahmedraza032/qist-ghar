"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPKR } from "@/lib/helpers/format";

export interface VariantAttribute {
  id?: string;
  name: string;
  options: { id?: string; value: string }[];
}

export interface VariantCombination {
  id?: string;
  options: string[]; // array of option values
  price_adjustment: number;
  stock_qty: number;
}

export interface ProductVariants {
  attributes: VariantAttribute[];
  combinations: VariantCombination[];
}

interface ProductVariantEditorProps {
  value: ProductVariants;
  onChange: (val: ProductVariants) => void;
  basePrice: number;
}

export function ProductVariantEditor({ value, onChange, basePrice }: ProductVariantEditorProps) {
  const [newAttrName, setNewAttrName] = React.useState("");

  function generateCombinations(attrs: VariantAttribute[]): string[][] {
    if (attrs.length === 0) return [];
    const combos: string[][] = [[]];
    for (const attr of attrs) {
      if (attr.options.length === 0) continue;
      const currentCombos = [...combos];
      combos.length = 0;
      for (const combo of currentCombos) {
        for (const opt of attr.options) {
          combos.push([...combo, opt.value]);
        }
      }
    }
    return combos.filter(c => c.length > 0);
  }

  function handleAddAttribute() {
    if (!newAttrName.trim()) return;
    const newAttrs = [...value.attributes, { name: newAttrName.trim(), options: [] }];
    onChange({
      attributes: newAttrs,
      combinations: reconcileCombinations(newAttrs, value.combinations),
    });
    setNewAttrName("");
  }

  function handleRemoveAttribute(idx: number) {
    const newAttrs = value.attributes.filter((_, i) => i !== idx);
    onChange({
      attributes: newAttrs,
      combinations: reconcileCombinations(newAttrs, value.combinations),
    });
  }

  function handleAddOption(attrIdx: number, optionValue: string) {
    if (!optionValue.trim()) return;
    const newAttrs = [...value.attributes];
    if (newAttrs[attrIdx].options.find((o) => o.value.toLowerCase() === optionValue.trim().toLowerCase())) return;
    
    newAttrs[attrIdx].options.push({ value: optionValue.trim() });
    onChange({
      attributes: newAttrs,
      combinations: reconcileCombinations(newAttrs, value.combinations),
    });
  }

  function handleRemoveOption(attrIdx: number, optIdx: number) {
    const newAttrs = [...value.attributes];
    newAttrs[attrIdx].options = newAttrs[attrIdx].options.filter((_, i) => i !== optIdx);
    onChange({
      attributes: newAttrs,
      combinations: reconcileCombinations(newAttrs, value.combinations),
    });
  }

  function reconcileCombinations(attrs: VariantAttribute[], oldCombos: VariantCombination[]): VariantCombination[] {
    const validOptionArrays = generateCombinations(attrs);
    
    return validOptionArrays.map(optArr => {
      // Find existing combo
      const existing = oldCombos.find(c => {
        if (c.options.length !== optArr.length) return false;
        return c.options.every(o => optArr.includes(o));
      });

      if (existing) {
        return { ...existing, options: optArr }; // maintain updated order
      }
      return { options: optArr, price_adjustment: 0, stock_qty: 0 };
    });
  }

  function updateCombination(idx: number, field: keyof VariantCombination, val: number) {
    const newCombos = [...value.combinations];
    newCombos[idx] = { ...newCombos[idx], [field]: val };
    onChange({ ...value, combinations: newCombos });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variant Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {value.attributes.map((attr, aIdx) => (
            <div key={aIdx} className="space-y-3 p-4 border border-border rounded-md relative">
              <button
                type="button"
                onClick={() => handleRemoveAttribute(aIdx)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              
              <Label className="text-base font-semibold">{attr.name}</Label>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {attr.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center bg-muted px-2 py-1 rounded-md text-sm">
                    <span>{opt.value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(aIdx, oIdx)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm mt-2">
                <Input
                  placeholder={`Add option (e.g. ${attr.name === "Color" ? "Black" : "256GB"})`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption(aIdx, e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2 max-w-sm">
            <Input
              placeholder="New Attribute (e.g. Color, Storage)"
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAttribute();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddAttribute}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {value.combinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variant Combinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground whitespace-nowrap">
                    <th className="text-left py-2 font-medium">Variant</th>
                    <th className="text-right py-2 font-medium">Price Adjustment</th>
                    <th className="text-right py-2 font-medium">Final Base Price</th>
                    <th className="text-right py-2 font-medium">Stock Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {value.combinations.map((combo, cIdx) => (
                    <tr key={cIdx} className="border-b border-border">
                      <td className="py-2 pr-4">{combo.options.join(" • ")}</td>
                      <td className="py-2 px-2 text-right">
                        <Input
                          type="number"
                          className="w-32 ml-auto text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={combo.price_adjustment}
                          onChange={(e) => updateCombination(cIdx, "price_adjustment", parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-primary whitespace-nowrap">
                        {formatPKR(basePrice + (combo.price_adjustment || 0))}
                      </td>
                      <td className="py-2 pl-2 text-right">
                        <Input
                          type="number"
                          className="w-24 ml-auto text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={combo.stock_qty}
                          onChange={(e) => updateCombination(cIdx, "stock_qty", parseInt(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
