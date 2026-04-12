"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Tag,
  MessageSquare,
  Bell,
  Calendar,
  DollarSign,
  Plus,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  tags?: string[];
  totalSpent?: number;
  eventsCount?: number;
  lastContact?: Date;
  nextFollowUp?: Date;
  status?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  preferences?: {
    budgetRange?: {
      currency?: string;
    };
    communicationMethod?: string;
    eventTypes?: string[];
  };
  notes: Array<{
    id: string;
    text: string;
    createdAt: Date;
  }>;
  createdAt: Date;
}

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const { default: clientsService } = await import(
          "@/services/clients.service"
        );
        const clientData = await clientsService.getClientById(
          params.id as string
        );

        // Transform backend data to match component interface
        const transformedClient: Client = {
          id: clientData._id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          company: clientData.company,
          tags: clientData.tags || [], // Initialize as empty array if not present
          totalSpent: clientData.totalSpent || 0,
          eventsCount: clientData.eventsCount || 0,
          status: clientData.status,
          address: clientData.address,
          preferences: clientData.preferences,
          lastContact: clientData.lastContact
            ? new Date(clientData.lastContact)
            : new Date(clientData.updatedAt),
          nextFollowUp: clientData.nextFollowUp
            ? new Date(clientData.nextFollowUp)
            : undefined,
          notes: (clientData.notes || []).map((note: any) => ({
            id: note._id || note.id,
            text: note.text || note.content,
            createdAt: new Date(note.createdAt),
          })),
          createdAt: new Date(clientData.createdAt),
        };

        setClient(transformedClient);
        if (transformedClient.nextFollowUp) {
          setFollowUpDate(
            transformedClient.nextFollowUp.toISOString().split("T")[0]
          );
        }
      } catch (error: any) {
        console.error("Error fetching client:", error);
        toast.error(
          error.response?.data?.message || "Failed to load client details"
        );
        router.push("/vendor/dashboard/clients");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClient();
    }
  }, [params.id, router]);

  const handleAddNote = async () => {
    if (!client || !newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    try {
      const { default: clientsService } = await import(
        "@/services/clients.service"
      );
      const response = await clientsService.addNote(client.id, newNote);

      // Backend returns { notes: [...] }
      const updatedNotes = (response.notes || []).map((note: any) => ({
        id: note._id || note.id,
        text: note.text || note.content,
        createdAt: new Date(note.createdAt),
      }));

      // Update client with new notes
      setClient({
        ...client,
        notes: updatedNotes,
      });

      setNewNote("");
      toast.success("Note added successfully");
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast.error(error.response?.data?.message || "Failed to add note");
    }
  };

  const handleAddTag = async () => {
    if (!client || !newTag.trim()) {
      toast.error("Please enter a tag");
      return;
    }

    if (client.tags?.includes(newTag)) {
      toast.error("Tag already exists");
      return;
    }

    try {
      const { default: clientsService } = await import(
        "@/services/clients.service"
      );
      const updatedClient = await clientsService.addTag(client.id, newTag);

      setClient({
        ...client,
        tags: updatedClient.tags || [],
      });

      setNewTag("");
      setShowTagInput(false);
      toast.success("Tag added successfully");
    } catch (error: any) {
      console.error("Error adding tag:", error);
      toast.error(error.response?.data?.message || "Failed to add tag");
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!client) return;

    try {
      const { default: clientsService } = await import(
        "@/services/clients.service"
      );
      const updatedClient = await clientsService.removeTag(client.id, tag);

      setClient({
        ...client,
        tags: updatedClient.tags || [],
      });

      toast.success("Tag removed successfully");
    } catch (error: any) {
      console.error("Error removing tag:", error);
      toast.error(error.response?.data?.message || "Failed to remove tag");
    }
  };

  const handleSetFollowUp = async () => {
    if (!client || !followUpDate) {
      toast.error("Please select a follow-up date");
      return;
    }

    try {
      const { default: clientsService } = await import(
        "@/services/clients.service"
      );
      const updatedClient = await clientsService.setFollowUp(
        client.id,
        followUpDate
      );

      setClient({
        ...client,
        nextFollowUp: updatedClient.nextFollowUp
          ? new Date(updatedClient.nextFollowUp)
          : undefined,
      });

      toast.success("Follow-up reminder set");
    } catch (error: any) {
      console.error("Error setting follow-up:", error);
      toast.error(error.response?.data?.message || "Failed to set follow-up");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/vendor/dashboard/clients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.company && (
              <p className="text-gray-600 mt-1">{client.company}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a
                  href={`mailto:${client.email}`}
                  className="text-purple-600 hover:underline"
                >
                  {client.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <a
                  href={`tel:${client.phone}`}
                  className="text-purple-600 hover:underline"
                >
                  {client.phone}
                </a>
              </div>
              {client.company && (
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{client.company}</span>
                </div>
              )}
              {client.status && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        client.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <span className="text-gray-700 capitalize">
                    {client.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Address - Only show if available */}
          {client.address && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Address
              </h2>
              <div className="text-gray-700 space-y-1">
                {client.address.street && <p>{client.address.street}</p>}
                {(client.address.city || client.address.state) && (
                  <p>
                    {client.address.city}
                    {client.address.city && client.address.state && ", "}
                    {client.address.state}
                  </p>
                )}
                {client.address.country && <p>{client.address.country}</p>}
                {client.address.zipCode && <p>{client.address.zipCode}</p>}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              <button
                onClick={() => setShowTagInput(!showTagInput)}
                className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </div>

            {showTagInput && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter tag name (e.g., VIP, Wedding, Corporate)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {client.tags && client.tags.length > 0 ? (
                client.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No tags yet. Add tags to organize and categorize your clients.
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="space-y-4 mb-4">
              {client.notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">{note.text}</p>
                  <div className="text-xs text-gray-500">
                    {note.createdAt.toLocaleString()}
                  </div>
                </div>
              ))}
              {client.notes.length === 0 && (
                <p className="text-sm text-gray-500">No notes yet</p>
              )}
            </div>
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleAddNote}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Add Note</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Total Spent</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{client.totalSpent?.toLocaleString() || "0"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Events</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {client.eventsCount}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Contact</span>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {client.lastContact
                    ? new Date(client.lastContact).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Client Since</span>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {client.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Follow-up Reminder */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Follow-up Reminder
              </h2>
            </div>
            <div className="space-y-3">
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSetFollowUp}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Set Reminder
              </button>
              {client.nextFollowUp && (
                <p className="text-sm text-gray-600 text-center">
                  Next follow-up: {client.nextFollowUp.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </a>
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Client</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
