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
