'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { motion } from 'framer-motion';
import { Crown, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionStatus() {
  const { currentPlan, trialStatus, isLoading } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Active Plan</h3>
            <p className="text-gray-600 mt-1">Upgrade to access premium features</p>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            View Plans
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Crown className="w-6 h-6 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name} Plan</h3>
        </div>
        <button
          onClick={() => router.push('/pricing')}
          className="text-sm text-primary hover:text-primary/90"
        >
          Change Plan
        </button>
      </div>

      {trialStatus?.isActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Trial Period Active</p>
              <p className="text-sm text-yellow-700 mt-1">
                {trialStatus.daysRemaining} days remaining in trial
                {trialStatus.eventsRemaining > 0 && (
                  <span> • {trialStatus.eventsRemaining} events remaining</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Plan Features:</h4>
        <ul className="space-y-2">
          {currentPlan.features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm">
              <span className="text-primary mr-2">•</span>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {currentPlan.limitations.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Limitations:</h4>
          <ul className="space-y-2">
            {currentPlan.limitations.map((limitation, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="text-gray-400 mr-2">•</span>
                <span className="text-gray-500">{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
} 