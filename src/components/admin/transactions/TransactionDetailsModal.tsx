"use client";

import { useState } from "react";
import { TransactionDetails } from "@/types/transaction-admin";
import {
  X,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TransactionDetailsModalProps {
  transaction: TransactionDetails;
  onClose: () => void;
  onRefund: (amount: number, reason: string) => void;
  onMarkDisputed: (reason: string) => void;
  onResolveDispute: (resolution: string, refundAmount?: number) => void;
  onRetry: () => void;
}

export default function TransactionDetailsModal({
  transaction,
  onClose,
  onRefund,
  onMarkDisputed,
  onResolveDispute,
  onRetry,
}: TransactionDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "details" | "refunds" | "disputes"
  >("details");
  const [showActionModal, setShowActionModal] = useState<
    "refund" | "dispute" | "resolve" | null
  >(null);
  const [refundAmount, setRefundAmount] = useState(transaction.amount);
  const [refundReason, setRefundReason] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [resolveRefundAmount, setResolveRefundAmount] = useState(0);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAction = () => {
    switch (showActionModal) {
      case "refund":
        if (refundReason.trim() && refundAmount > 0) {
          onRefund(refundAmount, refundReason);
        }
        break;
      case "dispute":
        if (disputeReason.trim()) {
          onMarkDisputed(disputeReason);
        }
        break;
      case "resolve":
        if (resolution.trim()) {
          onResolveDispute(resolution, resolveRefundAmount || undefined);
        }
        break;
    }
    setShowActionModal(null);
    resetActionState();
  };

  const resetActionState = () => {
    setRefundAmount(transaction.amount);
    setRefundReason("");
    setDisputeReason("");
    setResolution("");
    setResolveRefundAmount(0);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Transaction Details
              </h2>
              <p className="text-gray-600 mt-1">{transaction.transactionId}</p>
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
                onClick={() => setActiveTab("refunds")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "refunds"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Refunds ({transaction.refundHistory.length})
              </button>
              <button
                onClick={() => setActiveTab("disputes")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "disputes"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Disputes ({transaction.disputeHistory.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Transaction Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium">
                          {transaction.transactionId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium capitalize">
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">
                          {transaction.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gateway:</span>
                        <span className="font-medium capitalize">
                          {transaction.gateway}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium capitalize">
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      User Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {transaction.user.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">
                          {transaction.user.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium capitalize">
                          {transaction.user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Dates</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {transaction.completedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="font-medium">
                          {new Date(transaction.completedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {transaction.failedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Failed</p>
                        <p className="font-medium text-red-600">
                          {new Date(transaction.failedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {transaction.refundedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Refunded</p>
                        <p className="font-medium text-red-600">
                          {new Date(transaction.refundedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">{transaction.description}</p>
                </div>

                {/* Gateway Response */}
                {transaction.gatewayResponse && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Gateway Response
                    </h3>
                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-48">
                      {JSON.stringify(transaction.gatewayResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Metadata */}
                {transaction.metadata &&
                  Object.keys(transaction.metadata).length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Metadata
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(transaction.metadata).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="font-medium">
                                {String(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {activeTab === "refunds" && (
              <div className="space-y-4">
                {transaction.refundHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No refunds issued</p>
                  </div>
                ) : (
                  transaction.refundHistory.map((refund) => (
                    <div
                      key={refund._id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(
                              refund.amount,
                              transaction.currency
                            )}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {refund.status}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(refund.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {refund.reason}
                      </p>
                      <p className="text-xs text-gray-600">
                        Processed by: {refund.processedBy.name}
                      </p>
                      {refund.gatewayRefundId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Gateway Refund ID: {refund.gatewayRefundId}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "disputes" && (
              <div className="space-y-4">
                {transaction.disputeHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No disputes recorded</p>
                  </div>
                ) : (
                  transaction.disputeHistory.map((dispute) => (
                    <div
                      key={dispute._id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {dispute.status}
                          </p>
                          <p className="text-sm text-gray-600">
                            Reported by: {dispute.reportedBy.name}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(dispute.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {dispute.reason}
                      </p>
                      {dispute.assignedTo && (
                        <p className="text-xs text-gray-600">
                          Assigned to: {dispute.assignedTo.name}
                        </p>
                      )}
                      {dispute.resolution && (
                        <div className="mt-3 p-2 bg-green-50 rounded">
                          <p className="text-sm text-green-800">
                            <strong>Resolution:</strong> {dispute.resolution}
                          </p>
                          {dispute.resolvedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Resolved{" "}
                              {formatDistanceToNow(
                                new Date(dispute.resolvedAt),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            {transaction.status === "failed" && (
              <button
                onClick={onRetry}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Transaction
              </button>
            )}
            {transaction.status === "completed" && !transaction.refundedAt && (
              <>
                <button
                  onClick={() => setShowActionModal("dispute")}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Mark as Disputed
                </button>
                <button
                  onClick={() => setShowActionModal("refund")}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Issue Refund
                </button>
              </>
            )}
            {transaction.status === "disputed" && (
              <button
                onClick={() => setShowActionModal("resolve")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Resolve Dispute
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {showActionModal === "refund" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Issue Refund
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                max={transaction.amount}
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

      {showActionModal === "dispute" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mark as Disputed
            </h3>
            <p className="text-gray-600 mb-4">
              Provide a reason for marking this transaction as disputed:
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Enter dispute reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              rows={4}
            />
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
                disabled={!disputeReason.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Disputed
              </button>
            </div>
          </div>
        </div>
      )}

      {showActionModal === "resolve" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resolve Dispute
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter resolution details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount (Optional)
              </label>
              <input
                type="number"
                value={resolveRefundAmount}
                onChange={(e) => setResolveRefundAmount(Number(e.target.value))}
                max={transaction.amount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                disabled={!resolution.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resolve Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
