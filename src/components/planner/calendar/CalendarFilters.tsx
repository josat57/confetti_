"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { CalendarFilters as Filters } from "@/services/planner/calendar.service";

interface CalendarFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  events?: Array<{ _id: string; name: string }>;
  teamMembers?: Array<{ _id: string; name: string }>;
}

export default function CalendarFilters({
  filters,
  onFiltersChange,
  events = [],
  teamMembers = [],
}: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key: keyof Filters, value: any) => {
    const currentArray = (filters[key] as any[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    onFiltersChange({
      ...filters,
      [key]: newArray,
    });
  };

  const handleBooleanToggle = (key: keyof Filters) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      showEvents: true,
      showTasks: true,
      showMilestones: true,
    });
  };

  const hasActiveFilters =
    (filters.eventIds && filters.eventIds.length > 0) ||
    (filters.taskTypes && filters.taskTypes.length > 0) ||
    (filters.teamMembers && filters.teamMembers.length > 0) ||
    filters.showEvents === false ||
    filters.showTasks === false ||
    filters.showMilestones === false;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
          hasActiveFilters
            ? "border-teal-600 bg-teal-50 text-teal-700"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Filter panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filter Calendar</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Item type toggles */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Show Items
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showEvents !== false}
                      onChange={() => handleBooleanToggle("showEvents")}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Events</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showTasks !== false}
                      onChange={() => handleBooleanToggle("showTasks")}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Tasks</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showMilestones !== false}
                      onChange={() => handleBooleanToggle("showMilestones")}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Milestones</span>
                  </label>
                </div>
              </div>

              {/* Event filter */}
              {events.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Filter by Event
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {events.map((event) => (
                      <label
                        key={event._id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.eventIds?.includes(event._id)}
                          onChange={() => handleToggle("eventIds", event._id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 truncate">
                          {event.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Team member filter */}
              {teamMembers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Filter by Team Member
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {teamMembers.map((member) => (
                      <label
                        key={member._id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.teamMembers?.includes(member._id)}
                          onChange={() =>
                            handleToggle("teamMembers", member._id)
                          }
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 truncate">
                          {member.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Task type filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Task Priority
                </h4>
                <div className="space-y-2">
                  {["High", "Medium", "Low"].map((priority) => (
                    <label
                      key={priority}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.taskTypes?.includes(priority)}
                        onChange={() => handleToggle("taskTypes", priority)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            {hasActiveFilters && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
