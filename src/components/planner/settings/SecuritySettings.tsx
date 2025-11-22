"use client";

import { useState } from "react";
import { Shield, Lock, Key, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { settingsService } from "@/services/settings.service";
import api from "@/api/api";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface TwoFactorData {
  isEnabled: boolean;
  showQR: boolean;
  qrCode: string;
  secret: string;
  verificationCode: string;
  backupCodes: string[];
  showBackupCodes: boolean;
}

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData>({
    isEnabled: false,
    showQR: false,
    qrCode: "",
    secret: "",
    verificationCode: "",
    backupCodes: [],
    showBackupCodes: false,
  });

  const [showDisableAccountModal, setShowDisableAccountModal] = useState(false);
  const [disableAccountPassword, setDisableAccountPassword] = useState("");
  const [disableAccountReason, setDisableAccountReason] = useState("");

  // Change Password
  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await settingsService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Enable 2FA
  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const response = await settingsService.enable2FA();
      setTwoFactorData({
        ...twoFactorData,
        showQR: true,
        qrCode: response.data.qrCode,
        secret: response.data.secret,
      });
      toast.success("Scan the QR code with your authenticator app");
    } catch (error: any) {
      console.error("Failed to enable 2FA:", error);
      toast.error(error.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA
  const handleVerify2FA = async () => {
    if (twoFactorData.verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await settingsService.verify2FA(
        twoFactorData.verificationCode
      );

      setTwoFactorData({
        ...twoFactorData,
        isEnabled: true,
        showQR: false,
        verificationCode: "",
        backupCodes: response.data.backupCodes || [],
        showBackupCodes: true,
      });

      toast.success("Two-Factor Authentication enabled successfully");
    } catch (error: any) {
      console.error("Failed to verify 2FA:", error);
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    const password = prompt("Enter your password to disable 2FA:");

    if (!password) return;

    setLoading(true);
    try {
      await settingsService.disable2FA(password);
      setTwoFactorData({
        isEnabled: false,
        showQR: false,
        qrCode: "",
        secret: "",
        verificationCode: "",
        backupCodes: [],
        showBackupCodes: false,
      });
      toast.success("Two-Factor Authentication disabled");
    } catch (error: any) {
      console.error("Failed to disable 2FA:", error);
      toast.error(error.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  // Regenerate Backup Codes
  const handleRegenerateBackupCodes = async () => {
    if (!confirm("This will invalidate your old backup codes. Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await settingsService.regenerateBackupCodes();
      setTwoFactorData({
        ...twoFactorData,
        backupCodes: response.data.backupCodes || [],
        showBackupCodes: true,
      });
      toast.success("Backup codes regenerated");
    } catch (error: any) {
      console.error("Failed to regenerate backup codes:", error);
      toast.error(
        error.response?.data?.message || "Failed to regenerate backup codes"
      );
    } finally {
      setLoading(false);
    }
  };

  // Disable Account
  const handleDisableAccount = async () => {
    if (!disableAccountPassword) {
      toast.error("Please enter your password to confirm");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/auth/disable-account", {
        password: disableAccountPassword,
        reason: disableAccountReason || undefined,
      });

      toast.success(
        response.data?.message ||
          "Account disabled successfully. Your data will be retained for 30 days."
      );

      // Logout after 2 seconds
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
    } catch (error: any) {
      console.error("Failed to disable account:", error);
      toast.error(error.response?.data?.message || "Failed to disable account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-teal-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Security Settings
        </h2>
      </div>

      <div className="space-y-8">
        {/* Change Password */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Change Password</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Update your password regularly to keep your account secure
          </p>
          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="border-t pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">
              Two-Factor Authentication (2FA)
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Add an extra layer of security to your account using an
            authenticator app
          </p>

          {!twoFactorData.isEnabled ? (
            <>
              {!twoFactorData.showQR ? (
                <button
                  type="button"
                  onClick={handleEnable2FA}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Loading..." : "Enable 2FA"}
                </button>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium mb-3">
                      Step 1: Scan this QR code with your authenticator app
                    </p>
                    {twoFactorData.qrCode && (
                      <img
                        src={twoFactorData.qrCode}
                        alt="2FA QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    )}
                    <p className="text-xs text-gray-600 mt-3">
                      Or enter this code manually:{" "}
                      <code className="bg-white px-2 py-1 rounded border border-gray-300">
                        {twoFactorData.secret}
                      </code>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      Step 2: Enter the 6-digit code from your app
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={twoFactorData.verificationCode}
                        onChange={(e) =>
                          setTwoFactorData({
                            ...twoFactorData,
                            verificationCode: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-center text-lg tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={handleVerify2FA}
                        disabled={loading}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 max-w-md">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800 font-medium">
                  Two-Factor Authentication is enabled
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRegenerateBackupCodes}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
                >
                  Regenerate Backup Codes
                </button>
                <button
                  type="button"
                  onClick={handleDisable2FA}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          )}

          {/* Backup Codes Display */}
          {twoFactorData.showBackupCodes &&
            twoFactorData.backupCodes.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
                <p className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Save these backup codes in a safe place
                </p>
                <p className="text-xs text-yellow-700 mb-3">
                  Each code can only be used once. You'll need these if you lose
                  access to your authenticator app.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {twoFactorData.backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="block bg-white px-3 py-2 rounded text-sm font-mono border border-yellow-300"
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTwoFactorData({
                      ...twoFactorData,
                      showBackupCodes: false,
                    })
                  }
                  className="mt-3 text-sm text-yellow-800 hover:text-yellow-900 underline"
                >
                  I've saved these codes
                </button>
              </div>
            )}
        </div>

        {/* Disable Account */}
        <div className="border-t pt-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-gray-900">Disable Account</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Temporarily disable your account. You can reactivate it by logging
            in again.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-md">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Disabling your account will:
            </p>
            <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
              <li>Log you out immediately</li>
              <li>Hide your profile from other users</li>
              <li>Pause all active subscriptions</li>
              <li>Prevent access until you reactivate</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setShowDisableAccountModal(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Disable My Account
          </button>
        </div>
      </div>

      {/* Disable Account Modal */}
      {showDisableAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Account Disable
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your password to confirm that you want to disable
              your account. Your data will be retained for 30 days.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={disableAccountPassword}
                  onChange={(e) => setDisableAccountPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      handleDisableAccount();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  placeholder="Tell us why you're disabling your account..."
                  value={disableAccountReason}
                  onChange={(e) => setDisableAccountReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDisableAccountModal(false);
                  setDisableAccountPassword("");
                  setDisableAccountReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisableAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Disabling..." : "Disable Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
