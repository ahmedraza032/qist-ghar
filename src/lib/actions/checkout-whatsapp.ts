"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface CheckoutWhatsAppInput {
  productId: string;
  productName: string;
  duration: number;
  downPayment: number;
  monthly: number;
  total: number;
  name: string;
  phone: string;
  address: string;
  city: string;
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

export async function checkoutWithWhatsApp(input: CheckoutWhatsAppInput): Promise<{ url: string; adminPhone: string }> {
  const { productName, duration, downPayment, monthly, total, name, phone, address, city } = input;

  const adminPhone = await getWhatsAppNumber();
  if (!adminPhone) {
    throw new Error("WhatsApp number is not configured. Please contact the store owner.");
  }

  const lines = [
    "*New Order Inquiry*",
    "",
    "*Customer Details:*",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `City: ${city}`,
    `Address: ${address}`,
    "",
    "*Order Details:*",
    `Product: ${productName}`,
    `Duration: ${duration} months`,
    `Down Payment: PKR ${downPayment.toLocaleString()}`,
    `Monthly Installment: PKR ${monthly.toLocaleString()}`,
    `Total: PKR ${total.toLocaleString()}`,
    "",
    "Please confirm my order. Thank you.",
  ];

  const text = lines.join("\n");
  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;

  return { url, adminPhone };
}
