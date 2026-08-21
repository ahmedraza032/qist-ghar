"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, UserPlus } from "lucide-react";
import { createOrder } from "@/lib/actions/orders";
import { calculateInstallment, getAllInstallmentOptions, MIN_DOWN_PAYMENT_PCT, MARKUP_TIERS } from "@/lib/helpers/installments";
import { formatPKR } from "@/lib/helpers/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchSelect } from "@/components/admin/search-select";
import { useToast } from "@/components/ui/toast";

const DURATIONS = [3, 6, 9, 12];
const METHODS = ["cash", "jazzcash", "easypaisa", "bank", "card", "whatsapp"];

interface CustomerOption {
  id: string;
  full_name: string;
  phone: string;
}

interface ProductOption {
  id: string;
  name: string;
  base_price: number;
}

export function NewOrderForm({
  customers,
  products,
}: {
  customers: CustomerOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const { addToast } = useToast();

  const [customerMode, setCustomerMode] = React.useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = React.useState("");
  const [newCustomer, setNewCustomer] = React.useState({ name: "", phone: "", address: "", city: "" });

  const [productId, setProductId] = React.useState("");
  const [duration, setDuration] = React.useState(3);
  const [downPayment, setDownPayment] = React.useState<number | "">("");
  const [method, setMethod] = React.useState("cash");
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = React.useState(false);

  const product = products.find((p) => p.id === productId) || null;
  const basePrice = product?.base_price || 0;
  const totalPrice = Math.round(basePrice * (1 + (MARKUP_TIERS[duration] ?? 0) / 100));

  const minDownPayment = product
    ? Math.ceil(totalPrice * (MIN_DOWN_PAYMENT_PCT / 100))
    : 0;

  const activeDownPayment = typeof downPayment === "number" && downPayment >= minDownPayment
    ? downPayment
    : minDownPayment;

  const breakdown = product
    ? calculateInstallment(basePrice, duration, undefined, activeDownPayment)
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !breakdown) return;

    if (customerMode === "existing" && !customerId) {
      addToast({ title: "Error", description: "Select a customer.", variant: "destructive" });
      return;
    }
    if (customerMode === "new" && !newCustomer.phone.trim()) {
      addToast({ title: "Error", description: "Customer phone is required.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const result = await createOrder({
      customerId: customerMode === "existing" ? customerId : null,
      customerName: newCustomer.name,
      customerPhone: newCustomer.phone,
      customerAddress: newCustomer.address,
      customerCity: newCustomer.city,
      productId: product.id,
      durationMonths: duration,
      downPaymentAmount: breakdown.downPayment,
      monthlyAmount: breakdown.monthlyPayment,
      totalAmount: breakdown.totalPrice,
      paymentMethod: method,
      startDate,
    });

    setSaving(false);

    if (result.success) {
      addToast({ title: "Order created", description: `Order #${result.orderId?.slice(0, 8)}` });
      router.push("/admin/orders");
      router.refresh();
    } else {
      addToast({ title: "Error", description: result.error || "Failed to create order", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <LinkBack href="/admin/orders" />
        <h1 className="text-2xl sm:text-3xl font-bold">New Order</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5" /> Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(["existing", "new"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setCustomerMode(m)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  customerMode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {m === "existing" ? "Existing customer" : "New customer"}
              </button>
            ))}
          </div>

          {customerMode === "existing" ? (
            <div className="space-y-2">
              <Label>Search Customer</Label>
              <SearchSelect
                options={customers.map((c) => ({ value: c.id, label: c.full_name, sublabel: c.phone }))}
                value={customerId}
                onChange={setCustomerId}
                placeholder="Search customer by name or phone..."
                emptyText="No customers found"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newCustomer.name} onChange={(e) => setNewCustomer((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={newCustomer.phone} onChange={(e) => setNewCustomer((s) => ({ ...s, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={newCustomer.city} onChange={(e) => setNewCustomer((s) => ({ ...s, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={newCustomer.address} onChange={(e) => setNewCustomer((s) => ({ ...s, address: e.target.value }))} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Plus className="h-5 w-5" /> Product &amp; Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <SearchSelect
              options={products.map((p) => ({ value: p.id, label: p.name, sublabel: formatPKR(p.base_price) }))}
              value={productId}
              onChange={setProductId}
              placeholder="Search product by name..."
              emptyText="No products found"
            />
          </div>

          {product && (
            <>
              <div>
                <Label>Duration</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={cn(
                        "px-3 py-2 rounded-md border text-sm font-medium transition-colors",
                        d === duration ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary/50 hover:bg-muted"
                      )}
                    >
                      {d} mo
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Down Payment</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground font-mono">Rs</span>
                  <Input
                    type="number"
                    min={minDownPayment}
                    className="h-10 w-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={downPayment === "" ? activeDownPayment : downPayment}
                    onChange={(e) => setDownPayment(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    onBlur={() => {
                      if (typeof downPayment === "number" && downPayment < minDownPayment) setDownPayment(minDownPayment);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum {formatPKR(minDownPayment)} ({MIN_DOWN_PAYMENT_PCT}%)</p>
              </div>

              {breakdown && (
                <div className="rounded-md bg-muted/50 p-3 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{duration} x {formatPKR(breakdown.monthlyPayment)}</span>
                  </div>
                  <div className="border-t border-border pt-2 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-1 font-medium">Duration</th>
                          <th className="text-right py-1 font-medium">Total Installments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAllInstallmentOptions(basePrice, activeDownPayment).map((opt) => (
                          <tr
                            key={opt.duration}
                            className={cn(
                              "border-b border-border last:border-0 cursor-pointer",
                              opt.duration === duration && "bg-primary/5"
                            )}
                            onClick={() => setDuration(opt.duration)}
                          >
                            <td className="py-1">{opt.duration} months</td>
                            <td className="py-1 text-right font-medium">
                              {formatPKR(opt.monthlyPayment)} x {opt.duration}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>{m === "bank" ? "Bank Transfer" : m === "card" ? "Card" : m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving || !product} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Create Order
      </Button>
    </form>
  );
}

function LinkBack({ href }: { href: string }) {
  return (
    <a href={href} className="p-2 hover:bg-muted rounded-md">
      <ArrowLeft className="h-5 w-5" />
    </a>
  );
}
