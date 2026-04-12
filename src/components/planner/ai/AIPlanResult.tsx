"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Star,
  Save,
  Lightbulb,
} from "lucide-react";
import { AIPlanResult as PlanResult } from "@/services/planner/ai-planner.service";

interface AIPlanResultProps {
  plan: PlanResult;
  onSave: () => void;
  saving: boolean;
}

export default function AIPlanResult({
  plan,
  onSave,
  saving,
}: AIPlanResultProps) {
  const [activeTab, setActiveTab] = useState<
    "timeline" | "budget" | "vendors" | "tips"
  >("timeline");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const priorityColors = {
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Your AI-Generated Event Plan
              </h2>
              <p className="text-gray-600">
                {plan.eventSummary.eventType.charAt(0).toUpperCase() +
                  plan.eventSummary.eventType.slice(1)}{" "}
                • {plan.eventSummary.guestCount} guests •{" "}
                {formatCurrency(plan.eventSummary.totalBudget)}
              </p>
            </div>
          </div>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save as Event
              </>
            )}
          </button>
        </div>

        {/* Event Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-medium text-gray-900">
              {plan.eventSummary.location}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium text-gray-900">
              {new Date(plan.eventSummary.eventDate).toLocaleDateString()}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Formality</p>
            <p className="font-medium text-gray-900 capitalize">
              {plan.eventSummary.formality.replace("-", " ")}
            </p>
          </div>
          {plan.aiInsights?.feasibilityScore !== undefined && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Feasibility Score</p>
              <p className="font-medium text-gray-900">
                {plan.aiInsights.feasibilityScore}/100
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6">
          {[
            { id: "timeline", label: "Timeline", icon: Clock },
            { id: "budget", label: "Budget", icon: DollarSign },
            { id: "vendors", label: "Vendors", icon: Users },
            { id: "tips", label: "Tips", icon: Lightbulb },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            {/* Planning Milestones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Planning Milestones
              </h3>
              <div className="space-y-3">
                {plan.timeline.planningMilestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-teal-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {milestone.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                            {milestone.timeframe}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Day Schedule */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Day Schedule
              </h3>
              <div className="space-y-2">
                {plan.timeline.eventDayHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-teal-600">
                      {highlight.time}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{highlight.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === "budget" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recommended Budget Breakdown
              </h3>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Allocated</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(plan.budgetBreakdown.totalAllocated)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Contingency:{" "}
                  {formatCurrency(plan.budgetBreakdown.contingency)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {plan.budgetBreakdown.categories.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {item.percentage}%
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </p>
                    {item.confidence !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.confidence}% confidence
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === "vendors" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommended Vendor Categories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.vendorCategories.map((category, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {category.name}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        category.priority === "essential"
                          ? "bg-red-100 text-red-800"
                          : category.priority === "recommended"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(category.estimatedCost.min)} -{" "}
                        {formatCurrency(category.estimatedCost.max)}
                      </span>
                    </div>
                    {category.allocatedAmount !== undefined &&
                      category.allocatedAmount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Allocated Budget:
                          </span>
                          <span className="font-medium text-teal-600">
                            {formatCurrency(category.allocatedAmount)}
                          </span>
                        </div>
                      )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Vendors Available:</span>
                      <span className="font-medium text-gray-900">
                        {category.vendorCount}
                      </span>
                    </div>
                  </div>
                  {category.locked && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 italic">
                        🔒 Unlock full vendor details by saving this plan
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === "tips" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI Planning Tips & Recommendations
            </h3>
            <div className="space-y-3">
              {plan.recommendations.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            {plan.aiInsights && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.aiInsights.sentiment && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Sentiment</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {plan.aiInsights.sentiment.label} (
                        {Math.round(plan.aiInsights.sentiment.score * 100)}%)
                      </p>
                    </div>
                  )}
                  {plan.aiInsights.budgetLevel && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Budget Level</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {plan.aiInsights.budgetLevel}
                      </p>
                    </div>
                  )}
                  {plan.aiInsights.feasibilityScore !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Feasibility Score
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full"
                            style={{
                              width: `${plan.aiInsights.feasibilityScore}%`,
                            }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">
                          {plan.aiInsights.feasibilityScore}/100
                        </span>
                      </div>
                    </div>
                  )}
                  {plan.aiInsights.keywords &&
                    plan.aiInsights.keywords.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                        <p className="text-sm text-gray-600 mb-2">Keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.aiInsights.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
