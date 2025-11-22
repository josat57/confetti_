"use client";

import { useState } from "react";
import { Guest, RSVPStatus } from "@/types/guest";
import {
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  User,
} from "lucide-react";

interface GuestListProps {
  guests: Guest[];
  onEdit: (guest: Guest) => void;
  onDelete: (guestId: string) => void;
  onCheckIn: (guestId: string) => void;
  onUpdateRSVP: (guestId: string, status: RSVPStatus) => void;
}

export default function GuestList({
  guests,
  onEdit,
  onDelete,
  onCheckIn,
  onUpdateRSVP,
}: GuestListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rsvpFilter, setRsvpFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories
  const categories = Array.from(new Set(guests.map((g) => g.category)));

  // Filter guests
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone?.includes(searchTerm);

    const matchesCategory =
      categoryFilter === "all" || guest.category === categoryFilter;

    const matchesRSVP = rsvpFilter === "all" || guest.rsvpStatus === rsvpFilter;

    return matchesSearch && matchesCategory && matchesRSVP;
  });

  const getRSVPIcon = (status: RSVPStatus) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Declined":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "Maybe":
        return <HelpCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRSVPBadgeColor = (status: RSVPStatus) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Declined":
        return "bg-red-100 text-red-800";
      case "Maybe":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search guests by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RSVP Status
            </label>
            <select
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Maybe">Maybe</option>
            </select>
          </div>
        </div>
      )}

      {/* Guest Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredGuests.length} of {guests.length} guests
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RSVP Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plus One
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No guests found</p>
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-600 font-medium">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {guest.name}
                          </div>
                          {guest.dietaryRestrictions && (
                            <div className="text-xs text-gray-500">
                              {guest.dietaryRestrictions}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {guest.email || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {guest.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {guest.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRSVPIcon(guest.rsvpStatus)}
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRSVPBadgeColor(
                            guest.rsvpStatus
                          )}`}
                        >
                          {guest.rsvpStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guest.plusOneAllowed ? (
                        guest.plusOneName ? (
                          <div>
                            <div className="font-medium">
                              {guest.plusOneName}
                            </div>
                            {guest.plusOneRSVP && (
                              <span
                                className={`text-xs ${getRSVPBadgeColor(
                                  guest.plusOneRSVP
                                )}`}
                              >
                                {guest.plusOneRSVP}
                              </span>
                            )}
                          </div>
                        ) : (
                          "Allowed"
                        )
                      ) : (
                        "No"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.checkedIn ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Checked In</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onCheckIn(guest._id)}
                          className="text-sm text-teal-600 hover:text-teal-800"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(guest)}
                        className="text-teal-600 hover:text-teal-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(guest._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
