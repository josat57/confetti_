'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AdminLogin() {
  const { adminLogin } = useAdmin();
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Redirect if already logged in as admin
    if (user?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting admin login...');
      // Use adminLogin from AdminContext
      const response = await adminLogin(formData.email, formData.password);
      
      console.log('Admin login response:', response);
      
      if (response?.status === 'success') {
        toast.success('Welcome back, Administrator!');
        console.log('Admin login successful, redirecting to /admin');
        // Wait a bit for the user state to update
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else if (response?.requiresTwoFactor) {
        setShowTwoFactor(true);
        toast.info('Please enter your two-factor authentication code');
      } else {
        toast.error('Access denied. Admin privileges required.');
        // Clear form
        setFormData(prev => ({ ...prev, password: '', twoFactorCode: '' }));
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use adminLogin with two-factor code
      const response = await adminLogin(formData.email, formData.password, formData.twoFactorCode);
      
      if (response?.status === 'success') {
        toast.success('Two-factor authentication successful!');
        router.push('/admin');
      } else {
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error: any) {
      console.error('Two-factor error:', error);
      toast.error(error.message || 'Two-factor authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Confetti
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the administrative dashboard
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-xl p-8"
        >
          <form onSubmit={showTwoFactor ? handleTwoFactorSubmit : handleSubmit} className="space-y-6">
            {!showTwoFactor ? (
              <>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="admin@confetti.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Two-Factor Authentication */}
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div>
                  <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Authentication Code
                  </label>
                  <input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    required
                    maxLength={6}
                    value={formData.twoFactorCode}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowTwoFactor(false)}
                  className="text-sm text-purple-600 hover:text-purple-500"
                >
                  ← Back to login
                </button>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                showTwoFactor ? 'Verify Code' : 'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This portal is restricted to authorized administrators only.
            </p>
            <Link href="/" className="text-sm text-purple-600 hover:text-purple-500 mt-2 inline-block">
              ← Back to main site
            </Link>
          </div>
        </motion.div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This is a secure administrative portal. All activities are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 