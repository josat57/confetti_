"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SubscriptionSuccessContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [plan, setPlan] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [redirectCancelled, setRedirectCancelled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDashboardRoute = () => {
    const roleMap: Record<string, string> = {
      event_planner: "/planner/dashboard",
      "event-planner": "/planner/dashboard",
      vendor: "/vendor/dashboard",
      admin: "/admin",
      user: "/user/dashboard",
    };
    return user?.role ? (roleMap[user.role] ?? "/dashboard") : "/dashboard";
  };

  useEffect(() => {
    const planName = searchParams.get("plan");
    setPlan(planName || "Premium");

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          router.push(getDashboardRoute());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const cancelRedirect = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRedirectCancelled(true);
  };

  const handleContinue = () => {
    router.push(getDashboardRoute());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <SparklesIcon className="h-7 w-7 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome to {plan}!
          </h1>
          <p className="text-purple-100 text-sm">
            Your subscription is now active
          </p>
        </div>

        <div className="p-7">
          {/* Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-green-800 text-center">
              Payment verified successfully! You now have access to all {plan} features.
            </p>
          </div>

          {/* What&apos;s included */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What&apos;s included:</h3>
            <ul className="space-y-2">
              {[
                "Unlimited events and clients",
                "Advanced analytics and reports",
                "Team collaboration tools",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={handleContinue}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-semibold transition-colors shadow-sm shadow-purple-200"
          >
            Go to Dashboard
          </button>

          {/* Countdown */}
          <div className="mt-4 text-center">
            {!redirectCancelled ? (
              <>
                <p className="text-xs text-gray-400">
                  Auto-redirecting in <span className="font-semibold text-gray-600">{countdown}s</span>
                </p>
                <button
                  onClick={cancelRedirect}
                  className="text-xs text-purple-500 hover:text-purple-700 underline mt-1"
                >
                  Cancel
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-400">Auto-redirect cancelled</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionSuccessPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
};

export default SubscriptionSuccessPage;
