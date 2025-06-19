'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

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

interface SubscriptionState {
  currentPlan: Plan | null;
  trialStatus: {
    isActive: boolean;
    daysRemaining: number;
    eventsRemaining: number;
  } | null;
  isLoading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  subscribe: (planId: string, paymentProvider: 'flutterwave' | 'paystack') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  upgradeSubscription: (newPlanId: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
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

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [trialStatus, setTrialStatus] = useState<SubscriptionState['trialStatus']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const refreshSubscription = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get stored subscription data
      const storedSubscription = localStorage.getItem('subscription');
      if (storedSubscription) {
        const { planId, trialEndDate, eventsRemaining } = JSON.parse(storedSubscription);
        const plan = dummyPlans.find(p => p.id === planId);
        
        if (plan) {
          setCurrentPlan(plan);
          
          // Calculate trial status
          if (trialEndDate) {
            const daysRemaining = Math.max(0, Math.ceil((new Date(trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            setTrialStatus({
              isActive: daysRemaining > 0,
              daysRemaining,
              eventsRemaining: eventsRemaining || 0,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast.error('Failed to refresh subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (planId: string, paymentProvider: 'flutterwave' | 'paystack') => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const plan = dummyPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Store subscription data
      const subscriptionData = {
        planId,
        trialEndDate: plan.trialDays > 0 ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString() : null,
        eventsRemaining: plan.trialEvents,
      };
      localStorage.setItem('subscription', JSON.stringify(subscriptionData));

      await refreshSubscription();
      toast.success('Successfully subscribed to plan');
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to subscribe to plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.removeItem('subscription');
      setCurrentPlan(null);
      setTrialStatus(null);
      toast.success('Successfully canceled subscription');
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeSubscription = async (newPlanId: string) => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const plan = dummyPlans.find(p => p.id === newPlanId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Store subscription data
      const subscriptionData = {
        planId: newPlanId,
        trialEndDate: plan.trialDays > 0 ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000).toISOString() : null,
        eventsRemaining: plan.trialEvents,
      };
      localStorage.setItem('subscription', JSON.stringify(subscriptionData));

      await refreshSubscription();
      toast.success('Successfully upgraded subscription');
    } catch (error: any) {
      console.error('Upgrade subscription error:', error);
      toast.error(error.message || 'Failed to upgrade subscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh subscription data when user changes
  useEffect(() => {
    if (user) {
      refreshSubscription();
    } else {
      setCurrentPlan(null);
      setTrialStatus(null);
      localStorage.removeItem('subscription');
    }
  }, [user]);

  const value = {
    currentPlan,
    trialStatus,
    isLoading,
    subscribe,
    cancelSubscription,
    upgradeSubscription,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
} 