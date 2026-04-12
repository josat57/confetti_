"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Plus,
  Mail,
  Shield,
  Trash2,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "pending" | "inactive";
  joinedAt: Date;
  lastActive?: Date;
}

export default function TeamPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("staff");
  const [inviting, setInviting] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  // Fetch user subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1"
          }/subscriptions/current`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        console.log("Fetched subscription:", data);
        setUserSubscription(data.data?.subscription || data.subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // Check if user has Business+ tier
  const userPlan = userSubscription?.planName?.toLowerCase() || "";

  const hasAccess = userPlan === "business" || userPlan === "enterprise";

  // Get team member limit based on tier
  const teamLimit = userPlan === "enterprise" ? Infinity : 5;

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        const { default: teamService } = await import(
          "@/services/team.service"
        );
        const members = await teamService.getTeamMembers();

        // Transform backend data to match component interface
        const transformedMembers: TeamMember[] = members.map((member: any) => ({
          id: member._id,
          name: member.name,
          email: member.email,
          role: member.role,
          status: member.status,
          joinedAt: new Date(member.joinedAt),
          lastActive: member.lastActive
            ? new Date(member.lastActive)
            : undefined,
        }));

        setTeamMembers(transformedMembers);
      } catch (error: any) {
        console.error("Error fetching team members:", error);
        toast.error(
          error.response?.data?.message || "Failed to load team members"
        );
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      fetchTeamMembers();
    } else {
      setLoading(false);
    }
  }, [hasAccess, user]);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (teamMembers.length >= teamLimit) {
      toast.error(`You've reached your team limit of ${teamLimit} members`);
      return;
    }

    setInviting(true);

    try {
      const { default: teamService } = await import("@/services/team.service");
      const member = await teamService.inviteTeamMember({
        email: inviteEmail,
        role: inviteRole as "admin" | "manager" | "staff",
        message: "Join our team!",
      });

      // Transform the returned member to match component interface
      const newMember: TeamMember = {
        id: member._id,
        name: member.name || inviteEmail.split("@")[0],
        email: member.email,
        role: member.role,
        status: member.status,
        joinedAt: new Date(member.joinedAt),
        lastActive: member.lastActive ? new Date(member.lastActive) : undefined,
      };

      setTeamMembers([...teamMembers, newMember]);
      toast.success("Invitation sent successfully!");
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("staff");
    } catch (error: any) {
      console.error("Error inviting member:", error);
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const { default: teamService } = await import("@/services/team.service");
      await teamService.removeMember(memberId);

      setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
      toast.success("Team member removed successfully");
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove team member"
      );
    }
  };

  const handleUpdateRole = async (
    memberId: string,
    newRole: TeamMember["role"]
  ) => {
    try {
      const { default: teamService } = await import("@/services/team.service");
      await teamService.updateMemberRole(memberId, newRole);

      setTeamMembers(
        teamMembers.map((m) =>
          m.id === memberId ? { ...m, role: newRole } : m
        )
      );
      toast.success("Role updated successfully");
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const getRoleBadgeColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "staff":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
    }
  };

  if (!hasAccess) {
    return (
      <div className="max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Users className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to Business
          </h2>
          <p className="text-gray-600 mb-6">
            Team collaboration is available for Business tier and above. Invite
            team members and collaborate on managing your business.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          disabled={teamMembers.length >= teamLimit}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Team Limit Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              {userPlan === "enterprise" ? (
                <>You have unlimited team members on the Enterprise plan.</>
              ) : (
                <>
                  You have {teamMembers.length} of {teamLimit} team members.{" "}
                  {teamLimit - teamMembers.length > 0 && (
                    <span>
                      {teamLimit - teamMembers.length} slot
                      {teamLimit - teamMembers.length !== 1 ? "s" : ""}{" "}
                      remaining.
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {teamMembers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No team members yet
            </h3>
            <p className="text-gray-600 mb-6">
              Invite team members to collaborate on managing your business
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Invite Your First Member</span>
            </button>
          </div>
        ) : (
          <>
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {member.name}
                        </h3>
                        {member.email === user?.email && (
                          <span className="text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                            member.status
                          )}`}
                        >
                          {member.status.charAt(0).toUpperCase() +
                            member.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Joined {member.joinedAt.toLocaleDateString()}
                        {member.lastActive && (
                          <>
                            {" "}
                            • Last active{" "}
                            {member.lastActive.toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {member.email !== user?.email && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleUpdateRole(
                            member.id,
                            e.target.value as TeamMember["role"]
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove team member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Role Permissions Info */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Role Permissions
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Admin</h3>
            </div>
            <p className="text-sm text-gray-600 ml-7">
              Full access to all features including team management, billing,
              and settings.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Manager</h3>
            </div>
            <p className="text-sm text-gray-600 ml-7">
              Can manage leads, bookings, quotes, and view analytics. Cannot
              manage team or billing.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Staff</h3>
            </div>
            <p className="text-sm text-gray-600 ml-7">
              Can view and update assigned leads and bookings. Limited access to
              other features.
            </p>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Invite Team Member
              </h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteRole("staff");
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as TeamMember["role"])
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteRole("staff");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                disabled={inviting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviting ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
