"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import EventTimeline from "@/components/planner/events/EventTimeline";
import { eventsService } from "@/services/planner/events.service";
import { Event, Milestone } from "@/types/planner";

interface TimelinePageProps {
  params: {
    id: string;
  };
}

export default function TimelinePage({ params }: TimelinePageProps) {
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

  const handleAddMilestone = async (
    milestone: Omit<Milestone, "completed">
  ) => {
    if (!event) return;

    try {
      const updatedEvent = await eventsService.updateEvent(event._id, {
        ...event,
        timeline: [...event.timeline, { ...milestone, completed: false }],
      });
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    } catch (error) {
      console.error("Failed to add milestone:", error);
    }
  };

  const handleToggleMilestone = async (index: number) => {
    if (!event) return;

    const updatedTimeline = [...event.timeline];
    updatedTimeline[index] = {
      ...updatedTimeline[index],
      completed: !updatedTimeline[index].completed,
    };

    try {
      const updatedEvent = await eventsService.updateEvent(event._id, {
        ...event,
        timeline: updatedTimeline,
      });
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    } catch (error) {
      console.error("Failed to toggle milestone:", error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push(`/planner/dashboard/events/${event._id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Timeline</h1>
          <p className="mt-1 text-sm text-gray-500">{event.name}</p>
        </div>
      </div>

      {/* Timeline */}
      <EventTimeline
        milestones={event.timeline}
        onAddMilestone={handleAddMilestone}
        onToggleMilestone={handleToggleMilestone}
      />
    </div>
  );
}
