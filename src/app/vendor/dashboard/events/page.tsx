"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Calendar,
  Image,
  Eye,
  Edit,
  Trash2,
  Filter,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
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

export default function EventListingsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "draft" | "published" | "completed"
  >("all");
  const [monthlyListingsCount, setMonthlyListingsCount] = useState(0);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Fetch events from API
        const fetchedEvents = await eventService.getAll();
        setEvents(fetchedEvents);

        // Get monthly count for Basic tier
        if (user?.subscriptionTier === "basic") {
          const count = await eventService.getMonthlyCount();
          setMonthlyListingsCount(count);
        }
      } catch (error: any) {
        console.error("Error fetching events:", error);
        const errorMessage =
          error?.response?.data?.message || "Failed to load event listings";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.status === filter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event listing?")) return;

    try {
      await eventService.delete(id);
      setEvents(events.filter((e) => e._id !== id));
      toast.success("Event listing deleted successfully");
    } catch (error: any) {
      console.error("Error deleting event:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to delete event listing";
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Listings</h1>
          <p className="text-gray-600 mt-1">
            Showcase your past work and build your portfolio
          </p>
        </div>
        <Link
          href="/vendor/dashboard/events/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </Link>
      </div>

      {/* Monthly Limit Banner for Basic Tier */}
      {user?.subscriptionTier === "basic" && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            monthlyListingsCount >= 5
              ? "bg-red-50 border-red-200"
              : monthlyListingsCount >= 4
              ? "bg-yellow-50 border-yellow-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                monthlyListingsCount >= 5
                  ? "text-red-600"
                  : monthlyListingsCount >= 4
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`}
            />
            <div className="flex-1">
              <p
                className={`text-sm ${
                  monthlyListingsCount >= 5
                    ? "text-red-800"
                    : monthlyListingsCount >= 4
                    ? "text-yellow-800"
                    : "text-blue-800"
                }`}
              >
                {monthlyListingsCount >= 5 ? (
                  <>
                    You've reached your monthly limit of 5 event listings.
                    <Link
                      href="/pricing"
                      className="font-semibold underline ml-1"
                    >
                      Upgrade to Professional
                    </Link>{" "}
                    for unlimited listings.
                  </>
                ) : (
                  <>
                    You've created {monthlyListingsCount} out of 5 event
                    listings this month.
                    {5 - monthlyListingsCount} remaining.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {["all", "published", "draft", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === status
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {status}
            {status === "all" && ` (${events.length})`}
            {status !== "all" &&
              ` (${events.filter((e) => e.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Event Listings */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No event listings yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start building your portfolio by adding your first event listing
          </p>
          <Link
            href="/vendor/dashboard/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Event</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Event Image */}
              <div className="relative h-48 bg-gray-200">
                {(() => {
                  // Check for media array first (new format with base64)
                  if (event.media && event.media.length > 0) {
                    const firstMedia = event.media[0];
                    // Handle base64 images
                    if (
                      firstMedia.url &&
                      firstMedia.url.startsWith("data:image")
                    ) {
                      return (
                        <img
                          src={firstMedia.url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      );
                    }
                    // Handle GridFS images
                    if (firstMedia.isGridFS && firstMedia.fileId) {
                      return (
                        <img
                          src={`/api/v1/files/${firstMedia.fileId}`}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      );
                    }
                  }
                  // Fallback to photos array (old format)
                  if (event.photos && event.photos.length > 0) {
                    return (
                      <img
                        src={event.photos[0].url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    );
                  }
                  // No image available
                  return (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  );
                })()}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {event.description || "No description"}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/vendor/dashboard/events/${event._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
