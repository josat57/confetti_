"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const SubscriptionErrorPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const message = searchParams.get("message");
    setErrorMessage(message || "An error occurred with your subscription");
  }, [searchParams]);

  const handleGoBack = () => {
    router.push("/dashboard");
  };

  const handleRetry = () => {
    router.push("/subscription");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Subscription Error
        </h1>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-600 text-center mb-6">
          We encountered an issue processing your subscription. This could be
          due to:
        </p>

        <ul className="text-sm text-gray-600 space-y-2 mb-6">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Payment verification issues</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Invalid subscription data</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Server configuration error</span>
          </li>
        </ul>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleGoBack}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go to Dashboard
          </button>
        </div>

        {/* Support Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a
              href="/support"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionErrorPage;
