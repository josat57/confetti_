"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2 } from "lucide-react";
import EventCard from "@/components/planner/events/EventCard";
import EventFilters from "@/components/planner/events/EventFilters";
import { EventFilters as Filters, EventSortOption } from "@/types/planner";
import {
  usePlannerEvents,
  useDeletePlannerEvent,
  useBulkDeletePlannerEvents,
} from "@/hooks/usePlannerEvents";

export default function EventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [sortBy, setSortBy] = useState<EventSortOption>({ field: "date", order: "asc" });
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = usePlannerEvents(
    { ...filters, search: searchQuery },
    sortBy,
    page
  );
  const deleteEvent = useDeletePlannerEvent();
  const bulkDelete = useBulkDeletePlannerEvents();

  const events = data?.events || [];
  const totalPages = data?.totalPages || 1;

  const handleSelectEvent = (id: string) =>
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedEvents.length} events?`)) return;
    await bulkDelete.mutateAsync(selectedEvents);
    setSelectedEvents([]);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this event?")) return;
    deleteEvent.mutate(id);
  };

  const inputCls = "w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
  const selectCls = "px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500";

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Events</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all your events in one place
            {isFetching && !isLoading && (
              <span className="ml-2 text-teal-600 dark:text-teal-400">Refreshing…</span>
            )}
          </p>
        </div>
        <button
          onClick={() => router.push("/planner/dashboard/events/new")}
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search events by name or description..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          className={inputCls}
        />
      </div>

      {/* Filters */}
      <EventFilters
        filters={filters}
        onFilterChange={(f) => { setFilters(f); setPage(1); }}
        onClearFilters={() => { setFilters({}); setSearchQuery(""); setPage(1); }}
      />

      {/* Sort + Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {selectedEvents.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEvents.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
          <select
            value={`${sortBy.field}-${sortBy.order}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy({ field: field as any, order: order as "asc" | "desc" });
            }}
            className={selectCls}
          >
            <option value="date-asc">Date (Earliest)</option>
            <option value="date-desc">Date (Latest)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="status-asc">Status</option>
            <option value="createdAt-desc">Recently Created</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No events found</p>
          <button
            onClick={() => router.push("/planner/dashboard/events/new")}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Event
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                selected={selectedEvents.includes(event._id)}
                onSelect={handleSelectEvent}
                onView={(id) => router.push(`/planner/dashboard/events/${id}`)}
                onEdit={(id) => router.push(`/planner/dashboard/events/${id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
