import { Clock, AlertCircle } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface Deadline {
  id: string;
  title: string;
  type: "task" | "payment" | "event";
  dueDate: Date;
  eventName?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

interface DeadlinesListProps {
  deadlines: Deadline[];
}

export default function DeadlinesList({ deadlines }: DeadlinesListProps) {
  const priorityColors = {
    low: "text-gray-600 bg-gray-100",
    medium: "text-blue-600 bg-blue-100",
    high: "text-orange-600 bg-orange-100",
    urgent: "text-red-600 bg-red-100",
  };

  const getDateLabel = (date: Date) => {
    if (isPast(date)) return "Overdue";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  // Handle undefined or null deadlines
  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Deadlines
        </h3>
        <div className="text-center py-8 text-gray-500">
          No upcoming deadlines
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Deadlines
      </h3>
      <div className="space-y-3">
        {deadlines.map((deadline) => {
          const isOverdue = isPast(new Date(deadline.dueDate));

          return (
            <div
              key={deadline.id}
              className={`flex items-start p-3 rounded-lg border ${
                isOverdue
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 hover:bg-gray-50"
              } transition-colors`}
            >
              <div className="flex-shrink-0 mt-1">
                {isOverdue ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {deadline.title}
                </p>
                {deadline.eventName && (
                  <p className="text-xs text-gray-500 mt-1">
                    {deadline.eventName}
                  </p>
                )}
                <div className="flex items-center mt-2 space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      priorityColors[deadline.priority]
                    }`}
                  >
                    {deadline.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getDateLabel(new Date(deadline.dueDate))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
