"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Loader2,
  Plus,
  Eye,
} from "lucide-react";
import financialService, {
  FinancialReport,
} from "@/services/admin/financial.service";
import { toast } from "react-toastify";

export default function FinancialReportsPage() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [filters, setFilters] = useState({
    reportType: "",
    startDate: "",
    endDate: "",
  });

  // Quick stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    activeSubscriptions: 0,
    averageTransaction: 0,
  });

  useEffect(() => {
    fetchReports();
    fetchQuickStats();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await financialService.getFinancialReports(filters);
      setReports(response.reports);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      // Don't show error toast if endpoint doesn't exist
      if (err.response?.status !== 404) {
        toast.error("Failed to load reports");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const response = await financialService.getRevenueStats();
      setStats({
        totalRevenue: response.stats.totalRevenue || 0,
        totalTransactions: 0,
        activeSubscriptions: 0,
        averageTransaction: 0,
      });
    } catch (err: any) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleGenerateReport = async (reportData: {
    reportType: string;
    startDate: string;
    endDate: string;
  }) => {
    try {
      setGenerating(true);
      await financialService.generateReport(reportData);
      toast.success("Report generated successfully");
      setShowGenerateModal(false);
      fetchReports();
    } catch (err: any) {
      console.error("Error generating report:", err);
      toast.error(err.response?.data?.message || "Failed to generate report");
    } finally {
      setGenerating(false);
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
          <p className="text-gray-600">Loading reports...</p>
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
              Financial Reports
            </h1>
            <p className="text-gray-600 mt-1">
              Generate and view financial reports
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Total Revenue
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Transactions
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalTransactions}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Active Subscriptions
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeSubscriptions}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Avg Transaction
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.averageTransaction)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.reportType}
            onChange={(e) =>
              setFilters({ ...filters, reportType: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Report Types</option>
            <option value="revenue">Revenue Report</option>
            <option value="transactions">Transaction Report</option>
            <option value="subscriptions">Subscription Report</option>
            <option value="refunds">Refund Report</option>
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

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-600 mb-4">
              Generate your first financial report to get started
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div
                key={report._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {report.reportType} Report
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        {report.period && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(
                              report.period.start
                            ).toLocaleDateString()}{" "}
                            - {new Date(report.period.end).toLocaleDateString()}
                          </span>
                        )}
                        <span>
                          Generated:{" "}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // View report details
                        toast.info("Report details coming soon");
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        // Download report
                        toast.info("Download functionality coming soon");
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <GenerateReportModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerateReport}
          generating={generating}
        />
      )}
    </div>
  );
}

// Generate Report Modal Component
function GenerateReportModal({
  onClose,
  onGenerate,
  generating,
}: {
  onClose: () => void;
  onGenerate: (data: {
    reportType: string;
    startDate: string;
    endDate: string;
  }) => void;
  generating: boolean;
}) {
  const [formData, setFormData] = useState({
    reportType: "revenue",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  // Set default dates (last 30 days)
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    setFormData({
      reportType: "revenue",
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Generate Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type *
            </label>
            <select
              required
              value={formData.reportType}
              onChange={(e) =>
                setFormData({ ...formData, reportType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="revenue">Revenue Report</option>
              <option value="transactions">Transaction Report</option>
              <option value="subscriptions">Subscription Report</option>
              <option value="refunds">Refund Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

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
              disabled={generating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
