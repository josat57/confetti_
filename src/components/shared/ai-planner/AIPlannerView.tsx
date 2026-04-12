"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  MessageSquare,
  Download,
  Share2,
  Clock,
  DollarSign,
  Users,
  MapPin,
  Calendar,
  Star,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Eye,
  RefreshCw,
  Wand2,
  Target,
  TrendingUp,
  BarChart3,
  Heart,
  Gift,
  Briefcase,
  GraduationCap,
  Zap,
} from "lucide-react";
import { AIEventPlan } from "@/services/ai-planner.service";
import aiPlannerService from "@/services/ai-planner.service";

interface AIPlannerViewProps {
  plan: AIEventPlan;
  userType: "admin" | "planner" | "vendor";
  onEdit: () => void;
  onChat: () => void;
  onBack: () => void;
  onPlanUpdated: (plan: AIEventPlan) => void;
  className?: string;
}

const eventTypeIcons = {
  wedding: Heart,
  corporate: Briefcase,
  birthday: Gift,
  conference: Users,
  graduation: GraduationCap,
  anniversary: Heart,
  baby_shower: Gift,
  engagement: Heart,
  fundraiser: Target,
  product_launch: Zap,
};

const eventTypeColors = {
  wedding: "bg-pink-500",
  corporate: "bg-gray-500",
  birthday: "bg-blue-500",
  conference: "bg-indigo-500",
  graduation: "bg-green-500",
  anniversary: "bg-purple-500",
  baby_shower: "bg-yellow-500",
  engagement: "bg-rose-500",
  fundraiser: "bg-orange-500",
  product_launch: "bg-cyan-500",
};

const severityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusColors = {
  success: "bg-green-100 text-green-800",
  failure: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
};

export default function AIPlannerView({
  plan,
  userType,
  onEdit,
  onChat,
  onBack,
  onPlanUpdated,
  className = "",
}: AIPlannerViewProps) {
  const [enhancing, setEnhancing] = useState(false);
  const [enhancementType, setEnhancementType] = useState<string>("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeIcon = () => {
    const Icon =
      eventTypeIcons[plan.eventType as keyof typeof eventTypeIcons] || Calendar;
    return Icon;
  };

  const getEventTypeColor = () => {
    return (
      eventTypeColors[plan.eventType as keyof typeof eventTypeColors] ||
      "bg-gray-500"
    );
  };

  const handleQuickEnhancement = async (type: string, prompt: string) => {
    setEnhancing(true);
    setEnhancementType(type);

    try {
      const enhancedPlan = await aiPlannerService.refinePlan(
        plan.id,
        prompt,
        type as any
      );
      onPlanUpdated(enhancedPlan);
    } catch (error) {
      console.error("Failed to enhance plan:", error);
      alert("Failed to enhance plan. Please try again.");
    } finally {
      setEnhancing(false);
      setEnhancementType("");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await aiPlannerService.exportPlan(plan.id, "pdf");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${plan.eventType}-plan-${plan.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export plan:", error);
      alert("Export feature coming soon!");
    }
  };

  const handleShare = async () => {
    try {
      await aiPlannerService.sharePlan(
        plan.id,
        "client@example.com",
        "Here's your event plan!"
      );
      alert("Plan shared successfully!");
    } catch (error) {
      console.error("Failed to share plan:", error);
      alert("Share feature coming soon!");
    }
  };

  const Icon = getEventTypeIcon();
  const colorClass = getEventTypeColor();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 mb-6 lg:mb-8"
        >
          {/* Back Button and Title Section */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors self-start"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Back
            </button>

            <div className="flex items-start space-x-3 sm:space-x-4">
              <div
                className={`p-2 sm:p-3 ${colorClass} rounded-xl flex-shrink-0`}
              >
                <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent capitalize leading-tight">
                  {plan.eventType.replace("_", " ")} Event Plan
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {plan.guestCount} guests
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />₦
                    {plan.budget.toLocaleString()}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(plan.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:flex-wrap sm:gap-2 lg:gap-3">
            <button
              onClick={onEdit}
              className="flex items-center justify-center px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              <span>Edit Plan</span>
            </button>

            <button
              onClick={onChat}
              className="flex items-center justify-center px-3 sm:px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>Chat with AI</span>
            </button>

            <div className="flex space-x-2 sm:contents">
              <button
                onClick={handleExport}
                className="flex items-center justify-center px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline sm:hidden md:inline">
                  Export
                </span>
                <span className="xs:hidden sm:inline md:hidden">PDF</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center px-3 sm:px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium flex-1 sm:flex-none"
              >
                <Share2 className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline sm:hidden md:inline">
                  Share
                </span>
                <span className="xs:hidden sm:inline md:hidden">Link</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Enhancement Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-6 lg:mb-8"
        >
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Quick AI Enhancements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <button
              onClick={() =>
                handleQuickEnhancement(
                  "timeline",
                  "Add more detailed timeline activities and optimize the schedule"
                )
              }
              disabled={enhancing}
              className="flex flex-col items-center justify-center px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs sm:text-sm min-h-[60px] sm:min-h-[70px]"
            >
              {enhancing && enhancementType === "timeline" ? (
                <RefreshCw className="h-4 w-4 mb-1 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mb-1" />
              )}
              <span className="text-center leading-tight">
                <span className="hidden sm:inline">Enhance </span>Timeline
              </span>
            </button>

            <button
              onClick={() =>
                handleQuickEnhancement(
                  "budget",
                  "Optimize budget allocation and suggest cost-saving opportunities"
                )
              }
              disabled={enhancing}
              className="flex flex-col items-center justify-center px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs sm:text-sm min-h-[60px] sm:min-h-[70px]"
            >
              {enhancing && enhancementType === "budget" ? (
                <RefreshCw className="h-4 w-4 mb-1 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4 mb-1" />
              )}
              <span className="text-center leading-tight">
                <span className="hidden sm:inline">Optimize </span>Budget
              </span>
            </button>

            <button
              onClick={() =>
                handleQuickEnhancement(
                  "vendors",
                  "Find additional vendor recommendations and alternatives"
                )
              }
              disabled={enhancing}
              className="flex flex-col items-center justify-center px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs sm:text-sm min-h-[60px] sm:min-h-[70px]"
            >
              {enhancing && enhancementType === "vendors" ? (
                <RefreshCw className="h-4 w-4 mb-1 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mb-1" />
              )}
              <span className="text-center leading-tight">
                <span className="hidden sm:inline">More </span>Vendors
              </span>
            </button>

            <button
              onClick={() =>
                handleQuickEnhancement(
                  "sustainability",
                  "Improve sustainability and eco-friendly options"
                )
              }
              disabled={enhancing}
              className="flex flex-col items-center justify-center px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs sm:text-sm min-h-[60px] sm:min-h-[70px]"
            >
              {enhancing && enhancementType === "sustainability" ? (
                <RefreshCw className="h-4 w-4 mb-1 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4 mb-1" />
              )}
              <span className="text-center leading-tight">
                Eco<span className="hidden sm:inline">-Friendly</span>
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
            >
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600 mr-2 lg:mr-3" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Event Timeline
                  </h2>
                </div>
                <button
                  onClick={() =>
                    handleQuickEnhancement(
                      "timeline",
                      "Add more activities and optimize timing"
                    )
                  }
                  className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Enhance Timeline"
                >
                  <Wand2 className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
              </div>
              <div className="space-y-3 lg:space-y-4">
                {plan.timeline && plan.timeline.length > 0 ? (
                  plan.timeline.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-shrink-0 w-12 sm:w-16 text-center">
                        <div className="text-xs sm:text-sm font-semibold text-purple-600">
                          {item.time}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.duration}h
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {item.activity}
                        </h3>
                        {item.notes && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 lg:py-8 text-gray-500">
                    <Clock className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 text-gray-300" />
                    <p className="text-sm lg:text-base">
                      Timeline will be generated with AI enhancement
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Budget Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
            >
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-green-600 mr-2 lg:mr-3" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Budget Breakdown
                  </h2>
                </div>
                <button
                  onClick={() =>
                    handleQuickEnhancement(
                      "budget",
                      "Optimize budget allocation and find savings"
                    )
                  }
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                  title="Optimize Budget"
                >
                  <Wand2 className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
              </div>
              <div className="space-y-4 lg:space-y-6">
                {plan.budgetBreakdown && plan.budgetBreakdown.length > 0 ? (
                  plan.budgetBreakdown.map((category, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 lg:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 lg:mb-4 space-y-2 sm:space-y-0">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                          {category.category}
                        </h3>
                        <div className="text-left sm:text-right">
                          <div className="text-base lg:text-lg font-bold text-green-600">
                            ₦{category.amount.toLocaleString()}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-500">
                            {category.percentage}% of budget
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {category.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex justify-between items-center text-xs lg:text-sm py-1"
                          >
                            <span className="text-gray-600 flex-1 pr-2">
                              {item.item}{" "}
                              {item.quantity > 1 && `(${item.quantity}x)`}
                            </span>
                            <span className="font-medium text-gray-900 flex-shrink-0">
                              ₦{item.cost.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 lg:py-8 text-gray-500">
                    <DollarSign className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 text-gray-300" />
                    <p className="text-sm lg:text-base">
                      Budget breakdown will be generated with AI enhancement
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Vendor Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
            >
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center">
                  <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 mr-2 lg:mr-3" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Recommended Vendors
                  </h2>
                </div>
                <button
                  onClick={() =>
                    handleQuickEnhancement(
                      "vendors",
                      "Find more vendor options and alternatives"
                    )
                  }
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Find More Vendors"
                >
                  <Wand2 className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
              </div>
              <div className="space-y-4 lg:space-y-6">
                {plan.vendorRecommendations &&
                plan.vendorRecommendations.length > 0 ? (
                  plan.vendorRecommendations.map((category, index) => (
                    <div key={index}>
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                        {category.category}
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                        {category.vendors.map((vendor, vendorIndex) => (
                          <div
                            key={vendorIndex}
                            className="border border-gray-200 rounded-xl p-3 lg:p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                              <h4 className="font-semibold text-gray-900 text-sm lg:text-base">
                                {vendor.name}
                              </h4>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400 mr-1" />
                                <span className="text-xs lg:text-sm font-medium">
                                  {vendor.rating}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 mb-2 lg:mb-3 line-clamp-2">
                              {vendor.description}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                              <span className="text-sm lg:text-base font-medium text-green-600">
                                ₦{vendor.estimatedCost.toLocaleString()}
                              </span>
                              {vendor.contact && (
                                <span className="text-xs text-gray-500 truncate">
                                  {vendor.contact}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 lg:py-8 text-gray-500">
                    <Users className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 text-gray-300" />
                    <p className="text-sm lg:text-base">
                      Vendor recommendations will be generated with AI
                      enhancement
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Plan Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
            >
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                Plan Overview
              </h3>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm lg:text-base text-gray-600">
                    Event Date
                  </span>
                  <span className="text-sm lg:text-base font-medium">
                    {formatDate(plan.date)}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm lg:text-base text-gray-600">
                    Location
                  </span>
                  <span className="text-sm lg:text-base font-medium text-right max-w-[60%] break-words">
                    {plan.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm lg:text-base text-gray-600">
                    Total Budget
                  </span>
                  <span className="text-sm lg:text-base font-bold text-green-600">
                    ₦{plan.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm lg:text-base text-gray-600">
                    Guest Count
                  </span>
                  <span className="text-sm lg:text-base font-medium">
                    {plan.guestCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm lg:text-base text-gray-600">
                    Created
                  </span>
                  <span className="text-sm lg:text-base font-medium">
                    {formatDate(plan.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm lg:text-base text-gray-600">
                    Last Updated
                  </span>
                  <span className="text-sm lg:text-base font-medium">
                    {formatDate(plan.updatedAt)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Sustainability Score */}
            {plan.sustainability && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sustainability
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickEnhancement(
                        "sustainability",
                        "Improve eco-friendly options and sustainability"
                      )
                    }
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <Wand2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600">
                    {plan.sustainability.score}/100
                  </div>
                  <div className="text-sm text-gray-600">
                    Eco-Friendly Score
                  </div>
                </div>
                <div className="space-y-2">
                  {plan.sustainability.recommendations
                    .slice(0, 3)
                    .map((rec, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 flex items-start"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {rec}
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Risk Assessment */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk Assessment
                </h3>
              </div>
              <div className="space-y-3">
                {plan.riskAssessment && plan.riskAssessment.length > 0 ? (
                  plan.riskAssessment.slice(0, 3).map((risk, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-orange-400 pl-4"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {risk.risk}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {risk.mitigation}
                      </div>
                      <div className="flex items-center mt-2 space-x-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            severityColors[risk.probability]
                          }`}
                        >
                          {risk.probability} probability
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            severityColors[risk.impact]
                          }`}
                        >
                          {risk.impact} impact
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Risk assessment will be generated with AI enhancement
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6"
            >
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2 lg:space-y-3">
                <button
                  onClick={onChat}
                  className="w-full flex items-center justify-center px-4 py-2.5 lg:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base font-medium"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with AI
                </button>
                <button
                  onClick={onEdit}
                  className="w-full flex items-center justify-center px-4 py-2.5 lg:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base font-medium"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Plan
                </button>
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center justify-center px-3 py-2 lg:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm font-medium"
                  >
                    <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center px-3 py-2 lg:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm font-medium"
                  >
                    <Share2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
