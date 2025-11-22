"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useLeadById,
  useUpdateLeadStatus,
  useAddLeadNote,
} from "@/hooks/useLeads";
import type { LeadStatus } from "@/types/lead.types";

export default function LeadDetailsPage() {
  const params = useParams();
  const leadId = params.id as string;

  const [noteText, setNoteText] = useState("");

  const { data: lead, isLoading, error } = useLeadById(leadId);
  const updateStatus = useUpdateLeadStatus();
  const addNote = useAddLeadNote();

  const handleStatusChange = async (status: LeadStatus) => {
    await updateStatus.mutateAsync({ id: leadId, status });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    await addNote.mutateAsync({ id: leadId, note: noteText });
    setNoteText("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading lead details...</div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Error loading lead details. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Leads
        </button>
        <h1 className="text-3xl font-bold">Lead Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {lead.customer.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {lead.customer.email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {lead.customer.phone}
              </p>
            </div>
          </div>

          {/* Event Details */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {lead.eventDetails.type}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(lead.eventDetails.date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Location:</span>{" "}
                {lead.eventDetails.location}
              </p>
              {lead.eventDetails.guestCount && (
                <p>
                  <span className="font-semibold">Guest Count:</span>{" "}
                  {lead.eventDetails.guestCount}
                </p>
              )}
              {lead.eventDetails.budget && (
                <p>
                  <span className="font-semibold">Budget:</span> $
                  {lead.eventDetails.budget.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 border rounded mb-2"
                rows={3}
              />
              <button
                type="submit"
                disabled={addNote.isPending || !noteText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {addNote.isPending ? "Adding..." : "Add Note"}
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {lead.notes.length === 0 ? (
                <p className="text-gray-500">No notes yet</p>
              ) : (
                lead.notes.map((note) => (
                  <div
                    key={note._id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                    <p>{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              disabled={updateStatus.isPending}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="negotiating">Negotiating</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Lead Info */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Lead Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Source:</span> {lead.source}
              </p>
              <p>
                <span className="font-semibold">Priority:</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    lead.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : lead.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {lead.priority}
                </span>
              </p>
              {lead.estimatedValue && (
                <p>
                  <span className="font-semibold">Estimated Value:</span> $
                  {lead.estimatedValue.toLocaleString()}
                </p>
              )}
              {lead.followUpDate && (
                <p>
                  <span className="font-semibold">Follow Up:</span>{" "}
                  {new Date(lead.followUpDate).toLocaleDateString()}
                </p>
              )}
              <p>
                <span className="font-semibold">Created:</span>{" "}
                {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Send Quote
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Edit Lead
              </button>
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Convert to Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
