"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Calendar, DollarSign, Users, MapPin, ArrowRight, Loader2, CheckCircle2,
} from "lucide-react";
import { aiPlannerService } from "@/services/ai-planner.service";
import type { EventPlanningRequest } from "@/services/ai-planner.service";
import { toast } from "react-toastify";

const EVENT_TYPES = [
  "Wedding", "Birthday Party", "Corporate Event", "Graduation",
  "Anniversary", "Conference", "Naming Ceremony", "Engagement Party", "Other",
];

const NIGERIAN_STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Ogun", "Oyo", "Kano", "Kaduna",
  "Anambra", "Enugu", "Delta", "Imo", "Edo", "Cross River", "Kwara",
  "Osun", "Ekiti", "Ondo", "Akwa Ibom", "Bayelsa", "Other",
];

type Step = "form" | "loading" | "done";

const PROGRESS_STEPS = [
  "Analyzing your event requirements...",
  "Searching vendor database in your area...",
  "Calculating optimal budget allocation...",
  "Matching vendors to your preferences...",
  "Generating your personalized event plan...",
  "Your event plan is ready!",
];

export default function UserAIPlannerPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState(PROGRESS_STEPS[0]);
  const [resultToken, setResultToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    eventType: "", budget: "", guestCount: "", date: "",
    location: "Lagos", theme: "", name: "", email: "", phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined as any }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.eventType) errs.eventType = "Select an event type";
    if (!form.budget || Number(form.budget) < 1) errs.budget = "Enter your budget";
    if (!form.guestCount || Number(form.guestCount) < 1) errs.guestCount = "Enter guest count";
    if (!form.date) errs.date = "Select event date";
    if (!form.name.trim()) errs.name = "Your name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function simulateProgress() {
    PROGRESS_STEPS.forEach((msg, i) => {
      setTimeout(() => {
        setProgress(Math.round(((i + 1) / PROGRESS_STEPS.length) * 100));
        setProgressMsg(msg);
      }, i * 1500);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStep("loading");
    simulateProgress();

    const payload: EventPlanningRequest = {
      eventType: form.eventType,
      budget: Number(form.budget),
      guestCount: Number(form.guestCount),
      date: form.date,
      location: form.location,
      duration: 8,
      preferences: { theme: form.theme || undefined },
      clientInfo: { name: form.name, email: form.email, phone: form.phone || undefined },
    };

    try {
      const result = await aiPlannerService.createEventPlan(payload);
      const token = result.planId || result.id;
      setResultToken(token);
      setTimeout(() => setStep("done"), PROGRESS_STEPS.length * 1500 + 500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate plan. Please try again.");
      setStep("form");
    }
  }

  const inputCls = (field: string) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
      errors[field]
        ? "border-red-400 bg-red-50 dark:bg-red-900/20"
        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
    }`;

  const sectionClass = "bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-4";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const headingClass = "font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2";

  // Loading screen
  if (step === "loading") {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Generating Your Plan</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{progressMsg}</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 bg-purple-600 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">{progress}%</p>
      </div>
    );
  }

  // Done screen
  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Plan is Ready!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Your personalized event plan has been generated with budget breakdown,
            timeline, and vendor recommendations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {resultToken && (
            <button
              onClick={() => router.push(`/ai-event-planner/result/${resultToken}`)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              View Plan <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setStep("form");
              setForm({ eventType: "", budget: "", guestCount: "", date: "", location: "Lagos", theme: "", name: "", email: "", phone: "" });
              setProgress(0);
            }}
            className="flex-1 px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Plan Another Event
          </button>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Event Planner</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md mx-auto">
          Describe your event and our AI will generate a complete plan with
          budget breakdown, timeline, and vendor suggestions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Event basics */}
        <div className={sectionClass}>
          <h2 className={headingClass}>
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Event Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Event Type <span className="text-red-500">*</span></label>
              <select value={form.eventType} onChange={(e) => set("eventType", e.target.value)} className={inputCls("eventType")}>
                <option value="">Select type...</option>
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {errors.eventType && <p className="mt-1 text-xs text-red-500">{errors.eventType}</p>}
            </div>
            <div>
              <label className={labelClass}>Event Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className={inputCls("date")}
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>
            <div>
              <label className={labelClass}>Location / State</label>
              <select value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls("location")}>
                {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Theme / Style</label>
              <input
                type="text"
                placeholder="e.g. Black & Gold, Garden Party..."
                value={form.theme}
                onChange={(e) => set("theme", e.target.value)}
                className={inputCls("theme")}
              />
            </div>
          </div>
        </div>

        {/* Budget & Guests */}
        <div className={sectionClass}>
          <h2 className={headingClass}>
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Budget & Guests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Total Budget (NGN) <span className="text-red-500">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number" min={1} placeholder="e.g. 5000000"
                  value={form.budget} onChange={(e) => set("budget", e.target.value)}
                  className={`${inputCls("budget")} pl-9`}
                />
              </div>
              {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget}</p>}
            </div>
            <div>
              <label className={labelClass}>Expected Guests <span className="text-red-500">*</span></label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number" min={1} placeholder="e.g. 150"
                  value={form.guestCount} onChange={(e) => set("guestCount", e.target.value)}
                  className={`${inputCls("guestCount")} pl-9`}
                />
              </div>
              {errors.guestCount && <p className="mt-1 text-xs text-red-500">{errors.guestCount}</p>}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className={sectionClass}>
          <h2 className={headingClass}>
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Your Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Email <span className="text-red-500">*</span></label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls("email")} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Phone (optional)</label>
              <input type="tel" placeholder="+234..." value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls("phone")} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
        >
          <Sparkles className="w-5 h-5" />
          Generate My Event Plan
        </button>
      </form>
    </div>
  );
}
