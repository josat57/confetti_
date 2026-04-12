"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Loader2,
  Save,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  businessProfileService,
  BusinessProfileData,
} from "@/services/planner/business-profile.service";
import { toast } from "react-toastify";

export default function CustomBranding() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    website: "",
    description: "",
    yearEstablished: "",
    taxId: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    zipCode: "",
  });

  const [logo, setLogo] = useState<string>("");
  const [branding, setBranding] = useState({
    primaryColor: "#0d9488",
    secondaryColor: "#14b8a6",
    accentColor: "#2dd4bf",
    fontFamily: "Inter",
    customCSS: "",
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      setLoading(true);
      const profileData = await businessProfileService.getProfile();

      if (profileData) {
        setProfile(profileData);
        setHasProfile(true);
        setFormData({
          companyName: profileData.companyName || "",
          registrationNumber: profileData.registrationNumber || "",
          website: profileData.website || "",
          description: profileData.description || "",
          yearEstablished: profileData.yearEstablished?.toString() || "",
          taxId: profileData.taxId || "",
          street: profileData.address?.street || "",
          city: profileData.address?.city || "",
          state: profileData.address?.state || "",
          country: profileData.address?.country || "Nigeria",
          zipCode: profileData.address?.zipCode || "",
        });

        if (profileData.logo) {
          console.log("Loading logo from profile:", profileData.logo);
          setLogo(profileData.logo);
        } else {
          console.log("No logo found in profile data");
        }

        // Load branding theme
        if (profileData.branding) {
          setBranding({
            primaryColor: profileData.branding.primaryColor || "#0d9488",
            secondaryColor: profileData.branding.secondaryColor || "#14b8a6",
            accentColor: profileData.branding.accentColor || "#2dd4bf",
            fontFamily: profileData.branding.fontFamily || "Inter",
            customCSS: profileData.branding.customCSS || "",
          });
        }
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Failed to fetch business profile:", error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.companyName || formData.companyName.trim().length === 0) {
      errors.push("Company name is required");
    }

    if (formData.companyName && formData.companyName.length > 200) {
      errors.push("Company name must be less than 200 characters");
    }

    if (!formData.street || formData.street.trim().length === 0) {
      errors.push("Street address is required");
    }

    if (!formData.city || formData.city.trim().length === 0) {
      errors.push("City is required");
    }

    if (!formData.state || formData.state.trim().length === 0) {
      errors.push("State is required");
    }

    if (formData.yearEstablished) {
      const year = parseInt(formData.yearEstablished);
      if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
        errors.push("Please enter a valid year established");
      }
    }

    // Validate hex colors
    if (!isValidHexColor(branding.primaryColor)) {
      errors.push("Primary color must be a valid hex color (e.g., #0d9488)");
    }

    if (!isValidHexColor(branding.secondaryColor)) {
      errors.push("Secondary color must be a valid hex color (e.g., #14b8a6)");
    }

    if (!isValidHexColor(branding.accentColor)) {
      errors.push("Accent color must be a valid hex color (e.g., #2dd4bf)");
    }

    return errors;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingLogo(true);

      // Show immediate preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      const result = await businessProfileService.uploadLogo(file);

      console.log("Logo upload result:", result);
      console.log(
        "Logo upload result structure:",
        JSON.stringify(result, null, 2)
      );

      // Update with backend response if available
      // The service returns response.data.data || response.data
      // So result should directly have the logo property
      if (result && result.logo) {
        console.log("Setting logo from result.logo:", result.logo);
        setLogo(result.logo);
        toast.success("Logo uploaded successfully!");
      } else {
        console.warn("Logo not found in response, keeping preview");
        toast.success("Logo uploaded successfully!");
      }

      // Refresh profile to get latest data
      await fetchBusinessProfile();
    } catch (error: any) {
      console.error("Failed to upload logo:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload logo";
      toast.error(errorMessage);

      // Revert preview on error
      await fetchBusinessProfile();
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm("Are you sure you want to delete your business logo?")) return;

    try {
      await businessProfileService.deleteLogo();
      setLogo("");
      toast.success("Logo deleted successfully!");
      await fetchBusinessProfile();
    } catch (error: any) {
      console.error("Failed to delete logo:", error);
      toast.error(error.response?.data?.message || "Failed to delete logo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      setSaving(true);

      const profileData: Partial<BusinessProfileData> = {
        companyName: formData.companyName,
        registrationNumber: formData.registrationNumber || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
        yearEstablished: formData.yearEstablished
          ? parseInt(formData.yearEstablished)
          : undefined,
        taxId: formData.taxId || undefined,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode || undefined,
        },
        branding: {
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          accentColor: branding.accentColor,
          fontFamily: branding.fontFamily,
          customCSS: branding.customCSS || undefined,
        },
      };

      if (hasProfile) {
        await businessProfileService.updateProfile(profileData);
        toast.success("Business profile updated successfully!");
      } else {
        await businessProfileService.createProfile(profileData);
        toast.success("Business profile created! Pending verification.");
        setHasProfile(true);
      }

      // Refresh profile
      await fetchBusinessProfile();
    } catch (error: any) {
      console.error("Failed to save business profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save business profile";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getVerificationBadge = () => {
    if (!profile) return null;

    const badges = {
      verified: {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Verified",
        color: "bg-green-100 text-green-800 border-green-200",
        tooltip: "This business has been verified by our team",
      },
      pending: {
        icon: <Clock className="w-4 h-4" />,
        text: "Pending Verification",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        tooltip: "Verification in progress",
      },
      rejected: {
        icon: <AlertCircle className="w-4 h-4" />,
        text: "Not Verified",
        color: "bg-red-100 text-red-800 border-red-200",
        tooltip: "Verification was not approved",
      },
    };

    const badge = badges[profile.verificationStatus || "pending"];

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}
        title={badge.tooltip}
      >
        {badge.icon}
        <span>{badge.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Business Profile & Branding
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your business information, logo, and get verified
            </p>
          </div>
          {profile && getVerificationBadge()}
        </div>
      </div>

      {/* Verification Status Message */}
      {profile?.verificationStatus === "rejected" &&
        profile.rejectionReason && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">
                  Verification Not Approved
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {profile.rejectionReason}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Please update your information and resubmit.
                </p>
              </div>
            </div>
          </div>
        )}

      {profile?.verificationStatus === "pending" && (
        <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">
                Verification Pending
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Your profile is being reviewed by our team. This usually takes
                1-2 business days.
              </p>
            </div>
          </div>
        </div>
      )}

      {profile?.verificationStatus === "verified" && (
        <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">Profile Verified</h4>
              <p className="text-sm text-green-700 mt-1">
                Your business profile has been verified! You now have access to
                all features.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Company Information */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Your Company Name"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label
                htmlFor="registrationNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., RC-123456"
                maxLength={50}
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label
                htmlFor="yearEstablished"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Year Established
              </label>
              <input
                type="number"
                id="yearEstablished"
                value={formData.yearEstablished}
                onChange={(e) =>
                  setFormData({ ...formData, yearEstablished: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="2020"
                min={1800}
                max={new Date().getFullYear()}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Tell us about your business..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Business Address <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="street"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Lagos"
                required
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Lagos State"
                required
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country
              </label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Nigeria"
              />
            </div>

            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Zip Code
              </label>
              <input
                type="text"
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="100001"
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Tax Information (Optional)
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="taxId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tax ID
              </label>
              <input
                type="password"
                id="taxId"
                value={formData.taxId}
                onChange={(e) =>
                  setFormData({ ...formData, taxId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="This information is encrypted"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <span>🔒</span>
                <span>
                  This information is encrypted and only visible to
                  administrators
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Company Logo */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Company Logo
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative">
              {logo ? (
                <>
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      console.error("Failed to load logo image:", logo);
                      console.error("Image error event:", e);
                    }}
                    onLoad={() => {
                      console.log("Logo image loaded successfully");
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleDeleteLogo}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <label
                htmlFor="logo-upload"
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${
                  uploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploadingLogo
                  ? "Uploading..."
                  : logo
                  ? "Change Logo"
                  : "Upload Logo"}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Max size: 5MB. Formats: JPG, PNG, GIF, WebP
              </p>
              <p className="text-xs text-gray-500">Recommended: 200x200px</p>
            </div>
          </div>
        </div>

        {/* Branding & Theming */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Branding & Theming
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            🎨 Customize your dashboard appearance with your brand colors and
            fonts. Changes apply instantly on your next login!
          </p>

          <div className="space-y-6">
            {/* Color Scheme */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Color Scheme
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          primaryColor: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="#0d9488"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          secondaryColor: e.target.value,
                        })
                      }
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          secondaryColor: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="#14b8a6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          accentColor: e.target.value,
                        })
                      }
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.accentColor}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          accentColor: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="#2dd4bf"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Typography
              </h4>
              <div>
                <label
                  htmlFor="fontFamily"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Font Family
                </label>
                <select
                  id="fontFamily"
                  value={branding.fontFamily}
                  onChange={(e) =>
                    setBranding({ ...branding, fontFamily: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Georgia">Georgia</option>
                  <option value="System">System Default</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose a font that matches your brand identity
                </p>
              </div>
            </div>

            {/* Custom CSS */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Advanced Customization
              </h4>
              <div>
                <label
                  htmlFor="customCSS"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Custom CSS (Optional)
                </label>
                <textarea
                  id="customCSS"
                  value={branding.customCSS}
                  onChange={(e) =>
                    setBranding({ ...branding, customCSS: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
                  placeholder={`/* Add custom CSS here */\n.dashboard-header {\n  /* Your styles */\n}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Advanced users only. Invalid CSS may affect dashboard
                  appearance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">Preview</h3>
          </div>
          <div
            className="border-2 border-gray-200 rounded-lg p-6"
            style={{
              backgroundColor: `${branding.primaryColor}10`,
              fontFamily: `'${branding.fontFamily}', sans-serif`,
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              {logo && (
                <img
                  src={logo}
                  alt="Logo"
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <h4
                  className="font-semibold text-lg"
                  style={{ color: branding.primaryColor }}
                >
                  {formData.companyName || "Your Company Name"}
                </h4>
                <p className="text-sm text-gray-600">Dashboard Preview</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  style={{ backgroundColor: branding.primaryColor }}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: branding.secondaryColor }}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Secondary Button
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: branding.accentColor,
                    color: "#fff",
                  }}
                  className="px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Accent Button
                </button>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  🎨 This is how your dashboard will look with your custom
                  branding. Colors and fonts apply automatically on your next
                  login!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {hasProfile ? "Update Profile" : "Create Profile"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
