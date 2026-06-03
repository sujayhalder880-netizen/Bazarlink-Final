import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  shop?: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  getQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isInCart: () => false,
  getQuantity: () => 0,
});

const CART_KEY = "@bazarlink_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const persisted = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then((raw) => { if (raw) setItems(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => { persisted.current = true; });
  }, []);

  const save = useCallback((next: CartItem[]) => {
    setItems(next);
    AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const next = existing
        ? prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      const next = qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => i.id === id ? { ...i, quantity: qty } : i);
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    AsyncStorage.removeItem(CART_KEY).catch(() => {});
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, totalItems, totalPrice,
      addItem, removeItem, updateQuantity, clearCart,
      isInCart: (id) => items.some((i) => i.id === id),
      getQuantity: (id) => items.find((i) => i.id === id)?.quantity ?? 0,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
