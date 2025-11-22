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
                Customized plan based on your requirements
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
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Event Planning Timeline
              </h3>
              <span className="text-sm text-gray-600">
                {plan.timeline.length} tasks
              </span>
            </div>
            {plan.timeline.map((item, index) => (
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
                      <h4 className="font-medium text-gray-900">{item.task}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.category}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          priorityColors[item.priority]
                        }`}
                      >
                        {item.priority}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.dueDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === "budget" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recommended Budget Breakdown
              </h3>
              {plan.estimatedTotalCost && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Estimated Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(plan.estimatedTotalCost)}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {plan.budgetBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.category}
                    </h4>
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
            <div className="space-y-6">
              {plan.vendorRecommendations.map((category, index) => (
                <div key={index}>
                  <h4 className="font-medium text-gray-900 mb-3">
                    {category.category}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.vendors.map((vendor, vIndex) => (
                      <div
                        key={vIndex}
                        className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-md transition-all"
                      >
                        <h5 className="font-medium text-gray-900">
                          {vendor.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-700 ml-1">
                              {vendor.rating}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">
                            {vendor.priceRange}
                          </span>
                        </div>
                        {vendor.estimatedCost && (
                          <p className="text-sm font-medium text-teal-600 mt-2">
                            Est. {formatCurrency(vendor.estimatedCost)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
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
              {plan.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
