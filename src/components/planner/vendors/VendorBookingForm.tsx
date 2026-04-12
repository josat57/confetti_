"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Vendor, CreateBookingInput, Event } from "@/types/planner";
import { eventsService } from "@/services/planner/events.service";

interface VendorBookingFormProps {
  vendor: Vendor;
  onSubmit: (data: CreateBookingInput) => Promise<void>;
  onCancel: () => void;
  preselectedEventId?: string;
}

export default function VendorBookingForm({
  vendor,
  onSubmit,
  onCancel,
  preselectedEventId,
}: VendorBookingFormProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateBookingInput>({
    vendor: vendor._id,
    event: preselectedEventId || "",
    serviceRequirements: "",
    budget: vendor.pricing.startingPrice,
    specialRequirements: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsService.getEvents(
        {
          status: "Planning",
        },
        undefined,
        1,
        100
      );
      setEvents(response.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.event) {
      newErrors.event = "Please select an event";
    }
    if (!formData.serviceRequirements.trim()) {
      newErrors.serviceRequirements = "Please describe the services you need";
    }
    if (formData.budget <= 0) {
      newErrors.budget = "Budget must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book Vendor</h2>
            <p className="text-sm text-gray-600 mt-1">{vendor.businessName}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vendor Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {vendor.portfolio.length > 0 && (
                <img
                  src={vendor.portfolio[0].url}
                  alt={vendor.businessName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {vendor.businessName}
                </h3>
                <p className="text-sm text-gray-600">{vendor.category}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {vendor.location.city}, {vendor.location.state}
                </p>
                <p className="text-sm font-medium text-teal-600 mt-2">
                  Starting from {vendor.pricing.currency}{" "}
                  {vendor.pricing.startingPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Event *
            </label>
            <select
              value={formData.event}
              onChange={(e) =>
                setFormData({ ...formData, event: e.target.value })
              }
              disabled={!!preselectedEventId}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.event ? "border-red-500" : "border-gray-300"
              } ${preselectedEventId ? "bg-gray-100" : ""}`}
            >
              <option value="">Choose an event...</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>
            {errors.event && (
              <p className="mt-1 text-sm text-red-600">{errors.event}</p>
            )}
          </div>

          {/* Service Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Requirements *
            </label>
            <textarea
              value={formData.serviceRequirements}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceRequirements: e.target.value,
                })
              }
              rows={4}
              placeholder="Describe the services you need from this vendor..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                errors.serviceRequirements
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.serviceRequirements && (
              <p className="mt-1 text-sm text-red-600">
                {errors.serviceRequirements}
              </p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Budget *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {vendor.pricing.currency}
              </span>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: parseFloat(e.target.value) || 0,
                  })
                }
                className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.budget ? "border-red-500" : "border-gray-300"
                }`}
                min="0"
                step="1000"
              />
            </div>
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Vendor's starting price: {vendor.pricing.currency}{" "}
              {vendor.pricing.startingPrice.toLocaleString()}
            </p>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requirements (Optional)
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
              placeholder="Any special requests or requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will send a booking request to the
              vendor. They will review your requirements and respond with a
              quote. You'll be notified when they respond.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending Request..." : "Send Booking Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
