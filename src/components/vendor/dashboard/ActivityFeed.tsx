import {
  Eye,
  Star,
  MessageSquare,
  Calendar,
  UserPlus,
  DollarSign,
} from "lucide-react";

interface Activity {
  id: string;
  type: "view" | "review" | "lead" | "booking" | "message" | "payment";
  title: string;
  description: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export default function ActivityFeed({
  activities,
  maxItems = 10,
}: ActivityFeedProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "view":
        return <Eye className="w-5 h-5" />;
      case "review":
        return <Star className="w-5 h-5" />;
      case "lead":
        return <UserPlus className="w-5 h-5" />;
      case "booking":
        return <Calendar className="w-5 h-5" />;
      case "message":
        return <MessageSquare className="w-5 h-5" />;
      case "payment":
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "view":
        return "bg-blue-50 text-blue-600";
      case "review":
        return "bg-yellow-50 text-yellow-600";
      case "lead":
        return "bg-green-50 text-green-600";
      case "booking":
        return "bg-purple-50 text-purple-600";
      case "message":
        return "bg-pink-50 text-pink-600";
      case "payment":
        return "bg-emerald-50 text-emerald-600";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="space-y-4">
      {displayedActivities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(
              activity.type
            )}`}
          >
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {activity.title}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {activity.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTimestamp(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  );
}
