"use client";

import { useState } from "react";
import { X, Mail, UserPlus } from "lucide-react";
import { TeamRole, TeamInvitation } from "@/services/planner/team.service";

interface TeamInviteFormProps {
  onSubmit: (invitation: TeamInvitation) => void;
  onCancel: () => void;
  loading: boolean;
  events?: Array<{ _id: string; name: string }>;
  tierLimit?: number;
  currentCount?: number;
}

export default function TeamInviteForm({
  onSubmit,
  onCancel,
  loading,
  events = [],
  tierLimit,
  currentCount = 0,
}: TeamInviteFormProps) {
  const [formData, setFormData] = useState<TeamInvitation>({
    email: "",
    role: "Coordinator",
    assignedEvents: [],
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles: Array<{ value: TeamRole; label: string; description: string }> =
    [
      {
        value: "Admin",
        label: "Admin",
        description: "Full access to all features and settings",
      },
      {
        value: "Manager",
        label: "Manager",
        description: "Can create and manage events, tasks, and budgets",
      },
      {
        value: "Coordinator",
        label: "Coordinator",
        description: "Can manage tasks and guests, limited event editing",
      },
    ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleEventToggle = (eventId: string) => {
    const current = formData.assignedEvents || [];
    const updated = current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId];
    setFormData({ ...formData, assignedEvents: updated });
  };

  const isAtLimit = tierLimit !== undefined && currentCount >= tierLimit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Invite Team Member
              </h2>
              <p className="text-sm text-gray-600">
                Add a collaborator to help manage your events
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier limit warning */}
        {isAtLimit && (
          <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You've reached your team member limit ({tierLimit}). Upgrade your
              plan to invite more team members.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="colleague@example.com"
                disabled={isAtLimit}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Role *
            </label>
            <div className="space-y-3">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === role.value
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isAtLimit ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as TeamRole,
                      })
                    }
                    className="mt-1"
                    disabled={isAtLimit}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {role.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {role.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Event assignments */}
          {events.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign to Events (Optional)
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {events.map((event) => (
                  <label
                    key={event._id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedEvents?.includes(event._id)}
                      onChange={() => handleEventToggle(event._id)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      disabled={isAtLimit}
                    />
                    <span className="text-sm text-gray-700">{event.name}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Team member will only have access to selected events
              </p>
            </div>
          )}

          {/* Personal message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Add a personal message to the invitation email..."
              disabled={isAtLimit}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isAtLimit}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Invitation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
