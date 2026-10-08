"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { subscriptionService, Subscription, UsageSummary } from "@/services/subscription.service";

const BAR = {
  purple: "bg-purple-600",
  teal: "bg-teal-600",
};

interface PlanUsageProps {
  accent?: keyof typeof BAR;
  /** Opens the plan picker */
  onChangePlan: () => void;
  /** Bump to reload (e.g. after a plan change) */
  refreshKey?: number;
}

/**
 * Current plan, what happens at the end of the period, and usage against the plan's limits.
 */
export default function PlanUsage({ accent = "purple", onChangePlan, refreshKey = 0 }: PlanUsageProps) {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usage, current] = await Promise.all([
        subscriptionService.getUsage(),
        subscriptionService.getMySubscription().catch(() => null),
      ]);
      setSummary(usage);
      setSubscription(current);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function cancel() {
    if (!confirm("Cancel your plan? You keep it until the end of the period you've paid for.")) return;
    setBusy(true);
    try {
      await subscriptionService.cancel({ reason: "Cancelled from settings" });
      toast.success("Your plan will end at the end of this period");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't cancel your plan");
    } finally {
      setBusy(false);
    }
  }

  async function reactivate() {
    setBusy(true);
    try {
      await subscriptionService.reactivate();
      toast.success("Your plan will continue");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't reactivate your plan");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-4 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }
  if (!summary) {
    return <div className="border rounded-lg p-4 text-sm text-red-600">Couldn't load your plan.</div>;
  }

  const sub = summary.subscription;
  const isPaid = !!subscription && subscription.amount > 0;
  const endDate = sub?.endDate ? new Date(sub.endDate) : null;
  const showEnd = endDate && endDate.getFullYear() < new Date().getFullYear() + 50; // free plans don't end
  const pending = subscription?.pendingChange?.planName;
  const cancelled = sub?.status === "cancelled";

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {summary.plan?.displayName || "Free"} plan
          </p>
          {isPaid && subscription && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subscription.currency === "NGN" ? "₦" : `${subscription.currency} `}
              {(subscription.amount / 100).toLocaleString()} / {subscription.billingCycle === "yearly" ? "year" : "month"}
            </p>
          )}
          {showEnd && (
            <p className="text-xs text-gray-500 mt-1">
              {cancelled
                ? `Ends on ${endDate!.toLocaleDateString()}`
                : sub?.status === "trial"
                ? `Trial ends on ${endDate!.toLocaleDateString()}`
                : `Current period ends on ${endDate!.toLocaleDateString()}`}
            </p>
          )}
          {pending && (
            <p className="text-xs text-amber-700 mt-1">
              Changes to {pending} on{" "}
              {subscription?.pendingChange?.effectiveAt
                ? new Date(subscription.pendingChange.effectiveAt).toLocaleDateString()
                : "the end of this period"}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button
            type="button"
            onClick={onChangePlan}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            Change plan
          </button>
          {(cancelled || pending) && (
            <button type="button" onClick={reactivate} disabled={busy} className="text-xs text-blue-600 hover:underline">
              {cancelled ? "Keep my plan" : "Cancel the scheduled change"}
            </button>
          )}
          {isPaid && !cancelled && !pending && (
            <button type="button" onClick={cancel} disabled={busy} className="text-xs text-red-600 hover:underline">
              Cancel plan
            </button>
          )}
        </div>
      </div>

      {Object.keys(summary.usage).length > 0 && (
        <div className="space-y-3">
          {Object.entries(summary.usage).map(([key, meter]) => {
            const unlimited = meter.limit === null;
            const notIncluded = meter.limit === 0;
            const pct = unlimited || notIncluded ? 0 : Math.min(100, Math.round((meter.used / (meter.limit as number)) * 100));
            return (
              <div key={key}>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span className="capitalize">{meter.label}</span>
                  <span>
                    {notIncluded ? "Not included" : unlimited ? `${meter.used} · unlimited` : `${meter.used} of ${meter.limit}`}
                  </span>
                </div>
                {!unlimited && !notIncluded && (
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : BAR[accent]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
