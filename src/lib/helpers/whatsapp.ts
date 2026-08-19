export const DEFAULT_WHATSAPP_NUMBER = "923162873835";

/**
 * Normalizes phone numbers to standard international WhatsApp format without '+' or spaces.
 * E.g. '03162873835' -> '923162873835'
 *      '+92 316 2873835' -> '923162873835'
 */
export function normalizeWhatsAppNumber(phone?: string | null): string {
  if (!phone) return DEFAULT_WHATSAPP_NUMBER;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return DEFAULT_WHATSAPP_NUMBER;

  if (digits.startsWith("0092")) {
    return digits.slice(2);
  }
  if (digits.startsWith("92")) {
    return digits;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return `92${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("3")) {
    return `92${digits}`;
  }
  return digits;
}

export function generateWhatsAppOrderMessage(input: {
  productName: string;
  duration: number;
  downPayment: number;
  monthly: number;
  total: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  orderId?: string;
}): string {
  const {
    productName,
    duration,
    downPayment,
    monthly,
    total,
    name,
    phone,
    address,
    city,
    orderId,
  } = input;

  const orderTag = orderId ? ` (Order #${orderId.slice(0, 8)})` : "";

  const lines = [
    `🛍️ *NEW ORDER INQUIRY — QistGhar*${orderTag}`,
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "📦 *ORDER SUMMARY*",
    `• *Product:* ${productName}`,
    `• *Installment Plan:* ${duration} Months`,
    `• *Down Payment (Due Today):* Rs ${downPayment.toLocaleString()}`,
    `• *Monthly Installment:* Rs ${monthly.toLocaleString()}/month`,
    `• *Total Cost:* Rs ${total.toLocaleString()}`,
    "",
    "👤 *CUSTOMER INFORMATION*",
    `• *Name:* ${name}`,
    `• *Phone:* ${phone}`,
    `• *City:* ${city ? city : "Not specified"}`,
    `• *Delivery Address:* ${address}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    "Please confirm my order and share the payment and delivery procedure. Thank you!",
  ];

  return lines.join("\n");
}
