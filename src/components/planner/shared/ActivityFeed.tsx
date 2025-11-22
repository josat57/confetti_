import { Calendar, CheckSquare, Briefcase, UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "event" | "task" | "vendor" | "client";
  title: string;
  description: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activity: Activity[];
}

export default function ActivityFeed({ activity }: ActivityFeedProps) {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "event":
        return Calendar;
      case "task":
        return CheckSquare;
      case "vendor":
        return Briefcase;
      case "client":
        return UserCircle;
    }
  };

  const getIconColor = (type: Activity["type"]) => {
    switch (type) {
      case "event":
        return "bg-teal-100 text-teal-600";
      case "task":
        return "bg-blue-100 text-blue-600";
      case "vendor":
        return "bg-purple-100 text-purple-600";
      case "client":
        return "bg-green-100 text-green-600";
    }
  };

  // Handle undefined, null, or non-array activity
  if (!activity || !Array.isArray(activity) || activity.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8 text-gray-500">No recent activity</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="flow-root">
        <ul className="-mb-8">
          {activity.map((item, index) => {
            const Icon = getIcon(item.type);
            const iconColor = getIconColor(item.type);

            return (
              <li key={item.id}>
                <div className="relative pb-8">
                  {index !== activity.length - 1 && (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div
                        className={`h-10 w-10 rounded-full ${iconColor} flex items-center justify-center ring-8 ring-white`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.timestamp), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
