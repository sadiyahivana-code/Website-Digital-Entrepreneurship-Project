import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: string[];
    slug: string;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: CartItem['product'], quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setItems: (items) => set({ items }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      addItem: (product, quantity = 1) => {
        set(state => {
          const existing = state.items.find(i => i.productId === product.id);
          if (existing) {
            return { items: state.items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i) };
          }
          const newItem: CartItem = { id: `local-${Date.now()}`, productId: product.id, quantity, product };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set(state => ({ items: state.items.filter(i => i.productId !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set(state => ({ items: state.items.map(i => i.productId === productId ? { ...i, quantity } : i) }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      syncWithServer: async () => {
        try {
          const { data } = await api.get('/cart');
          set({ items: data.cart.items });
        } catch {}
      },
    }),
    { name: 'cart-store', partialize: (state) => ({ items: state.items }) }
  )
);
