"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import EventCard from "@/components/planner/events/EventCard";
import EventFilters from "@/components/planner/events/EventFilters";
import { eventsService } from "@/services/planner/events.service";
import {
  Event,
  EventFilters as Filters,
  EventSortOption,
} from "@/types/planner";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [sortBy, setSortBy] = useState<EventSortOption>({
    field: "date",
    order: "asc",
  });
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, [filters, sortBy, page, searchQuery]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsService.getEvents(
        { ...filters, search: searchQuery },
        sortBy,
        page,
        12
      );
      setEvents(data?.events || []);
      setTotalPages(data?.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (id: string) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map((e) => e._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedEvents.length} events?`)) return;

    try {
      await eventsService.bulkDelete(selectedEvents);
      setSelectedEvents([]);
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete events:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;

    try {
      await eventsService.deleteEvent(id);
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your events in one place
          </p>
        </div>
        <button
          onClick={() => router.push("/planner/dashboard/events/new")}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search events by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <EventFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Sort and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {selectedEvents.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedEvents.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={`${sortBy.field}-${sortBy.order}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy({
                field: field as any,
                order: order as "asc" | "desc",
              });
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
          <p className="text-gray-500 mb-4">No events found</p>
          <button
            onClick={() => router.push("/planner/dashboard/events/new")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
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
                onEdit={(id) =>
                  router.push(`/planner/dashboard/events/${id}/edit`)
                }
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
