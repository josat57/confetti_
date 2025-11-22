"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateLead } from "@/hooks/useLeads";
import type { LeadCreate } from "@/types/lead.types";

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

  const [formData, setFormData] = useState<LeadCreate>({
    customer: {
      name: "",
      email: "",
      phone: "",
    },
    eventDetails: {
      type: "",
      date: new Date(),
      location: "",
    },
    source: "website",
    priority: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createLead.mutateAsync(formData);
      router.push("/dashboard/leads");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleChange = (
    field: string,
    value: any,
    nested?: "customer" | "eventDetails"
  ) => {
    if (nested) {
      setFormData((prev) => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Leads
        </button>
        <h1 className="text-3xl font-bold">Create New Lead</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customer.name}
                onChange={(e) =>
                  handleChange("name", e.target.value, "customer")
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.customer.email}
                onChange={(e) =>
                  handleChange("email", e.target.value, "customer")
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.customer.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value, "customer")
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.eventDetails.type}
                onChange={(e) =>
                  handleChange("type", e.target.value, "eventDetails")
                }
                placeholder="e.g., Wedding, Corporate Event, Birthday"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={
                  formData.eventDetails.date instanceof Date
                    ? formData.eventDetails.date.toISOString().split("T")[0]
                    : formData.eventDetails.date
                }
                onChange={(e) =>
                  handleChange("date", new Date(e.target.value), "eventDetails")
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.eventDetails.location}
                onChange={(e) =>
                  handleChange("location", e.target.value, "eventDetails")
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Guest Count
              </label>
              <input
                type="number"
                value={formData.eventDetails.guestCount || ""}
                onChange={(e) =>
                  handleChange(
                    "guestCount",
                    e.target.value ? parseInt(e.target.value) : undefined,
                    "eventDetails"
                  )
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Budget</label>
              <input
                type="number"
                value={formData.eventDetails.budget || ""}
                onChange={(e) =>
                  handleChange(
                    "budget",
                    e.target.value ? parseFloat(e.target.value) : undefined,
                    "eventDetails"
                  )
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Lead Information */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Lead Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social">Social Media</option>
                <option value="direct">Direct</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Estimated Value
              </label>
              <input
                type="number"
                value={formData.estimatedValue || ""}
                onChange={(e) =>
                  handleChange(
                    "estimatedValue",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Follow Up Date
              </label>
              <input
                type="date"
                value={
                  formData.followUpDate
                    ? formData.followUpDate instanceof Date
                      ? formData.followUpDate.toISOString().split("T")[0]
                      : formData.followUpDate
                    : ""
                }
                onChange={(e) =>
                  handleChange(
                    "followUpDate",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createLead.isPending}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createLead.isPending ? "Creating..." : "Create Lead"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
