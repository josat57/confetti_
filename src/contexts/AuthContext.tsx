'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Auth } from '@/api/api';
import { toast } from 'react-toastify';
import { AdminAPI } from '@/api/adminApi';

interface User {
  id: string;
  userName: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin' | 'vendor' | 'event_planner';
  profileImage?: string;
  isActive: boolean;
  permissions: []
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  verifyUser: () => Promise<any>;
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const hydrateAndVerify = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        try {
          let verifiedUser = null;
          if (parsedUser.role === 'admin' || parsedUser.role === 'super_admin') {
            // Call admin verify
            const response = await AdminAPI.verifyAdminAccess();
            verifiedUser = response?.data?.admin;
          } else {
            // Call regular user verify
            const response = await Auth.verifyUser();
            verifiedUser = response?.userData;
          }
          if (verifiedUser) {
            setUser(verifiedUser);
            localStorage.setItem('user', JSON.stringify(verifiedUser));
          } else {
            setUser(null);
            localStorage.removeItem('user');
          }
        } catch (error) {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    hydrateAndVerify();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      const response = await Auth.signIn({ email, password });
      
      if (response?.status === "success" && response?.user) {
        setUser(response.user);
        // Store user data in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('rememberedEmail');
        }
        return response;
      } else {
        throw new Error(response?.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await Auth.register(userData);
      return response;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await Auth.signOut();
      setUser(null);
      // Clear stored user data
      localStorage.removeItem('user');
      localStorage.removeItem('rememberedEmail');
      router.push('/sign-in');
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async () => {
    try {
      const response = await Auth.verifyUser();
      if (response?.status === "success" && response?.userData) {
        setUser(response.userData);
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.userData));
        return response;
      } else {
        setUser(null);
        localStorage.removeItem('user');
        return null;
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      return null;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    verifyUser,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 