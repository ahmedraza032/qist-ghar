import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  basePrice: number;
  quantity: number;
  type: "full" | "installment";
  durationMonths: number;
  markupPercent: number;
  downPaymentPercent: number;
  downPayment: number;
  monthlyPayment: number;
  totalPrice: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.findIndex(
            (i) => i.productId === item.productId && i.type === item.type
          );
          if (existing >= 0) {
            const updated = [...state.items];
            updated[existing] = { ...item, quantity: item.quantity };
            return { items: updated };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.totalPrice, 0),
    }),
    { name: "qistghar-cart" }
  )
);
