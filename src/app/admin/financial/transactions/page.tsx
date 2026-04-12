"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import financialService, {
  Transaction,
} from "@/services/admin/financial.service";
import { toast } from "react-toastify";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await financialService.getTransactions({
        ...filters,
        search: searchQuery || undefined,
      });
      setTransactions(response.transactions);

      // Calculate stats
      const successful = response.transactions.filter(
        (t) => t.status === "completed" || t.status === "success"
      ).length;
      const pending = response.transactions.filter(
        (t) => t.status === "pending"
      ).length;
      const failed = response.transactions.filter(
        (t) => t.status === "failed"
      ).length;

      setStats({
        total: response.total,
        successful,
        pending,
        failed,
      });
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await financialService.exportTransactions({
        ...filters,
        format: "csv",
      });
      window.open(response.downloadUrl, "_blank");
      toast.success("Export started");
    } catch (err: any) {
      console.error("Error exporting transactions:", err);
      toast.error("Failed to export transactions");
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">
              View and manage all financial transactions
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Successful
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.successful}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Failed</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchTransactions()}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transactions found</p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.user ? (
                        <>
                          <div className="text-sm text-gray-900">
                            {transaction.user.firstName &&
                            transaction.user.lastName
                              ? `${transaction.user.firstName} ${transaction.user.lastName}`
                              : transaction.user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.user.email}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">N/A</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {transaction.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Transaction Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Reference</p>
                  <p className="font-medium text-gray-900">
                    {selectedTransaction.reference}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedTransaction.status
                    )}`}
                  >
                    {getStatusIcon(selectedTransaction.status)}
                    {selectedTransaction.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(
                      selectedTransaction.amount,
                      selectedTransaction.currency
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {selectedTransaction.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-medium text-gray-900">
                    {selectedTransaction.user
                      ? selectedTransaction.user.firstName &&
                        selectedTransaction.user.lastName
                        ? `${selectedTransaction.user.firstName} ${selectedTransaction.user.lastName}`
                        : selectedTransaction.user.email
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedTransaction.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium text-gray-900">
                    {selectedTransaction.description}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
