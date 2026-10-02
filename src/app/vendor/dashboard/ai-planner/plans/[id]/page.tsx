"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Download,
  Share2,
  Edit,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  Star,
  Leaf,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { aiPlannerService, AIEventPlan } from "@/services/ai-planner.service";
import PlanFeedback from "@/components/shared/ai-planner/PlanFeedback";

export default function AIPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<AIEventPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "budget" | "vendors" | "checklist" | "risks"
  >("overview");

  const planId = params.id as string;

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planData = await aiPlannerService.getEventPlan(planId);
        setPlan(planData);
      } catch (error: any) {
        toast.error("Failed to load event plan");
        router.push("/vendor/dashboard/ai-planner");
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, router]);

  const handleExport = async (format: "pdf" | "json") => {
    try {
      const blob = await aiPlannerService.exportPlan(planId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event-plan-${plan?.eventType}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Plan exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to export plan");
    }
  };

  const handleShare = async () => {
    const clientEmail = prompt("Enter client email to share the plan:");
    if (clientEmail) {
      try {
        await aiPlannerService.sharePlan(planId, clientEmail.trim());
        toast.success(`Plan shared with ${clientEmail.trim()}`);
      } catch (error: any) {
        toast.error(error?.message || "Failed to share plan");
      }
    }
  };

  const handleConvertToQuote = async () => {
    const name = prompt("Customer name for the quote:");
    if (!name?.trim()) return;
    const email = prompt("Customer email:");
    if (!email?.trim()) return;
    try {
      const { quoteId } = await aiPlannerService.convertToQuote(planId, {
        name: name.trim(),
        email: email.trim(),
      });
      toast.success("Draft quote created — review prices before sending");
      router.push(`/vendor/dashboard/quotes/${quoteId}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to convert to quote");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const totalBudget = plan.budgetBreakdown.reduce(
    (sum, category) => sum + category.amount,
    0
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/vendor/dashboard/ai-planner"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AI Planner
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {plan.eventType}
              </h1>
              <p className="text-gray-600 mt-1">AI Generated Event Plan</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(plan.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {plan.guestCount} guests
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {plan.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  const menu = document.getElementById("export-menu");
                  menu?.classList.toggle("hidden");
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <div
                id="export-menu"
                className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport("json")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 last:rounded-b-lg"
                >
                  Export as JSON
                </button>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleConvertToQuote}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <FileText className="w-4 h-4" />
              Convert to Quote
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">
              ₦{totalBudget.toLocaleString()}
            </span>
          </div>
          <p className="text-purple-100 mt-2">Total Budget</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{plan.timeline.length}</span>
          </div>
          <p className="text-blue-100 mt-2">Timeline Items</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <Star className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">
              {plan.vendorRecommendations.length}
            </span>
          </div>
          <p className="text-green-100 mt-2">Vendor Categories</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">
              {plan.riskAssessment.length}
            </span>
          </div>
          <p className="text-orange-100 mt-2">Risks Identified</p>
        </div>
      </div>

      <PlanFeedback interactionId={plan.learningInteractionId} className="mb-6" />

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {[
            { key: "overview", label: "Overview", icon: Sparkles },
            { key: "timeline", label: "Timeline", icon: Clock },
            { key: "budget", label: "Budget", icon: DollarSign },
            { key: "vendors", label: "Vendors", icon: Star },
            { key: "checklist", label: "Checklist", icon: CheckCircle },
            { key: "risks", label: "Risk Assessment", icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alternatives */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Alternative Scenarios
              </h3>
              <div className="space-y-4">
                {plan.alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      {alt.scenario}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {alt.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={`font-medium ${
                          alt.budgetImpact > 0
                            ? "text-red-600"
                            : alt.budgetImpact < 0
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        Budget Impact: {alt.budgetImpact > 0 ? "+" : ""}₦
                        {alt.budgetImpact.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-green-700 mb-1">Pros:</p>
                        <ul className="text-gray-600 space-y-1">
                          {alt.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-red-700 mb-1">Cons:</p>
                        <ul className="text-gray-600 space-y-1">
                          {alt.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sustainability (only when the backend assessed it) */}
            {plan.sustainability && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" />
                Sustainability Report
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Sustainability Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${plan.sustainability.score}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-green-600">
                      {plan.sustainability.score}/100
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Carbon Footprint
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plan.sustainability.carbonFootprint} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Recommendations
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plan.sustainability.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Leaf className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Eco-Friendly Options
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {plan.sustainability.ecoFriendlyOptions.map(
                      (option, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                        >
                          {option}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Event Timeline
            </h3>
            <div className="space-y-4">
              {plan.timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {item.time}
                    </div>
                    {index < plan.timeline.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {item.activity}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Duration: {item.duration} minutes
                    </p>
                    {item.notes && (
                      <p className="text-sm text-gray-500 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "budget" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Budget Breakdown
            </h3>
            <div className="space-y-6">
              {plan.budgetBreakdown.map((category, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      {category.category}
                    </h4>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₦{category.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {category.percentage}% of budget
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex-1">
                          <span className="text-gray-700">{item.item}</span>
                          {item.notes && (
                            <span className="text-gray-500 ml-2">
                              ({item.notes})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900">
                            {item.quantity} × ₦{item.cost.toLocaleString()} = ₦
                            {(item.quantity * item.cost).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "vendors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.vendorRecommendations.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.vendors.map((vendor, vendorIndex) => (
                    <div
                      key={vendorIndex}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {vendor.name}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">
                            {vendor.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {vendor.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-purple-600">
                          {vendor.estimatedCost != null
                            ? `₦${vendor.estimatedCost.toLocaleString()}`
                            : "Quote on request"}
                        </span>
                        {vendor.contact && (
                          <span className="text-sm text-gray-500">
                            {vendor.contact}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Event Planning Checklist
            </h3>
            <div className="space-y-6">
              {plan.checklist.map((category, index) => (
                <div key={index}>
                  <h4 className="font-medium text-gray-900 mb-3">
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.tasks.map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          readOnly
                        />
                        <div className="flex-1">
                          <p
                            className={`${
                              task.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {task.task}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>Deadline: {task.deadline}</span>
                            <span
                              className={`px-2 py-1 rounded-full ${
                                task.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {task.priority} priority
                            </span>
                            {task.assignedTo && (
                              <span>Assigned to: {task.assignedTo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "risks" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Risk Assessment & Mitigation
            </h3>
            <div className="space-y-4">
              {plan.riskAssessment.map((risk, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex-1">
                      {risk.risk}
                    </h4>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          risk.probability === "high"
                            ? "bg-red-100 text-red-700"
                            : risk.probability === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {risk.probability} probability
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          risk.impact === "high"
                            ? "bg-red-100 text-red-700"
                            : risk.impact === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {risk.impact} impact
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Mitigation Strategy:
                    </p>
                    <p className="text-sm text-gray-600">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
