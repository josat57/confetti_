import { Users, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface GuestCountInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export default function GuestCountInput({
  value,
  onChange,
  error,
}: GuestCountInputProps) {
  const handleIncrement = () => {
    if (value < 10000) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 10000) {
      onChange(newValue);
    } else if (e.target.value === "") {
      onChange(0);
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Users className="w-4 h-4 mr-2" />
        Number of Guests <span className="text-red-500">*</span>
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= 1}
          className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease guest count"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="number"
          value={value || ""}
          onChange={handleChange}
          min="1"
          max="10000"
          className={`flex-1 px-4 py-3 rounded-lg border ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          } focus:ring-2 focus:border-transparent transition-colors text-center`}
          placeholder="Enter number of guests"
          aria-label="Number of guests"
          aria-invalid={!!error}
          aria-describedby={error ? "guest-count-error" : "guest-count-help"}
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= 10000}
          className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase guest count"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p
          id="guest-count-error"
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}

      {!error && value > 0 && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <span className="text-green-500">✓</span>
          {value.toLocaleString()} guest{value !== 1 ? "s" : ""}
        </p>
      )}

      {!error && value === 0 && (
        <p id="guest-count-help" className="text-sm text-gray-500">
          Enter the expected number of guests (1-10,000)
        </p>
      )}
    </div>
  );
}
