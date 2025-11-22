"use client";

import { format, isSameDay, parseISO } from "date-fns";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { CalendarEvent } from "@/services/planner/calendar.service";

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function AgendaView({ events, onEventClick }: AgendaViewProps) {
  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const date = format(new Date(event.start), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, CalendarEvent[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();

  const getEventIcon = (event: CalendarEvent) => {
    switch (event.type) {
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "task":
        return event.status === "Completed" ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        );
      case "milestone":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color;

    switch (event.type) {
      case "event":
        return "border-teal-500 bg-teal-50 text-teal-700";
      case "task":
        return event.status === "Completed"
          ? "border-green-500 bg-green-50 text-green-700"
          : "border-blue-500 bg-blue-50 text-blue-700";
      case "milestone":
        return "border-purple-500 bg-purple-50 text-purple-700";
      case "booking":
        return "border-orange-500 bg-orange-50 text-orange-700";
      default:
        return "border-gray-500 bg-gray-50 text-gray-700";
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    const colors = {
      High: "bg-red-100 text-red-800 border-red-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Low: "bg-green-100 text-green-800 border-green-200",
    };

    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
          colors[priority as keyof typeof colors] || colors.Low
        }`}
      >
        {priority}
      </span>
    );
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No upcoming items
        </h3>
        <p className="text-gray-600">
          Your calendar is clear. Create an event or task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Agenda</h3>
        <p className="text-sm text-gray-600 mt-1">
          {events.length} upcoming {events.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedDates.map((dateStr) => {
          const date = parseISO(dateStr);
          const dateEvents = groupedEvents[dateStr];
          const isToday = isSameDay(date, new Date());

          return (
            <div key={dateStr} className="p-4">
              {/* Date header */}
              <div
                className={`flex items-center gap-2 mb-3 ${
                  isToday ? "text-teal-600" : "text-gray-900"
                }`}
              >
                <div className="font-semibold">
                  {format(date, "EEEE, MMMM d")}
                </div>
                {isToday && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
                    Today
                  </span>
                )}
              </div>

              {/* Events for this date */}
              <div className="space-y-2">
                {dateEvents.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => onEventClick(event)}
                    className={`flex items-start gap-3 p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${getEventColor(
                      event
                    )}`}
                  >
                    <div className="mt-0.5">{getEventIcon(event)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium truncate">
                            {event.title}
                          </h4>
                          {event.category && (
                            <p className="text-sm opacity-75 mt-0.5">
                              {event.category}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {event.priority && getPriorityBadge(event.priority)}
                          {event.start && !event.allDay && (
                            <span className="text-sm font-medium whitespace-nowrap">
                              {format(new Date(event.start), "h:mm a")}
                            </span>
                          )}
                        </div>
                      </div>
                      {event.status && event.type === "task" && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-75">Status:</span>
                          <span className="text-xs font-medium">
                            {event.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
