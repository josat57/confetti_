"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MessageSquare,
  Send,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import leadService from "@/services/lead.service";
import { invoicesService } from "@/services/invoices.service";
import type { Lead as ApiLead } from "@/types/lead.types";

interface Lead {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  eventDate: Date;
  budget?: number;
  message: string;
  status: "new" | "contacted" | "quoted" | "won" | "lost";
  source: string;
  notes: Array<{
    id: string;
    text: string;
    createdBy: string;
    createdAt: Date;
  }>;
  createdAt: Date;
}

function mapApiLead(apiLead: ApiLead): Lead {
  return {
    id: apiLead._id,
    clientName: apiLead.customer.name,
    clientEmail: apiLead.customer.email,
    clientPhone: apiLead.customer.phone,
    eventType: apiLead.eventDetails.type,
    eventDate: new Date(apiLead.eventDetails.date),
    budget: apiLead.eventDetails.budget,
    message: apiLead.notes[0]?.text || "",
    status: apiLead.status as Lead["status"],
    source: apiLead.source,
    notes: apiLead.notes.map((n) => ({
      id: n._id,
      text: n.text,
      createdBy: n.createdBy,
      createdAt: new Date(n.createdAt),
    })),
    createdAt: new Date(apiLead.createdAt),
  };
}

export default function LeadDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [sendingQuote, setSendingQuote] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteDetails, setQuoteDetails] = useState("");

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const apiLead = await leadService.getById(params.id as string);
        setLead(mapApiLead(apiLead));
      } catch (error) {
        console.error("Error fetching lead:", error);
        toast.error("Failed to load lead details");
        router.push("/vendor/dashboard/leads");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLead();
    }
  }, [params.id, router]);

  const handleStatusChange = async (newStatus: Lead["status"]) => {
    if (!lead) return;

    try {
      await leadService.updateStatus(lead.id, newStatus);
      setLead({ ...lead, status: newStatus });
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    try {
      await leadService.addNote(lead.id, newNote.trim());

      const note = {
        id: Date.now().toString(),
        text: newNote,
        createdBy: user?.username || "You",
        createdAt: new Date(),
      };

      setLead({ ...lead, notes: [...lead.notes, note] });
      setNewNote("");
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleSendQuote = async () => {
    if (!lead || !quoteAmount || !quoteDetails.trim()) {
      toast.error("Please fill in all quote details");
      return;
    }

    setSendingQuote(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const invoice = await invoicesService.create({
        clientName: lead.clientName,
        clientEmail: lead.clientEmail,
        issueDate: today,
        dueDate,
        items: [
          {
            description: quoteDetails,
            quantity: 1,
            unitPrice: parseFloat(quoteAmount),
          },
        ],
        notes: `Quote for ${lead.eventType} event on ${lead.eventDate.toLocaleDateString()}`,
      });

      await invoicesService.send(invoice._id);
      await leadService.updateStatus(lead.id, "quoted");

      setLead({ ...lead, status: "quoted" });
      toast.success("Quote sent successfully!");
      setQuoteAmount("");
      setQuoteDetails("");
    } catch (error) {
      console.error("Error sending quote:", error);
      toast.error("Failed to send quote");
    } finally {
      setSendingQuote(false);
    }
  };

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "quoted":
        return "bg-purple-100 text-purple-800";
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusLabel = (status: Lead["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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

  if (!lead) return null;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/vendor/dashboard/leads"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads</span>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.clientName}
            </h1>
            <p className="text-gray-600 mt-1">{lead.eventType}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              lead.status
            )}`}
          >
            {getStatusLabel(lead.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Client Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a
                  href={`mailto:${lead.clientEmail}`}
                  className="text-purple-600 hover:underline"
                >
                  {lead.clientEmail}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <a
                  href={`tel:${lead.clientPhone}`}
                  className="text-purple-600 hover:underline"
                >
                  {lead.clientPhone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  {lead.eventDate.toLocaleDateString()}
                </span>
              </div>
              {lead.budget && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    ₦{lead.budget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Initial Message */}
          {lead.message && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Initial Message
              </h2>
              <p className="text-gray-700">{lead.message}</p>
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                Received from {lead.source} on{" "}
                {lead.createdAt.toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Send Quote */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Send Quote
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Amount (₦)
                </label>
                <input
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  placeholder="500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Details
                </label>
                <textarea
                  value={quoteDetails}
                  onChange={(e) => setQuoteDetails(e.target.value)}
                  rows={4}
                  placeholder="Describe what's included in this quote..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSendQuote}
                disabled={sendingQuote}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingQuote ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Quote</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="space-y-4 mb-4">
              {lead.notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">{note.text}</p>
                  <div className="text-xs text-gray-500">
                    {note.createdBy} • {note.createdAt.toLocaleString()}
                  </div>
                </div>
              ))}
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
          {/* Status Workflow */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Update Status
            </h2>
            <div className="space-y-2">
              {["new", "contacted", "quoted", "won", "lost"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as Lead["status"])}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    lead.status === status
                      ? getStatusColor(status as Lead["status"])
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {getStatusLabel(status as Lead["status"])}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <a
                href={`mailto:${lead.clientEmail}`}
                className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </a>
              <a
                href={`tel:${lead.clientPhone}`}
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
