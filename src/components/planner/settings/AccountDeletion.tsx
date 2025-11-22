"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { settingsService } from "@/services/planner/settings.service";
import { useRouter } from "next/navigation";
import { Auth } from "@/api/api";

export default function AccountDeletion() {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmText !== "DELETE MY ACCOUNT") {
      alert("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }

    if (!password) {
      alert("Please enter your password");
      return;
    }

    try {
      setDeleting(true);
      await settingsService.deleteAccount(password);
      alert("Account deletion initiated. You will be logged out.");

      // Sign out and redirect to login
      await Auth.signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please check your password.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
        <p className="text-sm text-gray-600 mt-1">
          Permanently delete your account and all associated data
        </p>
      </div>

      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                Warning: This action cannot be undone
              </h3>
              <p className="text-sm text-red-800 mb-3">
                Deleting your account will permanently remove:
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• All your events and event data</li>
                <li>• Client information and contacts</li>
                <li>• Vendor bookings and communications</li>
                <li>• Tasks, budgets, and financial records</li>
                <li>• All uploaded documents and files</li>
                <li>• Team member access and permissions</li>
                <li>• Your subscription and billing history</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Data Retention Policy
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            After you delete your account:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              • Your account will be deactivated immediately and you will be
              logged out
            </li>
            <li>
              • Your data will be retained for 30 days in case you change your
              mind
            </li>
            <li>
              • During this period, you can contact support to restore your
              account
            </li>
            <li>
              • After 30 days, all your data will be permanently deleted from
              our servers
            </li>
            <li>
              • Some data may be retained for legal or compliance purposes as
              required by law
            </li>
          </ul>
        </div>

        {!showConfirmation ? (
          <button
            onClick={() => setShowConfirmation(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Delete My Account
          </button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label
                htmlFor="confirm-text"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Type <span className="font-bold">DELETE MY ACCOUNT</span> to
                confirm
              </label>
              <input
                type="text"
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="DELETE MY ACCOUNT"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter your password to confirm
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Your password"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmation(false);
                  setPassword("");
                  setConfirmText("");
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Confirm Deletion
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Need help? Contact our support team before deleting your account
        </p>
      </div>
    </div>
  );
}
