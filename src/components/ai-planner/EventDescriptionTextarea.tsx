import { FileText } from "lucide-react";
import { useEffect, useRef } from "react";

interface EventDescriptionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function EventDescriptionTextarea({
  value,
  onChange,
  error,
}: EventDescriptionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = value.length;
  const minChars = 50;
  const maxChars = 1000;
  const isValid = charCount >= minChars && charCount <= maxChars;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <FileText className="w-4 h-4 mr-2" />
        Event Description <span className="text-red-500">*</span>
      </label>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-lg border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-purple-500"
        } focus:ring-2 focus:border-transparent transition-colors resize-none`}
        placeholder="Describe your event vision, theme, and any specific requirements... (minimum 50 characters)"
        rows={4}
        maxLength={maxChars}
        aria-label="Event description"
        aria-invalid={!!error}
        aria-describedby={
          error ? "event-description-error" : "event-description-help"
        }
      />

      <div className="flex items-center justify-between">
        <div className="flex-1">
          {error && (
            <p
              id="event-description-error"
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <span className="text-red-500">⚠</span>
              {error}
            </p>
          )}

          {!error && isValid && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <span className="text-green-500">✓</span>
              Description looks good
            </p>
          )}

          {!error && !isValid && charCount > 0 && charCount < minChars && (
            <p id="event-description-help" className="text-sm text-gray-500">
              {minChars - charCount} more character
              {minChars - charCount !== 1 ? "s" : ""} needed
            </p>
          )}
        </div>

        <div
          className={`text-sm ${
            charCount < minChars
              ? "text-gray-400"
              : charCount > maxChars * 0.9
              ? "text-orange-500"
              : "text-gray-600"
          }`}
        >
          {charCount}/{maxChars}
        </div>
      </div>

      {!value && !error && (
        <p className="text-sm text-gray-500">
          💡 Example: "An elegant outdoor wedding for 150 guests with a garden
          theme. We want a romantic atmosphere with string lights and floral
          decorations."
        </p>
      )}
    </div>
  );
}
