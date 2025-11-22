"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Currency = "NGN" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertAmount: (amount: number, fromCurrency: Currency) => number;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

// Conversion rates (NGN to USD)
const CONVERSION_RATES = {
  NGN_TO_USD: 0.00065, // 1 NGN = ~0.00065 USD (approximate)
  USD_TO_NGN: 1538, // 1 USD = ~1538 NGN (approximate)
};

// localStorage key
const CURRENCY_STORAGE_KEY = "confetti_currency";

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("NGN");

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored && (stored === "NGN" || stored === "USD")) {
        setCurrencyState(stored as Currency);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  // Set currency and sync to localStorage
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch (error) {
      console.error("Error saving currency to localStorage:", error);
    }
  };

  // Convert amount from one currency to current currency
  const convertAmount = (amount: number, fromCurrency: Currency): number => {
    if (fromCurrency === currency) {
      return amount;
    }

    if (fromCurrency === "USD" && currency === "NGN") {
      return Math.round(amount * CONVERSION_RATES.USD_TO_NGN);
    }

    if (fromCurrency === "NGN" && currency === "USD") {
      return Math.round(amount * CONVERSION_RATES.NGN_TO_USD * 100) / 100;
    }

    return amount;
  };

  // Format amount with currency symbol
  const formatAmount = (amount: number): string => {
    if (currency === "NGN") {
      return `₦${amount.toLocaleString()}`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  const value = {
    currency,
    setCurrency,
    convertAmount,
    formatAmount,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
