"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Calendar, Loader2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { userBookingService, UserBooking, UserBookingStatus } from "@/services/user-booking.service";
import MessageButton from "@/components/messages/MessageButton";

const STATUS_STYLE: Record<UserBookingStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Contacted: "bg-blue-100 text-blue-700",
  Quoted: "bg-indigo-100 text-indigo-700",
  Booked: "bg-teal-100 text-teal-700",
  Confirmed: "bg-green-100 text-green-700",
  Declined: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-500",
};
const CANCELLABLE: UserBookingStatus[] = ["Pending", "Contacted", "Quoted"];
const FILTERS: Array<UserBookingStatus | "All"> = ["All", "Pending", "Quoted", "Confirmed", "Cancelled"];

/** Booking requests the planner has sent to vendors */
export default function PlannerBookingsPage() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<UserBookingStatus | "All">("All");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userBookingService.getMyBookings({
        status: filter === "All" ? undefined : filter,
        limit: 50,
      });
      setBookings(data.bookings);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id: string) {
    if (!confirm("Cancel this booking request?")) return;
    setCancelling(id);
    try {
      await userBookingService.cancelBooking(id);
      toast.success("Request cancelled");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't cancel the request");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 text-sm mt-1">Requests you&apos;ve sent to vendors</p>
        </div>
        <Link href="/planner/dashboard/vendors" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
          Find vendors
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm ${
              filter === f ? "bg-teal-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 text-teal-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-gray-700">Couldn&apos;t load your bookings.</p>
          <button onClick={load} className="mt-2 text-sm text-teal-700 underline">
            Try again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No booking requests yet</p>
          <p className="text-gray-500 text-sm mt-1">Book a vendor from the directory and it will show here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const vendor = typeof b.vendor === "object" ? b.vendor : null;
            const event = typeof b.event === "object" ? b.event : null;
            return (
              <div key={b._id} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{vendor?.businessName || "Vendor"}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[b.status] || STATUS_STYLE.Pending}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {event?.name || event?.type || "Event"}
                    {event?.date ? ` · ${new Date(event.date).toLocaleDateString()}` : ""}
                  </p>
                  {b.quotedPrice ? (
                    <p className="text-sm text-gray-700 mt-1">
                      Quote: {b.currency === "NGN" ? "₦" : `${b.currency} `}
                      {Number(b.quotedPrice).toLocaleString()}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  {vendor?._id && (
                    <MessageButton
                      participantId={vendor._id}
                      relatedBooking={b._id}
                      subject={`Booking with ${vendor.businessName}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-teal-200 text-teal-700 hover:bg-teal-50 disabled:opacity-50"
                    />
                  )}
                  {CANCELLABLE.includes(b.status) && (
                    <button
                      onClick={() => cancel(b._id)}
                      disabled={cancelling === b._id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
