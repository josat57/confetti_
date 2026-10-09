"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Currency = "NGN" | "USD" | "GBP";

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
// Naira per unit, approximate (display only; payments use the server's rates)
const NGN_PER: Record<Currency, number> = { NGN: 1, USD: 1600, GBP: 2050 };

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
      if (stored && (stored === "NGN" || stored === "USD" || stored === "GBP")) {
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

    const naira = amount * NGN_PER[fromCurrency];
    return currency === "NGN" ? Math.round(naira) : Math.round((naira / NGN_PER[currency]) * 100) / 100;
  };

  // Format amount with currency symbol
  const formatAmount = (amount: number): string => {
    const symbol = currency === "NGN" ? "₦" : currency === "GBP" ? "£" : "$";
    return `${symbol}${amount.toLocaleString()}`;
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
