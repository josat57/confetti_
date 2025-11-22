"use client";

import React, { useEffect, useState } from "react";
import { WifiIcon, SignalSlashIcon } from "@heroicons/react/24/outline";

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all ${
        isOnline ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
      role="alert"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <WifiIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Back online</span>
        </>
      ) : (
        <>
          <SignalSlashIcon className="h-5 w-5" />
          <span className="text-sm font-medium">You're offline</span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
