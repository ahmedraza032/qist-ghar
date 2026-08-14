export interface ReceiptData {
  orderId: string;
  productName: string;
  durationMonths: number;
  downPayment: number;
  monthlyAmount: number;
  totalAmount: number;
  paymentMethod: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  installments: { number: number; dueDate: string; amount: number; status: string }[];
}
