import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for admin authentication
});

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error but don't auto-redirect for content management
    // This allows the page to handle errors gracefully
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export interface ContentItem {
  _id: string;
  type: "announcement" | "blog_post" | "help_article" | "policy" | "faq";
  title: string;
  content: string;
  excerpt?: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  status: "draft" | "published" | "archived";
  category?: string;
  tags: string[];
  featured: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    slug?: string;
  };
}

export interface ContentCategory {
  _id: string;
  name: string;
  description: string;
  slug: string;
  contentCount: number;
  createdAt: Date;
}

export interface ContentStats {
  totalContent: number;
  published: number;
  drafts: number;
  archived: number;
  byType: {
    announcement: number;
    blog_post: number;
    help_article: number;
    policy: number;
    faq: number;
  };
  totalViews: number;
  totalLikes: number;
  recentActivity: Array<{
    action: string;
    content: string;
    user: string;
    timestamp: Date;
  }>;
}

export interface CreateContentInput {
  type: ContentItem["type"];
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags: string[];
  featured?: boolean;
  status: "draft" | "published";
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    slug?: string;
  };
}

export interface UpdateContentInput extends Partial<CreateContentInput> {
  _id: string;
}

class ContentManagementService {
  private baseUrl = "/admin/content";

  /**
   * Get all content with filtering and pagination
   */
  async getContent(params?: {
    type?: ContentItem["type"];
    status?: ContentItem["status"];
    category?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    content: ContentItem[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await api.get(this.baseUrl, { params });
    // Handle the actual backend response structure
    if (response.data?.data) {
      return {
        content: response.data.data.content || [],
        total: response.data.data.pagination?.total || 0,
        page: response.data.data.pagination?.page || 1,
        pages: response.data.data.pagination?.pages || 0,
      };
    }
    // Fallback for direct response structure
    return response.data;
  }

  /**
   * Get content by ID
   */
  async getContentById(id: string): Promise<{ content: ContentItem }> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create new content
   */
  async createContent(
    data: CreateContentInput
  ): Promise<{ content: ContentItem }> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update existing content
   */
  async updateContent(
    id: string,
    data: Partial<UpdateContentInput>
  ): Promise<{ content: ContentItem }> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete content
   */
  async deleteContent(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Bulk update content status
   */
  async bulkUpdateStatus(
    contentIds: string[],
    status: ContentItem["status"]
  ): Promise<{ updated: number; message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk-status`, {
      contentIds,
      status,
    });
    return response.data;
  }

  /**
   * Bulk delete content
   */
  async bulkDelete(
    contentIds: string[]
  ): Promise<{ deleted: number; message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk-delete`, {
      contentIds,
    });
    return response.data;
  }

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<{ stats: ContentStats }> {
    const response = await api.get(`${this.baseUrl}/stats`);
    // Handle the actual backend response structure
    if (response.data?.data) {
      const backendData = response.data.data;
      const mappedStats: ContentStats = {
        totalContent: backendData.totalContent || 0,
        published: backendData.statusBreakdown?.published || 0,
        drafts: backendData.statusBreakdown?.draft || 0,
        archived: backendData.statusBreakdown?.archived || 0,
        byType: {
          announcement: backendData.typeBreakdown?.announcement || 0,
          blog_post: backendData.typeBreakdown?.blog_post || 0,
          help_article: backendData.typeBreakdown?.help_article || 0,
          policy: backendData.typeBreakdown?.policy || 0,
          faq: backendData.typeBreakdown?.faq || 0,
        },
        totalViews: backendData.totalViews || 0,
        totalLikes: backendData.totalLikes || 0,
        recentActivity: backendData.recentActivity || [],
      };
      return { stats: mappedStats };
    }
    return response.data;
  }

  /**
   * Get content categories
   */
  async getCategories(): Promise<{ categories: ContentCategory[] }> {
    const response = await api.get(`${this.baseUrl}/categories`);
    // Handle the actual backend response structure
    if (response.data?.data?.categories) {
      return { categories: response.data.data.categories };
    }
    return response.data;
  }

  /**
   * Create content category
   */
  async createCategory(data: {
    name: string;
    description: string;
    slug?: string;
  }): Promise<{ category: ContentCategory }> {
    const response = await api.post(`${this.baseUrl}/categories`, data);
    return response.data;
  }

  /**
   * Update content category
   */
  async updateCategory(
    id: string,
    data: Partial<{ name: string; description: string; slug: string }>
  ): Promise<{ category: ContentCategory }> {
    const response = await api.put(`${this.baseUrl}/categories/${id}`, data);
    return response.data;
  }

  /**
   * Delete content category
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/categories/${id}`);
    return response.data;
  }

  /**
   * Publish content
   */
  async publishContent(id: string): Promise<{ content: ContentItem }> {
    const response = await api.post(`${this.baseUrl}/${id}/publish`);
    return response.data;
  }

  /**
   * Archive content
   */
  async archiveContent(id: string): Promise<{ content: ContentItem }> {
    const response = await api.post(`${this.baseUrl}/${id}/archive`);
    return response.data;
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string): Promise<{ content: ContentItem }> {
    const response = await api.post(`${this.baseUrl}/${id}/toggle-featured`);
    return response.data;
  }

  /**
   * Search content
   */
  async searchContent(
    query: string,
    filters?: {
      type?: ContentItem["type"];
      status?: ContentItem["status"];
      category?: string;
    }
  ): Promise<{ content: ContentItem[]; total: number }> {
    const response = await api.get(`${this.baseUrl}/search`, {
      params: { q: query, ...filters },
    });
    return response.data;
  }

  /**
   * Export content
   */
  async exportContent(params?: {
    type?: ContentItem["type"];
    status?: ContentItem["status"];
    format?: "csv" | "json";
  }): Promise<{ downloadUrl: string }> {
    const response = await api.get(`${this.baseUrl}/export`, { params });
    return response.data;
  }
}

export default new ContentManagementService();
