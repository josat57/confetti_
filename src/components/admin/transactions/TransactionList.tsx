"use client";

import { Transaction } from "@/types/transaction-admin";
import {
  CreditCard,
  User,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
}

export default function TransactionList({
  transactions,
  onViewDetails,
}: TransactionListProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
      disputed: "bg-orange-100 text-orange-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "disputed":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "pending":
        return <RefreshCw className="w-4 h-4 text-yellow-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getGatewayBadge = (gateway: string) => {
    const styles = {
      flutterwave: "bg-orange-100 text-orange-800",
      paystack: "bg-blue-100 text-blue-800",
      stripe: "bg-purple-100 text-purple-800",
      manual: "bg-gray-100 text-gray-800",
    };
    return styles[gateway as keyof typeof styles] || styles.manual;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Transactions Found
          </h3>
          <p className="text-gray-600">
            No transactions match your current filters
          </p>
        </div>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    {transaction.transactionId}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      transaction.status
                    )}`}
                  >
                    {getStatusIcon(transaction.status)}
                    {transaction.status}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getGatewayBadge(
                      transaction.gateway
                    )} capitalize`}
                  >
                    {transaction.gateway}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                    {transaction.type.replace(/_/g, " ")}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {transaction.user.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({transaction.user.email})
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    • {transaction.user.role}
                  </span>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Amount</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {transaction.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {transaction.completedAt && (
                    <div>
                      <p className="text-xs text-gray-600">Completed</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDistanceToNow(
                          new Date(transaction.completedAt),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-2">
                  {transaction.description}
                </p>

                {/* Additional Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {transaction.gatewayTransactionId && (
                    <span>Gateway ID: {transaction.gatewayTransactionId}</span>
                  )}
                  {transaction.refundedAmount && (
                    <span className="text-red-600">
                      Refunded:{" "}
                      {formatCurrency(
                        transaction.refundedAmount,
                        transaction.currency
                      )}
                    </span>
                  )}
                  {transaction.failureReason && (
                    <span className="text-red-600">
                      Failed: {transaction.failureReason}
                    </span>
                  )}
                  {transaction.disputeReason && (
                    <span className="text-orange-600">
                      Disputed: {transaction.disputeReason}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="ml-6">
                <button
                  onClick={() => onViewDetails(transaction)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
