"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Guest,
  CreateGuestInput,
  UpdateGuestInput,
  RSVPStatus,
  GuestStats,
} from "@/types/guest";
import GuestsService from "@/services/planner/guests.service";
import { eventsService } from "@/services/planner/events.service";
import GuestList from "@/components/planner/guests/GuestList";
import GuestForm from "@/components/planner/guests/GuestForm";
import GuestImport from "@/components/planner/guests/GuestImport";
import RSVPTracker from "@/components/planner/guests/RSVPTracker";
import SeatingChart from "@/components/planner/guests/SeatingChart";
import { Plus, Upload, Users, LayoutGrid } from "lucide-react";
import { toast } from "react-toastify";

type ViewMode = "list" | "seating";

export default function GuestsPage() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("eventId");

  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventIdParam || "");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats>({
    total: 0,
    accepted: 0,
    declined: 0,
    pending: 0,
    maybe: 0,
    checkedIn: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchGuests();
      fetchStats();
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const response = await eventsService.getEvents({});
      setEvents(response.events);
      if (response.events.length > 0 && !selectedEventId) {
        setSelectedEventId(response.events[0]._id);
      }
    } catch {
      toast.error("Failed to load events");
    }
  };

  const fetchGuests = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      const response = await GuestsService.getEventGuests(selectedEventId);
      setGuests(response.guests);
    } catch {
      toast.error("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedEventId) return;
    try {
      const guestStats = await GuestsService.getGuestStats(selectedEventId);
      setStats(guestStats);
    } catch {
      // silent
    }
  };

  const handleCreateGuest = async (data: CreateGuestInput) => {
    if (!selectedEventId) return;
    try {
      await GuestsService.createGuest(selectedEventId, data);
      toast.success("Guest added successfully");
      setShowGuestForm(false);
      fetchGuests();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add guest");
    }
  };

  const handleUpdateGuest = async (data: UpdateGuestInput) => {
    if (!editingGuest) return;
    try {
      await GuestsService.updateGuest(editingGuest._id, data);
      toast.success("Guest updated successfully");
      setShowGuestForm(false);
      setEditingGuest(undefined);
      fetchGuests();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update guest");
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Are you sure you want to delete this guest?")) return;
    try {
      await GuestsService.deleteGuest(guestId);
      toast.success("Guest deleted successfully");
      fetchGuests();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete guest");
    }
  };

  const handleCheckIn = async (guestId: string) => {
    try {
      await GuestsService.checkInGuest(guestId);
      toast.success("Guest checked in successfully");
      fetchGuests();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check in guest");
    }
  };

  const handleUpdateRSVP = async (guestId: string, status: RSVPStatus) => {
    try {
      await GuestsService.updateGuest(guestId, { rsvpStatus: status });
      toast.success("RSVP status updated");
      fetchGuests();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update RSVP");
    }
  };

  const handleImport = async (file: File) => {
    if (!selectedEventId) throw new Error("No event selected");
    const result = await GuestsService.importGuests(selectedEventId, file);
    fetchGuests();
    fetchStats();
    return result;
  };

  const handleUpdateSeating = async (
    guestId: string,
    tableNumber: number,
    seatNumber: number
  ) => {
    try {
      await GuestsService.updateGuest(guestId, { tableNumber, seatNumber });
      toast.success("Seating updated");
      fetchGuests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update seating");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guest Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your event guests, track RSVPs, and create seating arrangements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            disabled={!selectedEventId}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>
          <button
            onClick={() => { setEditingGuest(undefined); setShowGuestForm(true); }}
            disabled={!selectedEventId}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Event Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full md:w-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Select an event...</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.name} - {new Date(event.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedEventId ? (
        <>
          {/* RSVP Tracker */}
          <RSVPTracker stats={stats} />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 w-fit">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Users className="w-5 h-5" />
              Guest List
            </button>
            <button
              onClick={() => setViewMode("seating")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === "seating"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              Seating Chart
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading guests...</p>
            </div>
          ) : viewMode === "list" ? (
            <GuestList
              guests={guests}
              onEdit={(guest) => { setEditingGuest(guest); setShowGuestForm(true); }}
              onDelete={handleDeleteGuest}
              onCheckIn={handleCheckIn}
              onUpdateRSVP={handleUpdateRSVP}
            />
          ) : (
            <SeatingChart guests={guests} onUpdateSeating={handleUpdateSeating} />
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Event Selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an event to manage guests
          </p>
        </div>
      )}

      {/* Modals */}
      {showGuestForm && (
        <GuestForm
          guest={editingGuest}
          onSubmit={(data) =>
            editingGuest
              ? handleUpdateGuest(data as UpdateGuestInput)
              : handleCreateGuest(data as CreateGuestInput)
          }
          onCancel={() => { setShowGuestForm(false); setEditingGuest(undefined); }}
        />
      )}

      {showImport && (
        <GuestImport onImport={handleImport} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
