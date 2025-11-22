"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  paymentsService,
  Payment as PaymentType,
} from "@/services/payments.service";

type Payment = PaymentType & {
  clientName?: string;
  clientEmail?: string;
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Payment["status"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSubscription, setUserSubscription] = useState<any>(null);

  // Fetch user subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1"
          }/subscriptions/current`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setUserSubscription(data.data?.subscription || data.subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // Check if user has Business+ tier
  const userPlan = userSubscription?.planName?.toLowerCase() || "";
  const hasAccess = userPlan === "business" || userPlan === "enterprise";

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const { payments: fetchedPayments } = await paymentsService.getPayments(
          {
            status: filter !== "all" ? filter : undefined,
          }
        );

        // Transform payments to include clientName and clientEmail for compatibility
        const transformedPayments = fetchedPayments.map((payment) => ({
          ...payment,
          id: payment._id,
          clientName: payment.client.name,
          clientEmail: payment.client.email,
          dueDate: new Date(payment.dueDate),
          paidAt: payment.paidAt ? new Date(payment.paidAt) : undefined,
          createdAt: new Date(payment.createdAt),
        }));

        setPayments(transformedPayments);
      } catch (error: any) {
        console.error("Error fetching payments:", error);
        // If API returns 404 or endpoint doesn't exist, show empty state
        if (
          error.response?.status === 404 ||
          error.code === "ERR_BAD_REQUEST"
        ) {
          setPayments([]);
        } else {
          toast.error("Failed to load payments");
        }
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      fetchPayments();
    } else {
      setLoading(false);
    }
  }, [hasAccess, filter]);

  const handleSendReminder = async (paymentId: string) => {
    try {
      await paymentsService.sendPaymentReminder(paymentId);
      toast.success("Payment reminder sent successfully");
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast.error(error.response?.data?.message || "Failed to send reminder");
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesFilter = filter === "all" || payment.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      (payment.clientName &&
        payment.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Payment["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calculate stats
  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    overdue: payments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0),
    totalInvoices: payments.length,
  };

  if (!hasAccess) {
    return (
      <div className="max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <DollarSign className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to Business
          </h2>
          <p className="text-gray-600 mb-6">
            Payment processing is available for Business tier and above. Accept
            online payments and manage invoices seamlessly.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payments & Invoices
          </h1>
          <p className="text-gray-600 mt-1">
            Manage payments and track revenue
          </p>
        </div>
        <Link
          href="/vendor/dashboard/payments/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ₦{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            ₦{stats.pending.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">
            ₦{stats.overdue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalInvoices}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {["paid", "pending", "overdue", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as Payment["status"])}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {getStatusLabel(status as Payment["status"])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No invoices found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filter !== "all"
              ? "Try adjusting your filters"
              : "Create your first invoice to get started"}
          </p>
          {!searchQuery && filter === "all" && (
            <Link
              href="/vendor/dashboard/payments/invoices/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Invoice</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {payment.invoiceNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{payment.clientName}</p>
                  <p className="text-xs text-gray-500">{payment.clientEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{payment.amount.toLocaleString()}
                  </p>
                  {payment.paymentMethod && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      via {payment.paymentMethod.replace("_", " ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span>Due: {payment.dueDate.toLocaleDateString()}</span>
                  {payment.paidAt && (
                    <span className="ml-4">
                      Paid: {payment.paidAt.toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/vendor/dashboard/payments/invoices/${payment.id}`}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </Link>
                  {payment.status === "pending" && (
                    <button
                      onClick={() =>
                        handleSendReminder(payment.id || payment._id)
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Methods
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Flutterwave</h3>
            <p className="text-sm text-gray-600">
              Accept card payments, bank transfers, and mobile money
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Paystack</h3>
            <p className="text-sm text-gray-600">
              Process payments with cards, USSD, and bank transfers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
