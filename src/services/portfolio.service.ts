/**
 * Portfolio Service
 * Handles all portfolio management related API calls
 */

import api from "@/api/api";

export interface PortfolioItem {
  _id: string;
  vendor: string;
  title: string;
  description?: string;
  eventType: string;
  eventDate: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  budget?: {
    amount: number;
    currency: string;
  };
  guestCount?: number;
  photos: Array<{
    _id: string;
    url: string;
    caption?: string;
    order: number;
  }>;
  videos?: Array<{
    _id: string;
    url: string;
    thumbnail?: string;
    title?: string;
  }>;
  tags?: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CreatePortfolioData {
  title: string;
  description?: string;
  eventType: string;
  eventDate: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  budget?: {
    amount: number;
    currency: string;
  };
  guestCount?: number;
  tags?: string[];
  status?: "draft" | "published" | "archived";
}

export const portfolioService = {
  /**
   * Get all portfolio items
   */
  async getAll(params?: {
    status?: string;
    eventType?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    items: PortfolioItem[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await api.get("/vendors/portfolio", {
      params,
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Create a new portfolio item
   */
  async create(data: CreatePortfolioData): Promise<PortfolioItem> {
    const response = await api.post("/vendors/portfolio", data, {
      withCredentials: true,
    });
    return response.data.data.item;
  },

  /**
   * Get a single portfolio item by ID
   */
  async getById(id: string): Promise<PortfolioItem> {
    const response = await api.get(`/vendors/portfolio/${id}`, {
      withCredentials: true,
    });
    return response.data.data.item;
  },

  /**
   * Update a portfolio item
   */
  async update(
    id: string,
    data: Partial<CreatePortfolioData>
  ): Promise<PortfolioItem> {
    const response = await api.put(`/vendors/portfolio/${id}`, data, {
      withCredentials: true,
    });
    return response.data.data.item;
  },

  /**
   * Delete a portfolio item
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/portfolio/${id}`, {
      withCredentials: true,
    });
  },

  /**
   * Publish a portfolio item
   */
  async publish(id: string): Promise<PortfolioItem> {
    const response = await api.post(
      `/vendors/portfolio/${id}/publish`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.item;
  },

  /**
   * Archive a portfolio item
   */
  async archive(id: string): Promise<PortfolioItem> {
    const response = await api.post(
      `/vendors/portfolio/${id}/archive`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.item;
  },

  /**
   * Add photos to a portfolio item
   */
  async addPhotos(
    id: string,
    files: File[],
    captions?: string[]
  ): Promise<any[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });
    if (captions) {
      formData.append("captions", JSON.stringify(captions));
    }

    const response = await api.post(
      `/vendors/portfolio/${id}/photos`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );
    return response.data.data.photos;
  },

  /**
   * Delete a photo from a portfolio item
   */
  async deletePhoto(id: string, photoId: string): Promise<void> {
    await api.delete(`/vendors/portfolio/${id}/photos/${photoId}`, {
      withCredentials: true,
    });
  },
};

export default portfolioService;
