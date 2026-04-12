"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Save,
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { eventService } from "@/services/event.service";

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [monthlyListingsCount, setMonthlyListingsCount] = useState(0);
  const [canCreateListing, setCanCreateListing] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    startDate: "",
    endDate: "",
    location: {
      venue: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "Nigeria",
      },
      coordinates: [3.3792, 6.5244] as [number, number], // [longitude, latitude]
    },
    budget: 0,
    guestCount: 0,
    capacity: 0,
    category: "",
    organizer: {
      name: "",
      email: "",
      phone: "",
    },
    price: {
      amount: 0,
      currency: "NGN",
    },
    description: "",
    status: "draft" as "draft" | "published" | "completed",
  });

  // Check monthly listing limit for Basic tier
  useEffect(() => {
    const checkMonthlyLimit = async () => {
      if ((user as any)?.subscriptionTier !== "basic") {
        setCanCreateListing(true);
        return;
      }

      try {
        const currentMonthCount = await eventService.getMonthlyCount();
        setMonthlyListingsCount(currentMonthCount);

        const BASIC_TIER_MONTHLY_LIMIT = 5;
        setCanCreateListing(currentMonthCount < BASIC_TIER_MONTHLY_LIMIT);

        if (currentMonthCount >= BASIC_TIER_MONTHLY_LIMIT) {
          toast.error(
            "You've reached your monthly limit of 5 event listings. Upgrade to Professional for unlimited listings."
          );
        }
      } catch (error) {
        console.error("Error checking monthly limit:", error);
        // Allow creation if API call fails
        setCanCreateListing(true);
      }
    };

    if (user) {
      checkMonthlyLimit();
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check tier limits (Basic: 10 photos, Professional+: 100 photos)
    const maxPhotos = (user as any)?.subscriptionTier === "basic" ? 10 : 100;

    if (photoPreview.length + files.length > maxPhotos) {
      toast.error(`You can upload up to ${maxPhotos} photos`);
      return;
    }

    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setPhotoPreview((prev) => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setPhotoFiles((prev) => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    if (!formData.eventType) {
      toast.error("Please select an event type");
      return;
    }

    if (!formData.startDate) {
      toast.error("Please select a start date");
      return;
    }

    if (!formData.endDate) {
      toast.error("Please select an end date");
      return;
    }

    if (!formData.location.address.city || !formData.location.address.state) {
      toast.error("Please enter event location");
      return;
    }

    if (formData.budget <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }

    if (formData.guestCount <= 0) {
      toast.error("Please enter guest count");
      return;
    }

    if (formData.capacity <= 0) {
      toast.error("Please enter event capacity");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.organizer.name.trim()) {
      toast.error("Please enter organizer name");
      return;
    }

    setSaving(true);

    try {
      // Step 1: Create the event
      toast.info("Creating event...");
      const event = await eventService.create({
        title: formData.title,
        eventType: formData.eventType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        budget: formData.budget,
        guestCount: formData.guestCount,
        description: formData.description,
        status: formData.status,
      });

      // Step 2: Upload photos if any
      if (photoFiles.length > 0) {
        toast.info(`Uploading ${photoFiles.length} photo(s)...`);
        await eventService.uploadPhotos(event._id, photoFiles);
      }

      toast.success("Event listing created successfully!");
      router.push("/vendor/dashboard/events");
    } catch (error: any) {
      console.error("Error creating event:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to create event listing. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/vendor/dashboard/events"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Event</h1>
        <p className="text-gray-600 mt-1">
          Showcase your work by adding a new event to your portfolio
        </p>
      </div>

      {/* Monthly Limit Warning for Basic Tier */}
      {(user as any)?.subscriptionTier === "basic" && !canCreateListing && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">
                Monthly Limit Reached
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                You've created {monthlyListingsCount} out of 5 event listings
                this month. Upgrade to Professional tier for unlimited event
                listings.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Upgrade to Professional
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Listing Count Info for Basic Tier */}
      {(user as any)?.subscriptionTier === "basic" && canCreateListing && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                You've created {monthlyListingsCount} out of 5 event listings
                this month.
                {5 - monthlyListingsCount} remaining.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Disable form if limit reached */}
        <fieldset disabled={!canCreateListing}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Event Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Beautiful Garden Wedding"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  required
                  value={formData.eventType}
                  onChange={(e) =>
                    setFormData({ ...formData, eventType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select event type</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="birthday">Birthday</option>
                  <option value="graduation">Graduation</option>
                  <option value="conference">Conference</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Count *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.guestCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guestCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="social">Social</option>
                  <option value="conference">Conference</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Maximum capacity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: {
                          ...formData.price,
                          amount: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Organizer Information *
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={formData.organizer.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizer: {
                          ...formData.organizer,
                          name: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Organizer name *"
                  />
                  <input
                    type="email"
                    value={formData.organizer.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizer: {
                          ...formData.organizer,
                          email: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Organizer email"
                  />
                  <input
                    type="tel"
                    value={formData.organizer.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizer: {
                          ...formData.organizer,
                          phone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Organizer phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.location.venue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, venue: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Event venue name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.location.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: {
                          ...formData.location.address,
                          street: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          address: {
                            ...formData.location.address,
                            city: e.target.value,
                          },
                        },
                      })
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
                    value={formData.location.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          address: {
                            ...formData.location.address,
                            state: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe the event..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as typeof formData.status,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="completed">Completed</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Draft events are only visible to you
                </p>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Event Photos
            </h2>

            <div className="space-y-4">
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                  <ImageIcon className="w-4 h-4" />
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or GIF. Max size 5MB per photo.
                  {(user as any)?.subscriptionTier === "basic"
                    ? " Basic tier: up to 10 photos"
                    : " Professional+: up to 100 photos"}
                </p>
              </div>

              {/* Photo Preview Grid */}
              {photoPreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photoPreview.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                    >
                      <img
                        src={photo}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              href="/vendor/dashboard/events"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !canCreateListing}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create Event</span>
                </>
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
