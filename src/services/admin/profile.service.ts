import { adminApi } from "./api-config";

export interface AdminProfile {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface TwoFactorSetupResult {
  secret: string;
  qrCode: string;
}

class AdminProfileService {
  /** Fetch the current logged-in admin's profile via the verify endpoint */
  async getProfile(): Promise<AdminProfile> {
    const response = await adminApi.get("/admin/verify");
    const admin = response.data.data?.admin;
    return {
      id: admin.id ?? admin._id,
      _id: admin.id ?? admin._id,
      email: admin.email,
      firstName: admin.firstName ?? "",
      lastName: admin.lastName ?? "",
      role: admin.role,
      permissions: admin.permissions ?? [],
      lastLogin: admin.lastLogin,
      twoFactorEnabled: admin.twoFactorEnabled ?? false,
    };
  }

  /** Update firstName, lastName, and/or email */
  async updateProfile(
    adminId: string,
    data: { firstName?: string; lastName?: string; email?: string }
  ): Promise<AdminProfile> {
    const response = await adminApi.put(`/admin/${adminId}`, data);
    const admin = response.data.data?.admin;
    return {
      id: admin.id ?? admin._id,
      _id: admin.id ?? admin._id,
      email: admin.email,
      firstName: admin.firstName ?? "",
      lastName: admin.lastName ?? "",
      role: admin.role,
      permissions: admin.permissions ?? [],
    };
  }

  /** Change password — requires current password for verification */
  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await adminApi.put(`/admin/${adminId}/password`, {
      currentPassword,
      newPassword,
    });
    return { message: response.data.message };
  }

  /** Initiate 2FA setup — returns QR code data URL and base32 secret */
  async setup2FA(adminId: string): Promise<TwoFactorSetupResult> {
    const response = await adminApi.post(`/admin/${adminId}/2fa/setup`);
    return {
      secret: response.data.data?.secret,
      qrCode: response.data.data?.qrCode,
    };
  }

  /** Verify the TOTP token to activate 2FA */
  async verify2FA(
    adminId: string,
    token: string
  ): Promise<{ message: string }> {
    const response = await adminApi.post(`/admin/${adminId}/2fa/verify`, {
      token,
    });
    return { message: response.data.message };
  }
}

export default new AdminProfileService();
