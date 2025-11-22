"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import EventForm from "@/components/planner/events/EventForm";
import { eventsService } from "@/services/planner/events.service";
import { CreateEventInput, Event } from "@/types/planner";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventsService.getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      alert("Failed to load event");
      router.push("/planner/dashboard/events");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateEventInput) => {
    try {
      await eventsService.updateEvent(eventId, data);
      router.push(`/planner/dashboard/events/${eventId}`);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push(`/planner/dashboard/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Event not found
          </h3>
          <button
            onClick={() => router.push("/planner/dashboard/events")}
            className="text-teal-600 hover:text-teal-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Details
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-1">
          Update the details for {event.name}
        </p>
      </div>

      {/* Event Form */}
      <EventForm
        initialData={{
          name: event.name,
          type: event.type,
          description: event.description,
          date: event.date,
          endDate: event.endDate,
          location: event.location,
          budget: event.budget,
          guestCount: event.guestCount,
          client: event.client,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={true}
      />
    </div>
  );
}
