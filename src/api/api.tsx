import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1',
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          // window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const refreshResponse = await api.post('/auth/refresh', {
          method: 'POST',
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (refreshResponse.status !== 200) {
          console.error("Token refresh failed:", refreshResponse);
          // window.location.href = '/login';
          throw new Error('Token refresh failed');
        }
        
        // After successful refresh, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        // Redirect to login on refresh failure
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Refresh token handler
export const generateRefreshToken = async () => {
  try {
      await api.post('/auth/refresh');
  } catch (error) {
      console.error("Token refresh error:", error);
      window.location.href = '/login';
      const errorMessage = error || "An error occurred. Please try again.";
      console.log(errorMessage);
  }
};

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

  signIn: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      return response.data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      // Call API endpoint which will clear HTTP-only cookies
      await api.post('/auth/signout');
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Sign out error:', error);
    }
    // return '/login';
  },
 
  
  verifyEmail: async (token: string) => {
    try {
      const response = await api.get(`/auth/verify_email/${token}`);
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
      const response = await api.post('/auth/forgot_password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password API error:', error);
      throw error;
    }
  },

  verifyOtp: async (email: string, resetToken: string, otp: string) => {
    const response = await api.post('/auth/verify_otp', { email, resetToken, otp });
    return response.data;
  },

  resetPassword: async (resetToken: string, password: string) => {
    const response = await api.post(`/auth/reset_password`, { resetToken, password });
    return response.data;
  },

  verifyUser: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await api.post('/auth/resend_otp', { email });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend_verification', { email });
    return response.data;
  },

  completeProfile: async (formData: FormData) => {
    try {
      const response = await api.post('/auth/complete_profile', formData);
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
      const response = await api.post('/uploads/upload_profile_image', formData, {
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
  }
};

export const User = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/get_profile');
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

export default { api, Auth, User, Notifications }; 