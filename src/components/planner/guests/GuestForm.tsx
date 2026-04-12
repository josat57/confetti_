"use client";

import { useState, useEffect } from "react";
import {
  Guest,
  CreateGuestInput,
  UpdateGuestInput,
  RSVPStatus,
} from "@/types/guest";
import { X } from "lucide-react";

interface GuestFormProps {
  guest?: Guest;
  onSubmit: (data: CreateGuestInput | UpdateGuestInput) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function GuestForm({
  guest,
  onSubmit,
  onCancel,
  isLoading = false,
}: GuestFormProps) {
  const [formData, setFormData] = useState<CreateGuestInput & UpdateGuestInput>(
    {
      name: guest?.name || "",
      email: guest?.email || "",
      phone: guest?.phone || "",
      category: guest?.category || "General",
      plusOneAllowed: guest?.plusOneAllowed || false,
      plusOneName: guest?.plusOneName || "",
      plusOneRSVP: guest?.plusOneRSVP,
      dietaryRestrictions: guest?.dietaryRestrictions || "",
      specialRequirements: guest?.specialRequirements || "",
      rsvpStatus: guest?.rsvpStatus || "Pending",
      tableNumber: guest?.tableNumber,
      seatNumber: guest?.seatNumber,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "General",
    "VIP",
    "Family",
    "Friends",
    "Business",
    "Colleagues",
    "Other",
  ];

  const rsvpStatuses: RSVPStatus[] = [
    "Pending",
    "Accepted",
    "Declined",
    "Maybe",
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }

    if (
      formData.plusOneAllowed &&
      formData.plusOneName &&
      !formData.plusOneName.trim()
    ) {
      newErrors.plusOneName = "Plus one name cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Clean up data before submitting
    const submitData: any = {
      name: formData.name.trim(),
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      category: formData.category,
      plusOneAllowed: formData.plusOneAllowed,
      dietaryRestrictions: formData.dietaryRestrictions?.trim() || undefined,
      specialRequirements: formData.specialRequirements?.trim() || undefined,
    };

    if (guest) {
      // Update mode - include additional fields
      submitData.rsvpStatus = formData.rsvpStatus;
      submitData.plusOneName = formData.plusOneName?.trim() || undefined;
      submitData.plusOneRSVP = formData.plusOneRSVP;
      submitData.tableNumber = formData.tableNumber;
      submitData.seatNumber = formData.seatNumber;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {guest ? "Edit Guest" : "Add New Guest"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+234 800 000 0000"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {guest && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RSVP Status
                </label>
                <select
                  value={formData.rsvpStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rsvpStatus: e.target.value as RSVPStatus,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {rsvpStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Plus One */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Plus One</h3>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="plusOneAllowed"
                checked={formData.plusOneAllowed}
                onChange={(e) =>
                  setFormData({ ...formData, plusOneAllowed: e.target.checked })
                }
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label
                htmlFor="plusOneAllowed"
                className="ml-2 text-sm text-gray-700"
              >
                Allow plus one
              </label>
            </div>

            {formData.plusOneAllowed && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plus One Name
                  </label>
                  <input
                    type="text"
                    value={formData.plusOneName}
                    onChange={(e) =>
                      setFormData({ ...formData, plusOneName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.plusOneName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Jane Doe"
                  />
                  {errors.plusOneName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.plusOneName}
                    </p>
                  )}
                </div>

                {guest && formData.plusOneName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plus One RSVP
                    </label>
                    <select
                      value={formData.plusOneRSVP || "Pending"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plusOneRSVP: e.target.value as RSVPStatus,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {rsvpStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Special Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Special Requirements
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Restrictions
              </label>
              <input
                type="text"
                value={formData.dietaryRestrictions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dietaryRestrictions: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Vegetarian, Gluten-free, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements
              </label>
              <textarea
                value={formData.specialRequirements}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specialRequirements: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Wheelchair access, special seating, etc."
              />
            </div>
          </div>

          {/* Seating (only for edit mode) */}
          {guest && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Seating</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number
                  </label>
                  <input
                    type="number"
                    value={formData.tableNumber || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tableNumber: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seat Number
                  </label>
                  <input
                    type="number"
                    value={formData.seatNumber || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seatNumber: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : guest ? "Update Guest" : "Add Guest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
