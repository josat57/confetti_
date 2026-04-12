"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLeads, useUpdateLeadStatus, useLeadStats } from "@/hooks/useLeads";
import type { LeadStatus, LeadFilters } from "@/types/lead.types";

export default function LeadsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useLeads(filters);
  const { data: stats } = useLeadStats();
  const updateStatus = useUpdateLeadStatus();

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    await updateStatus.mutateAsync({ id: leadId, status });
  };

  const handleFilterChange = (key: keyof LeadFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading leads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Error loading leads. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <button
          onClick={() => router.push("/vendor/dashboard/leads/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Lead
        </button>
      </div>

      {/* Stats - Calculate from leads data */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.pagination?.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">New</p>
            <p className="text-2xl font-bold text-blue-600">
              {data.leads.filter((lead) => lead.status === "new").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Won</p>
            <p className="text-2xl font-bold text-green-600">
              {data.leads.filter((lead) => lead.status === "won").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Contacted</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.leads.filter((lead) => lead.status === "contacted").length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filters.status || ""}
          onChange={(e) =>
            handleFilterChange("status", e.target.value || undefined)
          }
          className="px-4 py-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="negotiating">Negotiating</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>

        <select
          value={filters.source || ""}
          onChange={(e) =>
            handleFilterChange("source", e.target.value || undefined)
          }
          className="px-4 py-2 border rounded"
        >
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social">Social</option>
          <option value="direct">Direct</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filters.priority || ""}
          onChange={(e) =>
            handleFilterChange("priority", e.target.value || undefined)
          }
          className="px-4 py-2 border rounded"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {data?.leads?.map((lead) => (
          <div
            key={lead._id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {lead.customer.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Email: {lead.customer.email}</p>
                  <p>Phone: {lead.customer.phone}</p>
                  <p>Event: {lead.eventDetails.type}</p>
                  <p>
                    Date:{" "}
                    {new Date(lead.eventDetails.date).toLocaleDateString()}
                  </p>
                  <p>Location: {lead.eventDetails.location}</p>
                  {lead.eventDetails.budget && (
                    <p>Budget: ₦{lead.eventDetails.budget.toLocaleString()}</p>
                  )}
                  {lead.eventDetails.guestCount && (
                    <p>Guests: {lead.eventDetails.guestCount}</p>
                  )}
                  {lead.estimatedValue && (
                    <p>
                      Estimated Value: ₦{lead.estimatedValue.toLocaleString()}
                    </p>
                  )}
                </div>
                {/* Tags - Not available in Lead interface */}
              </div>

              <div className="flex flex-col items-end gap-2">
                <select
                  value={lead.status}
                  onChange={(e) =>
                    handleStatusChange(lead._id, e.target.value as LeadStatus)
                  }
                  disabled={updateStatus.isPending}
                  className="px-3 py-1 border rounded"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>

                <span
                  className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                    lead.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : lead.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {lead.priority}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() =>
                  router.push(`/vendor/dashboard/leads/${lead._id}`)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Details
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Send Quote
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            disabled={filters.page === 1}
            onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <button
            disabled={filters.page === data.pagination.pages}
            onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
