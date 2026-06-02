import axios from "axios";
import {
  VendorVerification,
  VendorPerformance,
  VendorDetails,
} from "@/types/vendor-admin";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class AdminVendorsService {
  private baseUrl = "/admin/vendors";

  /**
   * Get all vendor verifications
   */
  async getVerifications(params?: {
    status?: "pending" | "approved" | "rejected";
    page?: number;
    limit?: number;
  }): Promise<{
    verifications: VendorVerification[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/verifications?${queryString}`
      : `${this.baseUrl}/verifications`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get a single vendor verification by ID
   */
  async getVerificationById(
    verificationId: string
  ): Promise<{ verification: VendorVerification }> {
    const response = await api.get(
      `${this.baseUrl}/verifications/${verificationId}`
    );
    return response.data;
  }

  /**
   * Approve a vendor
   */
  async approveVendor(
    vendorId: string
  ): Promise<{ vendor: VendorDetails; message: string }> {
    const response = await api.post(`${this.baseUrl}/${vendorId}/approve`);
    return response.data;
  }

  /**
   * Approve a vendor verification (alias for backward compatibility)
   */
  async approveVerification(
    verificationId: string
  ): Promise<{ verification: VendorVerification; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/${verificationId}/approve`
    );
    return response.data;
  }

  /**
   * Reject a vendor
   */
  async rejectVendor(
    vendorId: string,
    reason: string
  ): Promise<{ vendor: VendorDetails; message: string }> {
    const response = await api.post(`${this.baseUrl}/${vendorId}/reject`, {
      reason,
    });
    return response.data;
  }

  /**
   * Reject a vendor verification (alias for backward compatibility)
   */
  async rejectVerification(
    verificationId: string,
    reason: string
  ): Promise<{ verification: VendorVerification; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/${verificationId}/reject`,
      {
        reason,
      }
    );
    return response.data;
  }

  /**
   * Get vendor performance metrics
   */
  async getVendorPerformance(
    vendorId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ performance: VendorPerformance }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/${vendorId}/performance?${queryString}`
      : `${this.baseUrl}/${vendorId}/performance`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get vendor details
   */
  async getVendorDetails(vendorId: string): Promise<{ vendor: VendorDetails }> {
    const response = await api.get(`${this.baseUrl}/${vendorId}`);
    return response.data;
  }

  /**
   * Suspend a vendor
   */
  async suspendVendor(
    vendorId: string,
    reason: string
  ): Promise<{ vendor: VendorDetails; message: string }> {
    const response = await api.post(`${this.baseUrl}/${vendorId}/suspend`, {
      reason,
    });
    return response.data;
  }

  /**
   * Activate a vendor
   */
  async activateVendor(
    vendorId: string
  ): Promise<{ vendor: VendorDetails; message: string }> {
    const response = await api.post(`${this.baseUrl}/${vendorId}/activate`);
    return response.data;
  }

  /**
   * Flag a vendor for investigation
   */
  async flagVendor(
    vendorId: string,
    reason: string
  ): Promise<{ vendor: VendorDetails; message: string }> {
    const response = await api.post(`${this.baseUrl}/${vendorId}/flag`, {
      reason,
    });
    return response.data;
  }

  /**
   * Update vendor category
   */
  async updateVendorCategory(
    vendorId: string,
    category: string
  ): Promise<{ vendor: VendorDetails; message: string }> {
    const response = await api.put(`${this.baseUrl}/${vendorId}/category`, {
      category,
    });
    return response.data;
  }

  /**
   * Update vendor status
   */
  async updateVendorStatus(
    vendorId: string,
    status: string
  ): Promise<{ vendor: VendorDetails; message: string }> {
    const response = await api.put(`${this.baseUrl}/${vendorId}/status`, {
      status,
    });
    return response.data;
  }

  /**
   * Get vendor statistics
   */
  async getVendorStatistics(): Promise<{ statistics: any }> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  /**
   * Export vendors
   */
  async exportVendors(params?: {
    status?: string;
    category?: string;
    verified?: boolean;
  }): Promise<{ downloadUrl: string }> {
    const response = await api.get(`${this.baseUrl}/export`, { params });
    return response.data;
  }

  /**
   * Get all vendors with filtering
   */
  async getVendors(params?: {
    status?: string;
    category?: string;
    verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    vendors: VendorDetails[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.verified !== undefined)
      queryParams.append("verified", params.verified.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await api.get(url);
    return response.data;
  }
}

export default new AdminVendorsService();
