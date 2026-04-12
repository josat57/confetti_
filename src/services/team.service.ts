import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "pending" | "inactive";
  joinedAt: Date;
  lastActive?: Date;
  permissions?: string[];
}

export interface InviteTeamMemberData {
  email: string;
  role: "admin" | "manager" | "staff";
  message?: string;
}

export const teamService = {
  /**
   * Get all team members
   * Note: This is used by vendor dashboard, uses /vendors/team endpoint
   */
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await api.get("/vendors/team");
    return response.data.data?.members || response.data.members || [];
  },

  /**
   * Invite a new team member
   */
  async inviteTeamMember(data: InviteTeamMemberData): Promise<TeamMember> {
    const response = await api.post("/vendors/team/invite", data);
    return response.data.data.member;
  },

  /**
   * Update team member role
   */
  async updateMemberRole(
    memberId: string,
    role: "admin" | "manager" | "staff"
  ): Promise<TeamMember> {
    const response = await api.patch(`/vendors/team/${memberId}/role`, {
      role,
    });
    return response.data.data.member;
  },

  /**
   * Remove team member
   */
  async removeMember(memberId: string): Promise<void> {
    await api.delete(`/vendors/team/${memberId}`);
  },

  /**
   * Resend invitation
   */
  async resendInvitation(memberId: string): Promise<void> {
    await api.post(`/vendors/team/${memberId}/resend-invite`);
  },
};

export default teamService;
