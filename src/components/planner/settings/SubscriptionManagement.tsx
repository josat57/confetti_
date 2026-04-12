"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, CreditCard, TrendingUp, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import settingsService from "@/services/planner/settings.service";
import { subscriptionService } from "@/services/subscription.service";

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    fetchSubscription();
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      // TODO: Implement payment methods fetching
      // const methods = await settingsService.getPaymentMethods();
      // setPaymentMethods(methods);
      setPaymentMethods([]); // Placeholder
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  };

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const subscription = await settingsService.getSubscription();
      console.log("Fetched subscription data:", subscription);
      console.log("Amount:", (subscription as any)?.amount);
      console.log("Currency:", (subscription as any)?.currency);
      console.log("Status:", subscription?.status);
      setCurrentPlan(subscription);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      toast.error("Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangePlanModal = async () => {
    setShowChangePlanModal(true);
    setLoadingPlans(true);

    try {
      // Determine plan type based on user role
      let planType: "vendor" | "planner" = "planner";

      if (user?.role === "vendor") {
        planType = "vendor";
      } else if (
        (user as any)?.role === "event-planner" ||
        (user as any)?.role === "event_planner"
      ) {
        planType = "planner";
      }

      console.log(
        "Fetching plans for role:",
        user?.role,
        "planType:",
        planType
      );

      const plans = await subscriptionService.getPlans({
        planType: planType,
      });

      console.log("Fetched plans:", plans);
      setAvailablePlans(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleChangePlan = async (plan: any) => {
    if (
      !confirm(
        `Are you sure you want to change to the ${
          plan.displayName || plan.planName
        } plan?`
      )
    ) {
      return;
    }

    setChangingPlan(true);
    try {
      // Get NGN pricing (or first available)
      const ngnPricing =
        plan.pricing?.find((p: any) => p.currency === "NGN") ||
        plan.pricing?.[0];

      await settingsService.upgradeSubscription(
        plan.planName,
        plan.billingCycle || "monthly"
      );

      toast.success("Subscription plan changed successfully");
      setShowChangePlanModal(false);
      await fetchSubscription();
    } catch (error: any) {
      console.error("Error changing plan:", error);
      toast.error(error.message || "Failed to change subscription plan");
    } finally {
      setChangingPlan(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    setLoading(true);
    try {
      // Initialize payment method setup with Flutterwave
      const response = await settingsService.initializePaymentMethod();

      if (response.data?.paymentUrl) {
        // Store reference for verification after redirect
        sessionStorage.setItem(
          "paymentMethodReference",
          response.data.reference
        );

        // Redirect to Flutterwave for secure card tokenization
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error("Failed to initialize payment setup");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error initializing payment method:", error);
      toast.error(
        error.response?.data?.message || "Failed to initialize payment setup"
      );
      setLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?"))
      return;

    setLoading(true);
    try {
      await settingsService.removePaymentMethod(id);
      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
      toast.success("Payment method removed successfully");
    } catch (error: any) {
      console.error("Error removing payment method:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove payment method"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    setLoading(true);
    try {
      await settingsService.setDefaultPaymentMethod(id);
      setPaymentMethods(
        paymentMethods.map((pm) => ({
          ...pm,
          isDefault: pm.id === id,
        }))
      );
      toast.success("Default payment method updated");
    } catch (error: any) {
      console.error("Error setting default payment method:", error);
      toast.error(
        error.response?.data?.message || "Failed to set default payment method"
      );
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    {
      name: "Starter",
      price: "₦15,000",
      period: "/month",
      features: [
        "Up to 5 active events",
        "1 team member",
        "Basic vendor directory",
        "Email support",
        "Mobile app access",
      ],
    },
    {
      name: "Professional",
      price: "₦35,000",
      period: "/month",
      popular: true,
      features: [
        "Up to 15 active events",
        "3 team members",
        "Full vendor directory",
        "Priority support",
        "SMS notifications",
        "Advanced analytics",
        "Client portal",
      ],
    },
    {
      name: "Business",
      price: "₦75,000",
      period: "/month",
      features: [
        "Up to 50 active events",
        "10 team members",
        "Premium vendor access",
        "24/7 support",
        "Custom branding",
        "API access",
        "White-label options",
        "Dedicated account manager",
      ],
    },
  ];

  // Calculate days remaining until renewal
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    const symbol =
      currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  const daysRemaining = currentPlan?.currentPeriodEnd
    ? getDaysRemaining(currentPlan.currentPeriodEnd)
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Current Plan
        </h2>
        {currentPlan ? (
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentPlan.planName || "Professional"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentPlan.amount
                        ? formatCurrency(
                            currentPlan.amount,
                            currentPlan.currency || "NGN"
                          )
                        : "₦35,000"}{" "}
                      / {currentPlan.billingCycle || "monthly"}
                    </p>
                  </div>
                  {daysRemaining > 0 && (
                    <div className="ml-4 px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg">
                      <p className="text-xs text-teal-600 font-medium">
                        {daysRemaining} {daysRemaining === 1 ? "day" : "days"}{" "}
                        remaining
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs text-gray-500">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        currentPlan.status === "active"
                          ? "text-green-600"
                          : currentPlan.status === "pending_payment"
                          ? "text-yellow-600"
                          : currentPlan.status === "cancelled"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {currentPlan.status?.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </p>
                  {currentPlan.currentPeriodEnd && (
                    <p className="text-xs text-gray-500">
                      Renews on{" "}
                      {new Date(
                        currentPlan.currentPeriodEnd
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleOpenChangePlanModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Change Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">No active subscription</p>
            <button
              onClick={handleOpenChangePlanModal}
              className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        )}

        {/* Usage Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Active Events</p>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {currentPlan?.usage?.activeEvents || 0} /{" "}
                {currentPlan?.usage?.maxEvents || 0}
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full"
                  style={{
                    width: `${
                      currentPlan?.usage?.maxEvents
                        ? (currentPlan.usage.activeEvents /
                            currentPlan.usage.maxEvents) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Team Members</p>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {currentPlan?.usage?.teamMembers || 0} /{" "}
                {currentPlan?.usage?.maxTeamMembers || 0}
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full"
                  style={{
                    width: `${
                      currentPlan?.usage?.maxTeamMembers
                        ? (currentPlan.usage.teamMembers /
                            currentPlan.usage.maxTeamMembers) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Storage Used</p>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">
                {((currentPlan?.usage?.storageUsed || 0) / 1024).toFixed(1)} /{" "}
                {((currentPlan?.usage?.maxStorage || 0) / 1024).toFixed(0)} GB
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full"
                  style={{
                    width: `${
                      currentPlan?.usage?.maxStorage
                        ? (currentPlan.usage.storageUsed /
                            currentPlan.usage.maxStorage) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Methods
          </h2>
          <button
            onClick={handleAddPaymentMethod}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:opacity-50"
          >
            Add Payment Method
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {method.brand?.toUpperCase() || "Card"} ••••{" "}
                      {method.last4}
                    </p>
                    <p className="text-xs text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                    {method.isDefault && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefaultPaymentMethod(method.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">No payment methods on file</p>
            <p className="text-xs text-gray-500 mt-1">
              Add a payment method to manage your subscription
            </p>
          </div>
        )}
      </div>

      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Change Subscription Plan
              </h3>
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Choose a plan that works best for you. You can change or cancel
              anytime.
            </p>
            <div className="space-y-3">
              {loadingPlans ? (
                <div className="text-center py-8">
                  <Loader2 className="inline-block w-8 h-8 text-teal-600 animate-spin mb-2" />
                  <p className="text-gray-600">Loading plans...</p>
                </div>
              ) : availablePlans.length > 0 ? (
                availablePlans.map((plan: any) => {
                  const isCurrentPlan = currentPlan?.planName === plan.planName;

                  // Get pricing for NGN currency (or first available)
                  const ngnPricing =
                    plan.pricing?.find((p: any) => p.currency === "NGN") ||
                    plan.pricing?.[0];
                  const displayPrice = ngnPricing?.amount || 0;
                  const displayCurrency = ngnPricing?.currency || "NGN";

                  return (
                    <div
                      key={plan._id}
                      className={`border-2 rounded-lg p-4 ${
                        isCurrentPlan
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">
                              {plan.displayName || plan.planName}
                            </p>
                            {isCurrentPlan && (
                              <span className="px-2 py-0.5 bg-teal-600 text-white text-xs rounded">
                                Current Plan
                              </span>
                            )}
                            {plan.isPopular && !isCurrentPlan && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {displayCurrency === "NGN" ? "₦" : displayCurrency}{" "}
                            {displayPrice.toLocaleString()} /{" "}
                            {plan.billingCycle}
                          </p>
                          {plan.description && (
                            <p className="text-xs text-gray-500 mt-2">
                              {plan.description}
                            </p>
                          )}
                          {plan.features && plan.features.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {plan.features
                                .slice(0, 3)
                                .map((feature: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="text-xs text-gray-600 flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3 text-teal-600" />
                                    {feature}
                                  </li>
                                ))}
                              {plan.features.length > 3 && (
                                <li className="text-xs text-gray-500 italic">
                                  +{plan.features.length - 3} more features
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                        <button
                          onClick={() => handleChangePlan(plan)}
                          disabled={changingPlan || isCurrentPlan}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            isCurrentPlan
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-teal-600 text-white hover:bg-teal-700"
                          } disabled:opacity-50`}
                        >
                          {changingPlan
                            ? "Processing..."
                            : isCurrentPlan
                            ? "Current"
                            : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No plans available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
