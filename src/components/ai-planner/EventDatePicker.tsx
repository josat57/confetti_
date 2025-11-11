import { Calendar } from "lucide-react";

interface EventDatePickerProps {
  value: Date | null;
  onChange: (value: Date) => void;
  error?: string;
}

export default function EventDatePicker({
  value,
  onChange,
  error,
}: EventDatePickerProps) {
  const today = new Date().toISOString().split("T")[0];
  const dateValue = value ? new Date(value).toISOString().split("T")[0] : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onChange(newDate);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Calendar className="w-4 h-4 mr-2" />
        Event Date <span className="text-red-500">*</span>
      </label>

      <input
        type="date"
        value={dateValue}
        onChange={handleChange}
        min={today}
        className={`w-full px-4 py-3 rounded-lg border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-purple-500"
        } focus:ring-2 focus:border-transparent transition-colors`}
        aria-label="Select event date"
        aria-invalid={!!error}
        aria-describedby={error ? "event-date-error" : "event-date-help"}
      />

      {error && (
        <p
          id="event-date-error"
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}

      {!error && value && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <span className="text-green-500">✓</span>
          Date selected
        </p>
      )}

      {!error && !value && (
        <p id="event-date-help" className="text-sm text-gray-500">
          Select a future date for your event
        </p>
      )}
    </div>
  );
}
