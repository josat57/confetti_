"use client";

import { Subscription, SubscriptionTier } from "@/types/subscription-admin";
import {
  CreditCard,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SubscriptionListProps {
  subscriptions: Subscription[] | undefined;
  onViewDetails: (subscription: Subscription) => void;
}

export default function SubscriptionList({
  subscriptions,
  onViewDetails,
}: SubscriptionListProps) {
  // Helper to get user display name
  const getUserName = (user: Subscription["user"]) => {
    if (!user) return "Deleted User";
    if (user.name) return user.name;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return user.email.split("@")[0];
  };

  // Helper to get user role
  const getUserRole = (user: Subscription["user"]) => {
    if (!user) return "user";
    return user.role || "user";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
      past_due: "bg-orange-100 text-orange-800",
      trialing: "bg-blue-100 text-blue-800",
      paused: "bg-yellow-100 text-yellow-800",
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const getTierBadge = (planName: string) => {
    const lowerPlan = planName.toLowerCase();
    const styles: Record<string, string> = {
      starter: "bg-gray-100 text-gray-800",
      basic: "bg-blue-100 text-blue-800",
      professional: "bg-purple-100 text-purple-800",
      business: "bg-indigo-100 text-indigo-800",
      enterprise: "bg-indigo-100 text-indigo-800",
    };
    return styles[lowerPlan] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
      case "expired":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "past_due":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
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
      {!subscriptions || subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            No Subscriptions Found
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {!subscriptions
              ? "Loading subscriptions..."
              : "No subscriptions match your current filters"}
          </p>
        </div>
      ) : (
        subscriptions!.map((subscription) => (
          <div
            key={subscription._id}
            className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {getUserName(subscription.user)}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      subscription.status
                    )} flex-shrink-0`}
                  >
                    {getStatusIcon(subscription.status)}
                    <span className="hidden sm:inline">
                      {subscription.status}
                    </span>
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTierBadge(
                      subscription.planName
                    )} capitalize flex-shrink-0`}
                  >
                    {subscription.planName}
                  </span>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {subscription.user?.email ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Plan Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {subscription.planType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Payment Provider</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {subscription.paymentProvider === "none"
                        ? "Free Plan"
                        : subscription.paymentProvider}
                    </p>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {formatCurrency(
                          subscription.amount,
                          subscription.currency
                        )}
                        <span className="text-xs text-gray-600 ml-1">
                          /{subscription.billingCycle}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">End Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Auto Renew</p>
                      <p className="text-sm font-medium text-gray-900">
                        {subscription.autoRenew ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-2">Usage</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Events Created</p>
                      <p className="text-sm font-medium text-gray-900">
                        {subscription.usage.eventsCreated}
                        {subscription.limits?.events && (
                          <span className="text-xs text-gray-600">
                            {" "}
                            / {subscription.limits.events}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Photos Uploaded</p>
                      <p className="text-sm font-medium text-gray-900">
                        {subscription.usage.photosUploaded}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Last Reset</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(
                          subscription.usage.lastResetDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  {subscription.autoRenew &&
                    subscription.status === "active" && (
                      <span>
                        Auto-renews{" "}
                        {formatDistanceToNow(new Date(subscription.endDate), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  {subscription.pendingUpgrade && (
                    <span className="text-blue-600">
                      Pending upgrade to{" "}
                      {subscription.pendingUpgrade.newPlanName}
                    </span>
                  )}
                  {subscription.status === "pending_payment" && (
                    <span className="text-orange-600">
                      Awaiting payment confirmation
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="lg:ml-6 flex-shrink-0">
                <button
                  onClick={() => onViewDetails(subscription)}
                  className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
