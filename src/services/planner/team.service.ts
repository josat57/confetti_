import api from "@/api/api";

export type TeamRole = "Admin" | "Manager" | "Coordinator";

export interface TeamMember {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: TeamRole;
  assignedEvents: string[];
  joinedAt: Date;
  invitedBy: string;
  status: "Active" | "Invited" | "Inactive";
  permissions: {
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
    canManageTasks: boolean;
    canManageGuests: boolean;
    canManageBudget: boolean;
  };
  stats?: {
    tasksCompleted: number;
    eventsManaged: number;
    lastActive: Date;
  };
}

export interface TeamInvitation {
  email: string;
  role: TeamRole;
  assignedEvents?: string[];
  message?: string;
}

export interface TeamActivity {
  _id: string;
  member: {
    _id: string;
    name: string;
  };
  action: string;
  target: string;
  timestamp: Date;
  details?: any;
}

class TeamService {
  /**
   * Get all team members
   */
  async getTeamMembers(): Promise<{
    members: TeamMember[];
    limit: number;
    current: number;
  }> {
    const response = await api.get("/api/v1/planner/team");
    return response.data;
  }

  /**
   * Invite team member
   */
  async inviteTeamMember(
    invitation: TeamInvitation
  ): Promise<{ invitation: any }> {
    const response = await api.post("/api/v1/planner/team/invite", invitation);
    return response.data;
  }

  /**
   * Update team member role and assignments
   */
  async updateTeamMember(
    memberId: string,
    updates: {
      role?: TeamRole;
      assignedEvents?: string[];
    }
  ): Promise<{ member: TeamMember }> {
    const response = await api.put(`/api/v1/planner/team/${memberId}`, updates);
    return response.data;
  }

  /**
   * Remove team member
   */
  async removeTeamMember(memberId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/api/v1/planner/team/${memberId}`);
    return response.data;
  }

  /**
   * Get team activity log
   */
  async getTeamActivity(
    limit: number = 50
  ): Promise<{ activities: TeamActivity[] }> {
    const response = await api.get(
      `/api/v1/planner/team/activity?limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role: TeamRole) {
    const permissions = {
      Admin: {
        canCreateEvents: true,
        canEditEvents: true,
        canDeleteEvents: true,
        canManageTasks: true,
        canManageGuests: true,
        canManageBudget: true,
      },
      Manager: {
        canCreateEvents: true,
        canEditEvents: true,
        canDeleteEvents: false,
        canManageTasks: true,
        canManageGuests: true,
        canManageBudget: true,
      },
      Coordinator: {
        canCreateEvents: false,
        canEditEvents: true,
        canDeleteEvents: false,
        canManageTasks: true,
        canManageGuests: true,
        canManageBudget: false,
      },
    };

    return permissions[role];
  }
}

export const teamService = new TeamService();
