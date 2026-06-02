"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Plus,
} from "lucide-react";
import { UserBooking, UserBookingStatus } from "@/services/user-booking.service";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useUserBookings, useCancelBooking } from "@/hooks/useUserBookings";

const STATUS_OPTIONS = ["All", "Pending", "Contacted", "Quoted", "Booked", "Confirmed", "Declined", "Cancelled"];

const statusConfig: Record<UserBookingStatus, { label: string; icon: any; className: string }> = {
  Pending:   { label: "Pending",   icon: Clock,        className: "bg-amber-100 text-amber-700" },
  Contacted: { label: "Contacted", icon: Clock,        className: "bg-blue-100 text-blue-700" },
  Quoted:    { label: "Quoted",    icon: AlertCircle,  className: "bg-indigo-100 text-indigo-700" },
  Booked:    { label: "Booked",    icon: CheckCircle2, className: "bg-teal-100 text-teal-700" },
  Confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-green-100 text-green-700" },
  Declined:  { label: "Declined",  icon: XCircle,      className: "bg-red-100 text-red-700" },
  Cancelled: { label: "Cancelled", icon: XCircle,      className: "bg-gray-100 text-gray-500" },
};

function StatusBadge({ status }: { status: UserBookingStatus }) {
  const cfg = statusConfig[status] || statusConfig.Pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="p-5 flex items-center gap-4 animate-pulse border-b border-gray-50">
      <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20" />
    </div>
  );
}

function getVendorName(booking: UserBooking): string {
  return typeof booking.vendor === "object" && booking.vendor?.businessName
    ? booking.vendor.businessName
    : "Vendor";
}

function getEventInfo(booking: UserBooking): string {
  if (typeof booking.event === "object" && booking.event) {
    const type = booking.event.type || "";
    const date = booking.event.date ? format(new Date(booking.event.date), "MMM d, yyyy") : "";
    return [type, date].filter(Boolean).join(" · ");
  }
  return "";
}

export default function UserBookingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUserBookings({
    status: statusFilter !== "All" ? statusFilter : undefined,
    page,
    limit: 10,
  });

  const cancelBooking = useCancelBooking();

  const allBookings = data?.bookings ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Client-side search filter (bookings already paginated by status)
  const bookings = search
    ? allBookings.filter(
        (b) =>
          getVendorName(b).toLowerCase().includes(search.toLowerCase()) ||
          b.serviceRequirements.toLowerCase().includes(search.toLowerCase())
      )
    : allBookings;

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking request?")) return;
    try {
      await cancelBooking.mutateAsync({ id });
      toast.success("Request cancelled");
    } catch {
      toast.error("Failed to cancel request");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Track your vendor quote requests and bookings</p>
        </div>
        <button
          onClick={() => router.push("/user/dashboard/vendors")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Find Vendors
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vendor or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-5">
              <Briefcase className="w-10 h-10 text-purple-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {search || statusFilter !== "All" ? "No matching bookings" : "No booking requests yet"}
            </h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              {search || statusFilter !== "All"
                ? "Try adjusting your filters"
                : "Browse vendors and send your first quote request"}
            </p>
            {!search && statusFilter === "All" && (
              <button
                onClick={() => router.push("/user/dashboard/vendors")}
                className="mt-5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Find Vendors
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {bookings.map((booking) => {
              const vendorName = getVendorName(booking);
              const eventInfo = getEventInfo(booking);
              const canCancel = booking.status === "Pending" || booking.status === "Contacted";
              const isCancelling = cancelBooking.isPending && (cancelBooking.variables as any)?.id === booking._id;

              return (
                <li
                  key={booking._id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{vendorName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {eventInfo && <span className="text-xs text-gray-500">{eventInfo}</span>}
                      {booking.budget > 0 && (
                        <span className="text-xs text-gray-400">
                          Budget:{" "}
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: booking.currency || "NGN",
                            minimumFractionDigits: 0,
                          }).format(booking.budget)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                      {booking.serviceRequirements}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={booking.status} />
                    <span className="text-xs text-gray-400">
                      {format(new Date(booking.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push(`/user/dashboard/bookings/${booking._id}`)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={isCancelling}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancel request"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
