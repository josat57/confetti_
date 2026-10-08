"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  subscriptionService,
  BillingCycle,
  ChangePlanResult,
  PlanPrice,
} from "@/services/subscription.service";

// Full class names so Tailwind keeps them
const ACCENTS = {
  purple: {
    selected: "border-purple-600 bg-purple-50 dark:bg-purple-900/20",
    badge: "bg-purple-600",
    button: "bg-purple-600 hover:bg-purple-700",
    toggle: "bg-purple-600 text-white",
    ring: "focus:ring-purple-500",
  },
  teal: {
    selected: "border-teal-600 bg-teal-50 dark:bg-teal-900/20",
    badge: "bg-teal-600",
    button: "bg-teal-600 hover:bg-teal-700",
    toggle: "bg-teal-600 text-white",
    ring: "focus:ring-teal-500",
  },
};

interface PlanPickerProps {
  planType: "vendor" | "planner";
  /** planName of the current subscription (old names are matched by displayName too) */
  currentPlanName?: string;
  currentBillingCycle?: BillingCycle;
  accent?: keyof typeof ACCENTS;
  onClose: () => void;
  /** Called after a change that didn't need a payment redirect */
  onChanged?: (result: ChangePlanResult) => void;
}

const money = (price: PlanPrice | null | undefined) => {
  if (!price) return "—";
  if (price.amount === 0) return "Free";
  const symbol = price.currency === "NGN" ? "₦" : price.currency === "USD" ? "$" : price.currency === "GBP" ? "£" : `${price.currency} `;
  return `${symbol}${price.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

/**
 * Choose a plan: upgrades go to the payment page and apply once paid; cheaper plans
 * take effect when the current period ends (the API decides and says which).
 */
export default function PlanPicker({
  planType,
  currentPlanName,
  currentBillingCycle = "monthly",
  accent = "purple",
  onClose,
  onChanged,
}: PlanPickerProps) {
  const theme = ACCENTS[accent];
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cycle, setCycle] = useState<BillingCycle>(currentBillingCycle);
  const [provider, setProvider] = useState<"flutterwave" | "paystack">("flutterwave");
  const [coupon, setCoupon] = useState("");
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    subscriptionService
      .getPlans({ planType })
      .then((data) => !cancelled && setPlans(data || []))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [planType]);

  const priceOf = (plan: any): PlanPrice | null => {
    const monthly = plan.pricing?.find((p: PlanPrice) => p.currency === "NGN") || plan.pricing?.[0] || null;
    if (!monthly || cycle === "monthly" || monthly.amount === 0) return monthly;
    return plan.yearlyPricing?.find((p: PlanPrice | null) => p?.currency === monthly.currency) || null;
  };

  const isCurrent = (plan: any) => {
    const current = (currentPlanName || "").toLowerCase();
    return current === String(plan.planName).toLowerCase() || current === String(plan.displayName).toLowerCase();
  };

  async function choose(plan: any) {
    setBusyPlan(plan._id);
    try {
      const result = await subscriptionService.changePlan({
        planId: plan._id,
        billingCycle: cycle,
        paymentProvider: provider,
        couponCode: coupon.trim() || undefined,
      });

      if (result.action === "payment_required" && result.paymentUrl) {
        toast.info("Taking you to the payment page…");
        window.location.href = result.paymentUrl;
        return;
      }
      if (result.action === "scheduled") {
        const when = result.effectiveAt ? new Date(result.effectiveAt).toLocaleDateString() : "the end of this period";
        toast.success(`You'll move to ${plan.displayName} on ${when}. You keep your current plan until then.`);
      } else if (result.freeUntil) {
        toast.success(`${plan.displayName} is active, free until ${new Date(result.freeUntil).toLocaleDateString()}`);
      } else {
        toast.success(`You're now on the ${plan.displayName} plan`);
      }
      onChanged?.(result);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't change your plan");
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Change plan</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Upgrades start as soon as payment goes through, charged only for the days left. A cheaper plan starts
          when your current period ends.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="inline-flex rounded-full border border-gray-200 dark:border-gray-600 p-0.5 text-sm">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={`px-3 py-1.5 rounded-full font-medium ${cycle === c ? theme.toggle : "text-gray-600 dark:text-gray-300"}`}
              >
                {c === "monthly" ? "Monthly" : "Yearly · 2 months free"}
              </button>
            ))}
          </div>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as "flutterwave" | "paystack")}
            className={`text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 ${theme.ring}`}
            aria-label="Payment provider"
          >
            <option value="flutterwave">Pay with Flutterwave</option>
            <option value="paystack">Pay with Paystack</option>
          </select>
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Coupon code"
            className={`text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-1.5 w-36 uppercase focus:outline-none focus:ring-2 ${theme.ring}`}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : error ? (
          <p className="text-center py-8 text-sm text-red-600">Couldn't load plans. Please try again.</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const current = isCurrent(plan) && cycle === currentBillingCycle;
              const price = priceOf(plan);
              return (
                <div
                  key={plan._id}
                  className={`border-2 rounded-lg p-4 ${current ? theme.selected : "border-gray-200 dark:border-gray-700"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{plan.displayName}</p>
                        {current && <span className={`px-2 py-0.5 text-white text-xs rounded ${theme.badge}`}>Current</span>}
                        {plan.isPopular && !current && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Popular</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {money(price)}
                        {price && price.amount > 0 && <span className="text-gray-500"> / {cycle === "yearly" ? "year" : "month"}</span>}
                      </p>
                      {plan.description && <p className="text-xs text-gray-500 mt-1">{plan.description}</p>}
                      <ul className="mt-2 space-y-1">
                        {(plan.features || []).map((feature: string) => (
                          <li key={feature} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                            <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => choose(plan)}
                      disabled={!!busyPlan || current || !price}
                      className={`px-4 py-2 rounded-lg text-white text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                        current ? "bg-gray-400" : theme.button
                      }`}
                    >
                      {busyPlan === plan._id ? <Loader2 className="w-4 h-4 animate-spin" /> : current ? "Current" : "Choose"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
