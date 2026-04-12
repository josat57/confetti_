"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  Star,
  Edit3,
  MessageSquare,
  Eye,
  Trash2,
  Download,
  Share2,
  Sparkles,
  TrendingUp,
  BarChart3,
  Zap,
  Heart,
  Briefcase,
  Gift,
  GraduationCap,
  Target,
  ChevronDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { AIEventPlan } from "@/services/ai-planner.service";
import aiPlannerService from "@/services/ai-planner.service";
import { useAuth } from "@/contexts/AuthContext";
import AIPlannerForm from "./AIPlannerForm";
import AIPlannerView from "./AIPlannerView";
import AIPlannerChat from "./AIPlannerChat";

interface AIPlannerHubProps {
  userType: "admin" | "planner" | "vendor";
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

export default function AIPlannerHub({
  userType,
  className = "",
}: AIPlannerHubProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<
    "hub" | "create" | "view" | "chat"
  >("hub");
  const [selectedPlan, setSelectedPlan] = useState<AIEventPlan | null>(null);
  const [plans, setPlans] = useState<AIEventPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "budget" | "updated">(
    "updated"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = viewMode === "grid" ? 9 : 10;

  useEffect(() => {
    loadPlans();
  }, [currentPage, searchTerm, filterType, sortBy, sortOrder]);

  useEffect(() => {
    // Load recent plans on initial mount
    loadRecentPlans();
  }, []);

  const loadRecentPlans = async () => {
    try {
      setLoading(true);
      const recentPlans = await aiPlannerService.getRecentPlans({
        limit: 5,
        includeArchived: false,
      });
      setPlans(recentPlans);
      setTotal(recentPlans.length);
      setTotalPages(1);
    } catch (error: any) {
      console.error("Failed to load recent plans:", error);

      // If it's an authentication error, don't try to load more data
      if (error?.response?.status === 401) {
        const errorMessage = error?.response?.data?.message || "";
        if (
          errorMessage.includes("User no longer exists") ||
          errorMessage.includes("Invalid token") ||
          errorMessage.includes("User not found")
        ) {
          // Don't try fallback, let the auth system handle it
          setPlans([]);
          setTotal(0);
          setTotalPages(0);
          return;
        }
      }

      // Fallback to regular plans loading for other errors
      loadPlans();
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await aiPlannerService.getEventPlans({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        eventType: filterType || undefined,
        sortBy,
        sortOrder,
      });

      setPlans(response.plans);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error("Failed to load plans:", error);

      // If it's an authentication error, clear the plans
      if (error?.response?.status === 401) {
        const errorMessage = error?.response?.data?.message || "";
        if (
          errorMessage.includes("User no longer exists") ||
          errorMessage.includes("Invalid token") ||
          errorMessage.includes("User not found")
        ) {
          setPlans([]);
          setTotal(0);
          setTotalPages(0);
          return;
        }
      }

      // For other errors, set empty state but don't crash
      setPlans([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setCurrentView("create");
  };

  const handleViewPlan = (plan: AIEventPlan) => {
    setSelectedPlan(plan);
    setCurrentView("view");
  };

  const handleEditPlan = (plan: AIEventPlan) => {
    setSelectedPlan(plan);
    setCurrentView("create");
  };

  const handleChatWithPlan = (plan: AIEventPlan) => {
    setSelectedPlan(plan);
    setCurrentView("chat");
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await aiPlannerService.deleteEventPlan(planId);
        loadPlans();
      } catch (error) {
        console.error("Failed to delete plan:", error);
        alert("Failed to delete plan. Please try again.");
      }
    }
  };

  const handlePlanCreated = (newPlan: AIEventPlan) => {
    setPlans([newPlan, ...plans]);
    setSelectedPlan(newPlan);
    setCurrentView("view");
  };

  const handlePlanUpdated = (updatedPlan: AIEventPlan) => {
    setPlans(plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    setSelectedPlan(updatedPlan);
    if (currentView === "chat") {
      // Stay in chat view if we're chatting
      return;
    }
    setCurrentView("view");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEventTypeIcon = (eventType: string) => {
    const Icon =
      eventTypeIcons[eventType as keyof typeof eventTypeIcons] || Calendar;
    return Icon;
  };

  const getEventTypeColor = (eventType: string) => {
    return (
      eventTypeColors[eventType as keyof typeof eventTypeColors] ||
      "bg-gray-500"
    );
  };

  const filteredAndSortedPlans = plans.filter((plan) => {
    const matchesSearch =
      !searchTerm ||
      (plan.eventType?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (plan.location?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());

    const matchesFilter = !filterType || plan.eventType === filterType;

    return matchesSearch && matchesFilter;
  });

  if (currentView === "create") {
    return (
      <AIPlannerForm
        userType={userType}
        existingPlan={selectedPlan}
        onPlanCreated={handlePlanCreated}
        onPlanUpdated={handlePlanUpdated}
        onBack={() => setCurrentView("hub")}
        className={className}
      />
    );
  }

  if (currentView === "view" && selectedPlan) {
    return (
      <AIPlannerView
        plan={selectedPlan}
        userType={userType}
        onEdit={() => handleEditPlan(selectedPlan)}
        onChat={() => handleChatWithPlan(selectedPlan)}
        onBack={() => setCurrentView("hub")}
        onPlanUpdated={handlePlanUpdated}
        className={className}
      />
    );
  }

  if (currentView === "chat" && selectedPlan) {
    return (
      <AIPlannerChat
        plan={selectedPlan}
        userType={userType}
        onPlanUpdated={handlePlanUpdated}
        onBack={() => setCurrentView("hub")}
        className={className}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6 lg:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl mr-3 sm:mr-4">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Event Planner
                </h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
                  Create, manage, and enhance your event plans with AI
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end">
            <button
              onClick={handleCreatePlan}
              className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Create New Plan
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8"
        >
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Total Plans
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  This Month
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {
                    plans.filter(
                      (p) =>
                        new Date(p.createdAt).getMonth() ===
                        new Date().getMonth()
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  Avg Budget
                </p>
                <p className="text-sm lg:text-2xl font-bold text-gray-900 truncate">
                  ₦
                  {plans.length > 0
                    ? Math.round(
                        plans.reduce((sum, p) => sum + p.budget, 0) /
                          plans.length
                      ).toLocaleString()
                    : "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 bg-orange-100 rounded-full">
                <Sparkles className="h-4 w-4 lg:h-6 lg:w-6 text-orange-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">
                  AI Enhanced
                </p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {
                    plans.filter(
                      (p) => new Date(p.updatedAt) > new Date(p.createdAt)
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8"
        >
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 lg:max-w-md">
              <div className="relative">
                <Search className="h-4 w-4 lg:h-5 lg:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm lg:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={
                  "flex items-center justify-center px-4 py-3 border rounded-xl transition-colors text-sm font-medium " +
                  (showFilters
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50")
                }
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>

              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={
                    "p-3 flex-1 sm:flex-none transition-colors " +
                    (viewMode === "grid"
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-50")
                  }
                >
                  <Grid3X3 className="h-4 w-4 mx-auto" />
                </button>
                <div className="w-px bg-gray-300"></div>
                <button
                  onClick={() => setViewMode("list")}
                  className={
                    "p-3 flex-1 sm:flex-none transition-colors " +
                    (viewMode === "list"
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-50")
                  }
                >
                  <List className="h-4 w-4 mx-auto" />
                </button>
              </div>

              <div className="relative min-w-0 flex-1 sm:flex-none sm:min-w-[180px]">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 w-full text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="updated-desc">Recently Updated</option>
                  <option value="date-desc">Event Date (Newest)</option>
                  <option value="date-asc">Event Date (Oldest)</option>
                  <option value="budget-desc">Budget (High to Low)</option>
                  <option value="budget-asc">Budget (Low to High)</option>
                </select>
                <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-3">
                  <button
                    onClick={() => setFilterType("")}
                    className={
                      "px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm transition-colors " +
                      (filterType === ""
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                    }
                  >
                    All Types
                  </button>
                  {Object.keys(eventTypeIcons).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={
                        "px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm transition-colors capitalize " +
                        (filterType === type
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                      }
                    >
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Plans Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedPlans.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Plans Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterType
                  ? "Try adjusting your search or filters"
                  : "Create your first AI-powered event plan"}
              </p>
              <button
                onClick={handleCreatePlan}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Plan
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filteredAndSortedPlans.map((plan, index) => {
                const Icon = getEventTypeIcon(plan.eventType);
                const colorClass = getEventTypeColor(plan.eventType);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className={`h-2 ${colorClass}`}></div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center min-w-0 flex-1">
                          <div
                            className={`p-2 sm:p-2.5 ${colorClass} rounded-lg mr-3 flex-shrink-0`}
                          >
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 capitalize text-sm sm:text-base truncate">
                              {(plan.eventType ?? "").replace("_", " ")}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                              {formatDate(plan.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewPlan(plan)}
                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                            title="View Plan"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Edit Plan"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleChatWithPlan(plan)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                            title="Chat with AI"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5 sm:space-y-3 mb-4">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2.5 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{plan.location}</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2.5 flex-shrink-0 text-gray-400" />
                          <span>{plan.guestCount} guests</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2.5 flex-shrink-0 text-gray-400" />
                          <span className="truncate font-medium text-green-600">
                            ₦{plan.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500 min-w-0 flex-1">
                          <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                          <span className="truncate">
                            Updated {formatDate(plan.updatedAt)}
                          </span>
                        </div>
                        {new Date(plan.updatedAt) >
                          new Date(plan.createdAt) && (
                          <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full ml-2 flex-shrink-0">
                            <Sparkles className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline font-medium">
                              AI Enhanced
                            </span>
                            <span className="sm:hidden font-medium">AI</span>
                          </div>
                        )}
                      </div>

                      {/* Mobile Action Buttons */}
                      <div className="flex items-center space-x-2 mt-4 sm:hidden">
                        <button
                          onClick={() => handleViewPlan(plan)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Edit3 className="h-3 w-3 mr-1.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleChatWithPlan(plan)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                        >
                          <MessageSquare className="h-3 w-3 mr-1.5" />
                          Chat
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg overflow-hidden">
              {/* Mobile List View */}
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-200">
                  {filteredAndSortedPlans.map((plan) => {
                    const Icon = getEventTypeIcon(plan.eventType);
                    const colorClass = getEventTypeColor(plan.eventType);

                    return (
                      <div key={plan.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 ${colorClass} rounded-lg flex-shrink-0`}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900 capitalize truncate">
                                {(plan.eventType ?? "").replace("_", " ")}
                              </h3>
                              {new Date(plan.updatedAt) >
                                new Date(plan.createdAt) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
                                {formatDate(plan.date)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1.5 text-gray-400" />
                                <span className="truncate">
                                  {plan.location}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1.5 text-gray-400" />
                                  {plan.guestCount} guests
                                </div>
                                <div className="flex items-center font-medium text-green-600">
                                  <DollarSign className="h-3 w-3 mr-1" />₦
                                  {plan.budget.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              <button
                                onClick={() => handleViewPlan(plan)}
                                className="flex-1 flex items-center justify-center px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md text-xs font-medium hover:bg-purple-100 transition-colors"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleEditPlan(plan)}
                                className="flex-1 flex items-center justify-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleChatWithPlan(plan)}
                                className="flex-1 flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-600 rounded-md text-xs font-medium hover:bg-green-100 transition-colors"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Location
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget & Guests
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedPlans.map((plan) => {
                      const Icon = getEventTypeIcon(plan.eventType);
                      const colorClass = getEventTypeColor(plan.eventType);

                      return (
                        <tr
                          key={plan.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className={`p-2 ${colorClass} rounded-lg mr-3 flex-shrink-0`}
                              >
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 capitalize truncate">
                                  {(plan.eventType ?? "").replace("_", " ")}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Created {formatDate(plan.createdAt)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(plan.date)}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {plan.location}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ₦{plan.budget.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {plan.guestCount} guests
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            {new Date(plan.updatedAt) >
                            new Date(plan.createdAt) ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Enhanced
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Original
                              </span>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-1 lg:space-x-2">
                              <button
                                onClick={() => handleViewPlan(plan)}
                                className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Plan"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditPlan(plan)}
                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Plan"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleChatWithPlan(plan)}
                                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                                title="Chat with AI"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePlan(plan.id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Plan"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between mt-6 lg:mt-8 space-y-4 sm:space-y-0"
          >
            <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, total)} of {total} plans
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={
                      "px-2 sm:px-3 py-2 border text-xs sm:text-sm font-medium rounded-lg " +
                      (currentPage === page
                        ? "border-purple-500 bg-purple-50 text-purple-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50")
                    }
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
