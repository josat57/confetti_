"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Briefcase, Calendar, DollarSign, Clock,
  CheckCircle2, XCircle, AlertCircle, FileText, Loader2, MessageSquare,
} from "lucide-react";
import { userBookingService, UserBooking, UserBookingStatus } from "@/services/user-booking.service";
import { format } from "date-fns";
import { toast } from "react-toastify";
import MessageButton from "@/components/messages/MessageButton";
import BookingPaymentPanel from "@/components/escrow/BookingPaymentPanel";

const statusConfig: Record<
  UserBookingStatus,
  { label: string; icon: any; className: string; description: string }
> = {
  Pending:   { label: "Pending",   icon: Clock,        className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700",   description: "Your request has been sent and is awaiting a response." },
  Contacted: { label: "Contacted", icon: Clock,        className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700",         description: "The vendor has seen your request and will respond soon." },
  Quoted:    { label: "Quoted",    icon: AlertCircle,  className: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700", description: "The vendor has sent you a quote. Review and respond." },
  Booked:    { label: "Booked",    icon: CheckCircle2, className: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700",          description: "Your booking has been made with this vendor." },
  Confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700",    description: "This booking is confirmed. You're all set!" },
  Declined:  { label: "Declined",  icon: XCircle,      className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700",               description: "The vendor is unavailable for your request." },
  Cancelled: { label: "Cancelled", icon: XCircle,      className: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600",            description: "This request has been cancelled." },
};

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | number | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function getVendorName(booking: UserBooking): string {
  return typeof booking.vendor === "object" ? booking.vendor?.businessName || "Vendor" : "Vendor";
}

function getVendorCategory(booking: UserBooking): string {
  return typeof booking.vendor === "object" ? booking.vendor?.category || "" : "";
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [booking, setBooking] = useState<UserBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  // Back from the payment page
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const outcome = query.get("payment");
    if (!outcome) return;
    if (outcome === "success") toast.success("Payment received. Confetti holds it until after your event.");
    else if (outcome === "cancelled") toast.info("Payment cancelled");
    else toast.error(query.get("message") || "The payment didn't go through");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await userBookingService.getBookingById(id);
      setBooking(data);
    } catch {
      toast.error("Could not load booking details");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this booking request? This cannot be undone.")) return;
    setCancelling(true);
    try {
      await userBookingService.cancelBooking(id);
      toast.success("Request cancelled");
      setBooking((prev) => prev ? { ...prev, status: "Cancelled" } : prev);
    } catch {
      toast.error("Failed to cancel request");
    } finally {
      setCancelling(false);
    }
  }

  const formatCurrency = (amount: number, currency = "NGN") =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);

  const cardClass = "bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5";
  const sectionHeadingClass = "text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
              <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Booking not found.</p>
        <button
          onClick={() => router.push("/user/dashboard/bookings")}
          className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const cfg = statusConfig[booking.status] || statusConfig.Pending;
  const StatusIcon = cfg.icon;
  const canCancel = booking.status === "Pending" || booking.status === "Contacted";

  const eventDate =
    typeof booking.event === "object" && booking.event?.date
      ? format(new Date(booking.event.date), "EEEE, MMMM d, yyyy")
      : undefined;
  const eventType = typeof booking.event === "object" ? booking.event?.type : undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button
        onClick={() => router.push("/user/dashboard/bookings")}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to bookings
      </button>

      {/* Status banner */}
      <div className={`flex items-start gap-4 p-4 rounded-2xl border ${cfg.className}`}>
        <div className="w-10 h-10 rounded-xl bg-white bg-opacity-60 flex items-center justify-center flex-shrink-0">
          <StatusIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-sm">{cfg.label}</p>
          <p className="text-xs mt-0.5 opacity-80">{cfg.description}</p>
        </div>
      </div>

      {/* Vendor card */}
      <div className={cardClass}>
        <h2 className={sectionHeadingClass}>Payment</h2>
        <BookingPaymentPanel bookingId={id} />
      </div>

      <div className={cardClass}>
        <h2 className={sectionHeadingClass}>Vendor</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-gray-100">{getVendorName(booking)}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">{getVendorCategory(booking)}</p>
          </div>
        </div>
      </div>

      {/* Event & booking details */}
      <div className={cardClass}>
        <h2 className={`${sectionHeadingClass} mb-2`}>Event & Request Details</h2>
        <DetailRow icon={Calendar}    label="Event Type"           value={eventType} />
        <DetailRow icon={Calendar}    label="Event Date"           value={eventDate} />
        <DetailRow icon={DollarSign}  label="Your Budget"          value={booking.budget > 0 ? formatCurrency(booking.budget, booking.currency) : undefined} />
        {booking.quotedPrice && (
          <DetailRow icon={DollarSign} label="Vendor's Quoted Price" value={formatCurrency(booking.quotedPrice, booking.currency)} />
        )}
        <DetailRow icon={Calendar} label="Request Submitted" value={format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")} />
        <DetailRow icon={Calendar} label="Last Updated"      value={format(new Date(booking.updatedAt), "MMM d, yyyy 'at' h:mm a")} />
      </div>

      {/* Service requirements */}
      <div className={cardClass}>
        <h2 className={sectionHeadingClass}>Your Requirements</h2>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {booking.serviceRequirements}
          </p>
        </div>
        {booking.specialRequirements && (
          <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">Special Requests</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {booking.specialRequirements}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Vendor notes */}
      {booking.notes && booking.notes.length > 0 && (
        <div className={cardClass}>
          <h2 className={sectionHeadingClass}>Messages from Vendor</h2>
          <ul className="space-y-3">
            {booking.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  V
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {format(new Date(note.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {typeof booking.vendor === "object" && booking.vendor?._id && (
          <MessageButton
            participantId={booking.vendor._id}
            relatedBooking={booking._id}
            subject={`Booking with ${getVendorName(booking)}`}
            label="Message Vendor"
            className="flex items-center gap-2 px-4 py-2.5 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
          />
        )}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Cancel Request
          </button>
        )}
        <button
          onClick={() => router.push("/user/dashboard/vendors")}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors ml-auto"
        >
          <Briefcase className="w-4 h-4" />
          Find More Vendors
        </button>
      </div>
    </div>
  );
}
