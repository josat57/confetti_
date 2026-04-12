"use client";

import { useState } from "react";
import {
  Subscription,
  PaymentHistory,
  SubscriptionChange,
  SubscriptionTier,
} from "@/types/subscription-admin";
import {
  X,
  CreditCard,
  TrendingUp,
  TrendingDown,
  XCircle,
  History,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SubscriptionDetailsModalProps {
  subscription: Subscription;
  payments?: PaymentHistory[];
  changes?: SubscriptionChange[];
  onClose: () => void;
  onUpgrade: (newTier: SubscriptionTier) => void;
  onDowngrade: (newTier: SubscriptionTier) => void;
  onCancel: (reason: string, immediate: boolean) => void;
  onReactivate: () => void;
  onRefund: (paymentId: string, amount: number, reason: string) => void;
}

export default function SubscriptionDetailsModal({
  subscription,
  payments = [],
  changes = [],
  onClose,
  onUpgrade,
  onDowngrade,
  onCancel,
  onReactivate,
  onRefund,
}: SubscriptionDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "details" | "payments" | "history"
  >("details");
  const [showActionModal, setShowActionModal] = useState<
    "upgrade" | "downgrade" | "cancel" | "refund" | null
  >(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("basic");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [refundPaymentId, setRefundPaymentId] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");

  const tiers: SubscriptionTier[] = [
    "free",
    "basic",
    "professional",
    "enterprise",
  ];

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
      disputed: "bg-orange-100 text-orange-800",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const handleAction = () => {
    switch (showActionModal) {
      case "upgrade":
        onUpgrade(selectedTier);
        break;
      case "downgrade":
        onDowngrade(selectedTier);
        break;
      case "cancel":
        if (cancelReason.trim()) {
          onCancel(cancelReason, cancelImmediate);
        }
        break;
      case "refund":
        if (refundReason.trim() && refundPaymentId) {
          onRefund(refundPaymentId, refundAmount, refundReason);
        }
        break;
    }
    setShowActionModal(null);
    resetActionState();
  };

  const resetActionState = () => {
    setSelectedTier("basic");
    setCancelReason("");
    setCancelImmediate(false);
    setRefundPaymentId("");
    setRefundAmount(0);
    setRefundReason("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Subscription Details
              </h2>
              <p className="text-gray-600 mt-1">{subscription.user?.name ?? subscription.user?.email ?? "Deleted User"}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "details"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payments"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Payments ({payments.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Change History ({changes.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Subscription Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Subscription Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tier:</span>
                        <span className="font-medium capitalize">
                          {subscription.tier}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium capitalize">
                          {subscription.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            subscription.price || 0,
                            subscription.currency
                          )}
                          /{subscription.billingCycle}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto Renew:</span>
                        <span className="font-medium">
                          {subscription.autoRenew ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Dates</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">
                          {new Date(
                            subscription.startDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {subscription.renewalDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Renewal Date:</span>
                          <span className="font-medium">
                            {new Date(
                              subscription.renewalDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {subscription.cancelledAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cancelled:</span>
                          <span className="font-medium text-red-600">
                            {new Date(
                              subscription.cancelledAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Usage Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Events</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {subscription.usage.eventsCreated}
                        </span>
                        {subscription.limits?.events && (
                          <span className="text-sm text-gray-600">
                            / {subscription.limits.events}
                          </span>
                        )}
                      </div>
                      {subscription.limits?.events && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (subscription.usage.eventsCreated /
                                  subscription.limits.events) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Photos</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {subscription.usage.photosUploaded}
                        </span>
                        {subscription.limits?.storage && (
                          <span className="text-sm text-gray-600">
                            / {subscription.limits.storage} MB
                          </span>
                        )}
                      </div>
                      {subscription.limits?.storage && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (subscription.usage.photosUploaded /
                                  (subscription.limits?.storage || 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Reset</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-900">
                          {new Date(
                            subscription.usage.lastResetDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {subscription.features && subscription.features.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {subscription.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payment history</p>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadge(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              {payment.transactionId}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-600">Amount</p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(
                                  payment.amount,
                                  payment.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Method</p>
                              <p className="font-medium text-gray-900 capitalize">
                                {payment.paymentMethod.replace(/_/g, " ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Date</p>
                              <p className="font-medium text-gray-900">
                                {payment.paidAt
                                  ? new Date(
                                      payment.paidAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                            {payment.refundedAt && (
                              <div>
                                <p className="text-xs text-gray-600">
                                  Refunded
                                </p>
                                <p className="font-medium text-red-600">
                                  {formatCurrency(
                                    payment.refundAmount || 0,
                                    payment.currency
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                          {payment.failureReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                              {payment.failureReason}
                            </div>
                          )}
                        </div>
                        {payment.status === "paid" && !payment.refundedAt && (
                          <button
                            onClick={() => {
                              setRefundPaymentId(payment._id);
                              setRefundAmount(payment.amount);
                              setShowActionModal("refund");
                            }}
                            className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                {changes.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No change history</p>
                  </div>
                ) : (
                  changes.map((change) => (
                    <div
                      key={change._id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        {change.changeType === "upgrade" ? (
                          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : change.changeType === "downgrade" ? (
                          <TrendingDown className="w-5 h-5 text-orange-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900 capitalize">
                              {change.changeType}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(change.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          {change.fromTier && change.toTier && (
                            <p className="text-sm text-gray-600 mb-1">
                              From{" "}
                              <span className="font-medium capitalize">
                                {change.fromTier}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium capitalize">
                                {change.toTier}
                              </span>
                            </p>
                          )}
                          {change.proratedAmount !== undefined && (
                            <p className="text-sm text-gray-600 mb-1">
                              Prorated Amount:{" "}
                              {formatCurrency(
                                change.proratedAmount,
                                subscription.currency
                              )}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            By: {change.performedBy?.name ?? change.performedBy?.email ?? "Unknown"}
                          </p>
                          {change.reason && (
                            <p className="text-sm text-gray-700 mt-2">
                              Reason: {change.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {subscription.status !== "cancelled" &&
            subscription.status !== "expired" && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                {subscription.status === "active" && (
                  <>
                    <button
                      onClick={() => setShowActionModal("downgrade")}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Downgrade
                    </button>
                    <button
                      onClick={() => setShowActionModal("upgrade")}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Upgrade
                    </button>
                    <button
                      onClick={() => setShowActionModal("cancel")}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {(subscription.status as any) === "cancelled" && (
                  <button
                    onClick={onReactivate}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Action Modals */}
      {(showActionModal === "upgrade" || showActionModal === "downgrade") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {showActionModal} Subscription
            </h3>
            <p className="text-gray-600 mb-4">
              Select the new tier for this subscription:
            </p>

            <select
              value={selectedTier}
              onChange={(e) =>
                setSelectedTier(e.target.value as SubscriptionTier)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            >
              {tiers
                .filter((tier) => tier !== subscription.tier)
                .map((tier) => (
                  <option key={tier} value={tier} className="capitalize">
                    {tier}
                  </option>
                ))}
            </select>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  resetActionState();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showActionModal === "cancel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Subscription
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this subscription:
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              rows={4}
            />

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="immediate"
                checked={cancelImmediate}
                onChange={(e) => setCancelImmediate(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="immediate" className="text-sm text-gray-700">
                Cancel immediately (otherwise cancels at period end)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  resetActionState();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!cancelReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {showActionModal === "refund" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Issue Refund
            </h3>
            <p className="text-gray-600 mb-4">Provide refund details:</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter refund reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  resetActionState();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={!refundReason.trim() || refundAmount <= 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Issue Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
