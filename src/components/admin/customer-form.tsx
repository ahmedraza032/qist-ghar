"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function CustomerForm({ customer }: { customer: any | null }) {
  const router = useRouter();
  const { addToast } = useToast();
  const isEdit = !!customer;

  const [fullName, setFullName] = React.useState(customer?.full_name || "");
  const [phone, setPhone] = React.useState(customer?.phone || "");
  const [address, setAddress] = React.useState(customer?.address || "");
  const [city, setCity] = React.useState(customer?.city || "");
  const [notes, setNotes] = React.useState(customer?.notes || "");
  const [saving, setSaving] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = { full_name: fullName.trim(), phone: phone.trim(), address, city, notes };

    const result = isEdit
      ? await updateCustomer(customer.id, payload)
      : await createCustomer(payload);

    setSaving(false);

    if (result.success) {
      addToast({ title: "Saved", description: isEdit ? "Customer updated." : "Customer created." });
      router.push("/admin/customers");
      router.refresh();
    } else {
      addToast({ title: "Error", description: result.error || "Failed to save", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => router.back()} className="p-2 hover:bg-muted rounded-md">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Customer" : "Add Customer"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX XXXXXXX" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isEdit ? "Update Customer" : "Create Customer"}
      </Button>
    </form>
  );
}
