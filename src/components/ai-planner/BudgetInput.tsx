import { DollarSign } from "lucide-react";
import { Currency } from "@/types/ai-planner";

interface BudgetInputProps {
  amount: number;
  currency: Currency;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: Currency) => void;
  error?: string;
}

const currencyOptions = [
  { value: Currency.USD, label: "USD ($)", symbol: "$" },
  { value: Currency.EUR, label: "EUR (€)", symbol: "€" },
  { value: Currency.GBP, label: "GBP (£)", symbol: "£" },
  { value: Currency.NGN, label: "NGN (₦)", symbol: "₦" },
];

export default function BudgetInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  error,
}: BudgetInputProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      onAmountChange(newAmount);
    } else if (e.target.value === "") {
      onAmountChange(0);
    }
  };

  const formatAmount = (value: number): string => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const currencySymbol =
    currencyOptions.find((c) => c.value === currency)?.symbol || "$";

  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <DollarSign className="w-4 h-4 mr-2" />
        Budget <span className="text-red-500">*</span>
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            {currencySymbol}
          </span>
          <input
            type="number"
            value={amount || ""}
            onChange={handleAmountChange}
            min="0"
            step="100"
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            } focus:ring-2 focus:border-transparent transition-colors`}
            placeholder="Enter your budget"
            aria-label="Budget amount"
            aria-invalid={!!error}
            aria-describedby={error ? "budget-error" : "budget-help"}
          />
        </div>

        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as Currency)}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          aria-label="Select currency"
        >
          {currencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p
          id="budget-error"
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}

      {!error && amount >= 100 && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <span className="text-green-500">✓</span>
          Budget: {currencySymbol}
          {formatAmount(amount)}
        </p>
      )}

      {!error && amount > 0 && amount < 100 && (
        <p className="text-sm text-orange-500">
          Minimum budget is {currencySymbol}100
        </p>
      )}

      {!error && amount === 0 && (
        <p id="budget-help" className="text-sm text-gray-500">
          💡 Enter your total budget for the event (minimum {currencySymbol}100)
        </p>
      )}
    </div>
  );
}
