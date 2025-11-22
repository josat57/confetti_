import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  MoreVertical,
} from "lucide-react";
import { Event } from "@/types/planner";
import { format } from "date-fns";
import { useState } from "react";

interface EventCardProps {
  event: Event;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function EventCard({
  event,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: EventCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    Draft: "bg-gray-100 text-gray-800",
    Planning: "bg-blue-100 text-blue-800",
    Confirmed: "bg-green-100 text-green-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    Completed: "bg-purple-100 text-purple-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 ${
        selected ? "border-teal-500" : "border-transparent"
      }`}
    >
      {/* Event Image/Placeholder */}
      <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 rounded-t-lg relative">
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(event._id)}
            className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  onView(event._id);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  onEdit(event._id);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit Event
              </button>
              <button
                onClick={() => {
                  onDelete(event._id);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete Event
              </button>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[event.status]
            }`}
          >
            {event.status}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {event.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{event.type}</p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {event.location.city}, {event.location.state}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{event.guestCount} guests</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{formatCurrency(event.budget.total)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {event.status === "Planning" && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{event.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all"
                style={{ width: `${event.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
