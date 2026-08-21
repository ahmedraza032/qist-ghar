import { createServiceClient } from "@/lib/supabase/server";
import { BannerForm } from "@/components/admin/banner-form";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const supabase = await createServiceClient();

  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = (banners || []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Banner Management</h1>
        <p className="text-muted-foreground mt-1">Manage homepage hero banners</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((banner: any) => (
          <div
            key={banner.id}
            className="rounded-lg border border-border overflow-hidden"
          >
            {banner.image_url && (
              <div className="aspect-[2/1] bg-muted overflow-hidden">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{banner.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    banner.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {banner.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {banner.cta_text && (
                <p className="text-sm text-muted-foreground">{banner.cta_text} {banner.cta_link ? `→ ${banner.cta_link}` : ''}</p>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No banners yet.</p>
        )}
      </div>

      <BannerForm existing={list} />
    </div>
  );
}
