"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { updateSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface SettingsFormProps {
  settings: Record<string, string>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [whatsappNumber, setWhatsappNumber] = React.useState(settings.whatsapp_number || "");
  const [businessName, setBusinessName] = React.useState(settings.business_name || "");
  const [businessAddress, setBusinessAddress] = React.useState(settings.business_address || "");
  
  // Pages content
  const [pageAbout, setPageAbout] = React.useState(settings.page_about_us || "");
  const [pageContact, setPageContact] = React.useState(settings.page_contact || "");
  const [pageTerms, setPageTerms] = React.useState(settings.page_terms_of_service || "");
  const [pagePrivacy, setPagePrivacy] = React.useState(settings.page_privacy_policy || "");

  const [saving, setSaving] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = await updateSettings({
      whatsapp_number: whatsappNumber.trim(),
      business_name: businessName.trim(),
      business_address: businessAddress.trim(),
      page_about_us: pageAbout,
      page_contact: pageContact,
      page_terms_of_service: pageTerms,
      page_privacy_policy: pagePrivacy,
    });

    setSaving(false);

    if (result.success) {
      addToast({ title: "Saved", description: "Settings updated." });
      router.refresh();
    } else {
      addToast({ title: "Error", description: result.error || "Failed to save", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Handoff</CardTitle>
          <CardDescription>
            Storefront orders are sent to this WhatsApp number via wa.me.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input
              id="whatsapp_number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="923001234567"
            />
            <p className="text-xs text-muted-foreground">
              Use international format without &quot;+&quot; (e.g. 923001234567).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="QistGhar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <Input
              id="business_address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Shop address"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Page Content</CardTitle>
          <CardDescription>
            Manage the text content for the static pages linked in the footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="page_about">About Us</Label>
            <Textarea
              id="page_about"
              rows={4}
              value={pageAbout}
              onChange={(e) => setPageAbout(e.target.value)}
              placeholder="About Us content..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_contact">Contact</Label>
            <Textarea
              id="page_contact"
              rows={4}
              value={pageContact}
              onChange={(e) => setPageContact(e.target.value)}
              placeholder="Contact content..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_terms">Terms of Service</Label>
            <Textarea
              id="page_terms"
              rows={4}
              value={pageTerms}
              onChange={(e) => setPageTerms(e.target.value)}
              placeholder="Terms of Service content..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page_privacy">Privacy Policy</Label>
            <Textarea
              id="page_privacy"
              rows={4}
              value={pagePrivacy}
              onChange={(e) => setPagePrivacy(e.target.value)}
              placeholder="Privacy Policy content..."
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Settings
      </Button>
    </form>
  );
}
