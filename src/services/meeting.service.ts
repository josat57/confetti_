import api from "@/api/api";

/** Video calls with vendors (Diaspora Pass). API: confetti_server routes/meeting.routes.js */

export interface Meeting {
  _id: string;
  title: string;
  agenda?: string;
  startsAt: string;
  durationMinutes: number;
  url: string;
  status: "scheduled" | "cancelled";
  conversation?: string;
  booking?: string;
  createdBy: string;
}

export const meetingService = {
  async list(params: { conversationId?: string; bookingId?: string; upcoming?: boolean }): Promise<Meeting[]> {
    return (await api.get("/meetings", { params })).data.data.meetings;
  },
  async create(data: {
    conversationId?: string;
    bookingId?: string;
    title?: string;
    agenda?: string;
    startsAt: string;
    durationMinutes?: number;
    timezone?: string;
  }): Promise<Meeting> {
    return (await api.post("/meetings", data)).data.data.meeting;
  },
  async reschedule(id: string, data: { startsAt?: string; durationMinutes?: number; title?: string }): Promise<Meeting> {
    return (await api.patch(`/meetings/${id}`, data)).data.data.meeting;
  },
  async cancel(id: string): Promise<Meeting> {
    return (await api.post(`/meetings/${id}/cancel`)).data.data.meeting;
  },
  async invite(id: string): Promise<Blob> {
    return (await api.get(`/meetings/${id}/invite.ics`, { responseType: "blob" })).data;
  },
};

export default meetingService;
