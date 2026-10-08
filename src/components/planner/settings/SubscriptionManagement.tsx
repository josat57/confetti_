"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, CreditCard, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import settingsService from "@/services/planner/settings.service";
import PlanPicker from "@/components/subscription/PlanPicker";
import PlanUsage from "@/components/subscription/PlanUsage";

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [planRefresh, setPlanRefresh] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    fetchSubscription();
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const methods = await settingsService.getPaymentMethods();
      setPaymentMethods(methods);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Current Plan
        </h2>
        <PlanUsage
          accent="teal"
          refreshKey={planRefresh}
          onChangePlan={() => setShowChangePlanModal(true)}
        />
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

      {/* Change Plan */}
      {showChangePlanModal && (
        <PlanPicker
          planType={user?.role === "vendor" ? "vendor" : "planner"}
          accent="teal"
          currentPlanName={currentPlan?.planName}
          currentBillingCycle={currentPlan?.billingCycle === "yearly" ? "yearly" : "monthly"}
          onClose={() => setShowChangePlanModal(false)}
          onChanged={() => {
            setPlanRefresh((n) => n + 1);
            fetchSubscription();
          }}
        />
      )}
    </div>
  );
}
