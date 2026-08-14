"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { normalizeWhatsAppNumber, DEFAULT_WHATSAPP_NUMBER } from "@/lib/helpers/whatsapp";

export interface SettingsResult {
  success: boolean;
  error?: string;
}

export async function updateSettings(values: Record<string, string>): Promise<SettingsResult> {
  const supabase = await createServiceClient();

  const entries = Object.entries(values)
    .filter(([key, value]) => key && value !== undefined)
    .map(([key, value]) => {
      let finalValue = String(value);
      if (key === "whatsapp_number") {
        finalValue = normalizeWhatsAppNumber(finalValue);
      }
      return { key, value: finalValue };
    });

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
  try {
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle();
    return data?.value ? normalizeWhatsAppNumber(data.value) : DEFAULT_WHATSAPP_NUMBER;
  } catch {
    return DEFAULT_WHATSAPP_NUMBER;
  }
}
