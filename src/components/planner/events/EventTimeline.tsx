import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Milestone } from "@/types/planner";
import { format } from "date-fns";
import { useState } from "react";

interface EventTimelineProps {
  milestones: Milestone[];
  onAddMilestone?: (milestone: Omit<Milestone, "completed">) => void;
  onToggleMilestone?: (index: number) => void;
}

export default function EventTimeline({
  milestones,
  onAddMilestone,
  onToggleMilestone,
}: EventTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    milestone: "",
    date: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddMilestone && newMilestone.milestone && newMilestone.date) {
      onAddMilestone(newMilestone);
      setNewMilestone({ milestone: "", date: "", description: "" });
      setShowAddForm(false);
    }
  };

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Event Timeline</h2>
        {onAddMilestone && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Milestone
          </button>
        )}
      </div>

      {/* Add Milestone Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Milestone Name
              </label>
              <input
                type="text"
                value={newMilestone.milestone}
                onChange={(e) =>
                  setNewMilestone({
                    ...newMilestone,
                    milestone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Venue Booking Confirmed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newMilestone.date}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({
                    ...newMilestone,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={2}
                placeholder="Additional details..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
              >
                Add Milestone
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Timeline */}
      {sortedMilestones.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No milestones added yet
        </p>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Milestones */}
          <div className="space-y-6">
            {sortedMilestones.map((milestone, index) => (
              <div key={index} className="relative flex items-start">
                {/* Milestone Icon */}
                <button
                  onClick={() => onToggleMilestone?.(index)}
                  className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    milestone.completed
                      ? "bg-teal-600 text-white"
                      : "bg-white border-2 border-gray-300 text-gray-400 hover:border-teal-600"
                  }`}
                  disabled={!onToggleMilestone}
                >
                  {milestone.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Milestone Content */}
                <div className="ml-4 flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-medium ${
                          milestone.completed
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {milestone.milestone}
                      </h3>
                      {milestone.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <span className="ml-4 text-sm text-gray-500 whitespace-nowrap">
                      {format(new Date(milestone.date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {sortedMilestones.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">
              {sortedMilestones.filter((m) => m.completed).length} of{" "}
              {sortedMilestones.length} completed
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all"
              style={{
                width: `${
                  (sortedMilestones.filter((m) => m.completed).length /
                    sortedMilestones.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
