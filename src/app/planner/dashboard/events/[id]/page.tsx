"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Edit,
  ArrowLeft,
  Briefcase,
  CheckSquare,
  FileText,
} from "lucide-react";
import { eventsService } from "@/services/planner/events.service";
import { Event } from "@/types/planner";
import { format } from "date-fns";

interface EventDetailsPageProps {
  params: {
    id: string;
  };
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const data = await eventsService.getEvent(params.id);
      setEvent(data);
    } catch (error) {
      console.error("Failed to fetch event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Event["status"]) => {
    if (!event) return;

    try {
      await eventsService.updateEventStatus(event._id, newStatus);
      setEvent({ ...event, status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Event not found</p>
        <button
          onClick={() => router.push("/planner/dashboard/events")}
          className="text-teal-600 hover:text-teal-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const statusColors = {
    Draft: "bg-gray-100 text-gray-800",
    Planning: "bg-blue-100 text-blue-800",
    Confirmed: "bg-green-100 text-green-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    Completed: "bg-purple-100 text-purple-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/planner/dashboard/events")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{event.type}</p>
          </div>
        </div>
        <div className="flex gap-2">
        <button
          onClick={() => router.push(`/planner/dashboard/events/${event._id}/portal`)}
          className="inline-flex items-center px-4 py-2 border border-teal-200 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
        >
          Client portal
        </button>
        <button
          onClick={() =>
            router.push(`/planner/dashboard/events/${event._id}/edit`)
          }
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Event
        </button>
        </div>
      </div>

      {/* Status and Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Status</h2>
          <select
            value={event.status}
            onChange={(e) =>
              handleStatusChange(e.target.value as Event["status"])
            }
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              statusColors[event.status]
            } border-0 focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            <option value="Draft">Draft</option>
            <option value="Planning">Planning</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {event.status === "Planning" && (
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Event Progress</span>
              <span className="font-medium">{event.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-teal-600 h-3 rounded-full transition-all"
                style={{ width: `${event.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Event Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">
                    {event.location.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.location.city}, {event.location.state},{" "}
                    {event.location.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Guest Count
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.guestCount} guests
                  </p>
                </div>
              </div>

              {event.description && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Information */}
          {event.client && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Client</h2>
                <button
                  onClick={() =>
                    router.push(`/planner/dashboard/clients/${event.client}`)
                  }
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  View Profile
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Client information will be displayed here once the backend API
                  is connected.
                </p>
              </div>
            </div>
          )}

          {/* Budget Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Budget</h2>
              <button
                onClick={() =>
                  router.push(`/planner/dashboard/events/${event._id}/budget`)
                }
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                View Details
              </button>
            </div>
            <div className="flex items-center mb-4">
              <DollarSign className="w-8 h-8 text-teal-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(event.budget.total)}
                </p>
              </div>
            </div>
            {event.budget.allocations.length > 0 && (
              <div className="space-y-2">
                {event.budget.allocations
                  .slice(0, 3)
                  .map((allocation, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {allocation.category}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(allocation.amount)} (
                        {allocation.percentage}%)
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Vendors */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Vendors</h2>
              <button
                onClick={() =>
                  router.push(`/planner/dashboard/events/${event._id}/vendors`)
                }
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                Manage Vendors
              </button>
            </div>
            {event.vendors.length === 0 ? (
              <p className="text-sm text-gray-500">No vendors assigned yet</p>
            ) : (
              <div className="space-y-3">
                {event.vendors.slice(0, 5).map((vendor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {vendor.category}
                        </p>
                        <p className="text-xs text-gray-500">{vendor.status}</p>
                      </div>
                    </div>
                    {vendor.amount && (
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(vendor.amount)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button
                onClick={() =>
                  router.push(`/planner/dashboard/events/${event._id}/tasks`)
                }
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CheckSquare className="w-5 h-5 mr-3 text-teal-600" />
                View Tasks
              </button>
              <button
                onClick={() =>
                  router.push(`/planner/dashboard/events/${event._id}/guests`)
                }
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users className="w-5 h-5 mr-3 text-teal-600" />
                Manage Guests
              </button>
              <button
                onClick={() =>
                  router.push(`/planner/dashboard/documents?event=${event._id}`)
                }
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-5 h-5 mr-3 text-teal-600" />
                Documents
              </button>
            </div>
          </div>

          {/* Event Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {event.tasks.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {event.vendors.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {event.guests.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {event.documents.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
