"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import CalendarView from "@/components/planner/calendar/CalendarView";
import AgendaView from "@/components/planner/calendar/AgendaView";
import CalendarFilters from "@/components/planner/calendar/CalendarFilters";
import {
  plannerCalendarService,
  CalendarEvent,
  CalendarFilters as Filters,
} from "@/services/planner/calendar.service";

type ViewType = "month" | "week" | "day" | "agenda";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [filters, setFilters] = useState<Filters>({
    showEvents: true,
    showTasks: true,
    showMilestones: true,
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // Calculate date range based on view
  const getDateRange = () => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };
    } else if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };
    } else if (view === "day") {
      return {
        startDate: format(currentDate, "yyyy-MM-dd"),
        endDate: format(currentDate, "yyyy-MM-dd"),
      };
    } else {
      // Agenda view - show next 3 months
      const start = currentDate;
      const end = addMonths(currentDate, 3);
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };
    }
  };

  const { startDate, endDate } = getDateRange();

  // Fetch calendar data
  const { data, isLoading, error } = useQuery({
    queryKey: ["planner-calendar", startDate, endDate, view, filters],
    queryFn: () =>
      plannerCalendarService.getCalendar(
        startDate,
        endDate,
        view === "agenda" ? "month" : view,
        filters
      ),
  });

  const handleExport = async () => {
    try {
      const result = await plannerCalendarService.exportCalendar(
        startDate,
        endDate
      );
      // Trigger download
      window.open(result.downloadUrl, "_blank");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export calendar");
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    // TODO: Open event/task details modal
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView("day");
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">
              Manage your events, tasks, and deadlines
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* View switcher */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {(["month", "week", "day", "agenda"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  view === v
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Filters */}
          <CalendarFilters
            filters={filters}
            onFiltersChange={setFilters}
            events={[]} // TODO: Pass actual events list
            teamMembers={[]} // TODO: Pass actual team members
          />
        </div>
      </div>

      {/* Conflicts warning */}
      {data?.conflicts && data.conflicts.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">
              Scheduling Conflicts Detected
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              You have {data.conflicts.length} date(s) with overlapping events
              or tasks.
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load calendar
            </h3>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      )}

      {/* Calendar content */}
      {!isLoading && !error && data && (
        <div className="flex-1 overflow-hidden">
          {view === "agenda" ? (
            <AgendaView
              events={data.events || []}
              onEventClick={handleEventClick}
            />
          ) : (
            <CalendarView
              events={data.events || []}
              view={view}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}
        </div>
      )}

      {/* Event details modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedEvent.title}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-sm text-gray-900 capitalize">
                  {selectedEvent.type}
                </span>
              </div>
              {selectedEvent.start && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Date:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {format(new Date(selectedEvent.start), "MMMM d, yyyy")}
                  </span>
                </div>
              )}
              {selectedEvent.category && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Category:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {selectedEvent.category}
                  </span>
                </div>
              )}
              {selectedEvent.status && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Status:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {selectedEvent.status}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // TODO: Navigate to event/task details
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
