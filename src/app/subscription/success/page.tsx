"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { SparklesIcon } from "@heroicons/react/24/outline";

const SubscriptionSuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plan, setPlan] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const planName = searchParams.get("plan");
    setPlan(planName || "Premium");

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-14 w-14 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2">
              <SparklesIcon className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Success Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Welcome to {plan}!
        </h1>

        <p className="text-lg text-gray-600 text-center mb-6">
          Your subscription is now active
        </p>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800 text-center">
            🎉 Payment verified successfully! You now have access to all {plan}{" "}
            features.
          </p>
        </div>

        {/* Features List */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            What's included:
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>Unlimited events and clients</span>
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>Advanced analytics and reports</span>
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>Team collaboration tools</span>
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>Priority support</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          Go to Dashboard
        </button>

        {/* Auto-redirect message */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Redirecting in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
