"use client";

import React, { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import settingsService from "@/services/planner/settings.service";

const AccountDeletionPage: React.FC = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setDeleting(true);
      await settingsService.deleteAccount(password);
      toast.success("Account deletion initiated");

      // Redirect to home page after a delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please check your password.");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-red-900">
                Delete Account
              </h2>
              <p className="mt-1 text-sm text-red-700">
                Permanently delete your account and all associated data
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">
              ⚠️ This action cannot be undone
            </h3>
            <p className="text-sm text-yellow-700">
              Deleting your account will permanently remove all your data from
              our servers. Please make sure you have exported any data you wish
              to keep before proceeding.
            </p>
          </div>

          {/* What will be deleted */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What will be deleted?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>
                  All events, including details, timelines, and milestones
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>All client information and communication history</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>All vendor bookings and ratings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>All tasks and assignments</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>All budget and expense data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>All guest lists and RSVP information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>All uploaded documents and files</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>All messages and conversation history</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-600">✗</span>
                <span>Your profile and account settings</span>
              </li>
            </ul>
          </div>

          {/* Data Retention Policy */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Data Retention Policy
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                After you delete your account:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Your account will be immediately deactivated and you will be
                    logged out.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Your data will be soft-deleted and retained for 30 days in
                    case you change your mind.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    During this 30-day period, you can contact support to
                    restore your account.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    After 30 days, all your data will be permanently deleted
                    from our servers.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Some data may be retained in backups for up to 90 days for
                    disaster recovery purposes.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Alternatives */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Consider these alternatives
            </h3>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Downgrade to Free Plan
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Keep your data and access basic features without any cost.
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Export Your Data
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Download a copy of all your data before deleting your
                    account.
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Contact Support
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Let us know if there's anything we can do to improve your
                    experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              I understand, delete my account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Account Deletion
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This action is permanent and cannot be undone. All your data will
              be deleted.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPassword("");
                  setConfirmText("");
                }}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== "DELETE" || !password}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDeletionPage;
