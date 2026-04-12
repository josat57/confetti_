"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Plus,
  Loader2,
} from "lucide-react";
import eventPlannersService, {
  EventPlanner as EventPlannerType,
} from "@/services/admin/event-planners.service";
import { toast } from "react-toastify";

// Map backend EventPlanner to component EventPlanner
interface EventPlanner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  lastLogin: string;
  profileImage?: string;
}

function mapBackendPlanner(planner: EventPlannerType): EventPlanner {
  return {
    id: planner._id,
    name:
      planner.fullName ||
      `${planner.firstName || ""} ${planner.lastName || ""}`.trim() ||
      planner.username,
    email: planner.email,
    phone: planner.phone || "N/A",
    status: planner.status,
    createdAt: new Date(planner.createdAt).toISOString(),
    lastLogin: planner.lastLogin
      ? new Date(planner.lastLogin).toISOString()
      : new Date(planner.createdAt).toISOString(),
    profileImage: planner.profilePicture,
  };
}

export default function EventPlannersPage() {
  const [planners, setPlanners] = useState<EventPlanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPlanner, setSelectedPlanner] = useState<EventPlanner | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("view");

  // Fetch planners from backend
  useEffect(() => {
    fetchPlanners();
  }, [statusFilter]);

  const fetchPlanners = async () => {
    try {
      setLoading(true);
      const response = await eventPlannersService.getEventPlanners({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setPlanners(response.users.map(mapBackendPlanner));
    } catch (err: any) {
      console.error("Error fetching event planners:", err);
      toast.error("Failed to load event planners");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlanners = (planners || []).filter((planner) => {
    const matchesSearch =
      planner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      planner.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || planner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // API actions
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await eventPlannersService.updateEventPlannerStatus(id, newStatus);
      toast.success("Status updated successfully");
      fetchPlanners();
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event planner?")) {
      return;
    }

    try {
      await eventPlannersService.deleteEventPlanner(id);
      toast.success("Event planner deleted successfully");
      fetchPlanners();
      setShowModal(false);
    } catch (err: any) {
      console.error("Error deleting planner:", err);
      toast.error("Failed to delete event planner");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Planners</h1>
          <p className="text-gray-600 mt-1">
            Manage event planner accounts and status
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search planners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Planners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Event Planners ({filteredPlanners.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading planners...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlanners.map((planner, index) => (
                  <motion.tr
                    key={planner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {planner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {planner.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {planner.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {planner.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {planner.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          planner.status
                        )}`}
                      >
                        {planner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(planner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(planner.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPlanner(planner);
                            setShowModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(planner.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for View */}
      {showModal && selectedPlanner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Event Planner Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {selectedPlanner.profileImage ? (
                    <img
                      src={selectedPlanner.profileImage}
                      alt={selectedPlanner.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {selectedPlanner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedPlanner.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedPlanner.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedPlanner.phone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Joined:{" "}
                      {new Date(selectedPlanner.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Last Login:{" "}
                      {new Date(selectedPlanner.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedPlanner.status}
                    onChange={(e) => {
                      handleStatusChange(selectedPlanner.id, e.target.value);
                      setShowModal(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedPlanner.id);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete Planner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
