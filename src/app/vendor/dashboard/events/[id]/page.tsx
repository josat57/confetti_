"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Save,
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { eventService } from "@/services/event.service";

interface EventListing {
  _id: string;
  vendor: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  photos?: Array<{
    _id: string;
    url: string;
    caption?: string;
    order: number;
  }>;
  media?: Array<{
    _id: string;
    type: string;
    fileId: string;
    url: string;
    caption?: string;
    isGridFS?: boolean;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  status: "draft" | "published" | "completed";
  createdAt: string;
  updatedAt: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<EventListing | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "draft" as "draft" | "published" | "completed",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const fetchedEvent = (await eventService.getById(
          params.id as string
        )) as any;
        setEvent(fetchedEvent);

        setFormData({
          title: fetchedEvent.title,
          startDate: (fetchedEvent.startDate || fetchedEvent.date || "").split(
            "T"
          )[0],
          endDate: (fetchedEvent.endDate || fetchedEvent.date || "").split(
            "T"
          )[0],
          description: fetchedEvent.description || "",
          status: fetchedEvent.status,
        });

        // Set existing photos - check media array first (new format), then photos (old format)
        if (fetchedEvent.media && fetchedEvent.media.length > 0) {
          setPhotoPreview(
            fetchedEvent.media.map((m: any) => {
              // Handle base64 images
              if (m.url && m.url.startsWith("data:image")) {
                return m.url;
              }
              // Handle GridFS images
              if (m.isGridFS && m.fileId) {
                return `/api/v1/files/${m.fileId}`;
              }
              return m.url;
            })
          );
        } else if (fetchedEvent.photos && fetchedEvent.photos.length > 0) {
          setPhotoPreview(fetchedEvent.photos.map((p: any) => p.url));
        }
      } catch (error: any) {
        console.error("Error fetching event:", error);
        const errorMessage =
          error?.response?.data?.message || "Failed to load event";
        toast.error(errorMessage);
        router.push("/vendor/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id, router]);

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

    setNewPhotoFiles((prev) => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    // Check if this is an existing photo or a new one
    const existingPhotosCount = event?.photos?.length || 0;

    if (index < existingPhotosCount && event?.photos) {
      // Mark existing photo for deletion
      const photoId = event.photos[index]._id;
      setPhotosToDelete((prev) => [...prev, photoId]);
    } else {
      // Remove from new photos
      const newPhotoIndex = index - existingPhotosCount;
      setNewPhotoFiles((prev) => prev.filter((_, i) => i !== newPhotoIndex));
    }

    setPhotoPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter an event title");
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

    setSaving(true);

    try {
      // Step 1: Update event details
      await eventService.update(params.id as string, {
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        status: formData.status,
        // createdBy is handled by the backend
      });

      // Step 2: Delete photos marked for deletion
      if (photosToDelete.length > 0) {
        for (const photoId of photosToDelete) {
          await eventService.deleteMedia(params.id as string, photoId);
        }
      }

      // Step 3: Upload new photos
      if (newPhotoFiles.length > 0) {
        await eventService.uploadPhotos(params.id as string, newPhotoFiles);
      }

      toast.success("Event listing updated successfully!");
      router.push("/vendor/dashboard/events");
    } catch (error: any) {
      console.error("Error updating event:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to update event listing";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-1">Update your event listing details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe the event, your role, and what made it special..."
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
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
