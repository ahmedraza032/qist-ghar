import { createServiceClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createServiceClient();

  const { data } = await supabase.from("settings").select("key, value");

  const settings: Record<string, string> = {};
  (data || []).forEach((row: any) => {
    settings[row.key] = row.value;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage store configuration, payments, branding, and more.</p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
