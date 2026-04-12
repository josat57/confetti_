"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Loader2, Camera, X } from "lucide-react";
import { toast } from "react-toastify";
import { vendorService } from "@/services/vendor.service";

export default function VendorProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    categories: [] as string[], // Service categories (UI allows multiple, backend gets first)
    eventTypes: [] as string[], // Types of events they serve
    businessHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: true },
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  const serviceCategories = [
    { label: "Photography", value: "photography" },
    { label: "Videography", value: "videography" },
    { label: "Catering", value: "catering" },
    { label: "Venue", value: "venue" },
    { label: "Decoration", value: "decoration" },
    { label: "Florals", value: "florals" },
    { label: "Entertainment", value: "entertainment" },
    { label: "Event Planning", value: "event_planning" },
    { label: "Audio/Visual", value: "audio_visual" },
    { label: "Transportation", value: "transportation" },
    { label: "Security", value: "security" },
    { label: "Valet Parking", value: "valet_parking" },
    { label: "Rentals", value: "rentals" },
    { label: "Cake & Desserts", value: "cake_desserts" },
    { label: "Bar Services", value: "bar_services" },
    { label: "Lighting", value: "lighting" },
    { label: "Invitations", value: "invitations" },
    { label: "Favors & Gifts", value: "favors_gifts" },
    { label: "Other", value: "other" },
  ];

  const eventTypeOptions = [
    "wedding",
    "corporate",
    "birthday",
    "graduation",
    "conference",
    "other",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await vendorService.getProfile();

        // Populate form with existing profile data
        setFormData({
          businessName: profile.businessName || "",
          description: profile.description || "",
          email: profile.email || user?.email || "",
          phone: profile.phone || user?.phone || "",
          website: profile.website || "",
          address: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          country: profile.address?.country || "Nigeria",
          categories: profile.category ? [profile.category] : [],
          eventTypes: profile.eventTypes || [],
          businessHours: profile.businessHours?.reduce(
            (acc: any, hour: any) => {
              acc[hour.day as keyof typeof acc] = {
                open: hour.open,
                close: hour.close,
                closed: hour.closed,
              };
              return acc;
            },
            {
              monday: { open: "09:00", close: "17:00", closed: false },
              tuesday: { open: "09:00", close: "17:00", closed: false },
              wednesday: { open: "09:00", close: "17:00", closed: false },
              thursday: { open: "09:00", close: "17:00", closed: false },
              friday: { open: "09:00", close: "17:00", closed: false },
              saturday: { open: "09:00", close: "17:00", closed: false },
              sunday: { open: "09:00", close: "17:00", closed: true },
            }
          ) || {
            monday: { open: "09:00", close: "17:00", closed: false },
            tuesday: { open: "09:00", close: "17:00", closed: false },
            wednesday: { open: "09:00", close: "17:00", closed: false },
            thursday: { open: "09:00", close: "17:00", closed: false },
            friday: { open: "09:00", close: "17:00", closed: false },
            saturday: { open: "09:00", close: "17:00", closed: false },
            sunday: { open: "09:00", close: "17:00", closed: true },
          },
          socialMedia: {
            facebook: profile.socialMedia?.facebook || "",
            instagram: profile.socialMedia?.instagram || "",
            twitter: profile.socialMedia?.twitter || "",
          },
        });

        // Set logo preview if exists
        if (profile.logo) {
          setLogoPreview(profile.logo);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // If profile doesn't exist yet, populate with user data
        if (user) {
          setFormData((prev) => ({
            ...prev,
            email: user.email || "",
            phone: user.phone || "",
            businessName: user.username || "",
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Create preview immediately for better UX
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      try {
        toast.info("Uploading logo...");
        const logoUrl = await vendorService.uploadLogo(file);
        console.log("Logo uploaded, URL:", logoUrl);
        setLogoPreview(logoUrl);
        toast.success("Logo uploaded successfully!");
      } catch (error) {
        console.error("Error uploading logo:", error);
        toast.error("Failed to upload logo. Please try again.");
        // Keep the base64 preview on error instead of removing it
      }
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleEventTypeToggle = (eventType: string) => {
    setFormData((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter((e) => e !== eventType)
        : [...prev.eventTypes, eventType],
    }));
  };

  const handleBusinessHoursChange = (
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare the data in the format expected by the backend
      const profileData: any = {
        businessName: formData.businessName,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
        category: formData.categories[0] || "other", // Backend accepts single category
        eventTypes: formData.eventTypes,
        // Convert business hours to backend format
        businessHours: Object.entries(formData.businessHours).map(
          ([day, hours]) => ({
            day,
            open: hours.open,
            close: hours.close,
            closed: hours.closed,
          })
        ),
        socialMedia: formData.socialMedia,
      };

      // Add logo URL if it exists and is not a data URL (base64)
      if (logoPreview && !logoPreview.startsWith("data:")) {
        profileData.logo = logoPreview;
      }

      // Call the backend API to update profile
      await vendorService.updateProfile(profileData);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your business information and settings
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your business information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Business Logo
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {logoPreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setLogoPreview(null)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                <Camera className="w-4 h-4" />
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your Business Name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tell clients about your business..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="business@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://yourbusiness.com"
              />
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Service Categories *
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Select all services you provide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {serviceCategories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => handleCategoryToggle(category.value)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.categories.includes(category.value)
                    ? "border-purple-600 bg-purple-50 text-purple-600 font-medium"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Event Types You Serve *
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Select the types of events you provide services for
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {eventTypeOptions.map((eventType) => (
              <button
                key={eventType}
                type="button"
                onClick={() => handleEventTypeToggle(eventType)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors capitalize ${
                  formData.eventTypes.includes(eventType)
                    ? "border-purple-600 bg-purple-50 text-purple-600 font-medium"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {eventType}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="State"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Business Hours
          </h2>
          <div className="space-y-3">
            {Object.entries(formData.businessHours).map(([day, hours]) => (
              <div
                key={day}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-28">
                  <span className="font-medium text-gray-900 capitalize">
                    {day}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) =>
                      handleBusinessHoursChange(day, "open", e.target.value)
                    }
                    disabled={hours.closed}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) =>
                      handleBusinessHoursChange(day, "close", e.target.value)
                    }
                    disabled={hours.closed}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <label className="flex items-center gap-2 ml-auto">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) =>
                        handleBusinessHoursChange(
                          day,
                          "closed",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Social Media
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialMedia.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      facebook: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialMedia.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      instagram: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://instagram.com/yourbusiness"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialMedia.twitter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: {
                      ...formData.socialMedia,
                      twitter: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://twitter.com/yourbusiness"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
