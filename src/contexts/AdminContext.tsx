'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { AdminAPI } from '@/api/adminApi';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalEvents: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingReports: number;
  supportTickets: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

interface AdminContextType {
  stats: AdminStats;
  loading: boolean;
  // Admin Authentication
  adminLogin: (email: string, password: string, twoFactorCode?: string) => Promise<any>;
  adminLogout: () => Promise<void>;
  verifyAdminAccess: () => Promise<any>;
  // Admin Management
  getAdmins: () => Promise<any>;
  createAdmin: (adminData: any) => Promise<any>;
  updateAdmin: (adminId: string, adminData: any) => Promise<any>;
  deleteAdmin: (adminId: string) => Promise<any>;
  // User Management
  getUsers: (params?: any) => Promise<any>;
  getUserDetails: (userId: string) => Promise<any>;
  updateUserStatus: (userId: string, status: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
  // Vendor Management
  getVendors: (params?: any) => Promise<any>;
  getVendorDetails: (vendorId: string) => Promise<any>;
  verifyVendor: (vendorId: string, verificationData: any) => Promise<any>;
  updateVendorStatus: (vendorId: string, status: string) => Promise<any>;
  deleteVendor: (vendorId: string) => Promise<any>;
  // Content Management
  getContent: (params?: any) => Promise<any>;
  updateContent: (contentId: string, contentData: any) => Promise<any>;
  deleteContent: (contentId: string) => Promise<any>;
  // System Configuration
  getSystemSettings: () => Promise<any>;
  updateSystemSettings: (settings: any) => Promise<any>;
  getFeatureFlags: () => Promise<any>;
  updateFeatureFlags: (flags: any) => Promise<any>;
  // Moderation
  getReports: (params?: any) => Promise<any>;
  handleReport: (reportId: string, action: string, reason?: string) => Promise<any>;
  moderateContent: (contentId: string, action: string, reason?: string) => Promise<any>;
  // Support System
  getSupportTickets: (params?: any) => Promise<any>;
  getTicketDetails: (ticketId: string) => Promise<any>;
  updateTicketStatus: (ticketId: string, status: string, response?: string) => Promise<any>;
  // Audit & Logging
  getAuditLogs: (params?: any) => Promise<any>;
  getAdminActions: (params?: any) => Promise<any>;
  // Analytics
  getAnalytics: (params?: any) => Promise<any>;
  getDashboardStats: () => Promise<any>;
  generateReport: (reportType: string, dateRange: any) => Promise<any>;
  // Communication
  sendAnnouncement: (announcement: any) => Promise<any>;
  getAnnouncements: () => Promise<any>;
  updateAnnouncement: (announcementId: string, announcement: any) => Promise<any>;
  // Stats
  refreshStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVendors: 0,
    totalEvents: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingReports: 0,
    supportTickets: 0,
    systemHealth: 'good',
  });
  const [loading, setLoading] = useState(false);

  // Admin Authentication
  const adminLogin = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.adminLogin({ email, password, twoFactorCode });
      if (response?.status === 'success') {
        // Use admin-specific verification instead of regular user verification
        const adminVerification = await verifyAdminAccess();
        // Extract admin user from either data.admin or userData for compatibility
        const adminUser = adminVerification?.data?.admin;
        if (adminVerification?.status === 'success' && adminUser) {
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
        }
        toast.success('Admin login successful!');
        return response;
      } else if (response?.requiresTwoFactor) {
        // Return the response for two-factor handling
        return response;
      } else {
        throw new Error(response?.message || 'Admin login failed');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || 'Admin login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = async () => {
    try {
      setLoading(true);
      await AdminAPI.adminLogout();
      toast.success('Admin logout successful');
      router.push('/admin/login');
    } catch (error: any) {
      console.error('Admin logout error:', error);
      toast.error(error.message || 'Admin logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyAdminAccess = async () => {
    try {
      const response = await AdminAPI.verifyAdminAccess();
      return response;
    } catch (error: any) {
      console.error('Admin access verification error:', error);
      throw error;
    }
  };

  // Admin Management
  const getAdmins = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAdmins();
      return response;
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (adminData: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.createAdmin(adminData);
      toast.success('Admin created successfully');
      return response;
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error('Failed to create admin');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAdmin = async (adminId: string, adminData: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateAdmin(adminId, adminData);
      toast.success('Admin updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update admin');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (adminId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteAdmin(adminId);
      toast.success('Admin deleted successfully');
      return response;
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // User Management
  const getUsers = async (params?: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getUsers(params);
      return response;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getUserDetails(userId);
      return response;
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateUserStatus(userId, status);
      toast.success('User status updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      return response;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Vendor Management
  const getVendors = async (params?: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getVendors(params);
      return response;
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getVendorDetails = async (vendorId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getVendorDetails(vendorId);
      return response;
    } catch (error: any) {
      console.error('Error fetching vendor details:', error);
      toast.error('Failed to fetch vendor details');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyVendor = async (vendorId: string, verificationData: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.verifyVendor(vendorId, verificationData);
      toast.success('Vendor verification updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating vendor verification:', error);
      toast.error('Failed to update vendor verification');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId: string, status: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateVendorStatus(vendorId, status);
      toast.success('Vendor status updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating vendor status:', error);
      toast.error('Failed to update vendor status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteVendor = async (vendorId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteVendor(vendorId);
      toast.success('Vendor deleted successfully');
      return response;
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Content Management
  const getContent = async (params?: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getContent(params);
      return response;
    } catch (error: any) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (contentId: string, contentData: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateContent(contentId, contentData);
      toast.success('Content updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.deleteContent(contentId);
      toast.success('Content deleted successfully');
      return response;
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // System Configuration
  const getSystemSettings = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getSystemSettings();
      return response;
    } catch (error: any) {
      console.error('Error fetching system settings:', error);
      toast.error('Failed to fetch system settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSystemSettings = async (settings: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateSystemSettings(settings);
      toast.success('System settings updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating system settings:', error);
      toast.error('Failed to update system settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFeatureFlags = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getFeatureFlags();
      return response;
    } catch (error: any) {
      console.error('Error fetching feature flags:', error);
      toast.error('Failed to fetch feature flags');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFeatureFlags = async (flags: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateFeatureFlags(flags);
      toast.success('Feature flags updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating feature flags:', error);
      toast.error('Failed to update feature flags');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Moderation
  const getReports = async (params?: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getReports(params);
      return response;
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (reportId: string, action: string, reason?: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.handleReport(reportId, action, reason);
      toast.success(`Report ${action} successfully`);
      return response;
    } catch (error: any) {
      console.error('Error handling report:', error);
      toast.error('Failed to handle report');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (contentId: string, action: string, reason?: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.moderateContent(contentId, action, reason);
      toast.success(`Content ${action} successfully`);
      return response;
    } catch (error: any) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Support System
  const getSupportTickets = async (params?: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getSupportTickets(params);
      return response;
    } catch (error: any) {
      console.error('Error fetching support tickets:', error);
      toast.error('Failed to fetch support tickets');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTicketDetails = async (ticketId: string) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getTicketDetails(ticketId);
      return response;
    } catch (error: any) {
      console.error('Error fetching ticket details:', error);
      toast.error('Failed to fetch ticket details');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string, response?: string) => {
    try {
      setLoading(true);
      const result = await AdminAPI.updateTicketStatus(ticketId, status, response);
      toast.success('Ticket status updated successfully');
      return result;
    } catch (error: any) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Audit & Logging
  const getAuditLogs = async (params?: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAuditLogs(params);
      return response;
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAdminActions = async (params?: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAdminActions(params);
      return response;
    } catch (error: any) {
      console.error('Error fetching admin actions:', error);
      toast.error('Failed to fetch admin actions');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Analytics
  const getAnalytics = async (params?: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAnalytics(params);
      return response;
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getDashboardStats();
      return response;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard stats');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string, dateRange: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.generateReport(reportType, dateRange);
      toast.success('Report generated successfully');
      return response;
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Communication
  const sendAnnouncement = async (announcement: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.sendAnnouncement(announcement);
      toast.success('Announcement sent successfully');
      return response;
    } catch (error: any) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAnnouncements();
      return response;
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAnnouncement = async (announcementId: string, announcement: any) => {
    try {
      setLoading(true);
      const response = await AdminAPI.updateAnnouncement(announcementId, announcement);
      toast.success('Announcement updated successfully');
      return response;
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const refreshStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      if (response?.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to fetch admin statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      refreshStats();
    }
  }, [user]);

  const value = {
    stats,
    loading,
    // Admin Authentication
    adminLogin,
    adminLogout,
    verifyAdminAccess,
    // Admin Management
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    // User Management
    getUsers,
    getUserDetails,
    updateUserStatus,
    deleteUser,
    // Vendor Management
    getVendors,
    getVendorDetails,
    verifyVendor,
    updateVendorStatus,
    deleteVendor,
    // Content Management
    getContent,
    updateContent,
    deleteContent,
    // System Configuration
    getSystemSettings,
    updateSystemSettings,
    getFeatureFlags,
    updateFeatureFlags,
    // Moderation
    getReports,
    handleReport,
    moderateContent,
    // Support System
    getSupportTickets,
    getTicketDetails,
    updateTicketStatus,
    // Audit & Logging
    getAuditLogs,
    getAdminActions,
    // Analytics
    getAnalytics,
    getDashboardStats,
    generateReport,
    // Communication
    sendAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    // Stats
    refreshStats,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
} 