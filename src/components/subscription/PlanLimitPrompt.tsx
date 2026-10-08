"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

const PLAN_PAGES: Record<string, string> = {
  vendor: "/vendor/dashboard/settings?tab=billing",
  planner: "/planner/dashboard/settings/subscription",
};

interface PlanLimitDetail {
  message?: string;
  code?: string;
  details?: { upgradeTo?: string | null; planType?: string; eventId?: string | null };
}

const PASS_NAMES: Record<string, string> = { celebration: "Celebration Pass", plus: "Celebration Plus" };

/**
 * Shown when an action hits a plan limit or a paid feature (the API returns
 * PLAN_LIMIT_REACHED / PLAN_FEATURE_REQUIRED; api.tsx broadcasts it).
 */
export default function PlanLimitPrompt({ dashboard }: { dashboard: "vendor" | "planner" | "user" }) {
  const [detail, setDetail] = useState<PlanLimitDetail | null>(null);

  useEffect(() => {
    const onLimit = (event: Event) => setDetail((event as CustomEvent<PlanLimitDetail>).detail || {});
    window.addEventListener("confetti:plan-limit", onLimit);
    return () => window.removeEventListener("confetti:plan-limit", onLimit);
  }, []);

  if (!detail) return null;
  // Clients upgrade an event with a pass; others change plan
  const isPass = detail.code === "PASS_REQUIRED";
  const href = isPass
    ? detail.details?.eventId
      ? `/user/dashboard/events/${detail.details.eventId}`
      : "/user/dashboard/events"
    : dashboard === "user"
    ? "/user/dashboard/events"
    : PLAN_PAGES[dashboard];
  const upgradeTo = isPass ? PASS_NAMES[detail.details?.upgradeTo || ""] || detail.details?.upgradeTo : detail.details?.upgradeTo;

  return (
    <div
      role="status"
      className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 rounded-xl border border-amber-200 bg-white dark:bg-gray-800 dark:border-amber-700 shadow-lg p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {upgradeTo ? `Available on ${upgradeTo}` : "Not included in your plan"}
          </p>
          {detail.message && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{detail.message}</p>}
          {href && (
            <Link
              href={href}
              onClick={() => setDetail(null)}
              className="inline-block mt-2 text-sm font-medium text-purple-700 dark:text-purple-300 hover:underline"
            >
              {isPass ? "Upgrade your event" : "See plans"}
            </Link>
          )}
        </div>
        <button type="button" onClick={() => setDetail(null)} aria-label="Dismiss" className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
