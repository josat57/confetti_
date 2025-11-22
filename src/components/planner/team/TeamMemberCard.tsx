"use client";

import { useState } from "react";
import {
  Mail,
  Calendar,
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
} from "lucide-react";
import { TeamMember } from "@/services/planner/team.service";
import { format } from "date-fns";

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
  isOwner?: boolean;
}

export default function TeamMemberCard({
  member,
  onEdit,
  onRemove,
  isOwner = false,
}: TeamMemberCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Coordinator":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
            Active
          </span>
        );
      case "Invited":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full" />
            Invited
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {member.user.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {member.user.name}
              </h3>
              {isOwner && (
                <Shield className="w-4 h-4 text-purple-600" title="Owner" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Mail className="w-4 h-4" />
              {member.user.email}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeColor(
                  member.role
                )}`}
              >
                {member.role}
              </span>
              {getStatusBadge(member.status)}
            </div>
          </div>
        </div>

        {/* Actions menu */}
        {!isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <button
                    onClick={() => {
                      onEdit(member);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Member
                  </button>
                  <button
                    onClick={() => {
                      onRemove(member);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Member
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <div className="text-xs text-gray-600 mb-1">Events</div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">
              {member.assignedEvents.length}
            </span>
          </div>
        </div>
        {member.stats && (
          <>
            <div>
              <div className="text-xs text-gray-600 mb-1">Tasks Done</div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {member.stats.tasksCompleted}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Last Active</div>
              <div className="text-sm font-medium text-gray-900">
                {format(new Date(member.stats.lastActive), "MMM d")}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Joined date */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        Joined {format(new Date(member.joinedAt), "MMMM d, yyyy")}
      </div>
    </div>
  );
}
