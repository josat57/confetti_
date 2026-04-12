"use client";

import { VendorVerification } from "@/types/vendor-admin";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VerificationQueueProps {
  verifications: VendorVerification[];
  onReview: (verification: VendorVerification) => void;
  onQuickApprove: (verificationId: string) => void;
  onQuickReject: (verificationId: string) => void;
}

export default function VerificationQueue({
  verifications,
  onReview,
  onQuickApprove,
  onQuickReject,
}: VerificationQueueProps) {
  const getStatusBadge = (status: VendorVerification["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingVerifications = verifications.filter(
    (v) => v.status === "pending"
  );
  const reviewedVerifications = verifications.filter(
    (v) => v.status !== "pending"
  );

  return (
    <div className="space-y-6">
      {/* Pending Verifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Verifications ({pendingVerifications.length})
          </h3>
        </div>

        <div className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No pending verifications</p>
            </div>
          ) : (
            pendingVerifications.map((verification) => (
              <div
                key={verification._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {verification.businessName}
                      </h4>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          verification.status
                        )}`}
                      >
                        {verification.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Vendor: {verification.vendorName}</p>
                      <p>Email: {verification.vendorEmail}</p>
                      <p>Category: {verification.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          Submitted{" "}
                          {formatDistanceToNow(
                            new Date(verification.submittedAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {verification.documents.businessRegistration && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          📄 Business Registration
                        </span>
                      )}
                      {verification.documents.idVerification && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          🆔 ID Verification
                        </span>
                      )}
                      {verification.documents.taxCertificate && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          📋 Tax Certificate
                        </span>
                      )}
                      {verification.documents.insurance && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          🛡️ Insurance
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => onReview(verification)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                    <button
                      onClick={() => onQuickApprove(verification._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => onQuickReject(verification._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recently Reviewed */}
      {reviewedVerifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Reviewed ({reviewedVerifications.length})
          </h3>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {reviewedVerifications.slice(0, 5).map((verification) => (
                <div
                  key={verification._id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {verification.businessName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {verification.vendorName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          verification.status
                        )}`}
                      >
                        {verification.status}
                      </span>
                      {verification.reviewedAt && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(verification.reviewedAt),
                            { addSuffix: true }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {verification.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Reason: {verification.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
