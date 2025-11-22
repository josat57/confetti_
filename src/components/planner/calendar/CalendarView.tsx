"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { CalendarEvent } from "@/services/planner/calendar.service";

interface CalendarViewProps {
  events: CalendarEvent[];
  view: "month" | "week" | "day";
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

export default function CalendarView({
  events,
  view,
  currentDate,
  onDateChange,
  onEventClick,
  onDateClick,
}: CalendarViewProps) {
  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color;

    switch (event.type) {
      case "event":
        return "bg-teal-500";
      case "task":
        return "bg-blue-500";
      case "milestone":
        return "bg-purple-500";
      case "booking":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const handlePrevious = () => {
    if (view === "month") {
      onDateChange(subMonths(currentDate, 1));
    } else if (view === "week") {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      onDateChange(addMonths(currentDate, 1));
    } else if (view === "week") {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                  !isCurrentMonth ? "bg-gray-50" : ""
                } ${
                  index % 7 === 6 ? "border-r-0" : ""
                } cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => onDateClick(day)}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? "w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center"
                      : isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`${getEventColor(
                        event
                      )} text-white text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-600 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className="border-r border-gray-200 last:border-r-0"
              >
                <div
                  className={`p-3 border-b border-gray-200 text-center ${
                    isToday ? "bg-teal-50" : ""
                  }`}
                >
                  <div className="text-xs text-gray-600 uppercase">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-1 ${
                      isToday
                        ? "w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto"
                        : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
                <div className="p-2 space-y-2 min-h-[400px]">
                  {dayEvents.map((event) => (
                    <div
                      key={event._id}
                      onClick={() => onEventClick(event)}
                      className={`${getEventColor(
                        event
                      )} text-white text-sm px-3 py-2 rounded cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.start && (
                        <div className="text-xs opacity-90 mt-1">
                          {format(new Date(event.start), "h:mm a")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isToday = isSameDay(currentDate, new Date());

    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200">
        <div
          className={`p-4 border-b border-gray-200 ${
            isToday ? "bg-teal-50" : ""
          }`}
        >
          <div className="text-sm text-gray-600 uppercase">
            {format(currentDate, "EEEE")}
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {format(currentDate, "MMMM d, yyyy")}
          </div>
        </div>
        <div className="p-4 space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No events or tasks scheduled for this day
            </div>
          ) : (
            dayEvents.map((event) => (
              <div
                key={event._id}
                onClick={() => onEventClick(event)}
                className={`${getEventColor(
                  event
                )} text-white p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{event.title}</div>
                    {event.category && (
                      <div className="text-sm opacity-90 mt-1">
                        {event.category}
                      </div>
                    )}
                  </div>
                  {event.start && (
                    <div className="text-sm opacity-90">
                      {format(new Date(event.start), "h:mm a")}
                    </div>
                  )}
                </div>
                {event.status && (
                  <div className="mt-2 text-sm opacity-90">
                    Status: {event.status}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {view === "day"
            ? format(currentDate, "MMMM d, yyyy")
            : format(currentDate, "MMMM yyyy")}
        </h2>
      </div>

      {/* Calendar content */}
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}
    </div>
  );
}
