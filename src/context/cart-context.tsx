import * as React from 'react';

import type { CartItem, Product } from '@/types/product';

export interface AddToCartOptions {
  quantity?: number;
  /** Abre el panel lateral tras agregar (por defecto true). */
  openDrawer?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  /** Producto recién añadido (resaltado breve en el panel). */
  highlightProductId: string | null;
  addItem: (product: Product, options?: AddToCartOptions) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const HIGHLIGHT_MS = 2200;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightProductId, setHighlightProductId] = React.useState<string | null>(null);
  const highlightTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashHighlight = React.useCallback((productId: string) => {
    setHighlightProductId(productId);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightProductId(null);
      highlightTimerRef.current = null;
    }, HIGHLIGHT_MS);
  }, []);

  React.useEffect(
    () => () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    },
    [],
  );

  const openCart = React.useCallback(() => setIsOpen(true), []);
  const closeCart = React.useCallback(() => setIsOpen(false), []);
  const setCartOpen = React.useCallback((open: boolean) => setIsOpen(open), []);

  const addItem = React.useCallback(
    (product: Product, options?: AddToCartOptions) => {
      const quantity = Math.max(1, Math.floor(options?.quantity ?? 1));
      const openDrawer = options?.openDrawer !== false;

      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...prev, { product, quantity }];
      });

      flashHighlight(product.id);
      if (openDrawer) setIsOpen(true);
    },
    [flashHighlight],
  );

  const updateQuantity = React.useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      );
    });
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const value = React.useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    return {
      items,
      totalItems,
      totalPrice,
      isOpen,
      highlightProductId,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      openCart,
      closeCart,
      setCartOpen,
    };
  }, [
    items,
    isOpen,
    highlightProductId,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    openCart,
    closeCart,
    setCartOpen,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return context;
}
