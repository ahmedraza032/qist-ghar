export const MARKUP_TIERS: Record<number, number> = {
  3: 0,
  6: 5,
  9: 7.5,
  12: 10,
};

export const MIN_DOWN_PAYMENT_PCT = 25;
export const DEFAULT_DOWN_PAYMENT_PCT = 25;

export interface InstallmentBreakdown {
  duration: number;
  markupPercent: number;
  totalPrice: number;
  downPayment: number;
  financeAmount: number;
  monthlyPayment: number;
  minDownPayment: number;
}

export function calculateInstallment(
  basePrice: number,
  durationMonths: number,
  markupPercent?: number,
  customDownPayment?: number
): InstallmentBreakdown {
  const markup = markupPercent ?? MARKUP_TIERS[durationMonths] ?? 0;
  const totalPrice = Math.round(basePrice * (1 + markup / 100));
  const minDownPayment = Math.ceil(basePrice * (MIN_DOWN_PAYMENT_PCT / 100));

  const downPayment = customDownPayment !== undefined && customDownPayment >= minDownPayment
    ? Math.round(customDownPayment)
    : Math.ceil(basePrice * (DEFAULT_DOWN_PAYMENT_PCT / 100));

  const financeAmount = Math.max(0, totalPrice - downPayment);
  const monthlyPayment = Math.round(financeAmount / durationMonths);

  return {
    duration: durationMonths,
    markupPercent: markup,
    totalPrice,
    downPayment,
    financeAmount,
    monthlyPayment,
    minDownPayment,
  };
}

export function getAllInstallmentOptions(
  basePrice: number,
  customDownPayment?: number
): InstallmentBreakdown[] {
  return [3, 6, 9, 12].map((d) =>
    calculateInstallment(basePrice, d, undefined, customDownPayment)
  );
}

export type DerivedInstallmentStatus = "pending" | "partial" | "paid" | "overdue";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function deriveInstallmentStatus(
  status: string,
  dueDate: string,
  paidTotal: number,
  amount: number
): DerivedInstallmentStatus {
  if (status === "paid" || paidTotal >= amount) return "paid";
  if (status === "overdue") return "overdue";

  const today = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));

  if (due < today) return "overdue";
  if (paidTotal > 0) return "partial";
  return "pending";
}

export function outstandingForOrder(
  order: { total_amount: number; down_payment_amount: number },
  paymentsSum: number
): number {
  const paidSoFar = (paymentsSum || 0) + (order.down_payment_amount || 0);
  return Math.max(0, (order.total_amount || 0) - paidSoFar);
}
