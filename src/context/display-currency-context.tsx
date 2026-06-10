import * as React from 'react';

import { readDisplayCurrency, writeDisplayCurrency } from '@/lib/display-currency-storage';
import type { DisplayCurrency } from '@/types/display-currency';

interface DisplayCurrencyContextValue {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
}

const DisplayCurrencyContext = React.createContext<DisplayCurrencyContextValue | null>(null);

export function DisplayCurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = React.useState<DisplayCurrency>(() =>
    readDisplayCurrency(),
  );

  const setDisplayCurrency = React.useCallback((currency: DisplayCurrency) => {
    setDisplayCurrencyState(currency);
    writeDisplayCurrency(currency);
  }, []);

  const value = React.useMemo(
    () => ({ displayCurrency, setDisplayCurrency }),
    [displayCurrency, setDisplayCurrency],
  );

  return (
    <DisplayCurrencyContext.Provider value={value}>{children}</DisplayCurrencyContext.Provider>
  );
}

export function useDisplayCurrency(): DisplayCurrencyContextValue {
  const context = React.useContext(DisplayCurrencyContext);
  if (!context) {
    throw new Error('useDisplayCurrency debe usarse dentro de DisplayCurrencyProvider');
  }
  return context;
}
