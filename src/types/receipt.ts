export interface ReceiptPayment {
  date: string;
  reference: string;
  method: string;
  amount: number;
}

export interface ReceiptData {
  orderId: string;
  logoUrl?: string;
  productName: string;
  quantity: number;
  durationMonths: number;
  downPayment: number;
  monthlyAmount: number;
  totalAmount: number;
  paymentMethod: string;
  date: string;
  startDate?: string;
  endDate?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  installments: { number: number; dueDate: string; amount: number; status: string }[];
  payments: ReceiptPayment[];
}
