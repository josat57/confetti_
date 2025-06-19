import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9600/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
  
  // Add request interceptor to add auth token
  api.interceptors.request.use(
    async (config) => {
      // No need to manually set Authorization header - HTTP-only cookies will be sent automatically
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      // If error is 401 and we haven't tried to refresh token yet
      // Also check if this is not already a refresh token or verify request to prevent infinite loop
      if (error.response?.status === 401 && 
          !originalRequest._retry && 
          !originalRequest.url?.includes('/auth/refresh-token') &&
          !originalRequest.url?.includes('/auth/verify')) {
        originalRequest._retry = true;
  
        try {
          // Try to refresh the token
          const refreshResponse = await api.post('/auth/refresh-token', {}, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Refresh Response: ", refreshResponse);
          if (refreshResponse.status !== 200) {
            // If refresh fails, clear any stored tokens and reject
            console.error("Token refresh failed:", refreshResponse);
            // You might want to add logic here to clear tokens and redirect to login
            return Promise.reject(error);
          }
          
          // After successful refresh, retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear any stored tokens and reject
          console.error("Token refresh error:", refreshError);
          // You might want to add logic here to clear tokens and redirect to login
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
);

// Auth functions
export const Auth = {
  register: async (userData: {
    userName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await api.post('/auth/register', userData);  
    return response.data;
  },

  signIn: async (formData: object) => {
    try {
      const response = await api.post('/auth/signin', formData);
      console.log('Sign in response:', response.data);
      if (response.data?.status === "success" && response.data?.user) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await api.post('/auth/signout');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string, otp: string) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}/${otp}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to verify email. Please try again.'
      );
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password API error:', error);
      throw error;
    }
  },

  verifyOtp: async (email: string, resetToken: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, resetToken, otp });
    return response.data;
  },

  resetPassword: async (formData: object) => {
    const response = await api.post(`/auth/reset-password`, formData);
    return response.data;
  },

  verifyUser: async () => {
    try {
      const response = await api.get('/auth/verify', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Verify user error:', error);
      throw error;
    }
  },

  resendOtp: async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  completeProfile: async (formData: FormData) => {
    try {
      const response = await api.post('/auth/complete-profile', formData, {withCredentials: true, headers: {
        "Content-Type": "application/json"
      }});
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to complete profile. Please try again.'
      );
    }
  },

  uploadProfileImage: async (formData: FormData) => {
    try {
      const response = await api.post('/uploads/upload-profile-image', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to upload profile image. Please try again.'
      );
    }
  },

  socialAuth: async (provider: 'google' | 'facebook' | 'twitter', token: string) => {
    try {
      const response = await api.post(`/auth/${provider}`, { token });
      return response.data;
    } catch (error: any) {
      console.error(`${provider} authentication error:`, error);
      throw new Error(
        error.response?.data?.message || 
        `Failed to authenticate with ${provider}. Please try again.`
      );
    }
  },
};

export const User = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/get_profile', {withCredentials: true});
      if (response.status === 401 || response.status === 404) {
        console.log("User not found");
        return null;
      }
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Check if the response has the expected structure
      if (!response.data.data || !response.data.data.user) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  updateProfile: async (formData: FormData) => {
    console.log("updateProfile formData: ", formData);
    // Remove unwanted fields
    const response = await api.put('/users/update_profile', formData);
    return response.data;
  },

  uploadCoverPhoto: async (formData: FormData) => {
    try {
      const response = await api.post('/uploads/upload_cover_image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to upload cover photo. Please try again.'
      );
    }
  },

  uploadProfileImage: async (formData: FormData) => {
    const response = await api.post('/uploads/upload_profile_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  uploadDocuments: async (formData: FormData) => {
    const response = await api.post('/uploads/upload_documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  verifyDocuments: async (formData: FormData) => {
    const response = await api.post('/auth/verify_documents', formData);
    return response.data;
  },

  getUserSuggestions: async () => {
    const response = await api.get('/auth/user_suggestions');
    return response.data;
  },

  getHashtagSuggestions: async () => {
    const response = await api.get('/users/hashtag_suggestions');
    return response.data;
  },

  followUser: async (userId: string) => {
    const response = await api.post(`/users/follow_user/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId: string) => {
    const response = await api.post(`/users/unfollow_user/${userId}`);
    return response.data;
  },

  getFollowers: async (userId: string) => {
    const response = await api.get(`/users/followers/${userId}`);
    return response.data;
  },

  getFollowing: async (userId: string) => {
    const response = await api.get(`/users/following/${userId}`);
    return response.data;
  },

  tagUser: async (userId: string, tagId: string) => {
    const response = await api.post(`/users/tag_user/${userId}/${tagId}`);
    return response.data;
  },

  untagUser: async (userId: string, tagId: string) => {
    const response = await api.post(`/users/untag_user/${userId}/${tagId}`);
    return response.data;
  },

  getTaggedUsers: async (userId: string) => {
    const response = await api.get(`/users/tagged_users/${userId}`);
    return response.data;
  },

  getTaggedHashtags: async (userId: string) => {
    const response = await api.get(`/users/tagged_hashtags/${userId}`);
    return response.data;
  }
}

export const Notifications = {
  sendNotification: async (notificationData: any) => {
    const response = await api.post('/notifications/send_notification', notificationData);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications/get_notifications');
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/mark_as_read/${notificationId}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark_all_as_read');
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/delete_notification/${notificationId}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/delete_all_notifications');
    return response.data;
  },

  getNotificationCount: async () => {
    const response = await api.get('/notifications/get_notification_count');
    return response.data;
  }
};

export const Subscription = {
  getPlans: async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },

  subscribe: async (planId: string, paymentProvider: 'flutterwave' | 'paystack') => {
    try {
      const response = await api.post('/subscriptions/subscribe', {
        planId,
        paymentProvider
      });
      return response.data;
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  },

  cancelSubscription: async () => {
    try {
      const response = await api.post('/subscriptions/cancel');
      return response.data;
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  getCurrentSubscription: async () => {
    try {
      const response = await api.get('/subscriptions/current');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  },

  upgradeSubscription: async (newPlanId: string) => {
    try {
      const response = await api.post('/subscriptions/upgrade', { newPlanId });
      return response.data;
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  },

  getTrialStatus: async () => {
    try {
      const response = await api.get('/subscriptions/trial-status');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching trial status:', error);
      throw error;
    }
  }
};

export default { api, Auth, User, Notifications, Subscription }; 