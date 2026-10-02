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
import PlanFeedback from "@/components/shared/ai-planner/PlanFeedback";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "@/lib/utils/formValidation";
import { useAuth } from "@/contexts/AuthContext";

// Smart category mapper - converts generic "Other" to specific categories based on percentage
const mapGenericCategory = (
  index: number,
  percentage: number,
  eventType: string
): { name: string; description: string; priority: string } => {
  // Define typical budget allocations for different event types
  const categoryPriority = [
    {
      name: "Venue & Space",
      description:
        "Premium event space with complete setup, tables, chairs, lighting, and climate control",
      priority: "essential",
      typical: [25, 30],
    },
    {
      name: "Catering & Food",
      description:
        "Full-service catering with appetizers, main course, desserts, beverages, and professional staff",
      priority: "essential",
      typical: [30, 35],
    },
    {
      name: "Decoration & Styling",
      description:
        "Complete event decoration with centerpieces, backdrop, flowers, linens, and themed lighting",
      priority: "recommended",
      typical: [15, 20],
    },
    {
      name: "Photography & Videography",
      description:
        "Professional photo and video coverage with edited deliverables, online gallery, and prints",
      priority: "recommended",
      typical: [10, 15],
    },
    {
      name: "Entertainment & Music",
      description:
        "DJ or live band with sound system, microphones, dance floor lighting, and MC services",
      priority: "recommended",
      typical: [10, 15],
    },
    {
      name: "Invitations & Stationery",
      description:
        "Custom invitation design, printing, envelopes, RSVP tracking, and digital invites",
      priority: "optional",
      typical: [3, 5],
    },
    {
      name: "Party Favors & Gifts",
      description:
        "Personalized party favors, gift bags, thank you cards, and guest keepsakes",
      priority: "optional",
      typical: [2, 5],
    },
    {
      name: "Miscellaneous & Coordination",
      description:
        "Event coordination, permits, insurance, emergency planning, and day-of management",
      priority: "optional",
      typical: [2, 5],
    },
  ];

  // Return the category based on index, or map by percentage if we run out
  if (index < categoryPriority.length) {
    return categoryPriority[index];
  }

  // Fallback for extra categories
  return {
    name: "Additional Services",
    description: "Supplementary event services and coordination",
    priority: "optional",
  };
};

// Helper function to get detailed included items based on category
const getIncludedItems = (categoryName: string, eventType: string): string => {
  const categoryMap: { [key: string]: string } = {
    "Venue & Space":
      "Space rental, tables, chairs, basic lighting, security, parking, climate control, setup crew",
    "Catering & Food":
      "Appetizers, main course, desserts, beverages, service staff, setup & cleanup, tableware",
    "Photography & Videography":
      "6-hour coverage, 200+ edited photos, highlight video, online gallery, prints, USB drive",
    "Decoration & Styling":
      "Centerpieces, backdrop, flowers, linens, ambient lighting, themed setup, balloons",
    "Entertainment & Music":
      "DJ/Live band, sound system, microphones, dance floor lighting, MC services, playlist curation",
    "Invitations & Stationery":
      "Custom design, printing, envelopes, RSVP tracking, digital invites, thank you cards",
    "Party Favors & Gifts":
      "Personalized favors, gift bags, custom labels, packaging, guest keepsakes",
    "Miscellaneous & Coordination":
      "Event coordinator, permits, insurance, emergency planning, vendor management, timeline creation",
    Venue:
      "Space rental, tables, chairs, basic lighting, security, parking, climate control",
    Catering:
      "Appetizers, main course, desserts, beverages, service staff, setup & cleanup",
    Photography:
      "6-hour coverage, 200+ edited photos, highlight video, online gallery, prints",
    Decoration:
      "Centerpieces, backdrop, flowers, linens, ambient lighting, themed setup",
    Entertainment:
      "DJ/Live band, sound system, microphones, dance floor lighting, MC services",
    Transportation:
      "Guest pickup/drop-off, vendor coordination, parking management, shuttle service",
    Other:
      "Event coordination, permits, insurance, emergency planning, day-of coordination",
  };

  // Check for exact match first
  for (const [key, value] of Object.entries(categoryMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default comprehensive package
  return `Professional ${categoryName.toLowerCase()} services, consultation, setup, execution, and cleanup`;
};

// Helper function to get value proposition tag
const getValueTag = (amount: number, totalBudget: number): string => {
  const percentage = (amount / totalBudget) * 100;

  if (percentage >= 30) {
    return "💎 Premium Investment";
  } else if (percentage >= 20) {
    return "⭐ Major Component";
  } else if (percentage >= 10) {
    return "✓ Standard Package";
  } else {
    return "✓ Essential Add-on";
  }
};

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { isAuthenticated } = useAuth();

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

  const handleSignUp = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      localStorage.setItem(
        "redirectAfterSignup",
        `/ai-event-planner/result/${token}`
      );
      router.push("/register");
    } catch (error) {
      console.error("Error in handleSignUp:", error);
      toast.error("Failed to navigate. Please try again.");
    }
  };

  const handleSaveContinue = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      localStorage.setItem("eventPlanToken", token);
      router.push("/register");
    } catch (error) {
      console.error("Error in handleSaveContinue:", error);
      toast.error("Failed to navigate. Please try again.");
    }
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
            type="button"
            onClick={(e) => {
              e.preventDefault();
              router.push("/ai-event-planner");
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  // Extract data from the actual backend response structure
  const backendData = eventPlan as any; // The actual backend response

  // Check if we have the expected EventPlanTeaser structure or new backend structure
  const isEventPlanTeaser = eventPlan.eventSummary && eventPlan.budgetBreakdown;
  const hasEventDetails = backendData.eventDetails;

  const eventSummary = isEventPlanTeaser
    ? {
        eventType: eventPlan.eventSummary.eventType,
        eventDate: eventPlan.eventSummary.eventDate,
        location: eventPlan.eventSummary.location,
        guestCount: eventPlan.eventSummary.guestCount,
        totalBudget: eventPlan.eventSummary.totalBudget,
        currency: eventPlan.eventSummary.currency,
        formality: eventPlan.eventSummary.formality,
      }
    : hasEventDetails
    ? {
        // Extract from new backend response structure with eventDetails
        eventType: backendData.eventDetails.eventType || "Event",
        eventDate:
          backendData.eventDetails.eventDate || new Date().toISOString(),
        location:
          backendData.eventDetails.location?.fullLocation ||
          backendData.eventDetails.location?.city ||
          "Location TBD",
        guestCount: backendData.eventDetails.guestCount || 0,
        totalBudget:
          backendData.budgetBreakdown?.totalBudget ||
          backendData.eventDetails.budget?.amount ||
          0,
        currency:
          backendData.budgetBreakdown?.currency ||
          backendData.eventDetails.budget?.currency ||
          "NGN",
        formality: backendData.eventDetails.formality || "casual",
      }
    : {
        // Fallback for other backend response structures
        eventType: backendData.eventType || "Event",
        eventDate: backendData.eventDate || new Date().toISOString(),
        location:
          backendData.location?.fullLocation ||
          backendData.location?.city ||
          "Location TBD",
        guestCount: backendData.guestCount || 0,
        totalBudget: backendData.budgetBreakdown?.totalBudget || 0,
        currency: backendData.budgetBreakdown?.currency || "NGN",
        formality: backendData.formality || "casual",
      };

  // Extract budget breakdown from the actual backend structure
  const budgetBreakdown = isEventPlanTeaser
    ? {
        categories: eventPlan.budgetBreakdown.categories,
        totalAllocated: eventPlan.budgetBreakdown.totalAllocated,
        contingency: eventPlan.budgetBreakdown.contingency,
        feasibilityScore: eventPlan.budgetBreakdown.feasibilityScore,
      }
    : {
        categories: backendData.budgetBreakdown?.breakdown
          ? Object.entries(backendData.budgetBreakdown.breakdown).map(
              ([key, value]: [string, any]) => ({
                name: key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                amount: value.amount,
                percentage: value.percentage,
                priority: value.priority || "optional",
                items: value.items || [],
              })
            )
          : [],
        totalAllocated:
          backendData.budgetBreakdown?.validation?.totalAllocated ||
          backendData.budgetBreakdown?.totalBudget ||
          0,
        contingency:
          backendData.budgetBreakdown?.breakdown?.contingency?.amount || 0,
        feasibilityScore: null,
      };

  // Extract vendor categories (hide contact details for guests)
  // categoryBreakdown: { [category]: [{ vendor, matchScore, matchReasons, estimatedCost }] }
  const vendorCategories = isEventPlanTeaser
    ? eventPlan.vendorCategories || []
    : Object.entries(
        backendData.vendorRecommendations?.categoryBreakdown || {}
      ).map(([key, recs]: [string, any]) => {
        const prices = recs
          .map((r: any) => r.vendor?.averagePrice)
          .filter((p: number) => p > 0);
        const ratings = recs
          .map((r: any) => r.vendor?.rating)
          .filter((r: number) => r > 0);
        return {
          name: key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: `${recs.length} matched vendor${recs.length === 1 ? "" : "s"} near your event`,
          vendorCount: recs.length,
          priceRange: prices.length
            ? { min: Math.min(...prices), max: Math.max(...prices) }
            : null,
          averageRating: ratings.length
            ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
            : null,
          reviewCount: recs.reduce(
            (sum: number, r: any) => sum + (r.vendor?.reviewCount || 0),
            0
          ),
          vendors: recs.map((r: any) => ({
            name: r.vendor?.name,
            specialization: r.matchScore != null
              ? `${Math.round(r.matchScore * 100)}% match`
              : r.vendor?.subcategory || "",
            basePrice: r.estimatedCost || 0,
            rating: r.vendor?.rating || 0,
          })),
        };
      });

  // Extract timeline data from the actual backend structure
  const timeline: any = isEventPlanTeaser
    ? eventPlan.timeline
    : {
        phases: backendData.timeline?.phases || [],
        criticalPath: backendData.timeline?.criticalPath || [],
        riskFactors: backendData.timeline?.riskFactors || [],
        totalWeeksAvailable: backendData.timeline?.totalWeeksAvailable || 1,
        planningMilestones:
          backendData.timeline?.phases?.flatMap(
            (phase: any) =>
              phase.tasks?.map((task: any) => ({
                title: task.task,
                description: `${phase.phase} - ${task.task}`,
                daysBeforeEvent: phase.phase,
                priority: task.priority || "medium",
                estimatedCost: task.estimatedCost || 0,
                vendor: task.vendor,
                status: task.status,
              })) || []
          ) || [],
        eventDayHighlights: backendData.timeline?.eventDaySchedule || [],
        metadata: {
          generatedAt:
            backendData.timeline?.generatedAt || new Date().toISOString(),
          processingTime: 0,
          daysUntilEvent: Math.ceil(
            (new Date(eventSummary.eventDate).getTime() -
              new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        },
      };

  // Extract recommendations from the actual backend
  const recommendations = isEventPlanTeaser
    ? eventPlan.recommendations || []
    : [
        ...(backendData.budgetBreakdown?.validation?.recommendations || []),
        ...(backendData.budgetOptimizationTips || []),
      ];

  // Extract AI insights from the actual backend structure
  const aiInsights = isEventPlanTeaser
    ? eventPlan.aiInsights
    : {
        keywords: backendData.visualSuggestions?.moodBoardConcepts || [],
        // Feasibility = 1 - overall risk; confidenceLevel is the model's
        // confidence, not feasibility. null hides the bar.
        feasibilityScore:
          typeof backendData.riskAnalysis?.overallRiskScore === "number"
            ? Math.round((1 - backendData.riskAnalysis.overallRiskScore) * 100)
            : null,
      };

  const clientAnalysis: any = backendData.clientAnalysis || null;
  const clientInsightGroups = [
    { title: "Cultural considerations", items: clientAnalysis?.culturalConsiderations || [] },
    { title: "Easy to overlook", items: clientAnalysis?.hiddenNeeds || [] },
    { title: "What success looks like", items: clientAnalysis?.successMetrics || [] },
    { title: "Personal touches", items: clientAnalysis?.personalizationOpportunities || [] },
  ].filter((group) => group.items.length > 0);
  // "balanced" with no details is the backend's placeholder when no AI model ran
  const clientPersonality =
    clientAnalysis?.clientPersonality && clientAnalysis.clientPersonality !== "balanced"
      ? clientAnalysis.clientPersonality
      : null;

  // Extract actual backend data for detailed sections
  const visualSuggestions: any = backendData.visualSuggestions || null;
  const riskAnalysis: any = backendData.riskAnalysis || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50">
      {/* Back Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          router.push("/");
        }}
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
            {eventSummary.eventType.charAt(0).toUpperCase() +
              eventSummary.eventType.slice(1)}{" "}
            Event Plan
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
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Insights & Analysis
                </h3>

                {/* Feasibility Score */}
                {aiInsights.feasibilityScore != null && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Event Feasibility
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {aiInsights.feasibilityScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        aiInsights.feasibilityScore >= 75
                          ? "bg-green-500"
                          : aiInsights.feasibilityScore >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${aiInsights.feasibilityScore}%` }}
                    />
                  </div>
                </div>
                )}

                {/* Client Analysis */}
                {(clientPersonality || clientInsightGroups.length > 0) && (
                  <div className="mb-4">
                    {clientPersonality && (
                      <p className="text-sm text-gray-700 mb-3">{clientPersonality}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {clientInsightGroups.map((group) => (
                        <div key={group.title}>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {group.title}
                          </p>
                          <ul className="list-disc pl-5 space-y-0.5">
                            {group.items.map((item: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Suggestions - Not available in EventPlanTeaser */}
                {/* 
                <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                  Visual Suggestions section commented out - not available in EventPlanTeaser
                </div>
                */}
                {false && (
                  <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Visual & Design Suggestions
                    </h4>

                    {visualSuggestions.colorPalette && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-700">
                          Recommended Colors:
                        </span>
                        <div className="flex gap-2 mt-1">
                          {visualSuggestions.colorPalette.map(
                            (color: string, index: number) => (
                              <div
                                key={index}
                                className="w-8 h-8 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {visualSuggestions.moodBoardConcepts && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-700">
                          Style Concepts:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {visualSuggestions.moodBoardConcepts.map(
                            (concept: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs capitalize"
                              >
                                {concept}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {visualSuggestions.layoutSuggestions && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Layout Ideas:
                        </span>
                        <ul className="mt-1 text-sm text-gray-600">
                          {visualSuggestions.layoutSuggestions.map(
                            (suggestion: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {suggestion}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Risk Analysis - Not available in EventPlanTeaser */}
                {false && (
                  <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Risk Assessment
                    </h4>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Overall Risk Level
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            riskAnalysis.overallRiskScore <= 0.3
                              ? "text-green-600"
                              : riskAnalysis.overallRiskScore <= 0.6
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {riskAnalysis.overallRiskScore <= 0.3
                            ? "Low"
                            : riskAnalysis.overallRiskScore <= 0.6
                            ? "Medium"
                            : "High"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            riskAnalysis.overallRiskScore <= 0.3
                              ? "bg-green-500"
                              : riskAnalysis.overallRiskScore <= 0.6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${riskAnalysis.overallRiskScore * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {riskAnalysis.riskCategories && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(riskAnalysis.riskCategories).map(
                          ([category, risk]: [string, any]) =>
                            risk && (
                              <div
                                key={category}
                                className="flex justify-between"
                              >
                                <span className="capitalize text-gray-700">
                                  {category}:
                                </span>
                                <span
                                  className={`font-medium ${
                                    risk.level === "low"
                                      ? "text-green-600"
                                      : risk.level === "medium"
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {risk.level}
                                </span>
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Keywords */}
                {aiInsights.keywords && aiInsights.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Key Themes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {aiInsights.keywords.map(
                        (keyword: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Rating (signed-in users on plan level 2+; hidden otherwise) */}
        <PlanFeedback
          interactionId={backendData.learningInteractionId}
          className="mb-8"
        />

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              AI Recommendations
            </h2>
            <div className="space-y-3">
              {recommendations.map((recommendation: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Budget Breakdown - Enhanced */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Detailed Budget Breakdown
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Investment</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  eventSummary.totalBudget,
                  eventSummary.currency
                )}
              </p>
            </div>
          </div>

          {/* Smart Savings Alert */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 mb-1">
                  💡 AI-Optimized Budget
                </p>
                <p className="text-sm text-green-800">
                  Allocations follow typical spending for this type of event, with
                  a 10% contingency held back for unexpected costs.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {budgetBreakdown.categories.map((category, index) => {
              // Smart mapping: if category name is "Other", map to specific category
              const mappedCategory =
                category.name === "Other"
                  ? mapGenericCategory(
                      index,
                      category.percentage,
                      eventSummary.eventType
                    )
                  : {
                      name: category.name,
                      description:
                        (category as any).description ||
                        `Professional ${category.name.toLowerCase()} services`,
                      priority: (category as any).priority || "optional",
                    };

              const isHighPriority = mappedCategory.priority === "essential";
              const isRecommended = mappedCategory.priority === "recommended";

              return (
                <div
                  key={index}
                  className="group border-2 border-gray-100 hover:border-purple-200 rounded-xl p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {mappedCategory.name}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            isHighPriority
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : isRecommended
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isHighPriority
                            ? "🔥 Essential"
                            : isRecommended
                            ? "⭐ Recommended"
                            : "Optional"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {mappedCategory.description}
                      </p>

                      {/* What's Included */}
                      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mt-2">
                        <span className="font-semibold text-gray-700">
                          Includes:
                        </span>{" "}
                        {getIncludedItems(
                          mappedCategory.name,
                          eventSummary.eventType
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(category.amount, eventSummary.currency)}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {category.percentage}% of budget
                      </p>
                      <div className="text-xs text-green-600 font-medium">
                        {getValueTag(category.amount, eventSummary.totalBudget)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isHighPriority
                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                          : isRecommended
                          ? "bg-gradient-to-r from-blue-500 to-purple-500"
                          : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contingency & Total */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-semibold text-gray-900">
                  🛡️ Contingency Fund
                </p>
                <p className="text-xs text-gray-600">
                  Emergency buffer for unexpected costs
                </p>
              </div>
              <span className="font-bold text-gray-900 text-lg">
                {formatCurrency(
                  budgetBreakdown.contingency,
                  eventSummary.currency
                )}
              </span>
            </div>

            {/* Payment Options */}
            <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Flexible Payment Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
                  <div className="font-semibold text-gray-900 mb-1">
                    Full Payment
                  </div>
                  <div className="text-green-600 font-bold text-sm mb-1">
                    Save 5%
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(
                      eventSummary.totalBudget * 0.95,
                      eventSummary.currency
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-purple-400 text-center relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Popular
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">
                    50% Deposit
                  </div>
                  <div className="text-purple-600 font-bold text-sm mb-1">
                    Most Flexible
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(
                      eventSummary.totalBudget * 0.5,
                      eventSummary.currency
                    )}{" "}
                    now
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100 text-center">
                  <div className="font-semibold text-gray-900 mb-1">
                    3 Installments
                  </div>
                  <div className="text-blue-600 font-bold text-sm mb-1">
                    Easy Planning
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(
                      eventSummary.totalBudget / 3,
                      eventSummary.currency
                    )}
                    /month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vendor Categories */}
        {vendorCategories && vendorCategories.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden"
          >
            {/* Show locked overlay for guest users */}
            {!isAuthenticated && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/95 z-10 flex items-end justify-center pb-8">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Sign up to see {vendorCategories.length} vendor
                    recommendations
                  </p>
                  <button
                    type="button"
                    onClick={handleSignUp}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Unlock Vendor Details
                  </button>
                </div>
              </div>
            )}

            <div className={!isAuthenticated ? "filter blur-sm" : ""}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recommended Vendors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendorCategories
                  .slice(0, isAuthenticated ? vendorCategories.length : 4)
                  .map((category: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg mb-1">
                            {category.name || category.category}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {category.description}
                          </p>

                          {/* Show vendor count */}
                          <p className="text-sm text-gray-500">
                            {category.vendorCount ||
                              category.vendors?.length ||
                              0}{" "}
                            vendors available
                          </p>

                          {/* Show price range if available */}
                          {category.priceRange && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              Price range:{" "}
                              {formatCurrency(
                                category.priceRange.min,
                                eventSummary.currency
                              )}{" "}
                              -{" "}
                              {formatCurrency(
                                category.priceRange.max,
                                eventSummary.currency
                              )}
                            </p>
                          )}
                        </div>

                        {/* Show rating if available */}
                        {category.averageRating && (
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-semibold text-gray-900">
                                {category.averageRating.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              ({category.reviewCount || 0} reviews)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Show vendor details for authenticated users only */}
                      {isAuthenticated &&
                        category.vendors &&
                        category.vendors.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Top Vendors:
                            </p>
                            <div className="space-y-2">
                              {category.vendors
                                .slice(0, 2)
                                .map((vendor: any, vIndex: number) => (
                                  <div
                                    key={vIndex}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {vendor.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {vendor.specialization}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-green-600">
                                        {vendor.basePrice
                                          ? formatCurrency(
                                              vendor.basePrice,
                                              eventSummary.currency
                                            )
                                          : "Quote on request"}
                                      </p>
                                      {vendor.rating && (
                                        <p className="text-xs text-gray-500">
                                          ⭐ {vendor.rating.toFixed(1)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* Hide contact details for guest users (this is already handled by authentication check) */}
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <button
                                type="button"
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                              >
                                View all {category.vendors.length} vendors →
                              </button>
                            </div>
                          </div>
                        )}

                      {/* Show preview for guest users */}
                      {!isAuthenticated && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Lock className="w-4 h-4" />
                            <span>Vendor details available after signup</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Show upgrade prompt for guest users at bottom */}
              {!isAuthenticated && vendorCategories.length > 4 && (
                <div className="mt-6 text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">
                      {vendorCategories.length - 4} more vendor categories
                    </span>{" "}
                    available with full contact details
                  </p>
                  <button
                    type="button"
                    onClick={handleSignUp}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Sign up to see all recommendations →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Timeline Section */}
        {timeline &&
          (timeline.planningMilestones?.length > 0 ||
            timeline.eventDayHighlights?.length > 0 ||
            timeline.phases?.length > 0) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Event Timeline & Milestones
              </h2>

              {/* Planning Milestones - from EventPlanTeaser structure */}
              {timeline.planningMilestones &&
                timeline.planningMilestones.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Planning Milestones
                    </h3>
                    <div className="space-y-4">
                      {timeline.planningMilestones.map(
                        (milestone: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {milestone.title || milestone.task}
                                </h4>
                                <span className="text-sm text-blue-600 font-medium">
                                  {milestone.daysBeforeEvent
                                    ? `${milestone.daysBeforeEvent} days before`
                                    : milestone.timeframe}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {milestone.description}
                              </p>
                              {milestone.priority && (
                                <span
                                  className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                                    milestone.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : milestone.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {milestone.priority} priority
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Timeline Phases - from raw backend structure */}
              {timeline.phases &&
                timeline.phases.length > 0 &&
                (!timeline.planningMilestones ||
                  timeline.planningMilestones.length === 0) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Planning Phases
                    </h3>
                    <div className="space-y-4">
                      {timeline.phases.map((phase: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {phase.name || phase.title}
                              </h4>
                              <span className="text-sm text-blue-600 font-medium">
                                {phase.timeframe || phase.duration}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {phase.description}
                            </p>
                            {phase.tasks && phase.tasks.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Key Tasks:
                                </p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {phase.tasks
                                    .slice(0, 3)
                                    .map((task: string, taskIndex: number) => (
                                      <li
                                        key={taskIndex}
                                        className="flex items-center gap-1"
                                      >
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        {task}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Event Day Highlights */}
              {timeline.eventDayHighlights &&
                timeline.eventDayHighlights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Event Day Schedule
                    </h3>
                    <div className="space-y-3">
                      {timeline.eventDayHighlights.map(
                        (highlight: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-200"
                          >
                            <div className="flex-shrink-0 w-16 text-center">
                              <span className="text-sm font-bold text-purple-600">
                                {highlight.time || `${index * 30 + 60} min`}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {highlight.activity || highlight.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {highlight.description}
                              </p>
                            </div>
                            {highlight.duration && (
                              <div className="text-sm text-gray-500">
                                {highlight.duration}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Timeline Metadata */}
              {timeline.metadata && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {timeline.metadata.daysUntilEvent && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-gray-900 text-lg">
                          {timeline.metadata.daysUntilEvent}
                        </div>
                        <div className="text-gray-600">Days until event</div>
                      </div>
                    )}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-gray-900 text-lg">
                        {(timeline.planningMilestones?.length || 0) +
                          (timeline.phases?.length || 0)}
                      </div>
                      <div className="text-gray-600">Planning tasks</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-gray-900 text-lg">
                        {timeline.eventDayHighlights?.length || 0}
                      </div>
                      <div className="text-gray-600">Event activities</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        {/* Social Proof & Urgency */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Join 10,000+ Happy Event Hosts
            </h3>
            <p className="text-gray-600">Trusted by thousands across Nigeria</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-sm text-gray-700 font-medium">
                Customer Satisfaction
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Based on 5,000+ reviews
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                5,000+
              </div>
              <div className="text-sm text-gray-700 font-medium">
                Successful Events
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Planned this year
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-700 font-medium">
                Support Available
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Always here to help
              </div>
            </div>
          </div>

          {/* Recent Activity Ticker */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-900">
                🔥 Live Activity
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  Sarah J. booked a Wedding in Lagos -{" "}
                  <span className="text-gray-500">2 hours ago</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  Michael A. booked a Corporate Event in Abuja -{" "}
                  <span className="text-gray-500">4 hours ago</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  Fatima K. booked a Birthday Party in Port Harcourt -{" "}
                  <span className="text-gray-500">6 hours ago</span>
                </span>
              </div>
            </div>
          </div>

          {/* Urgency Alert */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold text-lg">⏰ Limited Time Offer</span>
            </div>
            <p className="text-white/90 mb-4">
              This AI-optimized pricing is valid for{" "}
              <span className="font-bold">7 days only</span>. Lock in these
              rates before they expire!
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              <span>
                ⚡ Only 3 slots left for{" "}
                {formatDate(new Date(eventSummary.eventDate))}
              </span>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-4">
            🎉 Ready to Make Your Event Happen?
          </h2>
          <p className="text-lg mb-6 text-purple-100">
            Sign up now to access full vendor details, save your plan, and start
            booking with exclusive discounts!
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-semibold mb-1">Instant Access</div>
              <div className="text-sm text-purple-100">
                View all vendor details
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-semibold mb-1">Secure Booking</div>
              <div className="text-sm text-purple-100">
                Reserve with 20% deposit
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">📞</div>
              <div className="font-semibold mb-1">Free Consultation</div>
              <div className="text-sm text-purple-100">
                30-min planning session
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold mb-1">Best Price</div>
              <div className="text-sm text-purple-100">
                Guaranteed lowest rates
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              type="button"
              onClick={handleSignUp}
              className="px-10 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 font-bold text-lg flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all"
            >
              🚀 Sign Up Free - Save 20%
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleSaveContinue}
              className="px-10 py-4 bg-purple-700 text-white rounded-xl hover:bg-purple-800 font-bold text-lg border-2 border-white/30 transform hover:scale-105 transition-all"
            >
              💾 Save & Continue Later
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-purple-100">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Access to 1000+ vendors
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Save unlimited events
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
