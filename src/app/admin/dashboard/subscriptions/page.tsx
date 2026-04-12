"use client";

import { useState, useEffect } from "react";
import {
  Subscription,
  SubscriptionStats,
  SubscriptionTier,
  PaymentHistory,
  SubscriptionChange,
} from "@/types/subscription-admin";
import SubscriptionList from "@/components/admin/subscriptions/SubscriptionList";
import SubscriptionDetailsModal from "@/components/admin/subscriptions/SubscriptionDetailsModal";
import subscriptionsService from "@/services/admin/subscriptions.service";
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [changes, setChanges] = useState<SubscriptionChange[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    tier: "" as SubscriptionTier | "",
    status: "",
    search: "",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [subscriptionsResponse, statsResponse] = await Promise.all([
        subscriptionsService.getSubscriptions({
          tier: filters.tier || undefined,
          status: filters.status || undefined,
          search: filters.search || undefined,
        }),
        subscriptionsService.getSubscriptionStats(),
      ]);

      setSubscriptions(subscriptionsResponse.subscriptions);
      setStats(statsResponse.stats);
    } catch (err: any) {
      console.error("Error fetching subscriptions:", err);
      setError(err.response?.data?.message || "Failed to load subscriptions");
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (subscription: Subscription) => {
    try {
      const [paymentsResponse, changesResponse] = await Promise.all([
        subscriptionsService.getPaymentHistory(subscription._id),
        subscriptionsService.getSubscriptionChanges(subscription._id),
      ]);

      setPayments(paymentsResponse.payments);
      setChanges(changesResponse.changes);
      setSelectedSubscription(subscription);
    } catch (err: any) {
      console.error("Error fetching subscription details:", err);
      toast.error("Failed to load subscription details");
    }
  };

  const handleUpgrade = async (newTier: SubscriptionTier) => {
    if (!selectedSubscription) return;

    try {
      const response = await subscriptionsService.upgradeSubscription(
        selectedSubscription._id,
        newTier
      );
      toast.success(response.message);
      setSelectedSubscription(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error upgrading subscription:", err);
      toast.error(err.response?.data?.message || "Failed to upgrade");
    }
  };

  const handleDowngrade = async (newTier: SubscriptionTier) => {
    if (!selectedSubscription) return;

    try {
      const response = await subscriptionsService.downgradeSubscription(
        selectedSubscription._id,
        newTier
      );
      toast.success(response.message);
      setSelectedSubscription(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error downgrading subscription:", err);
      toast.error(err.response?.data?.message || "Failed to downgrade");
    }
  };

  const handleCancel = async (reason: string, immediate: boolean) => {
    if (!selectedSubscription) return;

    try {
      const response = await subscriptionsService.cancelSubscription(
        selectedSubscription._id,
        reason,
        immediate
      );
      toast.success(response.message);
      setSelectedSubscription(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      toast.error(err.response?.data?.message || "Failed to cancel");
    }
  };

  const handleReactivate = async () => {
    if (!selectedSubscription) return;

    try {
      const response = await subscriptionsService.reactivateSubscription(
        selectedSubscription._id
      );
      toast.success(response.message);
      setSelectedSubscription(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error reactivating subscription:", err);
      toast.error(err.response?.data?.message || "Failed to reactivate");
    }
  };

  const handleRefund = async (
    paymentId: string,
    amount: number,
    reason: string
  ) => {
    if (!selectedSubscription) return;

    try {
      const response = await subscriptionsService.issueRefund({
        subscriptionId: selectedSubscription._id,
        paymentId,
        amount,
        reason,
        refundType: "full",
      });
      toast.success(response.message);
      // Refresh payment history
      const paymentsResponse = await subscriptionsService.getPaymentHistory(
        selectedSubscription._id
      );
      setPayments(paymentsResponse.payments);
    } catch (err: any) {
      console.error("Error issuing refund:", err);
      toast.error(err.response?.data?.message || "Failed to issue refund");
    }
  };

  const handleExport = async () => {
    try {
      const response = await subscriptionsService.exportSubscriptions({
        tier: filters.tier || undefined,
        status: filters.status || undefined,
      });
      // Open download URL
      window.open(response.downloadUrl, "_blank");
      toast.success("Export started");
    } catch (err: any) {
      console.error("Error exporting subscriptions:", err);
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
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Subscription Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage user subscriptions and billing
            </p>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Subscriptions
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stats.totalSubscriptions}
            </p>
            <p className="text-xs sm:text-sm text-green-600 mt-1">
              {stats.activeSubscriptions} active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                MRR
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatCurrency(stats.monthlyRecurringRevenue)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Monthly Recurring
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                ARR
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatCurrency(stats.annualRecurringRevenue)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Annual Recurring
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Churn Rate
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stats.churnRate.toFixed(1)}%
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {stats.cancelledSubscriptions} cancelled
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Filter className="w-5 h-5 text-gray-600 flex-shrink-0 hidden sm:block" />
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <select
              value={filters.tier}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  tier: e.target.value as SubscriptionTier | "",
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">All Tiers</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="past_due">Past Due</option>
              <option value="trialing">Trialing</option>
              <option value="paused">Paused</option>
            </select>

            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Search by name or email..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:col-span-2 lg:col-span-1"
            />
          </div>
        </div>
      </div>

      {/* Subscription List */}
      <SubscriptionList
        subscriptions={subscriptions}
        onViewDetails={handleViewDetails}
      />

      {/* Details Modal */}
      {selectedSubscription && (
        <SubscriptionDetailsModal
          subscription={selectedSubscription}
          payments={payments}
          changes={changes}
          onClose={() => setSelectedSubscription(null)}
          onUpgrade={handleUpgrade}
          onDowngrade={handleDowngrade}
          onCancel={handleCancel}
          onReactivate={handleReactivate}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
}
