"use client";

import { useState, useEffect } from "react";
import {
  Transaction,
  TransactionDetails,
  PaymentAnalytics,
} from "@/types/transaction-admin";
import TransactionList from "@/components/admin/transactions/TransactionList";
import TransactionDetailsModal from "@/components/admin/transactions/TransactionDetailsModal";
import transactionsService from "@/services/admin/transactions.service";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertCircle,
  Filter,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetails | null>(null);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    gateway: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsResponse, analyticsResponse] = await Promise.all([
        transactionsService.getTransactions({
          status: filters.status || undefined,
          type: filters.type || undefined,
          gateway: filters.gateway || undefined,
          search: filters.search || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        } as any),
        transactionsService.getPaymentAnalytics({
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        }),
      ]);

      setTransactions(transactionsResponse.transactions);
      setAnalytics(analyticsResponse.analytics);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.response?.data?.message || "Failed to load transactions");
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (transaction: Transaction) => {
    try {
      const response = await transactionsService.getTransactionById(
        transaction._id
      );
      setSelectedTransaction(response.transaction);
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
      toast.error("Failed to load transaction details");
    }
  };

  const handleRefund = async (amount: number, reason: string) => {
    if (!selectedTransaction) return;

    try {
      const response = await transactionsService.refundTransaction(
        selectedTransaction._id,
        amount,
        reason
      );
      toast.success(response.message);
      setSelectedTransaction(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error refunding transaction:", err);
      toast.error(err.response?.data?.message || "Failed to refund");
    }
  };

  const handleMarkDisputed = async (reason: string) => {
    if (!selectedTransaction) return;

    try {
      const response = await transactionsService.markAsDisputed(
        selectedTransaction._id,
        reason
      );
      toast.success(response.message);
      setSelectedTransaction(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error marking as disputed:", err);
      toast.error(err.response?.data?.message || "Failed to mark as disputed");
    }
  };

  const handleResolveDispute = async (
    resolution: string,
    refundAmount?: number
  ) => {
    if (!selectedTransaction) return;

    try {
      const response = await transactionsService.resolveDispute(
        selectedTransaction._id,
        resolution,
        refundAmount
      );
      toast.success(response.message);
      setSelectedTransaction(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error resolving dispute:", err);
      toast.error(err.response?.data?.message || "Failed to resolve dispute");
    }
  };

  const handleRetry = async () => {
    if (!selectedTransaction) return;

    try {
      const response = await transactionsService.retryTransaction(
        selectedTransaction._id
      );
      toast.success(response.message);
      setSelectedTransaction(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error retrying transaction:", err);
      toast.error(err.response?.data?.message || "Failed to retry");
    }
  };

  const handleExport = async () => {
    try {
      const response = await transactionsService.exportTransactions({
        format: "csv",
        filters: {
          status: filters.status || undefined,
          type: filters.type || undefined,
          gateway: filters.gateway || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        } as any,
      });
      window.open(response.downloadUrl, "_blank");
      toast.success("Export started");
    } catch (err: any) {
      console.error("Error exporting transactions:", err);
      toast.error(err.response?.data?.message || "Failed to export");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction Management
          </h1>
          <p className="text-gray-600 mt-1">Manage payments and transactions</p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Transactions
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.totalTransactions}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(analytics.totalVolume)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Success Rate
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.successRate.toFixed(1)}%
            </p>
            <p className="text-sm text-green-600 mt-1">
              {analytics.successfulTransactions} successful
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                Avg Transaction
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(analytics.averageTransactionValue)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Failed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.failedTransactions}
            </p>
            <p className="text-sm text-red-600 mt-1">
              {analytics.refundedTransactions} refunded
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="booking">Booking</option>
              <option value="service_fee">Service Fee</option>
              <option value="refund">Refund</option>
            </select>

            <select
              value={filters.gateway}
              onChange={(e) =>
                setFilters({ ...filters, gateway: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Gateways</option>
              <option value="flutterwave">Flutterwave</option>
              <option value="paystack">Paystack</option>
              <option value="stripe">Stripe</option>
              <option value="manual">Manual</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Search transactions..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onViewDetails={handleViewDetails}
      />

      {/* Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onRefund={handleRefund}
          onMarkDisputed={handleMarkDisputed}
          onResolveDispute={handleResolveDispute}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
