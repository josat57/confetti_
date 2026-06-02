"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userBookingService, QuoteRequestData } from "@/services/user-booking.service";
import { toast } from "react-toastify";

interface QuoteRequestModalProps {
  vendor: {
    _id: string;
    businessName: string;
    category: string;
    pricing?: { startingPrice?: number; currency?: string };
  };
  onClose: () => void;
  onSuccess?: () => void;
}

const EVENT_TYPES = [
  "Wedding", "Birthday Party", "Corporate Event", "Graduation",
  "Anniversary", "Conference", "Naming Ceremony", "Engagement Party", "Other",
];

const NIGERIAN_STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Ogun", "Oyo", "Kano", "Kaduna",
  "Anambra", "Enugu", "Delta", "Imo", "Edo", "Cross River", "Kwara", "Other",
];

type Step = "form" | "success";

export default function QuoteRequestModal({
  vendor,
  onClose,
  onSuccess,
}: QuoteRequestModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    eventType: "",
    eventDate: "",
    location: "Lagos",
    guestCount: "",
    budget: vendor.pricing?.startingPrice?.toString() || "",
    serviceRequirements: "",
    specialRequirements: "",
    contactName:
      user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : user?.username || "",
    contactEmail: user?.email || "",
    contactPhone: user?.phone || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined as any }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.eventType) errs.eventType = "Select event type";
    if (!form.eventDate) errs.eventDate = "Select event date";
    if (!form.guestCount || Number(form.guestCount) < 1)
      errs.guestCount = "Enter guest count";
    if (!form.budget || Number(form.budget) < 1)
      errs.budget = "Enter your budget";
    if (!form.serviceRequirements.trim())
      errs.serviceRequirements = "Describe what you need";
    if (!form.contactName.trim()) errs.contactName = "Your name is required";
    if (!form.contactEmail.trim()) errs.contactEmail = "Email is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: QuoteRequestData = {
        vendorId: vendor._id,
        vendorName: vendor.businessName,
        eventType: form.eventType,
        eventDate: form.eventDate,
        location: form.location,
        guestCount: Number(form.guestCount),
        budget: Number(form.budget),
        serviceRequirements: form.serviceRequirements,
        specialRequirements: form.specialRequirements || undefined,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone || undefined,
      };
      await userBookingService.requestQuote(payload);
      setStep("success");
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send request. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = (field: string) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-300 bg-white"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">
                Request Quote
              </h2>
              <p className="text-xs text-gray-500">{vendor.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {step === "success" ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Request Sent!</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Your quote request has been sent to{" "}
              <span className="font-medium text-gray-700">
                {vendor.businessName}
              </span>
              . They'll respond within 24–48 hours.
            </p>
            <div className="flex gap-3 mt-2 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/user/dashboard/bookings";
                }}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                View My Requests
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Event info */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Event Details
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.eventType}
                    onChange={(e) => set("eventType", e.target.value)}
                    className={inputCls("eventType")}
                  >
                    <option value="">Select...</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  {errors.eventType && (
                    <p className="mt-0.5 text-xs text-red-500">
                      {errors.eventType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.eventDate}
                    onChange={(e) => set("eventDate", e.target.value)}
                    className={inputCls("eventDate")}
                  />
                  {errors.eventDate && (
                    <p className="mt-0.5 text-xs text-red-500">
                      {errors.eventDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    className={inputCls("location")}
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Guests <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 150"
                      value={form.guestCount}
                      onChange={(e) => set("guestCount", e.target.value)}
                      className={`${inputCls("guestCount")} pl-8`}
                    />
                  </div>
                  {errors.guestCount && (
                    <p className="mt-0.5 text-xs text-red-500">
                      {errors.guestCount}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Your Budget (NGN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 500000"
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    className={`${inputCls("budget")} pl-8`}
                  />
                </div>
                {errors.budget && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.budget}</p>
                )}
              </div>
            </div>

            {/* Service details */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Requirements
              </p>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Describe what you need{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={`e.g. I need ${vendor.category.toLowerCase()} services for my event. Please include...`}
                  value={form.serviceRequirements}
                  onChange={(e) => set("serviceRequirements", e.target.value)}
                  className={`${inputCls("serviceRequirements")} resize-none`}
                />
                {errors.serviceRequirements && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.serviceRequirements}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Special requests (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any dietary needs, accessibility requirements, specific preferences..."
                  value={form.specialRequirements}
                  onChange={(e) => set("specialRequirements", e.target.value)}
                  className={`${inputCls("specialRequirements")} resize-none`}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Your Contact
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                    className={inputCls("contactName")}
                  />
                  {errors.contactName && (
                    <p className="mt-0.5 text-xs text-red-500">
                      {errors.contactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+234..."
                    value={form.contactPhone}
                    onChange={(e) => set("contactPhone", e.target.value)}
                    className={inputCls("contactPhone")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  className={inputCls("contactEmail")}
                />
                {errors.contactEmail && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.contactEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
