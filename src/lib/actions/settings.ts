"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface SettingsResult {
  success: boolean;
  error?: string;
}

export async function updateSettings(values: Record<string, string>): Promise<SettingsResult> {
  const supabase = await createServiceClient();

  const entries = Object.entries(values)
    .filter(([key, value]) => key && value !== undefined)
    .map(([key, value]) => ({ key, value: String(value) }));

  if (entries.length === 0) {
    return { success: true };
  }

  const { error } = await supabase.from("settings").upsert(entries);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function getWhatsAppNumber(): Promise<string> {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();
  return data?.value || "";
}
