import axios from "axios";
import {
  Coupon,
  Promotion,
  CreateCouponRequest,
  CreatePromotionRequest,
  CouponFilters,
  PromotionFilters,
  CouponListResponse,
  PromotionListResponse,
  CouponStats,
  ValidateCouponRequest,
  ValidateCouponResponse,
} from "@/types/coupons";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class CouponsService {
  private baseUrl = "/admin/coupons";

  // Coupons CRUD
  async getCoupons(filters?: CouponFilters): Promise<CouponListResponse> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  async getCouponById(couponId: string): Promise<{ coupon: Coupon }> {
    const response = await api.get(`${this.baseUrl}/${couponId}`);
    return response.data;
  }

  async createCoupon(
    data: CreateCouponRequest
  ): Promise<{ coupon: Coupon; message: string }> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateCoupon(
    couponId: string,
    data: Partial<CreateCouponRequest>
  ): Promise<{ coupon: Coupon; message: string }> {
    const response = await api.put(`${this.baseUrl}/${couponId}`, data);
    return response.data;
  }

  async deleteCoupon(couponId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${couponId}`);
    return response.data;
  }

  async activateCoupon(couponId: string): Promise<{ message: string }> {
    const response = await api.patch(`${this.baseUrl}/${couponId}/activate`);
    return response.data;
  }

  async deactivateCoupon(couponId: string): Promise<{ message: string }> {
    const response = await api.patch(`${this.baseUrl}/${couponId}/deactivate`);
    return response.data;
  }

  async getCouponUsage(couponId: string): Promise<{ usage: any }> {
    const response = await api.get(`${this.baseUrl}/${couponId}/usage`);
    return response.data;
  }

  async validateCoupon(
    data: ValidateCouponRequest
  ): Promise<ValidateCouponResponse> {
    const response = await api.post(`${this.baseUrl}/validate`, data);
    return response.data;
  }

  async generateCouponCode(): Promise<{ code: string }> {
    const response = await api.get(`${this.baseUrl}/generate-code`);
    return response.data;
  }

  // Promotions CRUD
  async getPromotions(
    filters?: PromotionFilters
  ): Promise<PromotionListResponse> {
    const response = await api.get(`${this.baseUrl}/promotions`, {
      params: filters,
    });
    return response.data;
  }

  async getPromotionById(
    promotionId: string
  ): Promise<{ promotion: Promotion }> {
    const response = await api.get(`${this.baseUrl}/promotions/${promotionId}`);
    return response.data;
  }

  async createPromotion(
    data: CreatePromotionRequest
  ): Promise<{ promotion: Promotion; message: string }> {
    const response = await api.post(`${this.baseUrl}/promotions`, data);
    return response.data;
  }

  async updatePromotion(
    promotionId: string,
    data: Partial<CreatePromotionRequest>
  ): Promise<{ promotion: Promotion; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/promotions/${promotionId}`,
      data
    );
    return response.data;
  }

  async deletePromotion(promotionId: string): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/promotions/${promotionId}`
    );
    return response.data;
  }

  async activatePromotion(promotionId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/promotions/${promotionId}/activate`
    );
    return response.data;
  }

  async deactivatePromotion(promotionId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/promotions/${promotionId}/deactivate`
    );
    return response.data;
  }

  // Statistics & Analytics
  async getStats(): Promise<{ stats: CouponStats }> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async getCouponAnalytics(couponId: string): Promise<{ analytics: any }> {
    const response = await api.get(`${this.baseUrl}/${couponId}/analytics`);
    return response.data;
  }

  async getPromotionAnalytics(
    promotionId: string
  ): Promise<{ analytics: any }> {
    const response = await api.get(
      `${this.baseUrl}/promotions/${promotionId}/analytics`
    );
    return response.data;
  }

  // Export
  async exportCoupons(
    filters?: CouponFilters
  ): Promise<{ downloadUrl: string }> {
    const response = await api.post(`${this.baseUrl}/export`, filters);
    return response.data;
  }
}

export default new CouponsService();
