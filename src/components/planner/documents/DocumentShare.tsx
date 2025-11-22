"use client";

import { useState } from "react";
import { X, Share2 } from "lucide-react";
import { Document } from "@/services/planner/documents.service";

interface DocumentShareProps {
  document: Document;
  onShare: (userId: string, role: "Vendor" | "Client" | "Team Member") => void;
  onClose: () => void;
  loading: boolean;
}

export default function DocumentShare({
  document,
  onShare,
  onClose,
  loading,
}: DocumentShareProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"Vendor" | "Client" | "Team Member">(
    "Client"
  );

  const handleSubmit = () => {
    if (!userId) {
      alert("Please enter a user ID or email");
      return;
    }
    onShare(userId, role);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Share Document</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Sharing: <span className="font-medium">{document.name}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID or Email
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Client">Client</option>
              <option value="Vendor">Vendor</option>
              <option value="Team Member">Team Member</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
