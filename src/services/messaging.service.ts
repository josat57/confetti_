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
  participantId: string;
  participantRole: MessageRole;
  subject?: string;
  initialMessage: string;
  relatedBooking?: string;
  relatedEvent?: string;
}

export const messagingService = {
  async getConversations(): Promise<Conversation[]> {
    try {
      const res = await api.get("/messages/conversations");
      const data = res.data.data || res.data;
      return data.conversations || data || [];
    } catch {
      try {
        const res = await api.get("/conversations");
        const data = res.data.data || res.data;
        return data.conversations || data || [];
      } catch {
        return [];
      }
    }
  },

  async getConversation(id: string): Promise<Conversation | null> {
    try {
      const res = await api.get(`/messages/conversations/${id}`);
      return res.data.data?.conversation || res.data.conversation || res.data;
    } catch {
      try {
        const res = await api.get(`/conversations/${id}`);
        return res.data.data?.conversation || res.data.conversation || res.data;
      } catch {
        return null;
      }
    }
  },

  async getMessages(conversationId: string, params?: { page?: number; limit?: number }): Promise<{ messages: Message[]; total: number; totalPages: number }> {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}/messages`, { params: { limit: 50, ...params } });
      const data = res.data.data || res.data;
      return {
        messages: data.messages || data || [],
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      };
    } catch {
      try {
        const res = await api.get(`/conversations/${conversationId}/messages`, { params: { limit: 50, ...params } });
        const data = res.data.data || res.data;
        return {
          messages: data.messages || data || [],
          total: data.total || 0,
          totalPages: data.totalPages || 1,
        };
      } catch {
        return { messages: [], total: 0, totalPages: 1 };
      }
    }
  },

  async sendMessage(conversationId: string, data: SendMessageData): Promise<Message> {
    try {
      const res = await api.post(`/messages/conversations/${conversationId}/messages`, data);
      return res.data.data?.message || res.data.message || res.data;
    } catch {
      const res = await api.post(`/conversations/${conversationId}/messages`, data);
      return res.data.data?.message || res.data.message || res.data;
    }
  },

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      const res = await api.post("/messages/conversations", data);
      return res.data.data?.conversation || res.data.conversation || res.data;
    } catch {
      const res = await api.post("/conversations", data);
      return res.data.data?.conversation || res.data.conversation || res.data;
    }
  },

  async markAsRead(conversationId: string): Promise<void> {
    try {
      await api.patch(`/messages/conversations/${conversationId}/read`);
    } catch {
      try {
        await api.patch(`/conversations/${conversationId}/read`);
      } catch {
        // non-critical
      }
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await api.get("/messages/unread-count");
      return res.data.data?.count ?? res.data.count ?? 0;
    } catch {
      try {
        const conversations = await this.getConversations();
        return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      } catch {
        return 0;
      }
    }
  },
};

export default messagingService;
