import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const safeStorage = createJSONStorage(() => ({
  getItem(name: string) {
    try {
      return localStorage.getItem(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem(name: string, value: string) {
    try {
      localStorage.setItem(name, value);
    } catch {}
  },
  removeItem(name: string) {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
}));

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "astro-cart",
      storage: safeStorage,
    }
  )
);
