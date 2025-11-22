"use client";

import { Client } from "@/types/planner";
import { Mail, Phone, Building2, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

interface ClientCardProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (clientId: string) => void;
}

export default function ClientCard({
  client,
  onEdit,
  onDelete,
}: ClientCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            href={`/planner/dashboard/clients/${client._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors"
          >
            {client.name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                client.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {client.status}
            </span>
            {client.satisfactionRating && (
              <span className="text-sm text-gray-600">
                ⭐ {client.satisfactionRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <a
            href={`mailto:${client.email}`}
            className="hover:text-teal-600 transition-colors"
          >
            {client.email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <a
            href={`tel:${client.phone}`}
            className="hover:text-teal-600 transition-colors"
          >
            {client.phone}
          </a>
        </div>
        {client.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4" />
            <span>{client.company}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Events</p>
            <p className="text-sm font-semibold text-gray-900">
              {client.eventsCount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-sm font-semibold text-gray-900">
              ${client.totalSpent.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Link
          href={`/planner/dashboard/clients/${client._id}`}
          className="flex-1 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors text-center"
        >
          View Profile
        </Link>
        {onEdit && (
          <button
            onClick={() => onEdit(client)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(client._id)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
