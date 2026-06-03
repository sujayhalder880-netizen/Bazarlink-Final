import React, { createContext, useCallback, useContext, useState } from "react";

interface DrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const DrawerContext = createContext<DrawerContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <DrawerContext.Provider value={{ isOpen, open, close }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
