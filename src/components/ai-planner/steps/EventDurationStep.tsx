import { useState, useEffect } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { EventDurationData, EventType } from "@/types/ai-planner";

interface EventDurationStepProps {
  value?: EventDurationData;
  onChange: (data: EventDurationData) => void;
  eventType: EventType;
  errors: Record<string, string>;
}

// Smart defaults based on event type
const getEventDefaults = (eventType: EventType): Partial<EventDurationData> => {
  const defaults = {
    [EventType.WEDDING]: { startTime: "16:00", endTime: "23:00" },
    [EventType.CORPORATE]: { startTime: "09:00", endTime: "17:00" },
    [EventType.BIRTHDAY]: { startTime: "14:00", endTime: "18:00" },
    [EventType.CONFERENCE]: { startTime: "08:00", endTime: "18:00" },
    [EventType.GRADUATION]: { startTime: "10:00", endTime: "14:00" },
    [EventType.OTHER]: { startTime: "14:00", endTime: "18:00" },
  };

  return defaults[eventType] || defaults[EventType.OTHER];
};

export default function EventDurationStep({
  value,
  onChange,
  eventType,
  errors,
}: EventDurationStepProps) {
  const [localData, setLocalData] = useState<EventDurationData>(() => {
    const defaults = getEventDefaults(eventType);
    return {
      startTime: defaults.startTime || "14:00",
      endTime: defaults.endTime || "18:00",
      isMultiDay: false,
      numberOfDays: 1,
      timeFlexibility: "moderate",
      ...value,
    };
  });

  useEffect(() => {
    onChange(localData);
  }, [localData, onChange]);

  const updateData = (updates: Partial<EventDurationData>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
  };

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${localData.startTime}:00`);
    const end = new Date(`2000-01-01T${localData.endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 ? diffHours : diffHours + 24; // Handle overnight events
  };

  const duration = calculateDuration();

  return (
    <div className="space-y-6">
      {/* Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="time"
              value={localData.startTime}
              onChange={(e) => updateData({ startTime: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="time"
              value={localData.endTime}
              onChange={(e) => updateData({ endTime: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Duration Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            Event Duration: {duration.toFixed(1)} hours
          </span>
        </div>
        {duration > 8 && (
          <div className="flex items-center gap-2 mt-2 text-amber-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              Long events may require additional planning considerations
            </span>
          </div>
        )}
      </div>

      {/* Multi-day Event */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="multiDay"
            checked={localData.isMultiDay}
            onChange={(e) =>
              updateData({
                isMultiDay: e.target.checked,
                numberOfDays: e.target.checked ? localData.numberOfDays : 1,
              })
            }
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label
            htmlFor="multiDay"
            className="text-sm font-medium text-gray-700"
          >
            This is a multi-day event
          </label>
        </div>

        {localData.isMultiDay && (
          <div className="ml-7">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Days
            </label>
            <div className="relative w-32">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min="2"
                max="7"
                value={localData.numberOfDays}
                onChange={(e) =>
                  updateData({ numberOfDays: parseInt(e.target.value) || 2 })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Time Flexibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Time Flexibility
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              value: "strict",
              label: "Strict",
              description: "Exact times required",
              color: "red",
            },
            {
              value: "moderate",
              label: "Moderate",
              description: "±30 minutes flexibility",
              color: "yellow",
            },
            {
              value: "flexible",
              label: "Flexible",
              description: "Open to suggestions",
              color: "green",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                localData.timeFlexibility === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50`
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="timeFlexibility"
                value={option.value}
                checked={localData.timeFlexibility === option.value}
                onChange={(e) =>
                  updateData({ timeFlexibility: e.target.value as any })
                }
                className="sr-only"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
              <span className="text-sm text-gray-600 mt-1">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Event Type Specific Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">
          💡 Tips for {eventType} events:
        </h4>
        <div className="text-sm text-gray-600">
          {eventType === EventType.WEDDING && (
            <ul className="space-y-1">
              <li>• Ceremony typically 30-60 minutes</li>
              <li>• Cocktail hour: 1-1.5 hours</li>
              <li>• Reception: 4-6 hours</li>
            </ul>
          )}
          {eventType === EventType.CORPORATE && (
            <ul className="space-y-1">
              <li>• Include breaks every 90 minutes</li>
              <li>• Lunch break: 60-90 minutes</li>
              <li>• Networking time: 30-60 minutes</li>
            </ul>
          )}
          {eventType === EventType.BIRTHDAY && (
            <ul className="space-y-1">
              <li>• Children's parties: 2-3 hours</li>
              <li>• Adult parties: 3-5 hours</li>
              <li>• Consider meal timing</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
