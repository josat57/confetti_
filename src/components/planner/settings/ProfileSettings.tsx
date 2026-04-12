"use client";

import { useState, useEffect } from "react";
import { Camera, Loader2, Save, X, Upload } from "lucide-react";
import { User } from "@/api/api";
import { settingsService } from "@/services/planner/settings.service";
import { toast } from "react-toastify";

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    email: "",
    phone: "",
    aboutMe: "",
    street: "",
    city: "",
    state: "",
    nationality: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Try to get profile from planner settings endpoint first
      let profile;
      try {
        profile = await settingsService.getProfile();
      } catch (error) {
        console.log(
          "Planner settings endpoint failed, trying User.getProfile()"
        );
        // Fallback to User.getProfile() if planner endpoint fails
        profile = await User.getProfile();
      }

      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        otherName: profile.otherName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        aboutMe: profile.aboutMe || profile.bio || "",
        street: profile.street || profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        nationality: profile.nationality || profile.country || "",
      });

      // Handle base64 or URL images - try multiple field names
      const profileImg = profile.profileImage || profile.profilePicture || "";
      const coverImg = profile.coverPhoto || "";

      console.log("Fetched profile image:", profileImg ? "Found" : "Not found");
      console.log("Fetched cover photo:", coverImg ? "Found" : "Not found");

      setProfileImage(profileImg);
      setCoverPhoto(coverImg);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    try {
      setUploadingProfile(true);

      // Send to backend with "image" field name (as per backend expectation)
      const formData = new FormData();
      formData.append("image", file);

      const response = await User.uploadProfileImage(formData);

      console.log("Upload response:", response);
      console.log(
        "Full response structure:",
        JSON.stringify(response, null, 2)
      );

      // Backend returns base64 image in profileImage field
      // Try multiple possible response structures
      // Backend structure: { status: "success", data: { profile: { profileImage: "..." } } }
      const base64Image =
        response.data?.data?.profile?.profileImage ||
        response.data?.profile?.profileImage ||
        response.data?.data?.profileImage ||
        response.data?.profileImage ||
        response.profileImage ||
        response.data?.data?.profilePicture ||
        response.data?.profilePicture ||
        response.data?.data?.image ||
        response.data?.image ||
        response.image;

      console.log(
        "Extracted base64 image:",
        base64Image ? "Found" : "Not found"
      );

      if (base64Image) {
        // Update local state with base64 image immediately
        setProfileImage(base64Image);
      }

      // Always refresh profile to ensure we have the latest data
      // This handles cases where the response structure is different
      await fetchProfile();

      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Failed to upload profile image:", error);
      toast.error("Failed to upload profile image");
      // Revert on error
      await fetchProfile();
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

    try {
      setUploadingCover(true);

      // Send to backend with "image" field name (as per backend expectation)
      const formData = new FormData();
      formData.append("image", file);

      const response = await User.uploadCoverPhoto(formData);

      console.log("Cover upload response:", response);
      console.log(
        "Full cover response structure:",
        JSON.stringify(response, null, 2)
      );

      // Backend returns base64 image in coverPhoto field
      // Try multiple possible response structures
      // Backend structure: { status: "success", data: { profile: { coverPhoto: "..." } } }
      const base64Image =
        response.data?.data?.profile?.coverPhoto ||
        response.data?.profile?.coverPhoto ||
        response.data?.data?.coverPhoto ||
        response.data?.coverPhoto ||
        response.coverPhoto ||
        response.data?.data?.image ||
        response.data?.image ||
        response.image;

      console.log(
        "Extracted cover base64 image:",
        base64Image ? "Found" : "Not found"
      );

      if (base64Image) {
        // Update local state with base64 image immediately
        setCoverPhoto(base64Image);
      }

      // Always refresh profile to ensure we have the latest data
      // This handles cases where the response structure is different
      await fetchProfile();

      toast.success("Cover photo updated successfully!");
    } catch (error) {
      console.error("Failed to upload cover photo:", error);
      toast.error("Failed to upload cover photo");
      // Revert on error
      await fetchProfile();
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!confirm("Are you sure you want to remove your profile image?")) return;

    try {
      await User.deleteProfileImage();
      setProfileImage("");
      toast.success("Profile image removed successfully!");
    } catch (error) {
      console.error("Failed to delete profile image:", error);
      toast.error("Failed to delete profile image");
    }
  };

  const handleDeleteCoverPhoto = async () => {
    if (!confirm("Are you sure you want to remove your cover photo?")) return;

    try {
      await User.deleteCoverPhoto();
      setCoverPhoto("");
      toast.success("Cover photo removed successfully!");
    } catch (error) {
      console.error("Failed to delete cover photo:", error);
      toast.error("Failed to delete cover photo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateProfile(formData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Cover Photo Section */}
      <div className="relative h-48 bg-gradient-to-r from-teal-500 to-teal-600">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Upload className="w-12 h-12 text-white opacity-50" />
          </div>
        )}

        {/* Cover Photo Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <label
            htmlFor="cover-photo"
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
          >
            {uploadingCover ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {coverPhoto ? "Change" : "Upload"} Cover
            </span>
            <input
              id="cover-photo"
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoUpload}
              disabled={uploadingCover}
              className="hidden"
            />
          </label>
          {coverPhoto && (
            <button
              type="button"
              onClick={handleDeleteCoverPhoto}
              className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile Image - Overlapping Cover */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                <Camera className="w-10 h-10 text-gray-400" />
              </div>
            )}

            {/* Profile Image Actions */}
            <div className="absolute bottom-0 right-0 flex gap-1">
              <label
                htmlFor="profile-image"
                className="bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors shadow-lg"
              >
                {uploadingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  disabled={uploadingProfile}
                  className="hidden"
                />
              </label>
              {profileImage && (
                <button
                  type="button"
                  onClick={handleDeleteProfileImage}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Header */}
      <div className="pt-20 px-6 pb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Profile Information
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Update your personal and business information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                placeholder="John"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                placeholder="Doe"
              />
            </div>

            <div>
              <label
                htmlFor="otherName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Other Name
              </label>
              <input
                type="text"
                id="otherName"
                value={formData.otherName}
                onChange={(e) =>
                  setFormData({ ...formData, otherName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Middle name or nickname"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="+234 800 000 0000"
              />
            </div>

            <div>
              <label
                htmlFor="nationality"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nationality
              </label>
              <input
                type="text"
                id="nationality"
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Nigerian"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="aboutMe"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                About Me
              </label>
              <textarea
                id="aboutMe"
                value={formData.aboutMe}
                onChange={(e) =>
                  setFormData({ ...formData, aboutMe: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Tell us about yourself, your experience, and what makes you unique..."
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Street Address
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
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Lagos"
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
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Lagos State"
              />
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
