import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface SavedState {
  categories: string[];
  shops: string[];
  products: string[];
}

interface SavedContextType extends SavedState {
  toggleCategory: (id: string) => void;
  toggleShop: (id: string) => void;
  toggleProduct: (id: string) => void;
  isCategorySaved: (id: string) => boolean;
  isShopSaved: (id: string) => boolean;
  isProductSaved: (id: string) => boolean;
}

const SavedContext = createContext<SavedContextType>({
  categories: [],
  shops: [],
  products: [],
  toggleCategory: () => {},
  toggleShop: () => {},
  toggleProduct: () => {},
  isCategorySaved: () => false,
  isShopSaved: () => false,
  isProductSaved: () => false,
});

const SAVED_KEY = "@bazarlink_saved_v1";

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<SavedState>({ categories: [], shops: [], products: [] });

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY)
      .then((raw) => { if (raw) setSaved(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  const persist = useCallback((next: SavedState) => {
    setSaved(next);
    AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const toggle = useCallback(
    (field: keyof SavedState, id: string) => {
      setSaved((prev) => {
        const list = prev[field] as string[];
        const next: SavedState = {
          ...prev,
          [field]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
        };
        AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  return (
    <SavedContext.Provider
      value={{
        ...saved,
        toggleCategory: (id) => toggle("categories", id),
        toggleShop: (id) => toggle("shops", id),
        toggleProduct: (id) => toggle("products", id),
        isCategorySaved: (id) => saved.categories.includes(id),
        isShopSaved: (id) => saved.shops.includes(id),
        isProductSaved: (id) => saved.products.includes(id),
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
