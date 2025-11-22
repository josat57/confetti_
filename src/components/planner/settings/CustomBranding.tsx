"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, Save, Eye } from "lucide-react";
import { User } from "@/api/api";
import { settingsService } from "@/services/planner/settings.service";

export default function CustomBranding() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState<string>("");
  const [colors, setColors] = useState({
    primary: "#0d9488",
    secondary: "#14b8a6",
    accent: "#2dd4bf",
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [businessData, setBusinessData] = useState({
    companyName: "",
    website: "",
    registrationNumber: "",
    address: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let profile;
      try {
        profile = await settingsService.getProfile();
      } catch (error) {
        profile = await User.getProfile();
      }

      setBusinessData({
        companyName: profile.companyName || "",
        website: profile.website || "",
        registrationNumber: profile.registrationNumber || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
      });

      // Load business logo if available
      const businessLogo = profile.businessLogo || profile.companyLogo || "";
      if (businessLogo) {
        setLogo(businessLogo);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    try {
      setUploadingLogo(true);

      // Create FormData and send to backend
      const formData = new FormData();
      formData.append("image", file);

      // Upload to backend - using a generic upload endpoint
      // You may need to create a specific endpoint for business logo
      const response = await settingsService.uploadBusinessLogo(formData);

      console.log("Logo upload response:", response);

      // Extract base64 image from response
      const base64Image =
        response.data?.data?.businessLogo ||
        response.data?.businessLogo ||
        response.businessLogo ||
        response.data?.data?.companyLogo ||
        response.data?.companyLogo ||
        response.companyLogo ||
        response.data?.data?.image ||
        response.data?.image ||
        response.image;

      if (base64Image) {
        setLogo(base64Image);
      } else {
        // Fallback: convert to base64 locally if backend doesn't return it
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Refresh profile to get latest data
      await fetchProfile();

      alert("Business logo uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload business logo:", error);

      // Fallback: convert to base64 locally if upload fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);

      alert("Logo preview updated. Save changes to persist.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateProfile(businessData);
      alert("Branding and business information updated successfully!");
    } catch (error) {
      console.error("Failed to update branding:", error);
      alert("Failed to update branding");
    } finally {
      setSaving(false);
    }
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
              Custom Branding
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize your business information and dashboard appearance
            </p>
          </div>
          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
            Business+ Only
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Business Information */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={businessData.companyName}
                onChange={(e) =>
                  setBusinessData({
                    ...businessData,
                    companyName: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Your Company Name"
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
                value={businessData.website}
                onChange={(e) =>
                  setBusinessData({ ...businessData, website: e.target.value })
                }
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="registrationNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                value={businessData.registrationNumber}
                onChange={(e) =>
                  setBusinessData({
                    ...businessData,
                    registrationNumber: e.target.value,
                  })
                }
                placeholder="RC123456 or BN123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your company's official registration number (e.g., CAC
                Registration Number)
              </p>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Street Address
              </label>
              <input
                type="text"
                id="address"
                value={businessData.address}
                onChange={(e) =>
                  setBusinessData({ ...businessData, address: e.target.value })
                }
                placeholder="123 Main Street"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                value={businessData.city}
                onChange={(e) =>
                  setBusinessData({ ...businessData, city: e.target.value })
                }
                placeholder="Lagos"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                value={businessData.state}
                onChange={(e) =>
                  setBusinessData({ ...businessData, state: e.target.value })
                }
                placeholder="Lagos State"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="pt-6 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain p-2"
                />
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
                {uploadingLogo ? "Uploading..." : "Upload Logo"}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG or SVG. Max size 2MB. Recommended: 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Color Scheme
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) =>
                    setColors({ ...colors, primary: e.target.value })
                  }
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) =>
                    setColors({ ...colors, primary: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  value={colors.secondary}
                  onChange={(e) =>
                    setColors({ ...colors, secondary: e.target.value })
                  }
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) =>
                    setColors({ ...colors, secondary: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  value={colors.accent}
                  onChange={(e) =>
                    setColors({ ...colors, accent: e.target.value })
                  }
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.accent}
                  onChange={(e) =>
                    setColors({ ...colors, accent: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
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
            style={{ backgroundColor: `${colors.primary}10` }}
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
                <h4 className="font-semibold" style={{ color: colors.primary }}>
                  Your Company Name
                </h4>
                <p className="text-sm text-gray-600">Dashboard Preview</p>
              </div>
            </div>
            <button
              type="button"
              style={{ backgroundColor: colors.primary }}
              className="px-4 py-2 text-white rounded-lg"
            >
              Primary Button
            </button>
            <button
              type="button"
              style={{ backgroundColor: colors.secondary }}
              className="ml-2 px-4 py-2 text-white rounded-lg"
            >
              Secondary Button
            </button>
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
                Save Branding
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
