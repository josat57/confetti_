"use client";

import { useState, useEffect } from "react";
import { Plan, PlanType } from "@/types/plan-admin";
import plansService from "@/services/admin/plans.service";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Package,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import PlanFormModal from "@/components/admin/plans/PlanFormModal";
import PlanDetailsModal from "@/components/admin/plans/PlanDetailsModal";

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    planType: "" as PlanType | "",
    isActive: "" as "" | "true" | "false",
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [filters]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await plansService.getPlans({
        planType: filters.planType || undefined,
        isActive:
          filters.isActive === "" ? undefined : filters.isActive === "true",
      });
      setPlans(response.plans);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setEditMode(false);
    setShowFormModal(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setEditMode(true);
    setShowFormModal(true);
  };

  const handleViewPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  const handleDuplicatePlan = async (plan: Plan) => {
    try {
      const response = await plansService.duplicatePlan(plan._id);
      toast.success(response.message);
      fetchPlans();
    } catch (err: any) {
      console.error("Error duplicating plan:", err);
      toast.error("Failed to duplicate plan");
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      const response = await plansService.togglePlanStatus(
        plan._id,
        !plan.isActive
      );
      toast.success(response.message);
      fetchPlans();
    } catch (err: any) {
      console.error("Error toggling plan status:", err);
      toast.error("Failed to update plan status");
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (
      !confirm(
        `Are you sure you want to delete the "${plan.displayName}" plan? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await plansService.deletePlan(plan._id);
      toast.success(response.message);
      fetchPlans();
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      toast.error("Failed to delete plan");
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Plan Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage subscription plans
            </p>
          </div>

          <button
            onClick={handleCreatePlan}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={filters.planType}
            onChange={(e) =>
              setFilters({
                ...filters,
                planType: e.target.value as PlanType | "",
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Plan Types</option>
            <option value="planner">Event Planner</option>
            <option value="vendor">Vendor</option>
          </select>

          <select
            value={filters.isActive}
            onChange={(e) =>
              setFilters({
                ...filters,
                isActive: e.target.value as "" | "true" | "false",
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Plans Found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first subscription plan
            </p>
            <button
              onClick={handleCreatePlan}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Plan
            </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                !plan.isActive ? "opacity-60" : ""
              } ${plan.isPopular ? "ring-2 ring-purple-500" : ""}`}
            >
              {plan.isPopular && (
                <div className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-t-lg text-center">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.displayName}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                      {plan.planType}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className={`p-2 rounded-lg transition-colors ${
                      plan.isActive
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={plan.isActive ? "Active" : "Inactive"}
                  >
                    {plan.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.pricing && plan.pricing.length > 0
                        ? formatCurrency(
                            plan.pricing[0].amount,
                            plan.pricing[0].currency
                          )
                        : "Free"}
                    </span>
                    <span className="text-gray-600">/{plan.billingCycle}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {plan.description}
                </p>

                {/* Key Features */}
                <div className="space-y-2 mb-4">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <p className="text-xs text-gray-500 ml-3.5">
                      +{plan.features.length - 3} more features
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewPlan(plan)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicatePlan(plan)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <PlanFormModal
          plan={selectedPlan}
          isEdit={editMode}
          onClose={() => {
            setShowFormModal(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => {
            setShowFormModal(false);
            setSelectedPlan(null);
            fetchPlans();
          }}
        />
      )}

      {showDetailsModal && selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPlan(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            handleEditPlan(selectedPlan);
          }}
        />
      )}
    </div>
  );
}
