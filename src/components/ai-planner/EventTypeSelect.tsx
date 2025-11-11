import { EventType } from "@/types/ai-planner";
import {
  Heart,
  Briefcase,
  Cake,
  GraduationCap,
  Users,
  Calendar,
} from "lucide-react";

interface EventTypeSelectProps {
  value: EventType | "";
  onChange: (value: EventType) => void;
  error?: string;
}

const eventTypeOptions = [
  { value: EventType.WEDDING, label: "Wedding", icon: Heart },
  { value: EventType.CORPORATE, label: "Corporate Event", icon: Briefcase },
  { value: EventType.BIRTHDAY, label: "Birthday Party", icon: Cake },
  { value: EventType.GRADUATION, label: "Graduation", icon: GraduationCap },
  { value: EventType.CONFERENCE, label: "Conference", icon: Users },
  { value: EventType.OTHER, label: "Other", icon: Calendar },
];

export default function EventTypeSelect({
  value,
  onChange,
  error,
}: EventTypeSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Event Type <span className="text-red-500">*</span>
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as EventType)}
        className={`w-full px-4 py-3 rounded-lg border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-purple-500"
        } focus:ring-2 focus:border-transparent transition-colors`}
        aria-label="Select event type"
        aria-invalid={!!error}
        aria-describedby={error ? "event-type-error" : undefined}
      >
        <option value="">Select event type</option>
        {eventTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          id="event-type-error"
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}

      {!error && value && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <span className="text-green-500">✓</span>
          Event type selected
        </p>
      )}
    </div>
  );
}
