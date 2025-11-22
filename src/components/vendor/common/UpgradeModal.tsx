"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Lock, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTierDisplayName } from "@/utils/subscriptionTier";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredTier: string;
  currentTier: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  featureName,
  requiredTier,
  currentTier,
}: UpgradeModalProps) {
  const tierFeatures: Record<string, string[]> = {
    professional: [
      "Unlimited event listings",
      "Booking calendar",
      "Lead management",
      "Quote builder",
      "Advanced analytics",
    ],
    business: [
      "All Professional features",
      "Team collaboration (5 members)",
      "Payment processing",
      "CRM system",
      "Email marketing",
    ],
    enterprise: [
      "All Business features",
      "Unlimited team members",
      "API access",
      "White-label options",
      "Dedicated account manager",
    ],
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Upgrade Required
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Unlock {featureName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <p className="text-gray-600 mb-4">
                    The <span className="font-semibold">{featureName}</span>{" "}
                    feature requires a{" "}
                    <span className="font-semibold text-purple-600">
                      {getTierDisplayName(requiredTier)}
                    </span>{" "}
                    subscription or higher.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Current Plan:{" "}
                      <span className="text-gray-600">
                        {getTierDisplayName(currentTier)}
                      </span>
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Required Plan:{" "}
                      <span className="text-purple-600">
                        {getTierDisplayName(requiredTier)}
                      </span>
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      What you'll get with {getTierDisplayName(requiredTier)}:
                    </p>
                    <ul className="space-y-2">
                      {tierFeatures[requiredTier]?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Maybe Later
                    </button>
                    <Link
                      href="/#pricing"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Upgrade Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
