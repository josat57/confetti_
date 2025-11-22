"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import EventForm from "@/components/planner/events/EventForm";
import { eventsService } from "@/services/planner/events.service";
import { CreateEventInput } from "@/types/planner";

export default function NewEventPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateEventInput) => {
    try {
      const response = await eventsService.createEvent(data);
      router.push(`/planner/dashboard/events/${response.event._id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/planner/dashboard/events");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-1">
          Fill in the details to create your event
        </p>
      </div>

      {/* Event Form */}
      <EventForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
