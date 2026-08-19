"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, Plus, X, Building2, CreditCard, Bell, Palette,
  FileText, Truck, ShieldCheck, Globe, Phone, Hash, Calendar,
  MessageSquare, MapPin, DollarSign, Percent, Clock, Link as LinkIcon,
  ChevronRight,
} from "lucide-react";
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

// ─── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "general",    label: "General",          icon: Building2 },
  { id: "payments",   label: "Payments",         icon: CreditCard },
  { id: "reminders",  label: "Reminders",        icon: Bell },
  { id: "branding",   label: "Branding",         icon: Palette },
  { id: "content",    label: "Page Content",     icon: FileText },
  { id: "delivery",   label: "Delivery",         icon: Truck },
  { id: "security",   label: "Admin & Security", icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Reusable helpers ─────────────────────────────────────────────────────────
function FieldRow({ id, label, hint, children }: { id?: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      {id ? <Label htmlFor={id}>{label}</Label> : <Label>{label}</Label>}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <Button type="submit" disabled={saving} className="gap-2">
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {saving ? "Saving…" : "Save Changes"}
    </Button>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] ${checked ? "bg-[#205EA3]" : "bg-zinc-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = React.useState<TabId>("general");

  // Per-tab saving state
  const [saving, setSaving] = React.useState<Record<TabId, boolean>>({
    general: false, payments: false, reminders: false,
    branding: false, content: false, delivery: false, security: false,
  });

  // ── General ────────────────────────────────────────────────────────────────
  const [businessName, setBusinessName] = React.useState(settings.business_name || "");
  const [businessAddress, setBusinessAddress] = React.useState(settings.business_address || "");
  const [businessHours, setBusinessHours] = React.useState(settings.business_hours || "");
  const [socialFacebook, setSocialFacebook] = React.useState(settings.social_facebook || "");
  const [socialInstagram, setSocialInstagram] = React.useState(settings.social_instagram || "");
  const [socialTiktok, setSocialTiktok] = React.useState(settings.social_tiktok || "");

  // ── Payments ───────────────────────────────────────────────────────────────
  const [whatsappNumber, setWhatsappNumber] = React.useState(settings.whatsapp_number || "");
  const [bankAccountTitle, setBankAccountTitle] = React.useState(settings.bank_account_title || "");
  const [bankName, setBankName] = React.useState(settings.bank_name || "");
  const [bankIban, setBankIban] = React.useState(settings.bank_iban || "");
  const [jazzcashNumber, setJazzcashNumber] = React.useState(settings.jazzcash_number || "");
  const [easypaisaNumber, setEasypaisaNumber] = React.useState(settings.easypaisa_number || "");
  const [defaultDownPaymentPct, setDefaultDownPaymentPct] = React.useState(settings.default_down_payment_pct || "20");
  const [defaultInstallmentDurations, setDefaultInstallmentDurations] = React.useState(settings.default_installment_durations || "3,6,9,12");

  // ── Reminders ──────────────────────────────────────────────────────────────
  const [remindersEnabled, setRemindersEnabled] = React.useState(settings.reminders_enabled === "true");
  const [reminderDaysBefore, setReminderDaysBefore] = React.useState(settings.reminder_days_before || "3");
  const [reminderTemplate, setReminderTemplate] = React.useState(
    settings.reminder_template || "Dear {customer_name}, your installment of Rs {amount} is due on {due_date}. Thank you – QistGhar."
  );

  // ── Branding ───────────────────────────────────────────────────────────────
  const [brandPrimaryColor, setBrandPrimaryColor] = React.useState(settings.brand_primary_color || "#205EA3");
  const [brandAccentColor, setBrandAccentColor] = React.useState(settings.brand_accent_color || "#82B63F");

  // ── Page Content ───────────────────────────────────────────────────────────
  const [pageAbout, setPageAbout] = React.useState(settings.page_about_us || "");
  const [pageContact, setPageContact] = React.useState(settings.page_contact || "");
  const [pageTerms, setPageTerms] = React.useState(settings.page_terms_of_service || "");
  const [pagePrivacy, setPagePrivacy] = React.useState(settings.page_privacy_policy || "");
  const [pageFaq, setPageFaq] = React.useState(settings.page_faq || "");
  const [pageShipping, setPageShipping] = React.useState(settings.page_shipping_policy || "");
  const [pageRefund, setPageRefund] = React.useState(settings.page_refund_policy || "");

  // ── Delivery ───────────────────────────────────────────────────────────────
  interface DeliveryArea { city: string; charge: string }
  const parseAreas = (): DeliveryArea[] => {
    try { return JSON.parse(settings.delivery_areas || "[]"); } catch { return []; }
  };
  const [deliveryAreas, setDeliveryAreas] = React.useState<DeliveryArea[]>(parseAreas);
  const [deliveryFlatCharge, setDeliveryFlatCharge] = React.useState(settings.delivery_flat_charge || "0");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = React.useState(settings.free_delivery_threshold || "0");

  // ── Security ───────────────────────────────────────────────────────────────
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // ── Generic save helper ────────────────────────────────────────────────────
  async function save(tab: TabId, values: Record<string, string>) {
    setSaving((s) => ({ ...s, [tab]: true }));
    const result = await updateSettings(values);
    setSaving((s) => ({ ...s, [tab]: false }));
    if (result.success) {
      addToast({ title: "Saved", description: "Settings updated successfully." });
      router.refresh();
    } else {
      addToast({ title: "Error", description: result.error || "Failed to save.", variant: "destructive" });
    }
  }

  // ── Tab save handlers ──────────────────────────────────────────────────────
  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    await save("general", {
      business_name: businessName.trim(),
      business_address: businessAddress.trim(),
      business_hours: businessHours.trim(),
      social_facebook: socialFacebook.trim(),
      social_instagram: socialInstagram.trim(),
      social_tiktok: socialTiktok.trim(),
    });
  }

  async function savePayments(e: React.FormEvent) {
    e.preventDefault();
    await save("payments", {
      whatsapp_number: whatsappNumber.trim(),
      bank_account_title: bankAccountTitle.trim(),
      bank_name: bankName.trim(),
      bank_iban: bankIban.trim().toUpperCase(),
      jazzcash_number: jazzcashNumber.trim(),
      easypaisa_number: easypaisaNumber.trim(),
      default_down_payment_pct: defaultDownPaymentPct,
      default_installment_durations: defaultInstallmentDurations.replace(/\s/g, ""),
    });
  }

  async function saveReminders(e: React.FormEvent) {
    e.preventDefault();
    await save("reminders", {
      reminders_enabled: String(remindersEnabled),
      reminder_days_before: reminderDaysBefore,
      reminder_template: reminderTemplate,
    });
  }

  async function saveBranding(e: React.FormEvent) {
    e.preventDefault();
    await save("branding", {
      brand_primary_color: brandPrimaryColor,
      brand_accent_color: brandAccentColor,
    });
  }

  async function saveContent(e: React.FormEvent) {
    e.preventDefault();
    await save("content", {
      page_about_us: pageAbout,
      page_contact: pageContact,
      page_terms_of_service: pageTerms,
      page_privacy_policy: pagePrivacy,
      page_faq: pageFaq,
      page_shipping_policy: pageShipping,
      page_refund_policy: pageRefund,
    });
  }

  async function saveDelivery(e: React.FormEvent) {
    e.preventDefault();
    await save("delivery", {
      delivery_areas: JSON.stringify(deliveryAreas.filter((a) => a.city.trim())),
      delivery_flat_charge: deliveryFlatCharge,
      free_delivery_threshold: freeDeliveryThreshold,
    });
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      addToast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setSaving((s) => ({ ...s, security: true }));
    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setSaving((s) => ({ ...s, security: false }));
      if (error) {
        addToast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        addToast({ title: "Password updated", description: "Your password has been changed successfully." });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      }
    } catch {
      setSaving((s) => ({ ...s, security: false }));
      addToast({ title: "Error", description: "Could not update password.", variant: "destructive" });
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSaving((s) => ({ ...s, security: true }));
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      setSaving((s) => ({ ...s, security: false }));
      if (res.ok) {
        addToast({ title: "Invite sent", description: `An invitation was sent to ${inviteEmail}.` });
        setInviteEmail("");
      } else {
        const body = await res.json().catch(() => ({}));
        addToast({ title: "Error", description: body?.error || "Failed to send invite.", variant: "destructive" });
      }
    } catch {
      setSaving((s) => ({ ...s, security: false }));
      addToast({ title: "Error", description: "Could not send invite.", variant: "destructive" });
    }
  }

  // ── Delivery area helpers ──────────────────────────────────────────────────
  function addDeliveryArea() {
    setDeliveryAreas((prev) => [...prev, { city: "", charge: "0" }]);
  }
  function removeDeliveryArea(idx: number) {
    setDeliveryAreas((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateDeliveryArea(idx: number, field: "city" | "charge", value: string) {
    setDeliveryAreas((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max border-b border-border pb-0">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? "border-[#205EA3] text-[#205EA3] bg-[#EAF1FA]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 1. GENERAL ── */}
      {activeTab === "general" && (
        <form onSubmit={saveGeneral} className="space-y-5 max-w-2xl">
          <SectionCard
            title="Business Information"
            description="Core details about your store shown to customers."
          >
            <FieldRow id="business_name" label="Business Name">
              <Input id="business_name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="QistGhar" />
            </FieldRow>
            <FieldRow id="business_address" label="Business Address">
              <Input id="business_address" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Shop address" />
            </FieldRow>
            <FieldRow id="business_hours" label="Business Hours" hint='Free-text — e.g. "Mon–Sat, 10am–8pm"'>
              <Input id="business_hours" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} placeholder="Mon–Sat, 10am–8pm" />
            </FieldRow>
          </SectionCard>

          <SectionCard title="Social Links" description="Optional — leave blank to hide links from the storefront.">
            <FieldRow id="social_facebook" label="Facebook URL">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="social_facebook" type="url" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/yourpage" className="pl-9" />
              </div>
            </FieldRow>
            <FieldRow id="social_instagram" label="Instagram URL">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="social_instagram" type="url" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/yourhandle" className="pl-9" />
              </div>
            </FieldRow>
            <FieldRow id="social_tiktok" label="TikTok URL">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="social_tiktok" type="url" value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} placeholder="https://tiktok.com/@yourhandle" className="pl-9" />
              </div>
            </FieldRow>
          </SectionCard>

          <SaveButton saving={saving.general} />
        </form>
      )}

      {/* ── 2. PAYMENTS ── */}
      {activeTab === "payments" && (
        <form onSubmit={savePayments} className="space-y-5 max-w-2xl">
          <SectionCard title="Order Handoff" description="Storefront orders are forwarded to this WhatsApp number.">
            <FieldRow id="whatsapp_number" label="WhatsApp Number" hint='International format without "+" — e.g. 923001234567'>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="whatsapp_number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="923001234567" className="pl-9" />
              </div>
            </FieldRow>
          </SectionCard>

          <SectionCard title="Bank Transfer Details" description="Shown to customers who choose bank transfer at checkout.">
            <FieldRow id="bank_account_title" label="Account Title">
              <Input id="bank_account_title" value={bankAccountTitle} onChange={(e) => setBankAccountTitle(e.target.value)} placeholder="Muhammad Ali" />
            </FieldRow>
            <FieldRow id="bank_name" label="Bank Name">
              <Input id="bank_name" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="HBL / MCB / Meezan…" />
            </FieldRow>
            <FieldRow id="bank_iban" label="IBAN / Account Number" hint="Auto-uppercased. Spaces are allowed for readability.">
              <Input
                id="bank_iban"
                value={bankIban}
                onChange={(e) => setBankIban(e.target.value)}
                placeholder="PK36 SCBL 0000 0011 2345 6702"
                className="font-mono tracking-wider"
              />
            </FieldRow>
          </SectionCard>

          <SectionCard title="Mobile Wallets" description="JazzCash and EasyPaisa numbers for payment.">
            <FieldRow id="jazzcash_number" label="JazzCash Number" hint='International format without "+" — e.g. 923001234567'>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="jazzcash_number" type="tel" value={jazzcashNumber} onChange={(e) => setJazzcashNumber(e.target.value)} placeholder="923001234567" className="pl-9" />
              </div>
            </FieldRow>
            <FieldRow id="easypaisa_number" label="EasyPaisa Number" hint='International format without "+" — e.g. 923001234567'>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="easypaisa_number" type="tel" value={easypaisaNumber} onChange={(e) => setEasypaisaNumber(e.target.value)} placeholder="923001234567" className="pl-9" />
              </div>
            </FieldRow>
          </SectionCard>

          <SectionCard title="Installment Defaults" description="Platform-wide fallback values. Per-customer markups still override these.">
            <FieldRow id="default_down_payment_pct" label="Default Down Payment %" hint="Enter a value between 0 and 100.">
              <div className="relative w-40">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="default_down_payment_pct"
                  type="number"
                  min={0}
                  max={100}
                  value={defaultDownPaymentPct}
                  onChange={(e) => setDefaultDownPaymentPct(e.target.value)}
                  className="pl-9"
                />
              </div>
            </FieldRow>
            <FieldRow id="default_installment_durations" label="Available Installment Durations (months)" hint='Comma-separated, e.g. "3,6,9,12"'>
              <Input
                id="default_installment_durations"
                value={defaultInstallmentDurations}
                onChange={(e) => setDefaultInstallmentDurations(e.target.value)}
                placeholder="3,6,9,12"
                className="font-mono"
              />
            </FieldRow>
          </SectionCard>

          <SaveButton saving={saving.payments} />
        </form>
      )}

      {/* ── 3. REMINDERS ── */}
      {activeTab === "reminders" && (
        <form onSubmit={saveReminders} className="space-y-5 max-w-2xl">
          <SectionCard title="Automatic Reminders" description="Send WhatsApp reminders to customers before installments are due.">
            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <p className="text-sm font-medium">Enable Automatic Reminders</p>
                <p className="text-xs text-muted-foreground mt-0.5">When enabled, reminders are queued based on the schedule below.</p>
              </div>
              <Toggle id="reminders_enabled" checked={remindersEnabled} onChange={setRemindersEnabled} />
            </div>

            <div className={`space-y-5 transition-opacity duration-200 ${!remindersEnabled ? "opacity-40 pointer-events-none" : ""}`}>
              <FieldRow id="reminder_days_before" label="Days Before Due Date to Remind" hint="How many days ahead of the due date the reminder is sent.">
                <div className="relative w-32">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="reminder_days_before"
                    type="number"
                    min={0}
                    max={30}
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </FieldRow>

              <FieldRow id="reminder_template" label="Reminder Message Template">
                <Textarea
                  id="reminder_template"
                  rows={5}
                  value={reminderTemplate}
                  onChange={(e) => setReminderTemplate(e.target.value)}
                  placeholder="Dear {customer_name}, your installment…"
                />
                <div className="mt-2 rounded-lg bg-muted/60 border border-border px-3.5 py-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Available placeholders:</p>
                  <ul className="space-y-0.5 list-none">
                    <li><code className="font-mono bg-background px-1 py-0.5 rounded text-[11px]">{"{customer_name}"}</code> — customer's full name</li>
                    <li><code className="font-mono bg-background px-1 py-0.5 rounded text-[11px]">{"{amount}"}</code> — installment amount in PKR</li>
                    <li><code className="font-mono bg-background px-1 py-0.5 rounded text-[11px]">{"{due_date}"}</code> — formatted due date</li>
                  </ul>
                </div>
              </FieldRow>
            </div>
          </SectionCard>

          <SaveButton saving={saving.reminders} />
        </form>
      )}

      {/* ── 4. BRANDING ── */}
      {activeTab === "branding" && (
        <form onSubmit={saveBranding} className="space-y-5 max-w-2xl">
          <SectionCard title="Brand Colors" description="Colors used across the storefront. Changes take effect on next build.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow id="brand_primary_color" label="Primary Color">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg border border-border shadow-sm shrink-0 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: brandPrimaryColor }}
                  >
                    <input
                      type="color"
                      value={brandPrimaryColor}
                      onChange={(e) => setBrandPrimaryColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    id="brand_primary_color"
                    value={brandPrimaryColor}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    placeholder="#205EA3"
                    className="font-mono"
                  />
                </div>
              </FieldRow>
              <FieldRow id="brand_accent_color" label="Accent Color">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg border border-border shadow-sm shrink-0 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: brandAccentColor }}
                  >
                    <input
                      type="color"
                      value={brandAccentColor}
                      onChange={(e) => setBrandAccentColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    id="brand_accent_color"
                    value={brandAccentColor}
                    onChange={(e) => setBrandAccentColor(e.target.value)}
                    placeholder="#82B63F"
                    className="font-mono"
                  />
                </div>
              </FieldRow>
            </div>
          </SectionCard>

          <SectionCard title="Logo & Favicon" description="Upload your store logo and browser tab icon.">
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground space-y-2">
              <Palette className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="font-medium text-foreground">Image upload coming soon</p>
              <p className="text-xs">Logo and favicon upload will be available in the next update. For now, place files directly in the <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded">/public</code> directory.</p>
            </div>
          </SectionCard>

          <SaveButton saving={saving.branding} />
        </form>
      )}

      {/* ── 5. PAGE CONTENT ── */}
      {activeTab === "content" && (
        <form onSubmit={saveContent} className="space-y-5 max-w-2xl">
          <SectionCard title="Page Content" description="Text content for the static pages linked in the storefront footer.">
            {(
              [
                { id: "page_about", label: "About Us", value: pageAbout, setter: setPageAbout, placeholder: "Tell customers about QistGhar…" },
                { id: "page_contact", label: "Contact", value: pageContact, setter: setPageContact, placeholder: "Contact details and hours…" },
                { id: "page_terms", label: "Terms of Service", value: pageTerms, setter: setPageTerms, placeholder: "Terms and conditions…" },
                { id: "page_privacy", label: "Privacy Policy", value: pagePrivacy, setter: setPagePrivacy, placeholder: "Privacy policy…" },
                { id: "page_faq", label: "FAQ", value: pageFaq, setter: setPageFaq, placeholder: "Frequently asked questions…" },
                { id: "page_shipping", label: "Shipping & Delivery Policy", value: pageShipping, setter: setPageShipping, placeholder: "Delivery timelines, areas, charges…" },
                { id: "page_refund", label: "Return & Refund Policy", value: pageRefund, setter: setPageRefund, placeholder: "What happens if a customer misses payments or wants to return…" },
              ] as const
            ).map(({ id, label, value, setter, placeholder }) => (
              <FieldRow key={id} id={id} label={label}>
                <Textarea
                  id={id}
                  rows={4}
                  value={value}
                  onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                  placeholder={placeholder}
                />
              </FieldRow>
            ))}
          </SectionCard>

          <SaveButton saving={saving.content} />
        </form>
      )}

      {/* ── 6. DELIVERY ── */}
      {activeTab === "delivery" && (
        <form onSubmit={saveDelivery} className="space-y-5 max-w-2xl">
          <SectionCard
            title="Delivery Areas"
            description="List the cities you deliver to and the delivery charge for each."
          >
            <div className="space-y-3">
              {deliveryAreas.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">No delivery areas added yet.</p>
              )}
              {deliveryAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={area.city}
                      onChange={(e) => updateDeliveryArea(idx, "city", e.target.value)}
                      placeholder="City name"
                      className="pl-9"
                    />
                  </div>
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">Rs</span>
                    <Input
                      type="number"
                      min={0}
                      value={area.charge}
                      onChange={(e) => updateDeliveryArea(idx, "charge", e.target.value)}
                      placeholder="0"
                      className="pl-9"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDeliveryArea(idx)}
                    className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addDeliveryArea}
                className="flex items-center gap-2 text-sm text-[#205EA3] hover:text-[#174571] font-medium transition-colors mt-1"
              >
                <Plus className="h-4 w-4" />
                Add City
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Delivery Thresholds" description="Global delivery charge rules that apply when a city-specific charge is not found.">
            <FieldRow id="delivery_flat_charge" label="Flat Delivery Charge (Rs)" hint="Applied when no city-specific charge matches.">
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">Rs</span>
                <Input
                  id="delivery_flat_charge"
                  type="number"
                  min={0}
                  value={deliveryFlatCharge}
                  onChange={(e) => setDeliveryFlatCharge(e.target.value)}
                  className="pl-9"
                />
              </div>
            </FieldRow>
            <FieldRow id="free_delivery_threshold" label="Free Delivery Threshold (Rs)" hint="Orders above this total get free delivery. Set to 0 to disable.">
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">Rs</span>
                <Input
                  id="free_delivery_threshold"
                  type="number"
                  min={0}
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  className="pl-9"
                />
              </div>
            </FieldRow>
          </SectionCard>

          <SaveButton saving={saving.delivery} />
        </form>
      )}

      {/* ── 7. ADMIN & SECURITY ── */}
      {activeTab === "security" && (
        <div className="space-y-5 max-w-2xl">
          {/* Invite Admin */}
          <SectionCard title="Invite Admin" description="Send an email invitation to a new admin. They will be able to log in and manage the admin panel.">
            <form onSubmit={sendInvite} className="space-y-4">
              <FieldRow id="invite_email" label="Email Address">
                <Input
                  id="invite_email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </FieldRow>
              <Button type="submit" disabled={saving.security || !inviteEmail.trim()} className="gap-2">
                {saving.security ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                Send Invite
              </Button>
            </form>
          </SectionCard>

          {/* Change Password */}
          <SectionCard title="Change Password" description="Update your admin account password.">
            <form onSubmit={savePassword} className="space-y-4">
              <FieldRow id="current_password" label="Current Password">
                <Input
                  id="current_password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </FieldRow>
              <FieldRow id="new_password" label="New Password" hint="Minimum 8 characters.">
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </FieldRow>
              <FieldRow id="confirm_password" label="Confirm New Password">
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </FieldRow>
              <Button type="submit" disabled={saving.security || !newPassword || !confirmPassword} className="gap-2">
                {saving.security ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Update Password
              </Button>
            </form>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
