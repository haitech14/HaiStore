import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';

/** Altura aproximada de la barra fija de compra en ficha (px). */
export const MOBILE_PURCHASE_BAR_HEIGHT_PX = 88;

interface MobileBottomInsetContextValue {
  insetPx: number;
  setInsetPx: (value: number) => void;
}

const MobileBottomInsetContext = createContext<MobileBottomInsetContextValue | null>(null);

export function MobileBottomInsetProvider({ children }: { children: ReactNode }) {
  const [insetPx, setInsetPx] = useState(0);
  const value = useMemo(() => ({ insetPx, setInsetPx }), [insetPx]);
  return (
    <MobileBottomInsetContext.Provider value={value}>{children}</MobileBottomInsetContext.Provider>
  );
}

export function useMobileBottomInset(): number {
  return useContext(MobileBottomInsetContext)?.insetPx ?? 0;
}

/** Actualiza el inset inferior compartido (p. ej. barra de compra en ficha). */
export function useSetMobileBottomInset(insetPx: number) {
  const context = useContext(MobileBottomInsetContext);

  useEffect(() => {
    if (!context) return;
    context.setInsetPx(insetPx);
    return () => context.setInsetPx(0);
  }, [context, insetPx]);
}

export function mobileBottomOffsetStyle(insetPx: number, baseRem = 1.25): CSSProperties {
  return {
    bottom: `calc(${baseRem}rem + ${insetPx}px + env(safe-area-inset-bottom, 0px))`,
  };
}
