"use client";

import { useState, useEffect } from "react";
import { CreateEventInput, EventType, Client } from "@/types/planner";
import { clientsService } from "@/services/planner/clients.service";
import { Plus, X, MapPin } from "lucide-react";
import ClientForm from "@/components/planner/clients/ClientForm";

interface EventFormProps {
  initialData?: Partial<CreateEventInput>;
  onSubmit: (data: CreateEventInput) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function EventForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: EventFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateEventInput>({
    name: initialData?.name || "",
    type: initialData?.type || "Wedding",
    description: initialData?.description || "",
    date: initialData?.date || "",
    endDate: initialData?.endDate || "",
    location: initialData?.location || {
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
    },
    budget: initialData?.budget || {
      total: 0,
      currency: "NGN",
    },
    guestCount: initialData?.guestCount || 0,
    client: initialData?.client || undefined,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsService.getClients({ status: "Active" });
      setClients(response.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Event name is required";
      if (!formData.date) newErrors.date = "Event date is required";
      if (!formData.location.address.trim())
        newErrors.address = "Address is required";
      if (!formData.location.city.trim()) newErrors.city = "City is required";
      if (!formData.location.state.trim())
        newErrors.state = "State is required";
    }

    if (step === 2) {
      if (formData.budget.total <= 0)
        newErrors.budget = "Budget must be greater than 0";
      if (formData.guestCount <= 0)
        newErrors.guestCount = "Guest count must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      const response = await clientsService.createClient(clientData);
      setClients([...clients, response.client]);
      setFormData({ ...formData, client: response.client._id });
      setShowClientForm(false);
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  };

  const eventTypes: EventType[] = [
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Graduation",
    "Conference",
    "Anniversary",
    "Other",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-24 h-1 mx-2 ${
                  currentStep > step ? "bg-teal-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name *
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
                  placeholder="e.g., Sarah & John's Wedding"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as EventType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.date ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Brief description of the event..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Location
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          address: e.target.value,
                        },
                      })
                    }
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Street address"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          city: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Lagos"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          state: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Lagos"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.location.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          country: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Nigeria"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Budget & Guest Count */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Budget & Capacity
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Budget *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₦
                    </span>
                    <input
                      type="number"
                      value={formData.budget.total || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budget: {
                            ...formData.budget,
                            total: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.budget ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Guest Count *
                  </label>
                  <input
                    type="number"
                    value={formData.guestCount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guestCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.guestCount ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.guestCount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.guestCount}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-800">
                  <strong>Tip:</strong> You can adjust budget allocations and
                  add detailed expense tracking after creating the event.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Client Association */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Client Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client (Optional)
                </label>
                <select
                  value={formData.client || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      client: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">No client (personal event)</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center py-4">
                <button
                  type="button"
                  onClick={() => setShowClientForm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create New Client
                </button>
              </div>

              {formData.client && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {(() => {
                    const selectedClient = clients.find(
                      (c) => c._id === formData.client
                    );
                    return selectedClient ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Selected Client:
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            <strong>Name:</strong> {selectedClient.name}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Email:</strong> {selectedClient.email}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Phone:</strong> {selectedClient.phone}
                          </p>
                          {selectedClient.company && (
                            <p className="text-sm text-gray-700">
                              <strong>Company:</strong> {selectedClient.company}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Associating a client helps you track
                  event history, preferences, and communication. You can skip
                  this step for personal events.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={currentStep === 1 ? onCancel : handleBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : isEdit ? "Update Event" : "Create Event"}
          </button>
        )}
      </div>

      {/* Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-50 rounded-lg max-w-4xl w-full my-8">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Client
              </h2>
              <button
                onClick={() => setShowClientForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <ClientForm
                onSubmit={handleCreateClient}
                onCancel={() => setShowClientForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
