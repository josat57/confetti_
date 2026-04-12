"use client";

import { useState } from "react";
import { UserPlus, Users, Activity, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TeamMemberCard from "@/components/planner/team/TeamMemberCard";
import TeamInviteForm from "@/components/planner/team/TeamInviteForm";
import TeamPermissions from "@/components/planner/team/TeamPermissions";
import {
  teamService,
  TeamMember,
  TeamInvitation,
  TeamRole,
} from "@/services/planner/team.service";
import { format } from "date-fns";

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  // Fetch team members
  const { data: teamData, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => teamService.getTeamMembers(),
  });

  // Fetch team activity
  const { data: activityData } = useQuery({
    queryKey: ["team-activity"],
    queryFn: () => teamService.getTeamActivity(20),
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: (invitation: TeamInvitation) =>
      teamService.inviteTeamMember(invitation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setShowInviteForm(false);
      alert("Invitation sent successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to send invitation");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      memberId,
      updates,
    }: {
      memberId: string;
      updates: { role?: TeamRole; assignedEvents?: string[] };
    }) => teamService.updateTeamMember(memberId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setEditingMember(null);
      alert("Team member updated successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update team member");
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (memberId: string) => teamService.removeTeamMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      alert("Team member removed successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to remove team member");
    },
  });

  const handleInvite = (invitation: TeamInvitation) => {
    inviteMutation.mutate(invitation);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleRemove = (member: TeamMember) => {
    if (
      confirm(
        `Are you sure you want to remove ${member.user.name} from your team?`
      )
    ) {
      removeMutation.mutate(member._id);
    }
  };

  const handleUpdateRole = (role: TeamRole) => {
    if (editingMember) {
      updateMutation.mutate({
        memberId: editingMember._id,
        updates: { role },
      });
    }
  };

  const members = teamData?.members || [];
  const limit = teamData?.limit;
  const current = teamData?.current || members.length;
  const isAtLimit = limit !== undefined && current >= limit;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Team Management
            </h1>
            <p className="text-gray-600 mt-1">
              Collaborate with your team to manage events
            </p>
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            disabled={isAtLimit}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </button>
        </div>

        {/* Tier limit info */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Team Members: {current}
                {limit !== undefined && ` / ${limit}`}
              </div>
              <div className="text-xs text-gray-600">
                {limit === undefined
                  ? "Unlimited team members"
                  : isAtLimit
                  ? "You've reached your team member limit"
                  : `${limit - current} slots remaining`}
              </div>
            </div>
          </div>
          {isAtLimit && (
            <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Permissions info */}
      <div className="mb-6">
        <button
          onClick={() => setShowPermissions(!showPermissions)}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          <AlertCircle className="w-4 h-4" />
          {showPermissions ? "Hide" : "View"} Role Permissions
        </button>
        {showPermissions && (
          <div className="mt-4">
            <TeamPermissions currentRole="Admin" readOnly />
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading team members...</p>
          </div>
        </div>
      )}

      {/* Team members grid */}
      {!isLoading && members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {members.map((member) => (
            <TeamMemberCard
              key={member._id}
              member={member}
              onEdit={handleEdit}
              onRemove={handleRemove}
              isOwner={
                member.role === "Admin" &&
                member.user.email === "owner@example.com"
              } // TODO: Check actual owner
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && members.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No team members yet
          </h3>
          <p className="text-gray-600 mb-6">
            Invite team members to collaborate on your events
          </p>
          <button
            onClick={() => setShowInviteForm(true)}
            disabled={isAtLimit}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            Invite Your First Team Member
          </button>
        </div>
      )}

      {/* Team activity */}
      {activityData &&
        activityData.activities &&
        activityData.activities.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {activityData.activities.slice(0, 10).map((activity) => (
                <div
                  key={activity._id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {activity.member.name}
                        </span>{" "}
                        {activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(
                          new Date(activity.timestamp),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Invite form modal */}
      {showInviteForm && (
        <TeamInviteForm
          onSubmit={handleInvite}
          onCancel={() => setShowInviteForm(false)}
          loading={inviteMutation.isPending}
          events={[]} // TODO: Pass actual events
          tierLimit={limit}
          currentCount={current}
        />
      )}

      {/* Edit member modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Edit Team Member
            </h2>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Editing:{" "}
                <span className="font-medium">{editingMember.user.name}</span>
              </p>
              <TeamPermissions
                currentRole={editingMember.role}
                onRoleChange={handleUpdateRole}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingMember(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
