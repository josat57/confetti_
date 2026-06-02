"use client";

import { useState } from "react";
import { X, Sparkles, DollarSign, Users, MapPin, Calendar, Loader2 } from "lucide-react";
import type { MatchCriteria } from "@/services/smart-match.service";

const EVENT_TYPES = [
  "Wedding", "Birthday Party", "Corporate Event", "Graduation",
  "Anniversary", "Conference", "Naming Ceremony", "Engagement Party", "Other",
];

const NIGERIAN_STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Ogun", "Oyo", "Kano", "Kaduna",
  "Anambra", "Enugu", "Delta", "Imo", "Edo", "Cross River", "Kwara",
  "Osun", "Ekiti", "Ondo", "Akwa Ibom", "Bayelsa", "Other",
];

interface Props {
  onMatch: (criteria: MatchCriteria) => void;
  onClose: () => void;
  isMatching: boolean;
}

export default function SmartMatchPanel({ onMatch, onClose, isMatching }: Props) {
  const [form, setForm] = useState({
    eventType: "",
    budget: "",
    guestCount: "",
    location: "Lagos",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.eventType) errs.eventType = "Required";
    if (!form.budget || Number(form.budget) < 1000) errs.budget = "Enter a valid budget";
    if (!form.guestCount || Number(form.guestCount) < 1) errs.guestCount = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onMatch({
      eventType: form.eventType,
      budget: Number(form.budget),
      guestCount: Number(form.guestCount),
      location: form.location,
    });
  }

  const inputCls = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-purple-100 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Smart Vendor Match</h3>
          <p className="text-xs text-gray-500">Tell us about your event — we'll rank the best vendors for you</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Event type */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Event Type
          </label>
          <select
            value={form.eventType}
            onChange={(e) => set("eventType", e.target.value)}
            className={inputCls("eventType")}
          >
            <option value="">Select…</option>
            {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          {errors.eventType && <p className="text-xs text-red-500 mt-0.5">{errors.eventType}</p>}
        </div>

        {/* Budget */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Total Budget (₦)
          </label>
          <input
            type="number"
            min={1000}
            placeholder="e.g. 5000000"
            value={form.budget}
            onChange={(e) => set("budget", e.target.value)}
            className={inputCls("budget")}
          />
          {errors.budget && <p className="text-xs text-red-500 mt-0.5">{errors.budget}</p>}
        </div>

        {/* Guest count */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> Guests
          </label>
          <input
            type="number"
            min={1}
            placeholder="150"
            value={form.guestCount}
            onChange={(e) => set("guestCount", e.target.value)}
            className={inputCls("guestCount")}
          />
          {errors.guestCount && <p className="text-xs text-red-500 mt-0.5">{errors.guestCount}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Location
          </label>
          <select
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputCls("location")}
          >
            {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-4 flex justify-end">
          <button
            type="submit"
            disabled={isMatching}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isMatching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isMatching ? "Matching…" : "Find Best Vendors"}
          </button>
        </div>
      </form>
    </div>
  );
}
