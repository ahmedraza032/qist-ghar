"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { addBanner, deleteBanner } from "@/lib/actions/banners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function BannerForm({ existing }: { existing: any[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [title, setTitle] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [ctaText, setCtaText] = React.useState("");
  const [ctaLink, setCtaLink] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleAdd() {
    if (!title || !imageUrl) return;
    setSaving(true);

    const result = await addBanner({
      title,
      image_url: imageUrl,
      cta_text: ctaText,
      cta_link: ctaLink,
      sort_order: existing.length,
    });

    if (!result.success) {
      addToast({ title: "Error", description: result.error || "Failed to add", variant: "destructive" });
    } else {
      addToast({ title: "Added", description: "Banner created." });
      setTitle("");
      setImageUrl("");
      setCtaText("");
      setCtaLink("");
    }
    setSaving(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteBanner(id);
    if (result.success) {
      addToast({ title: "Deleted", description: "Banner removed." });
    } else {
      addToast({ title: "Error", description: result.error || "Failed to delete", variant: "destructive" });
    }
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Banner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Sale 2026" />
          </div>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CTA Text</Label>
            <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Shop Now" />
          </div>
          <div className="space-y-2">
            <Label>CTA Link</Label>
            <Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="/products" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button onClick={handleAdd} disabled={saving || !title || !imageUrl} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Banner
          </Button>
          {existing.length > 0 && (
            <div className="flex gap-1">
              {existing.map((b: any) => (
                <Button
                  key={b.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(b.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete #{b.title}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
