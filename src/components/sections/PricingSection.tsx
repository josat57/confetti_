"use client";

import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePlan } from "@/contexts/PlanContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "react-toastify";
import PaymentModal from "../subscription/PaymentModal";
import { SubscriptionPlans } from "@/api/api";

interface Plan {
  _id: string;
  planName: string;
  displayName: string;
  planType: "vendor" | "event_planner";
  description: string;
  pricing: Array<{
    currency: string;
    amount: number;
    amountInMinorUnits: number;
    _id: string;
  }>;
  selectedPricing?: {
    currency: string;
    amount: number;
    amountInMinorUnits: number;
    _id: string;
  };
  features: string[];
  limitations: string[];
  billingCycle: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  trialDays?: number;
  maxEvents?: number;
}

export default function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"vendor" | "event_planner">(
    "vendor"
  );
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<
    "flutterwave" | "paystack"
  >("flutterwave");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { currentPlan, trialStatus, isLoading, subscribe } = useSubscription();
  const { setSelectedPlan: setContextPlan } = usePlan();
  const { currency, formatAmount, convertAmount } = useCurrency();

  // Fetch plans from API when component mounts or when activeTab/currency changes
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoadingPlans(true);
      setPlansError(null);

      try {
        const response = await SubscriptionPlans.getAllPlans({
          planType: activeTab,
          currency: currency,
          activeOnly: true,
        });

        console.log("API Response:", response);

        if (response.status === "success" && response.data?.plans) {
          setPlans(response.data.plans);
        } else {
          throw new Error("Failed to fetch plans");
        }
      } catch (error: any) {
        console.error("Error fetching plans:", error);
        setPlansError(error.message || "Failed to load subscription plans");
        toast.error("Failed to load subscription plans. Please try again.");
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [activeTab, currency]);

  const handleSubscribe = async (plan: Plan) => {
    // Get the selected pricing based on current currency
    const selectedPrice =
      plan.selectedPricing || plan.pricing.find((p) => p.currency === currency);

    if (!selectedPrice) {
      toast.error("Price not available for selected currency");
      return;
    }

    // Store plan data in context
    setContextPlan({
      planId: plan._id,
      planName: plan.planName,
      planType: plan.planType,
      amount: selectedPrice.amount,
      currency: selectedPrice.currency as "NGN" | "USD",
      period: `/${plan.billingCycle}`,
    });

    // Navigate to registration
    router.push("/register");
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPlan) return;

    try {
      await subscribe(selectedPlan._id, selectedPaymentProvider);
      setShowPaymentModal(false);
      setSelectedPlan(null);
      toast.success("Successfully subscribed to plan");
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe to plan");
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const renderPricingCard = (plan: Plan) => {
    const isCurrentPlan = currentPlan?.id === plan._id;
    const isTrialActive = trialStatus?.isActive && isCurrentPlan;

    // Get the selected pricing based on current currency
    const selectedPrice =
      plan.selectedPricing || plan.pricing.find((p) => p.currency === currency);
    const displayAmount = selectedPrice ? selectedPrice.amount : 0;

    return (
      <motion.div
        key={plan._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative p-3 sm:p-4 lg:p-6 rounded-lg border shadow-sm h-full flex flex-col min-h-[400px] sm:min-h-[450px] ${
          isCurrentPlan ? "border-primary bg-primary/5" : "border-gray-200"
        }`}
      >
        {isCurrentPlan && (
          <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
            Current Plan
          </div>
        )}
        {plan.isPopular && !isCurrentPlan && (
          <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
            Most Popular
          </div>
        )}
        <div className="text-center mb-3 sm:mb-4 lg:mb-6">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 sm:mb-2">
            {plan.displayName || plan.planName}
          </h3>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
            {formatAmount(displayAmount)}
            <span className="text-xs font-normal text-gray-500">
              /{plan.billingCycle}
            </span>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-tight">
            {plan.description}
          </p>
        </div>
        <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 mb-3 sm:mb-4 lg:mb-6 flex-grow">
          {plan.features.slice(0, 8).map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm lg:text-base leading-tight">
                {feature}
              </span>
            </li>
          ))}
          {plan.features.length > 8 && (
            <li className="text-xs sm:text-sm text-gray-500 italic">
              +{plan.features.length - 8} more features
            </li>
          )}
          {plan.limitations &&
            plan.limitations.slice(0, 3).map((limitation, index) => (
              <li key={index} className="flex items-start text-gray-500">
                <X className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm lg:text-base leading-tight">
                  {limitation}
                </span>
              </li>
            ))}
        </ul>
        <div className="mt-auto">
          {plan.trialDays && plan.trialDays > 0 && !isCurrentPlan && (
            <div className="text-center text-xs text-gray-600 mb-2 sm:mb-3">
              {plan.trialDays}-day free trial
              {plan.maxEvents ? ` with ${plan.maxEvents} events` : ""}
            </div>
          )}
          {isTrialActive && (
            <div className="text-center text-xs text-primary mb-2 sm:mb-3">
              {trialStatus.daysRemaining} days remaining in trial
              <br />
              {trialStatus.eventsRemaining} events remaining
            </div>
          )}
          <button
            onClick={() => handleSubscribe(plan)}
            disabled={isCurrentPlan}
            className={`w-full py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 rounded-lg text-white font-medium transition-colors text-xs sm:text-sm lg:text-base ${
              isCurrentPlan
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isCurrentPlan ? "Current Plan" : "Subscribe Now"}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <section id="pricing" className="py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4">
            Choose Your Plan
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
            Select the perfect plan for your needs. All plans include a 14-day
            free trial.
          </p>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-4 sm:mt-6 lg:mt-8 px-2 sm:px-4"
        >
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 sm:p-1 w-full max-w-xs sm:max-w-md">
            <button
              onClick={() => setActiveTab("vendor")}
              className={`flex-1 px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm lg:text-lg font-medium transition-colors ${
                activeTab === "vendor"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Vendors
            </button>
            <button
              onClick={() => setActiveTab("event_planner")}
              className={`flex-1 px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm lg:text-lg font-medium transition-colors ${
                activeTab === "event_planner"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Planners
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoadingPlans && (
          <div className="flex justify-center items-center py-12 sm:py-20 px-4">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-sm sm:text-base text-gray-600">
              Loading plans...
            </span>
          </div>
        )}

        {/* Error State */}
        {plansError && !isLoadingPlans && (
          <div className="text-center py-12 sm:py-20 px-4">
            <p className="text-red-600 mb-4 text-sm sm:text-base">
              {plansError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        {!isLoadingPlans && !plansError && (
          <div className="mt-8 sm:mt-12">
            {/* Mobile: Single column with horizontal scroll for better UX */}
            <div className="block sm:hidden">
              <div className="flex gap-3 overflow-x-auto pb-4 px-4 pricing-scroll">
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <div key={plan._id} className="flex-none w-72 pricing-card">
                      {renderPricingCard(plan)}
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-12">
                    <p className="text-gray-600 text-sm">
                      No plans available at the moment.
                    </p>
                  </div>
                )}
              </div>
              {/* Scroll indicator for mobile */}
              {plans.length > 1 && (
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-1">
                    {plans.map((_, index) => (
                      <div
                        key={index}
                        className="w-2 h-2 rounded-full bg-gray-300"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 px-4 lg:px-0">
              {plans.length > 0 ? (
                plans.map((plan) => renderPricingCard(plan))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-600">
                    No plans available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handlePaymentCancel}
            plan={selectedPlan as any}
            paymentProvider={selectedPaymentProvider}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </section>
  );
}
