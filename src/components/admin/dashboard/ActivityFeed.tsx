import { Activity } from "@/types/admin";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, Calendar, DollarSign, CheckCircle } from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
}

export default function ActivityFeed({
  activities,
  limit = 10,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, limit);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "user_registered":
        return <UserPlus className="w-4 h-4" />;
      case "event_created":
        return <Calendar className="w-4 h-4" />;
      case "payment_received":
        return <DollarSign className="w-4 h-4" />;
      case "vendor_verified":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "user_registered":
        return "bg-blue-100 text-blue-600";
      case "event_created":
        return "bg-green-100 text-green-600";
      case "payment_received":
        return "bg-purple-100 text-purple-600";
      case "vendor_verified":
        return "bg-teal-100 text-teal-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {displayActivities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent activity
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
