import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { eastAfricanCountries, defaultCountry, getCountryByCode, CurrencyCountry } from '../lib/currency';
import { useAuth } from './AuthContext';

interface CurrencyContextType {
  country: CurrencyCountry;
  setCountry: (code: string) => void;
  formatPrice: (usd: number) => string;
  formatPriceWithUSD: (usd: number) => string;
  formatJobSalary: (amount: number | null | undefined, jobCountry?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'globalhire_country';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [country, setCountryState] = useState<CurrencyCountry>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? getCountryByCode(stored) : defaultCountry;
  });

  useEffect(() => {
    if (profile?.country) {
      setCountryState(getCountryByCode(profile.country));
      localStorage.setItem(STORAGE_KEY, profile.country);
    }
  }, [profile?.country]);

  const setCountry = (code: string) => {
    const c = getCountryByCode(code);
    setCountryState(c);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const formatPrice = (usd: number): string => {
    const converted = Math.round(usd * country.rateFromUSD);
    return `${country.currencySymbol} ${converted.toLocaleString()}`;
  };

  const formatPriceWithUSD = (usd: number): string => {
    const converted = Math.round(usd * country.rateFromUSD);
    return `${country.currencySymbol} ${converted.toLocaleString()} ($${usd.toLocaleString()})`;
  };

  const formatJobSalary = (amount: number | null | undefined, jobCountry?: string): string => {
    const numeric = Number(amount ?? 0);
    if (!Number.isFinite(numeric) || numeric <= 0) return 'KES 0/mo';

    const normalizedCountry = (jobCountry || '').toLowerCase();
    if (normalizedCountry === 'kenya' || normalizedCountry === 'ke') {
      return `KES ${numeric.toLocaleString()}/mo`;
    }

    return formatPrice(numeric);
  };

  return (
    <CurrencyContext.Provider value={{ country, setCountry, formatPrice, formatPriceWithUSD, formatJobSalary }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

export { eastAfricanCountries };
