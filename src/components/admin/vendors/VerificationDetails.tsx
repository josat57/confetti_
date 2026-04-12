"use client";

import { useState } from "react";
import { VendorVerification } from "@/types/vendor-admin";
import { X, Download, CheckCircle, XCircle, FileText } from "lucide-react";

interface VerificationDetailsProps {
  verification: VendorVerification;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export default function VerificationDetails({
  verification,
  onClose,
  onApprove,
  onReject,
}: VerificationDetailsProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    onReject(rejectionReason);
  };

  const documents = [
    {
      name: "Business Registration",
      doc: verification.documents.businessRegistration,
      required: true,
    },
    {
      name: "ID Verification",
      doc: verification.documents.idVerification,
      required: true,
    },
    {
      name: "Tax Certificate",
      doc: verification.documents.taxCertificate,
      required: false,
    },
    {
      name: "Insurance",
      doc: verification.documents.insurance,
      required: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Vendor Verification Review
            </h2>
            <p className="text-gray-600 mt-1">{verification.businessName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Business Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Business Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Business Name</label>
                  <p className="font-medium text-gray-900">
                    {verification.businessName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <p className="font-medium text-gray-900">
                    {verification.category}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vendor Name</label>
                  <p className="font-medium text-gray-900">
                    {verification.vendorName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium text-gray-900">
                    {verification.vendorEmail}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Submitted</label>
                  <p className="font-medium text-gray-900">
                    {new Date(verification.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      verification.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : verification.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {verification.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Submitted Documents
              </h3>
              <div className="space-y-3">
                {documents.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      item.doc
                        ? "bg-white border border-gray-200"
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        className={`w-5 h-5 ${
                          item.doc ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.name}
                          {item.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </p>
                        {item.doc && (
                          <p className="text-sm text-gray-600">
                            {item.doc.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.doc ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(item.doc!.url, "_blank")}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Not provided
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection Form */}
            {showRejectForm && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  Rejection Reason
                </h3>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection..."
                  rows={4}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>

          {verification.status === "pending" && (
            <div className="flex items-center gap-3">
              {showRejectForm ? (
                <>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Confirm Rejection
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={onApprove}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Vendor
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
