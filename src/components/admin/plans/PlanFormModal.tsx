"use client";

import { useState, useEffect } from "react";
import { Plan, CreatePlanRequest } from "@/types/plan-admin";
import plansService from "@/services/admin/plans.service";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface PlanFormModalProps {
  plan: Plan | null;
  isEdit: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlanFormModal({
  plan,
  isEdit,
  onClose,
  onSuccess,
}: PlanFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePlanRequest>({
    planType: "planner",
    planName: "",
    displayName: "",
    description: "",
    billingCycle: "monthly",
    pricing: [{ currency: "NGN", amount: 0, amountInMinorUnits: 0 }],
    features: [],
    limitations: [],
    isActive: true,
    isPopular: false,
    sortOrder: 0,
  });

  useEffect(() => {
    if (plan && isEdit) {
      setFormData({
        planType: plan.planType,
        planName: plan.planName,
        displayName: plan.displayName,
        description: plan.description,
        billingCycle: plan.billingCycle,
        pricing: plan.pricing.map((p) => ({
          currency: p.currency,
          amount: p.amount,
          amountInMinorUnits: p.amountInMinorUnits,
        })),
        features: [...plan.features],
        limitations: [...plan.limitations],
        isActive: plan.isActive,
        isPopular: plan.isPopular,
        sortOrder: plan.sortOrder,
      });
    }
  }, [plan, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && plan) {
        const response = await plansService.updatePlan(plan._id, formData);
        toast.success(response.message);
      } else {
        const response = await plansService.createPlan(formData);
        toast.success(response.message);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Error saving plan:", err);
      toast.error(err.response?.data?.message || "Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({ ...formData, features: updatedFeatures });
  };

  const addLimitation = () => {
    setFormData({
      ...formData,
      limitations: [...formData.limitations, ""],
    });
  };

  const removeLimitation = (index: number) => {
    setFormData({
      ...formData,
      limitations: formData.limitations.filter((_, i) => i !== index),
    });
  };

  const updateLimitation = (index: number, value: string) => {
    const updatedLimitations = [...formData.limitations];
    updatedLimitations[index] = value;
    setFormData({ ...formData, limitations: updatedLimitations });
  };

  const updatePricing = (
    field: "amount" | "currency",
    value: string | number
  ) => {
    const amount =
      field === "amount" ? Number(value) : formData.pricing[0].amount;
    const currency =
      field === "currency" ? String(value) : formData.pricing[0].currency;

    setFormData({
      ...formData,
      pricing: [
        {
          currency,
          amount,
          amountInMinorUnits: amount * 100, // Convert to minor units
        },
      ],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Plan" : "Create New Plan"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name (Internal) *
              </label>
              <input
                type="text"
                required
                value={formData.planName}
                onChange={(e) =>
                  setFormData({ ...formData, planName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., professional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Professional"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Type *
              </label>
              <select
                required
                value={formData.planType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    planType: e.target.value as "planner" | "vendor",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="planner">Event Planner</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingCycle: e.target.value as "monthly" | "yearly",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe what this plan offers..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.pricing[0].amount}
                onChange={(e) => updatePricing("amount", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.pricing[0].currency}
                onChange={(e) => updatePricing("currency", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Features</h3>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>

            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Feature description"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Limitations
              </h3>
              <button
                type="button"
                onClick={addLimitation}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Limitation
              </button>
            </div>

            <div className="space-y-2">
              {formData.limitations.map((limitation, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={limitation}
                    onChange={(e) => updateLimitation(index, e.target.value)}
                    placeholder="Limitation description"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeLimitation(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) =>
                    setFormData({ ...formData, isPopular: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Mark as Popular</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
