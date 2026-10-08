import api from "@/api/api";

export type MessageRole = "user" | "vendor" | "planner" | "system";
export type ConversationStatus = "active" | "archived" | "closed";

export interface MessageAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: MessageRole;
  senderName: string;
  content: string;
  attachments?: MessageAttachment[];
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  name: string;
  role: MessageRole;
  avatar?: string;
}

export interface Conversation {
  _id: string;
  participants: ConversationParticipant[];
  subject?: string;
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount: number;
  status: ConversationStatus;
  relatedBooking?: string;
  relatedEvent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  content: string;
  attachments?: MessageAttachment[];
}

export interface CreateConversationData {
  /** A user id, or a vendor id from the vendor directory (the API resolves it to the vendor's account) */
  participantId: string;
  participantRole?: MessageRole;
  subject?: string;
  initialMessage?: string;
  relatedBooking?: string;
  relatedEvent?: string;
}

// API: /messages/conversations… (confetti_server routes/communication.routes.js).
// Errors are thrown so pages can show them instead of an empty inbox.
export const messagingService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await api.get("/messages/conversations");
    return res.data.data?.conversations ?? [];
  },

  async getConversation(id: string): Promise<Conversation | null> {
    const res = await api.get(`/messages/conversations/${id}`);
    return res.data.data?.conversation ?? null;
  },

  async getMessages(
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ messages: Message[]; total: number; totalPages: number }> {
    const res = await api.get(`/messages/conversations/${conversationId}/messages`, {
      params: { limit: 50, ...params },
    });
    const data = res.data.data ?? {};
    return {
      messages: data.messages ?? [],
      total: data.total ?? 0,
      totalPages: data.totalPages ?? 1,
    };
  },

  async sendMessage(conversationId: string, data: SendMessageData): Promise<Message> {
    const res = await api.post(`/messages/conversations/${conversationId}/messages`, data);
    return res.data.data.message;
  },

  /** Start a conversation, or reopen the existing one with that person */
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const res = await api.post("/messages/conversations", data);
    return res.data.data.conversation;
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.patch(`/messages/conversations/${conversationId}/read`);
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get("/messages/unread-count");
    return res.data.data?.count ?? 0;
  },
};

export default messagingService;
