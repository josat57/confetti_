"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VendorDetails, VendorPerformance } from "@/types/vendor-admin";
import VendorPerformanceMetrics from "@/components/admin/vendors/VendorPerformance";
import adminVendorsService from "@/services/admin/vendors.service";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Ban,
  Flag,
  Edit,
} from "lucide-react";
import { toast } from "react-toastify";

export default function VendorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;

  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [performance, setPerformance] = useState<VendorPerformance | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [vendorResponse, performanceResponse] = await Promise.all([
        adminVendorsService.getVendorDetails(vendorId),
        adminVendorsService.getVendorPerformance(vendorId),
      ]);

      setVendor(vendorResponse.vendor);
      setPerformance(performanceResponse.performance);
    } catch (err: any) {
      console.error("Error fetching vendor data:", err);
      setError(err.response?.data?.message || "Failed to load vendor details");
      toast.error("Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    const reason = prompt(
      "Please provide a reason for suspending this vendor:"
    );
    if (!reason) return;

    try {
      setActionLoading(true);
      const response = await adminVendorsService.suspendVendor(
        vendorId,
        reason
      );
      toast.success(response.message || "Vendor suspended successfully");
      setVendor(response.vendor);
    } catch (err: any) {
      console.error("Error suspending vendor:", err);
      toast.error(err.response?.data?.message || "Failed to suspend vendor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!confirm("Are you sure you want to activate this vendor?")) return;

    try {
      setActionLoading(true);
      const response = await adminVendorsService.activateVendor(vendorId);
      toast.success(response.message || "Vendor activated successfully");
      setVendor(response.vendor);
    } catch (err: any) {
      console.error("Error activating vendor:", err);
      toast.error(err.response?.data?.message || "Failed to activate vendor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    const reason = prompt("Please provide a reason for flagging this vendor:");
    if (!reason) return;

    try {
      setActionLoading(true);
      const response = await adminVendorsService.flagVendor(vendorId, reason);
      toast.success(response.message || "Vendor flagged successfully");
      setVendor(response.vendor);
    } catch (err: any) {
      console.error("Error flagging vendor:", err);
      toast.error(err.response?.data?.message || "Failed to flag vendor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    const category = prompt("Enter new category:", vendor?.category || "");
    if (!category) return;

    try {
      setActionLoading(true);
      const response = await adminVendorsService.updateVendorCategory(
        vendorId,
        category
      );
      toast.success(response.message || "Category updated successfully");
      setVendor(response.vendor);
    } catch (err: any) {
      console.error("Error updating category:", err);
      toast.error(err.response?.data?.message || "Failed to update category");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Vendor
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchVendorData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-gray-100 text-gray-800",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {vendor.businessName}
            </h1>
            <p className="text-gray-600 mt-1">Vendor Details & Performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
              vendor.status
            )}`}
          >
            {vendor.status}
          </span>
          {vendor.verified && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Vendor Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-600">Contact Person</label>
            <p className="font-medium text-gray-900">{vendor.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium text-gray-900">{vendor.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <p className="font-medium text-gray-900">{vendor.phone}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <p className="font-medium text-gray-900 capitalize">
              {vendor.category}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Business Address</label>
            <p className="font-medium text-gray-900">
              {vendor.location?.address || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Member Since</label>
            <p className="font-medium text-gray-900">
              {new Date(vendor.registrationDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {vendor.description && (
          <div className="mt-6">
            <label className="text-sm text-gray-600">Description</label>
            <p className="text-gray-900 mt-1">{vendor.description}</p>
          </div>
        )}

        {(vendor as any).services && (vendor as any).services.length > 0 && (
          <div className="mt-6">
            <label className="text-sm text-gray-600 mb-2 block">Services</label>
            <div className="flex flex-wrap gap-2">
              {(vendor as any).services.map(
                (service: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {service}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {vendor.pricing && (
          <div className="mt-6">
            <label className="text-sm text-gray-600">Starting Price</label>
            <p className="font-medium text-gray-900">
              {vendor.pricing.currency}{" "}
              {vendor.pricing.startingPrice.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {performance && <VendorPerformanceMetrics performance={performance} />}

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vendor Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {vendor.status === "active" ? (
            <button
              onClick={handleSuspend}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Ban className="w-4 h-4" />
              Suspend Vendor
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              Activate Vendor
            </button>
          )}

          <button
            onClick={handleFlag}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Flag className="w-4 h-4" />
            Flag for Investigation
          </button>

          <button
            onClick={handleUpdateCategory}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="w-4 h-4" />
            Update Category
          </button>
        </div>
      </div>
    </div>
  );
}
