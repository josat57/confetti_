"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CreateTaskInput, Task, TaskPriority, Event } from "@/types/planner";
import { eventsService } from "@/services/planner/events.service";

interface TaskFormProps {
  initialData?: Task;
  preselectedEventId?: string;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function TaskForm({
  initialData,
  preselectedEventId,
  onSubmit,
  onCancel,
  isEdit = false,
}: TaskFormProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateTaskInput>({
    event: initialData?.event || preselectedEventId || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "Medium",
    dueDate: initialData?.dueDate || "",
    assignedTo: initialData?.assignedTo || "",
    category: initialData?.category || "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsService.getEvents({}, undefined, 1, 100);
      setEvents(response.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.event) newErrors.event = "Event is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";

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
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Task" : "Create Task"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event *
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
              <option value="">Select event...</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
            {errors.event && (
              <p className="mt-1 text-sm text-red-600">{errors.event}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Confirm venue booking"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Add task details..."
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.dueDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category (Optional)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Venue, Catering, Decoration"
            />
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
              {loading ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
