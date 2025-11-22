"use client";

import React, { useState, useEffect } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import settingsService, {
  SubscriptionData,
} from "@/services/planner/settings.service";

const SubscriptionPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [showCancelModal, setShowCancelModal] = useState(false);

  const tiers = [
    {
      name: "Starter",
      price: { monthly: 0, annual: 0 },
      features: [
        "5 events per month",
        "50 clients",
        "1 team member",
        "1GB storage",
        "Basic support",
      ],
      limits: {
        events: 5,
        clients: 50,
        teamMembers: 1,
        storage: 1,
      },
    },
    {
      name: "Professional",
      price: { monthly: 49, annual: 470 },
      features: [
        "25 events per month",
        "Unlimited clients",
        "3 team members",
        "10GB storage",
        "Priority support",
        "AI Event Planner",
        "Calendar integration",
        "Analytics & Reports",
      ],
      limits: {
        events: 25,
        clients: -1,
        teamMembers: 3,
        storage: 10,
      },
      popular: true,
    },
    {
      name: "Business",
      price: { monthly: 99, annual: 950 },
      features: [
        "Unlimited events",
        "Unlimited clients",
        "10 team members",
        "50GB storage",
        "Premium support",
        "Custom branding",
        "Advanced analytics",
        "Zapier integration",
      ],
      limits: {
        events: -1,
        clients: -1,
        teamMembers: 10,
        storage: 50,
      },
    },
    {
      name: "Enterprise",
      price: { monthly: 299, annual: 2870 },
      features: [
        "Everything in Business",
        "Unlimited team members",
        "Unlimited storage",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "White-label option",
      ],
      limits: {
        events: -1,
        clients: -1,
        teamMembers: -1,
        storage: -1,
      },
    },
  ];

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error("Failed to load subscription:", error);
      toast.error("Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (
    tier: string,
    billingCycle: "monthly" | "annual"
  ) => {
    try {
      await settingsService.upgradeSubscription(tier, billingCycle);
      toast.success("Subscription upgraded successfully");
      loadSubscription();
    } catch (error) {
      console.error("Failed to upgrade subscription:", error);
      toast.error("Failed to upgrade subscription");
    }
  };

  const handleCancel = async () => {
    try {
      await settingsService.cancelSubscription();
      toast.success("Subscription cancelled");
      setShowCancelModal(false);
      loadSubscription();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const handleManageBilling = async () => {
    console.log("Manage Billing button clicked");
    try {
      console.log("Calling getBillingPortalUrl...");
      const result = await settingsService.getBillingPortalUrl();
      console.log("Billing portal result:", result);

      if (result && result.url) {
        console.log("Redirecting to:", result.url);
        window.location.href = result.url;
      } else {
        console.error("No URL in response:", result);
        toast.error("No billing portal URL received");
      }
    } catch (error: any) {
      console.error("Failed to get billing portal URL:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to open billing portal"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Current Subscription */}
      {subscription && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Current Plan
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {subscription.tier || subscription.planName}
              </p>
              <p className="text-sm text-gray-500">
                {subscription.billingCycle === "monthly"
                  ? "Billed monthly"
                  : "Billed annually"}
              </p>
              <p className="text-sm text-gray-500">
                Next billing date:{" "}
                {new Date(
                  subscription.nextBillingDate || subscription.currentPeriodEnd
                ).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleManageBilling}
                className="px-4 py-2 text-sm font-medium text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
              >
                Manage Billing
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subscription.usage.events && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Events</span>
                  <span className="font-medium text-gray-900">
                    {subscription.usage.events.used} /{" "}
                    {subscription.usage.events.limit === -1
                      ? "∞"
                      : subscription.usage.events.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(
                        subscription.usage.events.used,
                        subscription.usage.events.limit
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {subscription.usage.clients && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Clients</span>
                  <span className="font-medium text-gray-900">
                    {subscription.usage.clients.used} /{" "}
                    {subscription.usage.clients.limit === -1
                      ? "∞"
                      : subscription.usage.clients.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(
                        subscription.usage.clients.used,
                        subscription.usage.clients.limit
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {subscription.usage.teamMembers !== undefined && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-medium text-gray-900">
                    {subscription.usage.teamMembers} /{" "}
                    {subscription.usage.maxTeamMembers === -1
                      ? "∞"
                      : subscription.usage.maxTeamMembers}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(
                        subscription.usage.teamMembers || 0,
                        subscription.usage.maxTeamMembers || 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {subscription.usage.storage && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium text-gray-900">
                    {subscription.usage.storage.used}GB /{" "}
                    {subscription.usage.storage.limit === -1
                      ? "∞"
                      : `${subscription.usage.storage.limit}GB`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(
                        subscription.usage.storage.used,
                        subscription.usage.storage.limit
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tier Comparison */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-lg border-2 p-6 flex flex-col ${
                tier.popular
                  ? "border-teal-600 shadow-lg md:scale-105"
                  : "border-gray-200"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {tier.name}
                </h3>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                    ${tier.price.monthly}
                  </span>
                  <span className="text-base text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  or ${tier.price.annual}/year
                </p>
              </div>

              <ul className="mt-8 space-y-3 flex-grow">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier.name, "monthly")}
                disabled={
                  subscription?.tier === tier.name ||
                  subscription?.planName === tier.name
                }
                className={`mt-8 w-full px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  subscription?.tier === tier.name ||
                  subscription?.planName === tier.name
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : tier.popular
                    ? "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg"
                    : "bg-white text-teal-600 border-2 border-teal-600 hover:bg-teal-50"
                }`}
              >
                {subscription?.tier === tier.name ||
                subscription?.planName === tier.name
                  ? "Current Plan"
                  : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Cancel Subscription
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll lose
              access to premium features at the end of your billing period.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
