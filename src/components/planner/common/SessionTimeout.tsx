"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  initSessionMonitoring,
  cleanupSessionMonitoring,
  extendSession,
  formatRemainingTime,
} from "@/utils/session";

const SessionTimeout: React.FC = () => {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const handleSessionExpire = () => {
      // Clear auth tokens
      localStorage.removeItem("authToken");
      sessionStorage.clear();

      // Redirect to login
      router.push("/login?session=expired");
    };

    const handleSessionWarning = (remaining: number) => {
      setRemainingTime(remaining);
      setShowWarning(true);
    };

    initSessionMonitoring(handleSessionExpire, handleSessionWarning);

    return () => {
      cleanupSessionMonitoring();
    };
  }, [router]);

  const handleExtendSession = () => {
    extendSession();
    setShowWarning(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    router.push("/login");
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">
            Session Expiring Soon
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Your session will expire in{" "}
          <span className="font-semibold text-gray-900">
            {formatRemainingTime(remainingTime)}
          </span>
          . Would you like to continue your session?
        </p>

        <div className="flex space-x-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
          <button
            onClick={handleExtendSession}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;
