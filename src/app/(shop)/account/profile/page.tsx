"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, MapPin, Phone, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUser] = React.useState<any>(null);
  const [form, setForm] = React.useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });
  const [passwords, setPasswords] = React.useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, address, city")
        .eq("id", user.id)
        .single();

      if (profile) {
        setForm({
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName,
        phone: form.phone,
        address: form.address,
        city: form.city,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      addToast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      addToast({ title: "Saved", description: "Profile updated successfully." });
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      addToast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (passwords.new.length < 6) {
      addToast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    setChangingPassword(false);

    if (error) {
      addToast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPasswords({ current: "", new: "", confirm: "" });
      addToast({ title: "Saved", description: "Password changed successfully." });
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-60" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="p-2 hover:bg-muted rounded-md">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </CardTitle>
            <CardDescription>Update your name and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, new: e.target.value }))
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, confirm: e.target.value }))
                    }
                    className="pr-10"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={changingPassword}
                variant="outline"
                className="gap-2"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Changing...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
