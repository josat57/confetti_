"use client";

import { Task } from "@/types/planner";
import { Calendar, User, Edit, Trash2, CheckCircle, Clock } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
}: TaskCardProps) {
  const priorityColors = {
    Low: "bg-gray-100 text-gray-800",
    Medium: "bg-blue-100 text-blue-800",
    High: "bg-orange-100 text-orange-800",
    Urgent: "bg-red-100 text-red-800",
  };

  const statusColors = {
    Todo: "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  const isOverdue =
    isPast(new Date(task.dueDate)) && task.status !== "Completed";
  const daysUntilDue = differenceInDays(new Date(task.dueDate), new Date());

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
        isOverdue ? "border-red-300" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[task.status]
              }`}
            >
              {task.status}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Meta Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span
            className={isOverdue ? "text-red-600 font-medium" : "text-gray-600"}
          >
            {format(new Date(task.dueDate), "MMM d, yyyy")}
            {isOverdue && " (Overdue)"}
            {!isOverdue && daysUntilDue === 0 && " (Due today)"}
            {!isOverdue && daysUntilDue === 1 && " (Due tomorrow)"}
          </span>
        </div>

        {task.assignedTo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>Assigned</span>
          </div>
        )}

        {task.category && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100">
              {task.category}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {task.status !== "Completed" && (
          <button
            onClick={() => onComplete(task._id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Complete
          </button>
        )}
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
