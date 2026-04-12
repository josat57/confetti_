"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Clock,
  Star,
  ArrowRight,
  X,
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react";
import { guestSessionService } from "@/services/guest-session.service";

interface GuestSessionBannerProps {
  onSignUpClick?: () => void;
  onSignInClick?: () => void;
  className?: string;
}

export default function GuestSessionBanner({
  onSignUpClick,
  onSignInClick,
  className = "",
}: GuestSessionBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    hasSession: false,
    planLevel: 0,
    totalPlans: 0,
    daysRemaining: 0,
    canUpgrade: false,
  });

  useEffect(() => {
    const stats = guestSessionService.getGuestSessionStats();
    setSessionStats(stats);
    setIsVisible(stats.hasSession);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleSignUp = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      // Default behavior - redirect to sign up
      window.location.href = "/register";
    }
  };

  const handleSignIn = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      // Default behavior - redirect to sign in
      window.location.href = "/sign-in";
    }
  };

  if (!sessionStats.hasSession) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-lg ${className}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Left side - Session info */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-white/20 rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Guest Session</span>
                </div>

                <div className="hidden sm:flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Level {sessionStats.planLevel}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{sessionStats.totalPlans} plans created</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{sessionStats.daysRemaining} days remaining</span>
                  </div>
                </div>
              </div>

              {/* Center - Message */}
              <div className="flex-1 text-center mx-4">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {sessionStats.canUpgrade
                      ? "🎉 You've unlocked Level 2! Sign up to save your plans permanently"
                      : "Create an account to save your plans and unlock premium features"}
                  </span>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSignIn}
                  className="px-3 py-1.5 text-sm font-medium text-white/90 hover:text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Sign In
                </button>

                <button
                  onClick={handleSignUp}
                  className="flex items-center space-x-1 px-4 py-1.5 bg-white text-purple-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Shield className="h-3 w-3" />
                  <span>Sign Up Free</span>
                  <ArrowRight className="h-3 w-3" />
                </button>

                <button
                  onClick={handleDismiss}
                  className="p-1 text-white/70 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="sm:hidden mt-2 pt-2 border-t border-white/20">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span>Level {sessionStats.planLevel}</span>
                  <span>{sessionStats.totalPlans} plans</span>
                  <span>{sessionStats.daysRemaining} days left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-blue-600/20 to-indigo-600/0 animate-pulse pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
