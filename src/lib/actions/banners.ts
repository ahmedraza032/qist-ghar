"use server";

import { createServiceClient } from "@/lib/supabase/server";

export async function addBanner(data: {
  title: string;
  image_url: string;
  cta_text?: string;
  cta_link?: string;
  sort_order?: number;
}) {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("banners").insert({
    title: data.title,
    image_url: data.image_url,
    cta_text: data.cta_text || null,
    cta_link: data.cta_link || null,
    is_active: true,
    sort_order: data.sort_order ?? 0,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteBanner(id: string) {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
