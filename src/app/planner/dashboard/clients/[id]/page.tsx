"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  MessageSquare,
  Edit,
  Trash2,
} from "lucide-react";
import { clientsService } from "@/services/planner/clients.service";
import { Client } from "@/types/planner";
import Link from "next/link";

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "notes">(
    "overview"
  );
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await clientsService.getClientById(clientId);
      setClient(response.client);
      setEvents(response.events || []);
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      await clientsService.addNote(clientId, newNote);
      setNewNote("");
      fetchClientData();
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      await clientsService.deleteClient(clientId);
      router.push("/planner/dashboard/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Client not found
          </h3>
          <Link
            href="/planner/dashboard/clients"
            className="text-teal-600 hover:text-teal-700"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/planner/dashboard/clients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  client.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {client.status}
              </span>
              {client.satisfactionRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {client.satisfactionRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                router.push(`/planner/dashboard/clients/${clientId}/edit`)
              }
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "events", label: `Events (${events.length})` },
            { id: "notes", label: `Notes (${client.notes.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a
                    href={`mailto:${client.email}`}
                    className="text-gray-700 hover:text-teal-600"
                  >
                    {client.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href={`tel:${client.phone}`}
                    className="text-gray-700 hover:text-teal-600"
                  >
                    {client.phone}
                  </a>
                </div>
                {client.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{client.company}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="text-gray-700">
                      <p>{client.address.street}</p>
                      <p>
                        {client.address.city}, {client.address.state}{" "}
                        {client.address.zipCode}
                      </p>
                      <p>{client.address.country}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Preferences
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preferred Communication
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800">
                    {client.preferences.communicationPreference}
                  </span>
                </div>
                {client.preferences.eventTypes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Event Types
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {client.preferences.eventTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {client.preferences.budgetRange.max > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </p>
                    <p className="text-gray-700">
                      ${client.preferences.budgetRange.min.toLocaleString()} - $
                      {client.preferences.budgetRange.max.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Events</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {client.eventsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Spent</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    ${client.totalSpent.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Feedback</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {client.feedback.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Feedback */}
            {client.feedback.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Feedback
                </h2>
                <div className="space-y-3">
                  {client.feedback.slice(0, 3).map((feedback, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < feedback.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        {feedback.comment}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(feedback.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "events" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {events.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-4">
                This client doesn't have any events associated yet
              </p>
              <Link
                href="/planner/dashboard/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Create Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <Link
                  key={event._id}
                  href={`/planner/dashboard/events/${event._id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.type} •{" "}
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : event.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${event.budget?.total?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-500">Budget</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Add Note */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Note
            </h2>
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note about this client..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingNote ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {client.notes.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notes yet
                </h3>
                <p className="text-gray-600">
                  Add notes to keep track of important information about this
                  client
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {client.notes.map((note, index) => (
                  <div key={index} className="p-6">
                    <p className="text-gray-700 mb-2">{note.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
