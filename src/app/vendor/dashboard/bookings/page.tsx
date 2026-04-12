"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  User,
  MapPin,
  Clock,
  Plus,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { bookingsService } from "@/services/bookings.service";
import type { Booking, BookingStats } from "@/types/booking.types";
import Link from "next/link";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [filter, setFilter] = useState<"all" | Booking["status"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [filter, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        bookingsService.getAll({
          status: filter !== "all" ? filter : undefined,
          search: searchQuery || undefined,
          page,
          limit: 10,
        }),
        bookingsService.getStats(),
      ]);

      setBookings(bookingsData.bookings || []);
      setTotalPages(bookingsData.totalPages || 1);

      // Handle stats structure from backend
      const statsFromBackend = statsData;
      setStats(statsFromBackend);
    } catch (error: any) {
      console.error("Error loading bookings:", error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
      // Ensure bookings is always an array even on error
      setBookings([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleConfirm = async (id: string) => {
    try {
      await bookingsService.confirm(id);
      toast.success("Booking confirmed successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm booking");
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm("Mark this booking as completed?")) return;
    try {
      await bookingsService.complete(id);
      toast.success("Booking marked as completed");
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to complete booking"
      );
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt("Please provide a cancellation reason:");
    if (!reason) return;

    try {
      await bookingsService.cancel(id, reason);
      toast.success("Booking cancelled");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "deposit_paid":
        return "bg-blue-100 text-blue-800";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    // Handle undefined, null, or NaN values
    const validAmount = amount && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(validAmount);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage your event bookings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/vendor/dashboard/bookings/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.confirmed || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalRevenue || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by client name, email, or event type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Search
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === "all"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({stats?.total || 0})
        </button>
        {[
          { key: "pending", label: "Pending", count: stats?.pending },
          { key: "confirmed", label: "Confirmed", count: stats?.confirmed },
          {
            key: "in_progress",
            label: "In Progress",
            count: stats?.inProgress,
          },
          { key: "completed", label: "Completed", count: stats?.completed },
          { key: "cancelled", label: "Cancelled", count: stats?.cancelled },
        ].map((status) => (
          <button
            key={status.key}
            onClick={() => {
              setFilter(status.key as any);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === status.key
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.label} ({status.count || 0})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {!bookings || bookings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter !== "all"
                ? "Try adjusting your filters"
                : "Your bookings will appear here"}
            </p>
            <Link
              href="/vendor/dashboard/bookings/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create First Booking
            </Link>
          </div>
        ) : (
          <>
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {booking.client.name}
                    </h3>
                    <p className="text-gray-600">{booking.event.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        booking.payment.status
                      )}`}
                    >
                      {booking.payment.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(booking.event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{booking.event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="truncate">{booking.client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {formatCurrency(
                        booking.payment.total,
                        booking.payment.currency
                      )}
                    </span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-semibold">
                        {formatCurrency(
                          booking.payment.total,
                          booking.payment.currency
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deposit</p>
                      <p className="font-semibold">
                        {formatCurrency(
                          booking.payment.deposit,
                          booking.payment.currency
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Balance</p>
                      <p className="font-semibold">
                        {formatCurrency(
                          booking.payment.balance,
                          booking.payment.currency
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deposit Status</p>
                      <p
                        className={`font-semibold ${
                          booking.payment.depositPaid
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {booking.payment.depositPaid ? "Paid" : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/vendor/dashboard/bookings/${booking._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>

                  {booking.status === "pending" && (
                    <button
                      onClick={() => handleConfirm(booking._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm
                    </button>
                  )}

                  {(booking.status === "confirmed" ||
                    booking.status === "in_progress") && (
                    <button
                      onClick={() => handleComplete(booking._id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                  )}

                  {booking.status !== "completed" &&
                    booking.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
