"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Clock,
  Star,
  FileText,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  ArrowRight,
} from "lucide-react";
import {
  guestSessionService,
  GuestSessionPlan,
} from "@/services/guest-session.service";

interface GuestSessionManagerProps {
  onPlanClick?: (sessionToken: string) => void;
  onSignUpClick?: () => void;
  className?: string;
}

export default function GuestSessionManager({
  onPlanClick,
  onSignUpClick,
  className = "",
}: GuestSessionManagerProps) {
  const [sessionStats, setSessionStats] = useState({
    hasSession: false,
    planLevel: 0,
    totalPlans: 0,
    daysRemaining: 0,
    canUpgrade: false,
  });
  const [plans, setPlans] = useState<GuestSessionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuestSessionData();
  }, []);

  const loadGuestSessionData = async () => {
    try {
      const stats = guestSessionService.getGuestSessionStats();
      setSessionStats(stats);

      if (stats.hasSession) {
        const storedPlans = guestSessionService.getStoredPlans();
        setPlans(storedPlans);
      }
    } catch (error) {
      console.error("Failed to load guest session data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanClick = (sessionToken: string) => {
    if (onPlanClick) {
      onPlanClick(sessionToken);
    } else {
      // Default behavior - navigate to result page
      window.location.href = `/ai-event-planner/result/${sessionToken}`;
    }
  };

  const handleSignUp = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      // Default behavior - redirect to sign up
      window.location.href = "/register";
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionStats.hasSession) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your Guest Session</h3>
              <p className="text-white/80 text-sm">
                {sessionStats.canUpgrade
                  ? "🎉 Level 2 unlocked! Sign up to save permanently"
                  : "Create an account to unlock more features"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignUp}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <span>Sign Up</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="h-4 w-4" />
              <span className="text-2xl font-bold">
                {sessionStats.planLevel}
              </span>
            </div>
            <p className="text-white/80 text-xs">Plan Level</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-2xl font-bold">
                {sessionStats.totalPlans}
              </span>
            </div>
            <p className="text-white/80 text-xs">Plans Created</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-2xl font-bold">
                {sessionStats.daysRemaining}
              </span>
            </div>
            <p className="text-white/80 text-xs">Days Left</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-2xl font-bold">{plans.length}</span>
            </div>
            <p className="text-white/80 text-xs">Saved Plans</p>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="p-6">
        {plans.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              Your Recent Plans
            </h4>

            {plans.slice(0, 3).map((plan, index) => (
              <motion.div
                key={plan.sessionToken}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handlePlanClick(plan.sessionToken)}
              >
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 capitalize">
                    {plan.eventType.replace("_", " ")} Event
                  </h5>

                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    {plan.guestCount && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{plan.guestCount} guests</span>
                      </div>
                    )}

                    {plan.budget && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>₦{plan.budget.toLocaleString()}</span>
                      </div>
                    )}

                    {plan.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">
                          {plan.location}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
              </motion.div>
            ))}

            {plans.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                And {plans.length - 3} more plans...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">No Plans Yet</h4>
            <p className="text-gray-600 text-sm">
              Create your first AI-powered event plan to get started!
            </p>
          </div>
        )}

        {/* Upgrade CTA */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-900">
                Unlock Premium Features
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                Save plans permanently, get advanced AI features, and more!
              </p>
            </div>

            <button
              onClick={handleSignUp}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm whitespace-nowrap ml-4"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
