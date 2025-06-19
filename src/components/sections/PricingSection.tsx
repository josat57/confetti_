"use client";

import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'react-toastify';
import PaymentModal from '../subscription/PaymentModal';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  role: 'vendor' | 'event_planner';
  trialDays: number;
  trialEvents: number;
}

// Dummy data for plans
const dummyPlans: Plan[] = [
  {
    id: 'vendor-basic',
    name: 'Basic',
    price: 0,
    period: '/month',
    description: 'Perfect for vendors just starting out',
    features: [
      'Basic profile listing',
      'Up to 5 event listings per month',
      'Basic analytics',
      'Email support',
      'Standard search visibility',
    ],
    limitations: [
      'No featured listings',
      'Limited photo uploads',
      'Basic customer reviews',
    ],
    role: 'vendor',
    trialDays: 0,
    trialEvents: 0,
  },
  {
    id: 'vendor-pro',
    name: 'Professional',
    price: 49,
    period: '/month',
    description: 'Ideal for growing vendors',
    features: [
      'Enhanced profile listing',
      'Unlimited event listings',
      'Advanced analytics',
      'Priority support',
      'Featured in search results',
      'Photo gallery (up to 50 images)',
      'Customer review management',
      'Booking calendar',
    ],
    limitations: [],
    role: 'vendor',
    trialDays: 14,
    trialEvents: 2,
  },
  {
    id: 'vendor-enterprise',
    name: 'Enterprise',
    price: 99,
    period: '/month',
    description: 'For established vendors',
    features: [
      'Premium profile listing',
      'Unlimited event listings',
      'Advanced analytics & reporting',
      '24/7 priority support',
      'Top search visibility',
      'Unlimited photo gallery',
      'Advanced review management',
      'Custom booking system',
      'API access',
      'White-label options',
    ],
    limitations: [],
    role: 'vendor',
    trialDays: 14,
    trialEvents: 2,
  },
  {
    id: 'planner-basic',
    name: 'Starter',
    price: 0,
    period: '/month',
    description: 'Perfect for personal event planning',
    features: [
      'Basic event planning tools',
      'Up to 3 active events',
      'Basic vendor search',
      'Email support',
      'Standard templates',
    ],
    limitations: [
      'No AI recommendations',
      'Limited guest management',
      'Basic budget tracking',
    ],
    role: 'event_planner',
    trialDays: 0,
    trialEvents: 0,
  },
  {
    id: 'planner-pro',
    name: 'Professional',
    price: 29,
    period: '/month',
    description: 'For professional event planners',
    features: [
      'Advanced planning tools',
      'Unlimited active events',
      'AI-powered recommendations',
      'Priority support',
      'Premium templates',
      'Advanced guest management',
      'Budget tracking & analytics',
      'Vendor management tools',
    ],
    limitations: [],
    role: 'event_planner',
    trialDays: 14,
    trialEvents: 2,
  },
  {
    id: 'planner-enterprise',
    name: 'Enterprise',
    price: 79,
    period: '/month',
    description: 'For event planning agencies',
    features: [
      'All Professional features',
      'Team collaboration tools',
      'Custom branding',
      '24/7 priority support',
      'Advanced analytics & reporting',
      'API access',
      'White-label options',
      'Dedicated account manager',
    ],
    limitations: [],
    role: 'event_planner',
    trialDays: 14,
    trialEvents: 2,
  },
];

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState<'vendor' | 'event_planner'>('vendor');
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<'flutterwave' | 'paystack'>('flutterwave');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { currentPlan, trialStatus, isLoading, subscribe } = useSubscription();

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast.info('Please sign in to subscribe to a plan');
      router.push('/sign-in');
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPlan) return;

    try {
      await subscribe(selectedPlan.id, selectedPaymentProvider);
      setShowPaymentModal(false);
      setSelectedPlan(null);
      toast.success('Successfully subscribed to plan');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe to plan');
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const renderPricingCard = (plan: Plan) => {
    const isCurrentPlan = currentPlan?.id === plan.id;
    const isTrialActive = trialStatus?.isActive && isCurrentPlan;

    return (
      <motion.div
        key={plan.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative p-6 rounded-lg border shadow-sm ${
          isCurrentPlan ? 'border-primary bg-primary/5' : 'border-gray-200'
        }`}
      >
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm">
            Current Plan
          </div>
        )}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
          <div className="text-3xl font-bold mb-2">
            ${plan.price}
            <span className="text-sm font-normal text-gray-500">{plan.period}</span>
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
          {plan.limitations.map((limitation, index) => (
            <li key={index} className="flex items-start text-gray-500">
              <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              <span>{limitation}</span>
            </li>
          ))}
        </ul>
        {plan.trialDays > 0 && !isCurrentPlan && (
          <div className="text-center text-sm text-gray-600 mb-4">
            {plan.trialDays}-day free trial with {plan.trialEvents} events
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
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : 'Subscribe Now'}
        </button>
      </motion.div>
    );
  };

  const filteredPlans = dummyPlans.filter(plan => plan.role === activeTab);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include a 14-day free trial.
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
              onClick={() => setActiveTab('vendor')}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                activeTab === 'vendor'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              For Vendors
            </button>
            <button
              onClick={() => setActiveTab('event_planner')}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors ${
                activeTab === 'event_planner'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              For Event Planners
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {filteredPlans.map(plan => renderPricingCard(plan))}
        </div>

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