"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  User as UserIcon,
  Bell,
  Lock,
  CreditCard,
  Globe,
  Camera,
  Upload,
  X,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { toast } from "react-toastify";
import { User } from "@/api/api";
import { settingsService } from "@/services/settings.service";
import { subscriptionService } from "@/services/subscription.service";
import Image from "next/image";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    username: user?.username || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      country: user?.address?.country || "",
      zipCode: user?.address?.zipCode || "",
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.profilePicture || null
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Fetch user profile with base64 images on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await User.getProfile();
        const userData = response.data?.user || response.user || response.data;

        if (userData) {
          // Update profile data
          setProfileData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            username: userData.username || "",
            address: {
              street: userData.address?.street || "",
              city: userData.address?.city || "",
              state: userData.address?.state || "",
              country: userData.address?.country || "",
              zipCode: userData.address?.zipCode || "",
            },
          });

          // Set base64 images from backend
          setAvatarPreview(
            userData.profileImage || userData.profilePicture || null
          );
          setCoverPreview(userData.coverPhoto || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();

    // Fetch billing data
    const fetchBillingData = async () => {
      try {
        const response = await settingsService.getAllSettings();
        if (response.data?.billing) {
          setBillingData({
            ...billingData,
            currentPlan: response.data.billing.subscription,
            paymentMethods: response.data.billing.paymentMethods || [],
          });
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
      }
    };

    fetchBillingData();

    // Fetch available plans when user is available
    const fetchAvailablePlans = async () => {
      if (!user?.role) return;

      try {
        const plans = await subscriptionService.getPlans({
          planType: user.role === "vendor" ? "vendor" : "planner",
        });
        console.log("Fetched plans:", plans);
        setBillingData((prev) => ({
          ...prev,
          availablePlans: plans,
        }));
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };

    if (user?.role) {
      fetchAvailablePlans();
    }
  }, [user?.role]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        username: user.username || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          country: user.address?.country || "",
          zipCode: user.address?.zipCode || "",
        },
      });
      setAvatarPreview(user.profilePicture || null);
    }
  }, [user]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newLeads: true,
    bookingUpdates: true,
    paymentReminders: true,
  });

  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || "system",
    language: user?.preferences?.language || "en",
    timezone: "Africa/Lagos",
    currency: "NGN",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [twoFactorData, setTwoFactorData] = useState({
    qrCode: "",
    secret: "",
    verificationCode: "",
    backupCodes: [] as string[],
    isEnabled: user?.twoFactorEnabled || false,
    showQR: false,
    showBackupCodes: false,
  });

  const [billingData, setBillingData] = useState({
    currentPlan: null as any,
    paymentMethods: [] as any[],
    showAddPaymentModal: false,
    showChangePlanModal: false,
    availablePlans: [] as any[],
    loadingPlans: false,
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 1MB as per backend)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image size should be less than 1MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await User.uploadProfileImage(formData);

      // Backend returns base64 image in profileImage field
      const base64Image = response.data?.profileImage || response.profileImage;

      // Update preview with base64 image
      setAvatarPreview(base64Image);

      // Update user context
      if (user) {
        setUser({ ...user, profilePicture: base64Image });
      }

      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 1MB as per backend)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image size should be less than 1MB");
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await User.uploadCoverPhoto(formData);

      // Backend returns base64 image in coverPhoto field
      const base64Image = response.data?.coverPhoto || response.coverPhoto;

      // Update preview with base64 image
      setCoverPreview(base64Image);

      toast.success("Cover photo updated successfully");
    } catch (error: any) {
      console.error("Error uploading cover:", error);
      toast.error(error.message || "Failed to upload cover photo");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Are you sure you want to delete your profile picture?"))
      return;

    setUploadingAvatar(true);
    try {
      await User.deleteProfileImage();

      // Clear preview
      setAvatarPreview(null);

      // Update user context
      if (user) {
        setUser({ ...user, profilePicture: undefined });
      }

      toast.success("Profile picture deleted successfully");
    } catch (error: any) {
      console.error("Error deleting avatar:", error);
      toast.error(error.message || "Failed to delete profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteCover = async () => {
    if (!confirm("Are you sure you want to delete your cover photo?")) return;

    setUploadingCover(true);
    try {
      await User.deleteCoverPhoto();

      // Clear preview
      setCoverPreview(null);

      toast.success("Cover photo deleted successfully");
    } catch (error: any) {
      console.error("Error deleting cover:", error);
      toast.error(error.message || "Failed to delete cover photo");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append all profile fields
      formData.append("firstName", profileData.firstName);
      formData.append("lastName", profileData.lastName);
      formData.append("email", profileData.email);
      formData.append("phone", profileData.phone);
      formData.append("username", profileData.username);

      // Append address fields
      formData.append("address[street]", profileData.address.street);
      formData.append("address[city]", profileData.address.city);
      formData.append("address[state]", profileData.address.state);
      formData.append("address[country]", profileData.address.country);
      formData.append("address[zipCode]", profileData.address.zipCode);

      const response = await User.updateProfile(formData);

      // Update user context
      if (user && response.data) {
        setUser({ ...user, ...response.data });
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await settingsService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const response = await settingsService.enable2FA();
      setTwoFactorData({
        ...twoFactorData,
        qrCode: response.data.qrCode,
        secret: response.data.secret,
        showQR: true,
      });
      toast.success("Scan the QR code with your authenticator app");
    } catch (error: any) {
      console.error("Error enabling 2FA:", error);
      toast.error(error.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (
      !twoFactorData.verificationCode ||
      twoFactorData.verificationCode.length !== 6
    ) {
      toast.error("Please enter a valid 6-digit code");
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
        showBackupCodes: true,
        backupCodes: response.data.backupCodes || [],
        verificationCode: "",
      });
      toast.success("2FA enabled successfully! Save your backup codes.");
    } catch (error: any) {
      console.error("Error verifying 2FA:", error);
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt("Enter your password to disable 2FA:");
    if (!password) return;

    setLoading(true);
    try {
      await settingsService.disable2FA(password);
      setTwoFactorData({
        ...twoFactorData,
        isEnabled: false,
        qrCode: "",
        secret: "",
        backupCodes: [],
      });
      toast.success("2FA disabled successfully");
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      toast.error(error.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!confirm("This will invalidate your current backup codes. Continue?"))
      return;

    setLoading(true);
    try {
      const response = await settingsService.regenerateBackupCodes();
      setTwoFactorData({
        ...twoFactorData,
        backupCodes: response.data.backupCodes || [],
        showBackupCodes: true,
      });
      toast.success("Backup codes regenerated successfully");
    } catch (error: any) {
      console.error("Error regenerating backup codes:", error);
      toast.error(
        error.response?.data?.message || "Failed to regenerate backup codes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    setLoading(true);
    try {
      // Initialize payment method setup with Flutterwave
      const response = await settingsService.initializePaymentMethod();

      if (response.data?.paymentUrl) {
        // Store reference for verification after redirect
        sessionStorage.setItem(
          "paymentMethodReference",
          response.data.reference
        );

        // Redirect to Flutterwave for secure card tokenization
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error("Failed to initialize payment setup");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error initializing payment method:", error);
      toast.error(
        error.response?.data?.message || "Failed to initialize payment setup"
      );
      setLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?"))
      return;

    setLoading(true);
    try {
      await settingsService.removePaymentMethod(id);
      setBillingData({
        ...billingData,
        paymentMethods: billingData.paymentMethods.filter((pm) => pm.id !== id),
      });
      toast.success("Payment method removed successfully");
    } catch (error: any) {
      console.error("Error removing payment method:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove payment method"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    setLoading(true);
    try {
      await settingsService.setDefaultPaymentMethod(id);
      setBillingData({
        ...billingData,
        paymentMethods: billingData.paymentMethods.map((pm) => ({
          ...pm,
          isDefault: pm.id === id,
        })),
      });
      toast.success("Default payment method updated");
    } catch (error: any) {
      console.error("Error setting default payment method:", error);
      toast.error(
        error.response?.data?.message || "Failed to set default payment method"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (plan: any) => {
    if (!confirm("Are you sure you want to change your subscription plan?"))
      return;

    setLoading(true);
    try {
      // Get NGN pricing (or first available)
      const ngnPricing =
        plan.pricing?.find((p: any) => p.currency === "NGN") ||
        plan.pricing?.[0];

      await settingsService.changePlan({
        planId: plan._id,
        planName: plan.planName,
        amount: ngnPricing?.amountInMinorUnits || ngnPricing?.amount || 0,
        currency: ngnPricing?.currency || "NGN",
      });
      toast.success("Subscription plan changed successfully");
      // Refresh billing data
      const response = await settingsService.getAllSettings();
      if (response.data?.billing) {
        setBillingData({
          ...billingData,
          currentPlan: response.data.billing.subscription,
          showChangePlanModal: false,
        });
      }
    } catch (error: any) {
      console.error("Error changing plan:", error);
      toast.error(
        error.response?.data?.message || "Failed to change subscription plan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangePlanModal = async () => {
    // Open modal first
    setBillingData({
      ...billingData,
      showChangePlanModal: true,
      loadingPlans: true,
    });

    // Fetch latest plans
    try {
      const plans = await subscriptionService.getPlans({
        planType: user?.role === "vendor" ? "vendor" : "planner",
      });
      console.log("Fetched plans for modal:", plans);
      setBillingData((prev) => ({
        ...prev,
        availablePlans: plans,
        loadingPlans: false,
      }));
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
      setBillingData((prev) => ({
        ...prev,
        loadingPlans: false,
      }));
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await settingsService.updateNotifications(notificationSettings);
      toast.success("Notification settings updated successfully");
    } catch (error: any) {
      console.error("Error updating notifications:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update notification settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-purple-50 text-purple-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Cover Photo Section */}
              <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-500">
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover"
                    fill
                    className="object-cover"
                    style={{ zIndex: 0 }}
                  />
                ) : null}
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                  {coverPreview && (
                    <button
                      type="button"
                      onClick={handleDeleteCover}
                      disabled={uploadingCover}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      console.log(
                        "Cover button clicked",
                        coverInputRef.current
                      );
                      coverInputRef.current?.click();
                    }}
                    disabled={uploadingCover}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-lg transition-colors disabled:opacity-50"
                  >
                    {uploadingCover ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Change Cover</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>

              {/* Avatar Section */}
              <div className="relative px-6 pb-6">
                <div className="relative -mt-16 mb-4">
                  <div className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-100">
                        <UserIcon className="w-16 h-16 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 flex gap-2">
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        disabled={uploadingAvatar}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg transition-colors disabled:opacity-50"
                        title="Delete profile picture"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-lg transition-colors disabled:opacity-50"
                      title="Change profile picture"
                    >
                      {uploadingAvatar ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Address</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={profileData.address.street}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: {
                                ...profileData.address,
                                street: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={profileData.address.city}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                address: {
                                  ...profileData.address,
                                  city: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            State/Province
                          </label>
                          <input
                            type="text"
                            value={profileData.address.state}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                address: {
                                  ...profileData.address,
                                  state: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={profileData.address.country}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                address: {
                                  ...profileData.address,
                                  country: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Zip/Postal Code
                          </label>
                          <input
                            type="text"
                            value={profileData.address.zipCode}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                address: {
                                  ...profileData.address,
                                  zipCode: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">
                Notification Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-3">Notification Types</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New Leads</span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.newLeads}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            newLeads: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Booking Updates</span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.bookingUpdates}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            bookingUpdates: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Reminders</span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.paymentReminders}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            paymentReminders: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
              <div className="space-y-6">
                {/* Change Password */}
                <div>
                  <h3 className="font-medium mb-3">Change Password</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="New Password (min 8 characters)"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-3">
                    Two-Factor Authentication (2FA)
                  </h3>
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
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium mb-2">
                              Step 1: Scan this QR code with your authenticator
                              app
                            </p>
                            {twoFactorData.qrCode && (
                              <img
                                src={twoFactorData.qrCode}
                                alt="2FA QR Code"
                                className="w-48 h-48 mx-auto"
                              />
                            )}
                            <p className="text-xs text-gray-600 mt-2">
                              Or enter this code manually:{" "}
                              <code className="bg-white px-2 py-1 rounded">
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
                                    verificationCode: e.target.value.replace(
                                      /\D/g,
                                      ""
                                    ),
                                  })
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                              />
                              <button
                                type="button"
                                onClick={handleVerify2FA}
                                disabled={loading}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                              >
                                {loading ? "Verifying..." : "Verify"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Two-Factor Authentication is enabled
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleRegenerateBackupCodes}
                          disabled={loading}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Regenerate Backup Codes
                        </button>
                        <button
                          type="button"
                          onClick={handleDisable2FA}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          Disable 2FA
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Backup Codes Display */}
                  {twoFactorData.showBackupCodes &&
                    twoFactorData.backupCodes.length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 mb-2">
                          ⚠️ Save these backup codes in a safe place
                        </p>
                        <p className="text-xs text-yellow-700 mb-3">
                          Each code can only be used once. You'll need these if
                          you lose access to your authenticator app.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {twoFactorData.backupCodes.map((code, index) => (
                            <code
                              key={index}
                              className="block bg-white px-3 py-2 rounded text-sm font-mono"
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
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Billing Settings</h2>
              <div className="space-y-6">
                {/* Current Plan */}
                <div>
                  <h3 className="font-medium mb-3">Current Plan</h3>
                  {billingData.currentPlan ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-lg">
                            {billingData.currentPlan.planName ||
                              "Professional Plan"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {billingData.currentPlan.amount
                              ? `${
                                  billingData.currentPlan.currency === "NGN"
                                    ? "₦"
                                    : billingData.currentPlan.currency
                                } ${(
                                  billingData.currentPlan.amount / 100
                                ).toLocaleString()}`
                              : "₦15,000"}{" "}
                            / {billingData.currentPlan.billingCycle || "month"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Status:{" "}
                            <span
                              className={`font-medium ${
                                billingData.currentPlan.status === "active"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {billingData.currentPlan.status}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenChangePlanModal}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Change Plan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        No active subscription
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenChangePlanModal}
                        className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Subscribe Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Methods */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Payment Methods</h3>
                    <button
                      type="button"
                      onClick={() =>
                        setBillingData({
                          ...billingData,
                          showAddPaymentModal: true,
                        })
                      }
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Add Payment Method
                    </button>
                  </div>

                  {billingData.paymentMethods.length > 0 ? (
                    <div className="space-y-3">
                      {billingData.paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="border rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {method.brand?.toUpperCase() || "Card"} ••••{" "}
                                {method.last4}
                              </p>
                              <p className="text-xs text-gray-600">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </p>
                              {method.isDefault && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!method.isDefault && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetDefaultPaymentMethod(method.id)
                                }
                                disabled={loading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemovePaymentMethod(method.id)
                              }
                              disabled={loading}
                              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        No payment methods on file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Add a payment method to manage your subscription
                      </p>
                    </div>
                  )}
                </div>

                {/* Change Plan Modal */}
                {billingData.showChangePlanModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">
                          Change Subscription Plan
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setBillingData({
                              ...billingData,
                              showChangePlanModal: false,
                            })
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Choose a plan that works best for you. You can change or
                        cancel anytime.
                      </p>
                      <div className="space-y-3">
                        {billingData.loadingPlans ? (
                          <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-gray-600">Loading plans...</p>
                          </div>
                        ) : billingData.availablePlans.length > 0 ? (
                          billingData.availablePlans.map((plan: any) => {
                            const isCurrentPlan =
                              billingData.currentPlan?.planName ===
                              plan.planName;

                            // Get pricing for NGN currency (or first available)
                            const ngnPricing =
                              plan.pricing?.find(
                                (p: any) => p.currency === "NGN"
                              ) || plan.pricing?.[0];
                            const displayPrice = ngnPricing?.amount || 0;
                            const displayCurrency =
                              ngnPricing?.currency || "NGN";

                            return (
                              <div
                                key={plan._id}
                                className={`border-2 rounded-lg p-4 ${
                                  isCurrentPlan
                                    ? "border-purple-600 bg-purple-50"
                                    : "border-gray-200"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-lg">
                                        {plan.displayName || plan.planName}
                                      </p>
                                      {isCurrentPlan && (
                                        <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">
                                          Current Plan
                                        </span>
                                      )}
                                      {plan.isPopular && !isCurrentPlan && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                          Popular
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {displayCurrency === "NGN"
                                        ? "₦"
                                        : displayCurrency}{" "}
                                      {displayPrice.toLocaleString()} /{" "}
                                      {plan.billingCycle}
                                    </p>
                                    {plan.description && (
                                      <p className="text-xs text-gray-500 mt-2">
                                        {plan.description}
                                      </p>
                                    )}
                                    {plan.features &&
                                      plan.features.length > 0 && (
                                        <ul className="mt-3 space-y-1">
                                          {plan.features
                                            .slice(0, 3)
                                            .map(
                                              (
                                                feature: string,
                                                idx: number
                                              ) => (
                                                <li
                                                  key={idx}
                                                  className="text-xs text-gray-600 flex items-center gap-1"
                                                >
                                                  <span className="text-green-600">
                                                    ✓
                                                  </span>
                                                  {feature}
                                                </li>
                                              )
                                            )}
                                          {plan.features.length > 3 && (
                                            <li className="text-xs text-gray-500 italic">
                                              +{plan.features.length - 3} more
                                              features
                                            </li>
                                          )}
                                        </ul>
                                      )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleChangePlan(plan)}
                                    disabled={loading || isCurrentPlan}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                      isCurrentPlan
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-purple-600 text-white hover:bg-purple-700"
                                    } disabled:opacity-50`}
                                  >
                                    {loading
                                      ? "Processing..."
                                      : isCurrentPlan
                                      ? "Current"
                                      : "Select Plan"}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-600">Loading plans...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Payment Method Modal */}
                {billingData.showAddPaymentModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">
                          Add Payment Method
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setBillingData({
                              ...billingData,
                              showAddPaymentModal: false,
                            })
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Cardholder Name */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={paymentForm.cardholderName}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                cardholderName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        {/* Card Number */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            value={paymentForm.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              const formatted =
                                value.match(/.{1,4}/g)?.join(" ") || value;
                              setPaymentForm({
                                ...paymentForm,
                                cardNumber: value,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        {/* Expiry and CVV */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Month
                            </label>
                            <input
                              type="text"
                              placeholder="MM"
                              maxLength={2}
                              value={paymentForm.expiryMonth}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (parseInt(value) <= 12 || value === "") {
                                  setPaymentForm({
                                    ...paymentForm,
                                    expiryMonth: value,
                                  });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Year
                            </label>
                            <input
                              type="text"
                              placeholder="YY"
                              maxLength={2}
                              value={paymentForm.expiryYear}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setPaymentForm({
                                  ...paymentForm,
                                  expiryYear: value,
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              placeholder="123"
                              maxLength={4}
                              value={paymentForm.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setPaymentForm({
                                  ...paymentForm,
                                  cvv: value,
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Security Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-800">
                            🔒 Your payment information is encrypted and secure.
                            Powered by Flutterwave.
                          </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setBillingData({
                                ...billingData,
                                showAddPaymentModal: false,
                              })
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddPaymentMethod}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                          >
                            {loading ? "Adding..." : "Add Card"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Preferences</h2>
              <div className="space-y-6">
                {/* Theme Mode */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() =>
                        setPreferences({ ...preferences, theme: "light" })
                      }
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        preferences.theme === "light"
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center">
                        <Sun className="w-6 h-6 text-yellow-500" />
                      </div>
                      <span className="text-sm font-medium">Light</span>
                    </button>

                    <button
                      onClick={() =>
                        setPreferences({ ...preferences, theme: "dark" })
                      }
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        preferences.theme === "dark"
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
                        <Moon className="w-6 h-6 text-blue-300" />
                      </div>
                      <span className="text-sm font-medium">Dark</span>
                    </button>

                    <button
                      onClick={() =>
                        setPreferences({ ...preferences, theme: "system" })
                      }
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        preferences.theme === "system"
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white to-gray-900 border-2 border-gray-400 flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {preferences.theme === "system"
                      ? "Automatically switch between light and dark mode based on your system settings"
                      : preferences.theme === "dark"
                      ? "Dark mode reduces eye strain in low-light environments"
                      : "Light mode provides a bright, clean interface"}
                  </p>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        language: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timezone
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        timezone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                    <option value="Africa/Johannesburg">
                      Africa/Johannesburg (SAST)
                    </option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Currency
                  </label>
                  <select
                    value={preferences.currency}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        currency: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await settingsService.updatePreferences({
                          theme: preferences.theme as "light" | "dark" | "auto",
                          language: preferences.language,
                          timezone: preferences.timezone,
                          currency: preferences.currency,
                        });

                        // Update user context with new preferences
                        if (user) {
                          setUser({
                            ...user,
                            preferences: {
                              ...user.preferences,
                              theme: preferences.theme as "light" | "dark",
                              language: preferences.language,
                            },
                          });
                        }

                        toast.success("Preferences saved successfully");
                      } catch (error: any) {
                        console.error("Error saving preferences:", error);
                        toast.error(
                          error.response?.data?.message ||
                            "Failed to save preferences"
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
