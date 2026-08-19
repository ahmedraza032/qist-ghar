"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { createOrder } from "./orders";
import {
  DEFAULT_WHATSAPP_NUMBER,
  normalizeWhatsAppNumber,
  generateWhatsAppOrderMessage,
} from "@/lib/helpers/whatsapp";

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
  try {
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle();

    if (data?.value && data.value.trim()) {
      return normalizeWhatsAppNumber(data.value);
    }
  } catch (err) {
    console.error("Failed to read whatsapp_number from settings:", err);
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

export async function checkoutWithWhatsApp(
  input: CheckoutWhatsAppInput
): Promise<{ url: string; adminPhone: string; orderId?: string }> {
  const {
    productId,
    productName,
    duration,
    downPayment,
    monthly,
    total,
    name,
    phone,
    address,
    city,
  } = input;

  const rawAdminPhone = await getWhatsAppNumber();
  const adminPhone = normalizeWhatsAppNumber(rawAdminPhone);

  // Automatically save order in Supabase admin database
  let createdOrderId: string | undefined;
  try {
    const orderRes = await createOrder({
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      customerCity: city,
      productId,
      durationMonths: duration,
      downPaymentAmount: downPayment,
      monthlyAmount: monthly,
      totalAmount: total,
      paymentMethod: "whatsapp",
      startDate: new Date().toISOString(),
    });
    if (orderRes.success && orderRes.orderId) {
      createdOrderId = orderRes.orderId;
    }
  } catch (err) {
    console.warn("Notice: could not auto-create order record in DB:", err);
  }

  const text = generateWhatsAppOrderMessage({
    productName,
    duration,
    downPayment,
    monthly,
    total,
    name,
    phone,
    address,
    city,
    orderId: createdOrderId,
  });

  const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;

  return { url, adminPhone, orderId: createdOrderId };
}
