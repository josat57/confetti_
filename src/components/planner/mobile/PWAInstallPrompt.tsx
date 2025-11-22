"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  initPWAInstallPrompt,
  showPWAInstallPrompt,
  canShowPWAPrompt,
  isInstalledPWA,
  isMobile,
} from "@/utils/mobile";

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isInstalledPWA() || dismissed) return;

    // Initialize PWA install prompt
    initPWAInstallPrompt();

    // Check if we can show the prompt after a delay
    const timer = setTimeout(() => {
      if (canShowPWAPrompt() && isMobile()) {
        // Check if user has dismissed before
        const dismissedBefore = localStorage.getItem("pwa-prompt-dismissed");
        if (!dismissedBefore) {
          setShowPrompt(true);
        }
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleInstall = async () => {
    const accepted = await showPWAInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
            <ArrowDownTrayIcon className="h-6 w-6 text-teal-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            Install Confetti App
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Add to your home screen for quick access and offline support
          </p>
          <div className="flex space-x-3 mt-3">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
