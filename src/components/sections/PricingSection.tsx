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
      currency: selectedPrice.currency,
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
        className={`relative p-6 rounded-lg border shadow-sm ${
          isCurrentPlan ? "border-primary bg-primary/5" : "border-gray-200"
        }`}
      >
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm">
            Current Plan
          </div>
        )}
        {plan.isPopular && !isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
            Most Popular
          </div>
        )}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">
            {plan.displayName || plan.planName}
          </h3>
          <div className="text-3xl font-bold mb-2">
            {formatAmount(displayAmount)}
            <span className="text-sm font-normal text-gray-500">
              /{plan.billingCycle}
            </span>
          </div>
          <p className="text-gray-600">{plan.description}</p>
        </div>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
          {plan.limitations &&
            plan.limitations.map((limitation, index) => (
              <li key={index} className="flex items-start text-gray-500">
                <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                <span>{limitation}</span>
              </li>
            ))}
        </ul>
        {plan.trialDays && plan.trialDays > 0 && !isCurrentPlan && (
          <div className="text-center text-sm text-gray-600 mb-4">
            {plan.trialDays}-day free trial
            {plan.maxEvents ? ` with ${plan.maxEvents} events` : ""}
          </div>
        )}
        {isTrialActive && (
          <div className="text-center text-sm text-primary mb-4">
            {trialStatus.daysRemaining} days remaining in trial
            <br />
            {trialStatus.eventsRemaining} events remaining
          </div>
        )}
        <button
          onClick={() => handleSubscribe(plan)}
          disabled={isCurrentPlan}
          className={`w-full py-4 px-4 rounded-lg text-white font-medium transition-colors ${
            isCurrentPlan
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {isCurrentPlan ? "Current Plan" : "Subscribe Now"}
        </button>
      </motion.div>
    );
  };

  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
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
          className="flex justify-center space-x-4 mt-8"
        >
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab("vendor")}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                activeTab === "vendor"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              For Vendors
            </button>
            <button
              onClick={() => setActiveTab("event_planner")}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                activeTab === "event_planner"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              For Event Planners
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoadingPlans && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Loading plans...</span>
          </div>
        )}

        {/* Error State */}
        {plansError && !isLoadingPlans && (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{plansError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        {!isLoadingPlans && !plansError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
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
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handlePaymentCancel}
            plan={selectedPlan}
            paymentProvider={selectedPaymentProvider}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </section>
  );
}
