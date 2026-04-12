"use client";

import { useState, useEffect } from "react";
import { Coupon, CouponStats, CouponFilters } from "@/types/coupons";
import couponsService from "@/services/admin/coupons.service";
import {
  Tag,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  Copy,
  Loader2,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  Calendar,
  Target,
  BarChart3,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CouponFilters>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponsRes, statsRes] = await Promise.all([
        couponsService.getCoupons(filters),
        couponsService.getStats(),
      ]);

      setCoupons(couponsRes.coupons);
      setTotal(couponsRes.total);
      setStats(statsRes.stats);
    } catch (err: any) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to load coupons");

      // Mock data
      setStats({
        totalCoupons: 45,
        activeCoupons: 28,
        totalUsage: 1250,
        totalRevenue: 450000,
        totalDiscount: 125000,
        averageConversionRate: 18.5,
        topCoupons: [
          { code: "WELCOME20", usage: 450, revenue: 125000 },
          { code: "SUMMER50", usage: 320, revenue: 98000 },
          { code: "NEWUSER", usage: 280, revenue: 75000 },
        ],
      });

      setCoupons([
        {
          _id: "1",
          code: "WELCOME20",
          name: "Welcome Discount",
          description: "20% off for new users",
          discountType: "percentage",
          discountValue: 20,
          usageLimit: { total: 1000, perUser: 1 },
          usageCount: 450,
          targetAudience: { type: "role", roles: ["event-planner"] },
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          active: true,
          createdBy: "admin1",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          analytics: {
            totalUsage: 450,
            uniqueUsers: 420,
            totalRevenue: 125000,
            totalDiscount: 25000,
            revenueImpact: 100000,
            conversionRate: 22.5,
            averageOrderValue: 278,
          },
        },
        {
          _id: "2",
          code: "SUMMER50",
          name: "Summer Sale",
          description: "50% off summer promotion",
          discountType: "percentage",
          discountValue: 50,
          maxDiscountAmount: 5000,
          usageLimit: { total: 500 },
          usageCount: 320,
          targetAudience: { type: "all" },
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          active: true,
          createdBy: "admin2",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          analytics: {
            totalUsage: 320,
            uniqueUsers: 310,
            totalRevenue: 98000,
            totalDiscount: 49000,
            revenueImpact: 49000,
            conversionRate: 18.2,
            averageOrderValue: 306,
          },
        },
        {
          _id: "3",
          code: "EXPIRED10",
          name: "Expired Coupon",
          description: "10% off - expired",
          discountType: "percentage",
          discountValue: 10,
          usageLimit: { total: 100 },
          usageCount: 85,
          targetAudience: { type: "all" },
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          active: false,
          createdBy: "admin1",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (couponId: string) => {
    try {
      setActionLoading(couponId);
      await couponsService.activateCoupon(couponId);
      toast.success("Coupon activated");
      fetchData();
    } catch (err: any) {
      console.error("Error activating coupon:", err);
      toast.error("Failed to activate coupon");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (couponId: string) => {
    if (!confirm("Deactivate this coupon?")) return;

    try {
      setActionLoading(couponId);
      await couponsService.deactivateCoupon(couponId);
      toast.success("Coupon deactivated");
      fetchData();
    } catch (err: any) {
      console.error("Error deactivating coupon:", err);
      toast.error("Failed to deactivate coupon");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Delete this coupon? This action cannot be undone.")) return;

    try {
      setActionLoading(couponId);
      await couponsService.deleteCoupon(couponId);
      toast.success("Coupon deleted");
      fetchData();
    } catch (err: any) {
      console.error("Error deleting coupon:", err);
      toast.error("Failed to delete coupon");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const handleExport = async () => {
    try {
      const response = await couponsService.exportCoupons(filters);
      window.open(response.downloadUrl, "_blank");
      toast.success("Export started");
    } catch (err: any) {
      console.error("Error exporting coupons:", err);
      toast.error("Failed to export coupons");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiryDate: Date) => {
    return new Date(expiryDate) < new Date();
  };

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.usageLimit.total) return 0;
    return (coupon.usageCount / coupon.usageLimit.total) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Coupon Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage discount coupons
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <Link
            href="/admin/dashboard/coupons/promotions"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <BarChart3 className="w-5 h-5" />
            Promotions
          </Link>
          <Link
            href="/admin/dashboard/coupons/create"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Tag className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalCoupons}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Coupons</p>
            <p className="text-xs text-green-600 mt-2">
              {stats.activeCoupons} active
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalUsage.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Usage</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
            <p className="text-xs text-red-600 mt-2">
              {formatCurrency(stats.totalDiscount)} discount
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageConversionRate}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Conversion</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={
              filters.active === undefined ? "" : filters.active.toString()
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                active:
                  e.target.value === "" ? undefined : e.target.value === "true",
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={filters.discountType || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                discountType: e.target.value as any,
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {coupon.name}
                  </h3>
                  {coupon.active && !isExpired(coupon.expiryDate) ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded">
                      Active
                    </span>
                  ) : isExpired(coupon.expiryDate) ? (
                    <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded">
                      Expired
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {coupon.description}
                </p>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-purple-900 text-lg">
                  {coupon.code}
                </span>
                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg"
                  title="Copy code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Discount Info */}
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}%`
                  : formatCurrency(coupon.discountValue)}
              </span>
              <span className="text-sm text-gray-600">OFF</span>
            </div>

            {/* Usage Stats */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Usage</span>
                <span>
                  {coupon.usageCount}
                  {coupon.usageLimit.total && ` / ${coupon.usageLimit.total}`}
                </span>
              </div>
              {coupon.usageLimit.total && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${getUsagePercentage(coupon)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(coupon.expiryDate)}
              </span>
              {coupon.targetAudience.type !== "all" && (
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {coupon.targetAudience.type}
                </span>
              )}
            </div>

            {/* Analytics */}
            {coupon.analytics && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(coupon.analytics.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Conversion</p>
                    <p className="font-semibold text-gray-900">
                      {coupon.analytics.conversionRate}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/dashboard/coupons/${coupon._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>

              {coupon.active && !isExpired(coupon.expiryDate) ? (
                <button
                  onClick={() => handleDeactivate(coupon._id)}
                  disabled={actionLoading === coupon._id}
                  className="px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 disabled:opacity-50"
                  title="Deactivate"
                >
                  <Power className="w-4 h-4" />
                </button>
              ) : (
                !isExpired(coupon.expiryDate) && (
                  <button
                    onClick={() => handleActivate(coupon._id)}
                    disabled={actionLoading === coupon._id}
                    className="px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50"
                    title="Activate"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                )
              )}

              <button
                onClick={() => handleDelete(coupon._id)}
                disabled={actionLoading === coupon._id}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > (filters.limit || 20) && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-700">
            Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to{" "}
            {Math.min((filters.page || 1) * (filters.limit || 20), total)} of{" "}
            {total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setFilters({ ...filters, page: (filters.page || 1) - 1 })
              }
              disabled={(filters.page || 1) === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setFilters({ ...filters, page: (filters.page || 1) + 1 })
              }
              disabled={
                (filters.page || 1) >= Math.ceil(total / (filters.limit || 20))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
