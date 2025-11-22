"use client";

import { useState } from "react";
import {
  useCalendar,
  useBlockDates,
  useUnblockDates,
} from "@/hooks/useCalendar";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import Calendar from "@/components/vendor/calendar/Calendar";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: "booking" | "blocked";
};

type WorkingHours = {
  [key: string]: {
    start: string;
    end: string;
    enabled: boolean;
  };
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { start: "09:00", end: "17:00", enabled: true },
    tuesday: { start: "09:00", end: "17:00", enabled: true },
    wednesday: { start: "09:00", end: "17:00", enabled: true },
    thursday: { start: "09:00", end: "17:00", enabled: true },
    friday: { start: "09:00", end: "17:00", enabled: true },
    saturday: { start: "10:00", end: "14:00", enabled: false },
    sunday: { start: "10:00", end: "14:00", enabled: false },
  });

  // Calculate date range for current month
  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).toISOString();
  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).toISOString();

  const { data: calendarData, isLoading } = useCalendar(startDate, endDate);
  const blockDates = useBlockDates();
  const unblockDates = useUnblockDates();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowBlockModal(true);
  };

  const handleBlockDate = async () => {
    if (!selectedDate || !blockReason.trim()) {
      toast.error("Please enter a reason for blocking this date");
      return;
    }

    try {
      // TODO: Call API to block date
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: blockReason,
        date: selectedDate,
        type: "blocked",
      };

      setEvents([...events, newEvent]);
      toast.success("Date blocked successfully");
      setShowBlockModal(false);
      setBlockReason("");
      setSelectedDate(null);
    } catch (error) {
      console.error("Error blocking date:", error);
      toast.error("Failed to block date");
    }
  };

  const handleUnblockDate = async (eventId: string) => {
    try {
      // TODO: Call API to unblock date
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEvents(events.filter((e) => e.id !== eventId));
      toast.success("Date unblocked successfully");
    } catch (error) {
      console.error("Error unblocking date:", error);
      toast.error("Failed to unblock date");
    }
  };

  const handleWorkingHoursChange = async (
    day: string,
    field: "start" | "end" | "enabled",
    value: string | boolean
  ) => {
    const newWorkingHours = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value,
      },
    };
    setWorkingHours(newWorkingHours);

    // TODO: Save to API
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      toast.success("Working hours updated");
    } catch (error) {
      console.error("Error updating working hours:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Calendar</h1>
          <p className="text-gray-600 mt-1">
            Manage your availability and bookings
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {[
            { value: "month", label: "Month" },
            { value: "week", label: "Week" },
            { value: "day", label: "Day" },
          ].map((viewOption) => (
            <button
              key={viewOption.value}
              onClick={() => setView(viewOption.value as typeof view)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === viewOption.value
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {viewOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
          <span className="text-gray-700">Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span className="text-gray-700">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span className="text-gray-700">Available</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-8">
        <Calendar
          events={events}
          view={view}
          onDateClick={handleDateClick}
          onEventClick={(event) => {
            if (event.type === "blocked") {
              if (confirm("Do you want to unblock this date?")) {
                handleUnblockDate(event.id);
              }
            }
          }}
        />
      </div>

      {/* Working Hours Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Working Hours</h2>
        </div>
        <div className="space-y-3">
          {Object.entries(workingHours).map(([day, hours]) => (
            <div
              key={day}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-28">
                <span className="font-medium text-gray-900 capitalize">
                  {day}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="time"
                  value={hours.start}
                  onChange={(e) =>
                    handleWorkingHoursChange(day, "start", e.target.value)
                  }
                  disabled={!hours.enabled}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hours.end}
                  onChange={(e) =>
                    handleWorkingHoursChange(day, "end", e.target.value)
                  }
                  disabled={!hours.enabled}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                />
                <label className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) =>
                      handleWorkingHoursChange(day, "enabled", e.target.checked)
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">Available</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Block Date Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Block Date
              </h3>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason("");
                  setSelectedDate(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Selected Date:{" "}
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for blocking
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Personal time off, Holiday"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason("");
                  setSelectedDate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockDate}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Block Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
