import { EventStatus, EventType } from "@/types/planner";
import { X } from "lucide-react";

interface EventFiltersProps {
  filters: {
    status?: EventStatus;
    type?: EventType;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

export default function EventFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: EventFiltersProps) {
  const statuses: EventStatus[] = [
    "Draft",
    "Planning",
    "Confirmed",
    "In Progress",
    "Completed",
    "Cancelled",
  ];

  const eventTypes: EventType[] = [
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Graduation",
    "Conference",
    "Anniversary",
    "Other",
  ];

  const hasActiveFilters =
    filters.status || filters.type || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            value={filters.type || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, type: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                dateFrom: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                dateTo: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
