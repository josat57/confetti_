"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Send,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";
import PaymentSchedule from "@/components/bookings/PaymentSchedule";
import VideoCallButton from "@/components/meetings/VideoCallButton";
import { bookingsService } from "@/services/bookings.service";
import type { Booking, BookingNote } from "@/types/booking.types";
import Link from "next/link";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getById(bookingId);
      setBooking(data);
    } catch (error: any) {
      console.error("Error loading booking:", error);
      toast.error(
        error.response?.data?.message || "Failed to load booking details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setAddingNote(true);
    try {
      await bookingsService.addNote(bookingId, noteText);
      toast.success("Note added successfully");
      setNoteText("");
      loadBooking();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await bookingsService.recordPayment(bookingId, {
        amount,
        paymentMethod,
      });
      toast.success("Payment recorded successfully");
      setShowPaymentModal(false);
      setPaymentAmount("");
      loadBooking();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    }
  };

  const handleMarkDepositPaid = async () => {
    try {
      await bookingsService.markDepositPaid(bookingId, "manual");
      toast.success("Deposit marked as paid");
      loadBooking();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to mark deposit as paid"
      );
    }
  };

  const handleConfirm = async () => {
    try {
      await bookingsService.confirm(bookingId);
      toast.success("Booking confirmed successfully");
      loadBooking();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm booking");
    }
  };

  const handleComplete = async () => {
    if (!confirm("Mark this booking as completed?")) return;
    try {
      await bookingsService.complete(bookingId);
      toast.success("Booking marked as completed");
      loadBooking();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to complete booking"
      );
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Please provide a cancellation reason:");
    if (!reason) return;

    try {
      await bookingsService.cancel(bookingId, reason);
      toast.success("Booking cancelled");
      loadBooking();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleSendConfirmation = async () => {
    try {
      await bookingsService.sendConfirmation(bookingId);
      toast.success("Confirmation email sent");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send confirmation"
      );
    }
  };

  const handleGenerateContract = async () => {
    try {
      const { contractUrl } = await bookingsService.generateContract(bookingId);
      window.open(contractUrl, "_blank");
      toast.success("Contract generated");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate contract"
      );
    }
  };

  const getStatusColor = (status: string) => {
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Booking not found
          </h2>
          <Link
            href="/vendor/dashboard/bookings"
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/vendor/dashboard/bookings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Booking Details</h1>
            <p className="text-gray-600 mt-1">
              Booking ID: {booking._id.slice(-8)}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{booking.client.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{booking.client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{booking.client.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Event Type</p>
                  <p className="font-medium">{booking.event.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Event Date</p>
                  <p className="font-medium">
                    {new Date(booking.event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{booking.event.location}</p>
                  {booking.event.address && (
                    <p className="text-sm text-gray-500">
                      {booking.event.address.street},{" "}
                      {booking.event.address.city},{" "}
                      {booking.event.address.state}
                    </p>
                  )}
                </div>
              </div>
              {booking.event.guestCount && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Guest Count</p>
                    <p className="font-medium">{booking.event.guestCount}</p>
                  </div>
                </div>
              )}
              {booking.event.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-700">{booking.event.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Payment Information</h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Record Payment
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    booking.payment.total,
                    booking.payment.currency
                  )}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Deposit</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    booking.payment.deposit,
                    booking.payment.currency
                  )}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Balance</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(
                    booking.payment.balance,
                    booking.payment.currency
                  )}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <p className="text-lg font-bold capitalize">
                  {booking.payment.status.replace("_", " ")}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Deposit Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.payment.depositPaid
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {booking.payment.depositPaid ? "Paid" : "Pending"}
                </span>
              </div>
              {!booking.payment.depositPaid && (
                <button
                  onClick={handleMarkDepositPaid}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Mark Deposit as Paid
                </button>
              )}
            </div>
          </div>

          {/* Deposit and balance schedule (Venue plan) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold">Payment schedule</h2>
              <div className="flex items-center gap-2">
                <VideoCallButton bookingId={bookingId} defaultTitle={`Call with ${booking.client.name}`} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Deposit and instalments. The client is reminded before each is due.</p>
            <PaymentSchedule
              schedule={booking.schedule}
              currency={booking.payment.currency}
              onSave={async (items, totalAmount) => {
                try {
                  setBooking(await bookingsService.setSchedule(bookingId, items, totalAmount));
                  toast.success("Schedule saved");
                } catch (error: any) {
                  toast.error(error.response?.data?.message || "Couldn't save the schedule");
                  throw error;
                }
              }}
            />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <div className="space-y-4 mb-4">
              {booking.notes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notes yet</p>
              ) : (
                booking.notes.map((note) => (
                  <div
                    key={note._id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="text-gray-700 mb-2">{note.text}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{note.createdByName}</span>
                      <span>•</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !noteText.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingNote ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              {booking.status === "pending" && (
                <button
                  onClick={handleConfirm}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm Booking
                </button>
              )}

              {(booking.status === "confirmed" ||
                booking.status === "in_progress") && (
                <button
                  onClick={handleComplete}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
              )}

              <button
                onClick={handleSendConfirmation}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Confirmation
              </button>

              <button
                onClick={handleGenerateContract}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Generate Contract
              </button>

              <Link
                href={`/vendor/dashboard/bookings/${booking._id}/edit`}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </Link>

              {booking.status !== "completed" &&
                booking.status !== "cancelled" && (
                  <button
                    onClick={handleCancel}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Booking
                  </button>
                )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {booking.confirmedAt && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Confirmed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.confirmedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {booking.completedAt && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Completed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.completedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {booking.cancelledAt && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cancelled</p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.cancelledAt).toLocaleString()}
                    </p>
                    {booking.cancellationReason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contract Status */}
          {booking.contractSigned && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Contract Signed</span>
              </div>
              {booking.contractSignedAt && (
                <p className="text-sm text-green-700 mt-1">
                  {new Date(booking.contractSignedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRecordPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Record Payment
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
