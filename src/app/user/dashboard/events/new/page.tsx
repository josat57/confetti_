"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { userService } from "@/services/user.service";
import { toast } from "react-toastify";

const EVENT_TYPES = [
  "Wedding", "Birthday Party", "Corporate Event", "Graduation",
  "Anniversary", "Conference", "Naming Ceremony", "Engagement Party",
  "Funeral/Memorial", "Other",
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

interface FormData {
  name: string; type: string; date: string; endDate: string;
  description: string; guestCount: string; budget: string; currency: string;
  venue: string; address: string; city: string; state: string;
}

const initialForm: FormData = {
  name: "", type: "", date: "", endDate: "", description: "",
  guestCount: "", budget: "", currency: "NGN",
  venue: "", address: "", city: "", state: "Lagos",
};

export default function NewUserEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = "Event name is required";
    if (!form.type) errs.type = "Select an event type";
    if (!form.date) errs.date = "Event date is required";
    if (!form.guestCount || Number(form.guestCount) < 1)
      errs.guestCount = "Enter expected guest count";
    if (form.endDate && form.endDate < form.date)
      errs.endDate = "End date must be after start date";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await userService.createEvent({
        name: form.name.trim(),
        type: form.type,
        date: form.date,
        endDate: form.endDate || undefined,
        description: form.description.trim() || undefined,
        guestCount: Number(form.guestCount),
        budget: { total: form.budget ? Number(form.budget) : 0, currency: form.currency },
        location: {
          address: [form.venue, form.address].filter(Boolean).join(", "),
          city: form.city || form.state,
          state: form.state,
          country: "Nigeria",
        },
      });
      toast.success("Event created successfully!");
      router.push("/user/dashboard/events");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
      errors[field]
        ? "border-red-400 bg-red-50 dark:bg-red-900/20"
        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
    }`;

  const sectionClass = "bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-4";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const headingClass = "font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Event</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Fill in the details to create your event
          </p>
        </div>
      </div>

      {/* AI Planner CTA */}
      <div
        onClick={() => router.push("/user/dashboard/ai-planner")}
        className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors group"
      >
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">
            Try the AI Planner instead
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
            Get a full budget breakdown, timeline, and vendor suggestions automatically
          </p>
        </div>
        <ArrowLeft className="w-5 h-5 text-purple-400 dark:text-purple-500 rotate-180 group-hover:translate-x-1 transition-transform" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className={sectionClass}>
          <h2 className={headingClass}>
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Basic Information
          </h2>
          <div>
            <label className={labelClass}>Event Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. John & Jane's Wedding"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Event Type <span className="text-red-500">*</span></label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className={inputClass("type")}
            >
              <option value="">Select type...</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              placeholder="Brief description of the event..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputClass("description")} resize-none`}
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className={sectionClass}>
          <h2 className={headingClass}>
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Date & Time
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className={inputClass("date")}
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                min={form.date || new Date().toISOString().split("T")[0]}
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inputClass("endDate")}
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={sectionClass}>
          <h2 className={headingClass}>
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Location
          </h2>
          <div>
            <label className={labelClass}>Venue Name</label>
            <input
              type="text"
              placeholder="e.g. Eko Hotel & Suites"
              value={form.venue}
              onChange={(e) => set("venue", e.target.value)}
              className={inputClass("venue")}
            />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input
              type="text"
              placeholder="Street address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputClass("address")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                placeholder="e.g. Lagos"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputClass("city")}
              />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <select
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                className={inputClass("state")}
              >
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Guests & Budget */}
        <div className={sectionClass}>
          <h2 className={headingClass}>
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Guests & Budget
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Expected Guests <span className="text-red-500">*</span></label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 200"
                  value={form.guestCount}
                  onChange={(e) => set("guestCount", e.target.value)}
                  className={`${inputClass("guestCount")} pl-9`}
                />
              </div>
              {errors.guestCount && <p className="mt-1 text-xs text-red-500">{errors.guestCount}</p>}
            </div>
            <div>
              <label className={labelClass}>Total Budget</label>
              <div className="flex gap-2">
                <select
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    className={`${inputClass("budget")} pl-9`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
