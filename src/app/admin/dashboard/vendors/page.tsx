"use client";

import { useState, useEffect } from "react";
import { VendorVerification } from "@/types/vendor-admin";
import VerificationQueue from "@/components/admin/vendors/VerificationQueue";
import VerificationDetails from "@/components/admin/vendors/VerificationDetails";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import adminVendorsService from "@/services/admin/vendors.service";

export default function VendorsPage() {
  const [selectedVerification, setSelectedVerification] =
    useState<VendorVerification | null>(null);
  const [verifications, setVerifications] = useState<VendorVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch verifications on mount
  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminVendorsService.getVerifications();
      setVerifications(response.verifications);
    } catch (err: any) {
      console.error("Error fetching verifications:", err);
      setError(err.response?.data?.message || "Failed to load verifications");
      toast.error("Failed to load verifications");
      // Fallback to mock data for development
      setVerifications([
        {
          _id: "1",
          vendorId: "v1",
          vendorName: "John Smith",
          vendorEmail: "john@abccatering.com",
          businessName: "ABC Catering Services",
          category: "Catering",
          status: "pending",
          documents: {
            businessRegistration: {
              url: "/documents/business-reg.pdf",
              fileName: "business-registration.pdf",
              fileType: "application/pdf",
              uploadedAt: new Date("2024-11-20"),
            },
            idVerification: {
              url: "/documents/id.pdf",
              fileName: "national-id.pdf",
              fileType: "application/pdf",
              uploadedAt: new Date("2024-11-20"),
            },
            taxCertificate: {
              url: "/documents/tax.pdf",
              fileName: "tax-certificate.pdf",
              fileType: "application/pdf",
              uploadedAt: new Date("2024-11-20"),
            },
          },
          submittedAt: new Date("2024-11-20"),
        },
        {
          _id: "2",
          vendorId: "v2",
          vendorName: "Sarah Johnson",
          vendorEmail: "sarah@xyzphotography.com",
          businessName: "XYZ Photography Studio",
          category: "Photography",
          status: "pending",
          documents: {
            businessRegistration: {
              url: "/documents/business-reg-2.pdf",
              fileName: "business-registration.pdf",
              fileType: "application/pdf",
              uploadedAt: new Date("2024-11-22"),
            },
            idVerification: {
              url: "/documents/id-2.pdf",
              fileName: "drivers-license.pdf",
              fileType: "application/pdf",
              uploadedAt: new Date("2024-11-22"),
            },
          },
          submittedAt: new Date("2024-11-22"),
        },
        {
          _id: "3",
          vendorId: "v3",
          vendorName: "Mike Brown",
          vendorEmail: "mike@decorplus.com",
          businessName: "Decor Plus",
          category: "Decoration",
          status: "approved",
          documents: {
            businessRegistration: {
              url: "/documents/business-reg-3.pdf",
              fileName: "business-registration.pdf",
              fileType: "application/pdf",
              uploadedAt: new Date("2024-11-18"),
            },
            idVerification: {
              url: "/documents/id-3.pdf",
              fileName: "national-id.pdf",
              fileType: "application/pdf",
              uploadedAt: new Date("2024-11-18"),
            },
          },
          submittedAt: new Date("2024-11-18"),
          reviewedBy: "Admin",
          reviewedAt: new Date("2024-11-19"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: string) => {
    if (!confirm("Are you sure you want to approve this vendor?")) {
      return;
    }

    try {
      const response = await adminVendorsService.approveVerification(
        verificationId
      );
      toast.success(response.message || "Vendor approved successfully!");

      // Update local state
      setVerifications((prev) =>
        prev.map((v) => (v._id === verificationId ? response.verification : v))
      );
      setSelectedVerification(null);

      // Refresh the list
      await fetchVerifications();
    } catch (err: any) {
      console.error("Error approving vendor:", err);
      toast.error(err.response?.data?.message || "Failed to approve vendor");
    }
  };

  const handleReject = async (verificationId: string, reason: string) => {
    try {
      const response = await adminVendorsService.rejectVerification(
        verificationId,
        reason
      );
      toast.success(response.message || "Vendor rejected");

      // Update local state
      setVerifications((prev) =>
        prev.map((v) => (v._id === verificationId ? response.verification : v))
      );
      setSelectedVerification(null);

      // Refresh the list
      await fetchVerifications();
    } catch (err: any) {
      console.error("Error rejecting vendor:", err);
      toast.error(err.response?.data?.message || "Failed to reject vendor");
    }
  };

  const pendingCount = verifications.filter(
    (v) => v.status === "pending"
  ).length;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading verifications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && verifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Verifications
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchVerifications}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
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
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review and manage vendor verifications
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-900">
              {pendingCount} Pending
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">
              {verifications.filter((v) => v.status === "approved").length}{" "}
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Verification Queue */}
      <VerificationQueue
        verifications={verifications}
        onReview={setSelectedVerification}
        onQuickApprove={handleApprove}
        onQuickReject={(id) => {
          const reason = prompt("Please provide a rejection reason:");
          if (reason) handleReject(id, reason);
        }}
      />

      {/* Verification Details Modal */}
      {selectedVerification && (
        <VerificationDetails
          verification={selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onApprove={() => handleApprove(selectedVerification._id)}
          onReject={(reason) => handleReject(selectedVerification._id, reason)}
        />
      )}
    </div>
  );
}
