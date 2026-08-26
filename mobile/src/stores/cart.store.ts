import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '@wunabuy/types';

interface CartState {
  items: CartItem[];
  storeId: string | null; // Cart is restricted to a single store per order

  // Actions
  addItem: (product: Product, quantity?: number) => boolean; // Returns false if store conflict
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Selectors
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,

      addItem: (product, quantity = 1) => {
        const { items, storeId } = get();

        // If cart contains items from a different store, reset cart or reject
        if (storeId && storeId !== product.store_id) {
          return false; // Signal store conflict to caller
        }

        const existingIndex = items.findIndex((i) => i.product_id === product.id);
        let newItems: CartItem[] = [];

        if (existingIndex > -1) {
          newItems = [...items];
          const newQty = Math.min(
            newItems[existingIndex].quantity + quantity,
            product.quantity // Stock limit
          );
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newQty,
          };
        } else {
          const newItem: CartItem = {
            product_id: product.id,
            store_id: product.store_id,
            name: product.name,
            price: product.price,
            quantity: Math.min(quantity, product.quantity),
            image_url: product.images[0] || '',
            max_quantity: product.quantity,
          };
          newItems = [...items, newItem];
        }

        set({
          items: newItems,
          storeId: product.store_id,
        });

        return true;
      },

      removeItem: (productId) => {
        const { items } = get();
        const newItems = items.filter((i) => i.product_id !== productId);
        set({
          items: newItems,
          storeId: newItems.length > 0 ? newItems[0].store_id : null,
        });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const newItems = items.map((item) => {
          if (item.product_id === productId) {
            return {
              ...item,
              quantity: Math.min(quantity, item.max_quantity),
            };
          }
          return item;
        });

        set({ items: newItems });
      },

      clearCart: () => {
        set({ items: [], storeId: null });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: '@wunabuy_cart_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
