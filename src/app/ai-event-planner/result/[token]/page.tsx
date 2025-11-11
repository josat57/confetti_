"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Sparkles,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { EventPlanTeaser } from "@/types/ai-planner";
import { getEventPlanResult } from "@/lib/api/ai-planner";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "@/lib/utils/formValidation";

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [eventPlan, setEventPlan] = useState<EventPlanTeaser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const result = await getEventPlanResult(token);
        setEventPlan(result.eventPlan);
      } catch (err: any) {
        setError(err.message);
        toast.error("Failed to load event plan");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchResult();
    }
  }, [token]);

  const handleSignUp = () => {
    localStorage.setItem(
      "redirectAfterSignup",
      `/ai-event-planner/result/${token}`
    );
    router.push("/register");
  };

  const handleSaveContinue = () => {
    localStorage.setItem("eventPlanToken", token);
    router.push("/register");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your event plan...</p>
        </div>
      </div>
    );
  }

  if (error || !eventPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error || "Event plan not found"}</p>
          <button
            onClick={() => router.push("/ai-event-planner")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  const {
    eventSummary,
    budgetBreakdown,
    vendorCategories,
    timeline,
    recommendations,
    aiInsights,
  } = eventPlan;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Home</span>
      </button>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12 pt-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Your Event Plan is Ready!
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {eventSummary.eventType} Event Plan
          </h1>
          <p className="text-lg text-gray-600">
            Here's your personalized event plan powered by AI
          </p>
        </motion.div>

        {/* Event Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Event Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(new Date(eventSummary.eventDate))}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold text-gray-900">
                  {eventSummary.location}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Guests</p>
                <p className="font-semibold text-gray-900">
                  {eventSummary.guestCount}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(
                    eventSummary.totalBudget,
                    eventSummary.currency
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Insights */}
        {aiInsights && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border border-purple-100"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI Insights
                </h3>
                <p className="text-gray-700">{aiInsights}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Budget Breakdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Budget Breakdown
          </h2>
          <div className="space-y-4">
            {budgetBreakdown.categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">
                      {category.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        category.priority === "essential"
                          ? "bg-red-100 text-red-700"
                          : category.priority === "recommended"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {category.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(category.amount, eventSummary.currency)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {category.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">
                Contingency Fund
              </span>
              <span className="font-bold text-gray-900">
                {formatCurrency(
                  budgetBreakdown.contingency,
                  eventSummary.currency
                )}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Vendor Categories (Locked) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/95 z-10 flex items-end justify-center pb-8">
            <div className="text-center">
              <Lock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Sign up to see {vendorCategories.length} vendor recommendations
              </p>
              <button
                onClick={handleSignUp}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Unlock Vendor Details
              </button>
            </div>
          </div>
          <div className="filter blur-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recommended Vendors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendorCategories.slice(0, 4).map((category, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <p className="font-semibold text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {category.vendorCount} vendors available
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Plan Your Perfect Event?
          </h2>
          <p className="text-lg mb-6 text-purple-100">
            Sign up now to access full vendor details, save your plan, and start
            booking!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSignUp}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-semibold flex items-center justify-center gap-2"
            >
              Sign Up Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleSaveContinue}
              className="px-8 py-4 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-semibold border-2 border-white/20"
            >
              Save & Continue
            </button>
          </div>
          <p className="text-sm text-purple-100 mt-4">
            ✓ No credit card required ✓ Access to 1000+ vendors ✓ Save unlimited
            events
          </p>
        </motion.div>
      </div>
    </div>
  );
}
