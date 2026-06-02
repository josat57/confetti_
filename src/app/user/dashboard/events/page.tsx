"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Filter,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useUserEvents, useDeleteEvent } from "@/hooks/useUserDashboard";

const STATUS_OPTIONS = ["All", "Draft", "Planning", "Confirmed", "In Progress", "Completed", "Cancelled"];

const statusConfig: Record<string, { className: string; icon: any }> = {
  Draft:        { className: "bg-gray-100 text-gray-700",   icon: Clock },
  Planning:     { className: "bg-blue-100 text-blue-700",   icon: Clock },
  Confirmed:    { className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  "In Progress":{ className: "bg-amber-100 text-amber-700", icon: Clock },
  Completed:    { className: "bg-purple-100 text-purple-700",icon: CheckCircle2 },
  Cancelled:    { className: "bg-red-100 text-red-700",     icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.Draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="mt-4 h-2 bg-gray-200 rounded-full" />
    </div>
  );
}

const formatCurrency = (amount: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

export default function UserEventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data, isLoading, isFetching } = useUserEvents({
    status: statusFilter !== "All" ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 12,
  });

  const deleteEvent = useDeleteEvent();

  const events = data?.events ?? [];
  const totalPages = data?.totalPages ?? 1;

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteEvent.mutateAsync(id);
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all your events</p>
        </div>
        <button
          onClick={() => router.push("/user/dashboard/events/new")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-5">
            <Calendar className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {searchQuery || statusFilter !== "All" ? "No matching events" : "No events yet"}
          </h3>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">
            {searchQuery || statusFilter !== "All"
              ? "Try adjusting your filters"
              : "Create your first event to get started"}
          </p>
          {!searchQuery && statusFilter === "All" && (
            <button
              onClick={() => router.push("/user/dashboard/events/new")}
              className="mt-5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Create Event
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Refetch indicator (keeps stale data visible while revalidating) */}
          {isFetching && (
            <div className="text-xs text-gray-400 text-right -mb-4">Refreshing…</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => router.push(`/user/dashboard/events/${event._id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1 flex-1 pr-2">
                      {event.name}
                    </h3>
                    <StatusBadge status={event.status} />
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                    </div>
                    {event.location?.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{event.location.city}, {event.location.state}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{event.guestCount} guests</span>
                    </div>
                  </div>

                  {event.completionPercentage > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Planning progress</span>
                        <span>{event.completionPercentage}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${event.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {event.budget?.total > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Budget</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(event.budget.total, event.budget.currency)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-4 flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/user/dashboard/events/${event._id}`)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View details
                  </button>
                  <button
                    onClick={() => handleDelete(event._id, event.name)}
                    disabled={deleteEvent.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
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
