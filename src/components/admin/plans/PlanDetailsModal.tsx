"use client";

import { Plan } from "@/types/plan-admin";
import { X, Check, Edit, XCircle } from "lucide-react";

interface PlanDetailsModalProps {
  plan: Plan;
  onClose: () => void;
  onEdit: () => void;
}

export default function PlanDetailsModal({
  plan,
  onClose,
  onEdit,
}: PlanDetailsModalProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {plan.displayName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                {plan.planType}
              </span>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  plan.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {plan.isActive ? "Active" : "Inactive"}
              </span>
              {plan.isPopular && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  Popular
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Pricing
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
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
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Description
            </h3>
            <p className="text-gray-700">{plan.description}</p>
          </div>

          {/* Pricing Details */}
          {plan.pricing && plan.pricing.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Pricing Options
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.pricing.map((price, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">{price.currency}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(price.amount, price.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Features
            </h3>
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-900">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations */}
          {plan.limitations && plan.limitations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Limitations
              </h3>
              <div className="space-y-2">
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{limitation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Sort Order</p>
                <p className="font-medium text-gray-900">{plan.sortOrder}</p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Plan
          </button>
        </div>
      </div>
    </div>
  );
}
