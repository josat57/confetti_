"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Sparkles, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import AIPlannerHub from "@/components/shared/ai-planner/AIPlannerHub";

export default function VendorAIPlannerPage() {
  const { user } = useAuth();
  const [userSubscription, setUserSubscription] = useState<any>(null);

  // Fetch user subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1"
          }/subscriptions/current`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setUserSubscription(data.data?.subscription || data.subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // Check if user has Business tier or higher
  const userPlan = userSubscription?.planName?.toLowerCase() || "";
  const hasAccess = userPlan === "business" || userPlan === "enterprise";

  if (!hasAccess) {
    return (
      <div className="max-w-4xl">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI Event Planner
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Unlock the power of AI to create stunning, detailed event plans in
            minutes. Available for Business tier and above.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Smart Planning
              </h3>
              <p className="text-sm text-gray-600">
                AI generates comprehensive event plans with timelines, budgets,
                and vendor recommendations
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Interactive Chat
              </h3>
              <p className="text-sm text-gray-600">
                Collaborate with AI through natural conversation to refine your
                event vision
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Smart Insights
              </h3>
              <p className="text-sm text-gray-600">
                Get data-driven recommendations and market insights for better
                planning
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Upgrade to Business
          </Link>
        </div>
      </div>
    );
  }

  return <AIPlannerHub userType="vendor" />;
}
