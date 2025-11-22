"use client";

import React, { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import settingsService, {
  BrandingData,
} from "@/services/planner/settings.service";

const BrandingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<BrandingData>({
    logo: "",
    primaryColor: "#0d9488",
    secondaryColor: "#14b8a6",
    accentColor: "#2dd4bf",
  });
  const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getBranding();
      setBranding(data);
      if (data.logo) {
        setLogoPreview(data.logo);
      }
    } catch (error) {
      console.error("Failed to load branding:", error);
      toast.error("Failed to load branding");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      const logoUrl = await settingsService.uploadLogo(file);
      setBranding({ ...branding, logo: logoUrl });
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Failed to upload logo:", error);
      toast.error("Failed to upload logo");
    }
  };

  const handleColorChange = (field: keyof BrandingData, value: string) => {
    setBranding({ ...branding, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await settingsService.updateBranding(branding);
      toast.success("Branding updated successfully");
    } catch (error) {
      console.error("Failed to update branding:", error);
      toast.error("Failed to update branding");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Custom Branding
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Customize your brand identity (Business+ tier)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-24 w-24 object-contain border border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Upload Logo
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG or SVG. Max size 2MB. Recommended: 200x200px
                </p>
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Color Scheme
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) =>
                      handleColorChange("primaryColor", e.target.value)
                    }
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) =>
                      handleColorChange("primaryColor", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) =>
                      handleColorChange("secondaryColor", e.target.value)
                    }
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) =>
                      handleColorChange("secondaryColor", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) =>
                      handleColorChange("accentColor", e.target.value)
                    }
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) =>
                      handleColorChange("accentColor", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-12 w-12 object-contain"
                  />
                )}
                <div>
                  <h4
                    className="text-lg font-semibold"
                    style={{ color: branding.primaryColor }}
                  >
                    Your Company Name
                  </h4>
                  <p className="text-sm text-gray-600">
                    Event Planning Dashboard
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  style={{ backgroundColor: branding.primaryColor }}
                  className="px-4 py-2 text-white rounded-md text-sm font-medium"
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: branding.secondaryColor }}
                  className="ml-3 px-4 py-2 text-white rounded-md text-sm font-medium"
                >
                  Secondary Button
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: branding.accentColor }}
                  className="ml-3 px-4 py-2 text-white rounded-md text-sm font-medium"
                >
                  Accent Button
                </button>
              </div>

              <div
                className="mt-6 p-4 rounded-lg"
                style={{ backgroundColor: `${branding.primaryColor}20` }}
              >
                <p className="text-sm" style={{ color: branding.primaryColor }}>
                  This is how your brand colors will appear in notifications and
                  highlights.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={loadBranding}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandingPage;
