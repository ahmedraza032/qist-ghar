"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Building2, Phone, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const [business, setBusiness] = React.useState({
    name: "QistGhar",
    phone: "0300-1234567",
    address: "123 Main Street, Gulberg III",
    city: "Lahore",
  });

  const [paymentMethods, setPaymentMethods] = React.useState({
    jazzcash: true,
    easypaisa: true,
    bank: true,
    card: true,
  });

  function handleSave() {
    setLoading(true);
    setTimeout(() => {
      addToast({ title: "Saved", description: "Settings have been saved (demo — not persisted)." });
      setLoading(false);
      router.refresh();
    }, 500);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure store-wide settings.</p>
      </div>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Business Information
          </CardTitle>
          <CardDescription>Your store contact and address details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={business.name} onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={business.phone} onChange={(e) => setBusiness((b) => ({ ...b, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={business.address} onChange={(e) => setBusiness((b) => ({ ...b, address: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={business.city} onChange={(e) => setBusiness((b) => ({ ...b, city: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Methods</CardTitle>
          <CardDescription>Enable or disable payment methods.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(paymentMethods).map(([key, enabled]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) =>
                  setPaymentMethods((m) => ({ ...m, [key]: e.target.checked }))
                }
                className="h-4 w-4"
              />
              <span className="text-sm capitalize">{key === "bank" ? "Bank Transfer" : key === "card" ? "Credit/Debit Card" : key}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} size="lg" className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Settings
      </Button>
    </div>
  );
}
