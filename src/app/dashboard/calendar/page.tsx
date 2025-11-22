"use client";

import { useState } from "react";
import {
  useCalendar,
  useBlockDates,
  useUnblockDates,
} from "@/hooks/useCalendar";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [blockReason, setBlockReason] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);

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

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateBlocked = (date: Date) => {
    if (!calendarData?.blockedDates) return false;
    const dateStr = date.toISOString().split("T")[0];
    return calendarData.blockedDates.some((block) =>
      block.dates.includes(dateStr)
    );
  };

  const hasEvent = (date: Date) => {
    if (!calendarData?.events) return false;
    const dateStr = date.toISOString().split("T")[0];
    return calendarData.events.some(
      (event) => new Date(event.date).toISOString().split("T")[0] === dateStr
    );
  };

  const toggleDateSelection = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleBlockDates = async () => {
    if (selectedDates.length === 0) return;

    try {
      await blockDates.mutateAsync({
        dates: selectedDates,
        reason: blockReason || undefined,
      });
      setSelectedDates([]);
      setBlockReason("");
      setShowBlockModal(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUnblockDate = async (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const block = calendarData?.blockedDates.find((b) =>
      b.dates.includes(dateStr)
    );
    if (block) {
      await unblockDates.mutateAsync(block._id);
    }
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar & Availability</h1>
        <div className="flex gap-2">
          {selectedDates.length > 0 && (
            <button
              onClick={() => setShowBlockModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Block {selectedDates.length} Date
              {selectedDates.length !== 1 ? "s" : ""}
            </button>
          )}
          <button
            onClick={() =>
              (window.location.href = "/dashboard/calendar/settings")
            }
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={previousMonth}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          ← Previous
        </button>
        <h2 className="text-2xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Next →
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Selected</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-3 text-center font-semibold border-b border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {getDaysInMonth().map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square border-b border-r last:border-r-0 bg-gray-50"
                ></div>
              );
            }

            const dateStr = date.toISOString().split("T")[0];
            const isBlocked = isDateBlocked(date);
            const hasEventOnDate = hasEvent(date);
            const isSelected = selectedDates.includes(dateStr);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={dateStr}
                onClick={() => !isBlocked && toggleDateSelection(date)}
                className={`aspect-square border-b border-r last:border-r-0 p-2 cursor-pointer transition-colors ${
                  isBlocked
                    ? "bg-red-50 cursor-not-allowed"
                    : hasEventOnDate
                    ? "bg-blue-50"
                    : isSelected
                    ? "bg-green-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col h-full">
                  <div
                    className={`text-sm font-semibold ${
                      isToday
                        ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {isBlocked && (
                    <div className="mt-1">
                      <span className="text-xs text-red-600 font-semibold">
                        Blocked
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnblockDate(date);
                        }}
                        className="text-xs text-blue-600 hover:underline block"
                      >
                        Unblock
                      </button>
                    </div>
                  )}

                  {hasEventOnDate && !isBlocked && (
                    <div className="mt-1">
                      <span className="text-xs text-blue-600 font-semibold">
                        Event
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked Dates List */}
      {calendarData?.blockedDates && calendarData.blockedDates.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Blocked Dates</h2>
          <div className="space-y-2">
            {calendarData.blockedDates.map((block) => (
              <div
                key={block._id}
                className="border rounded-lg p-4 flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold">
                    {block.dates.length} date
                    {block.dates.length !== 1 ? "s" : ""} blocked
                  </p>
                  {block.reason && (
                    <p className="text-sm text-gray-600">{block.reason}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(block.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => unblockDates.mutateAsync(block._id)}
                  disabled={unblockDates.isPending}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Unblock All
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block Dates Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Block Dates</h3>
            <p className="mb-4">
              You are about to block {selectedDates.length} date
              {selectedDates.length !== 1 ? "s" : ""}.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Reason (optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., Personal time off, Holiday, etc."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBlockDates}
                disabled={blockDates.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {blockDates.isPending ? "Blocking..." : "Block Dates"}
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason("");
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
