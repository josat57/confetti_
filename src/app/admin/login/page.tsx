'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await adminLogin(formData.email, formData.password);

      if (response?.status === 'success') {
        toast.success('Welcome back, Administrator!');
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else if (response?.requiresTwoFactor) {
        setShowTwoFactor(true);
        toast.info('Please enter your two-factor authentication code');
      } else {
        setError('Access denied. Admin privileges required.');
        setFormData(prev => ({ ...prev, password: '', twoFactorCode: '' }));
      }
    } catch (err: any) {
      setError(err.message || 'Admin login failed. Please try again.');
      toast.error(err.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await adminLogin(formData.email, formData.password, formData.twoFactorCode);

      if (response?.status === 'success') {
        toast.success('Two-factor authentication successful!');
        router.push('/admin');
      } else {
        setError('Invalid authentication code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Two-factor authentication failed.');
      toast.error(err.message || 'Two-factor authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center py-12 px-4">

      {/* Back link */}
      <Link
        href="/"
        className="fixed top-5 left-5 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-2xl mb-5">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <Link href="/" className="block">
            <span className="text-2xl font-bold text-white tracking-tight">Confetti</span>
          </Link>
          <h2 className="mt-3 text-xl font-semibold text-white">Admin Portal</h2>
          <p className="mt-1 text-sm text-white/50">
            Sign in to access the administrative dashboard
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm mb-6"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!showTwoFactor ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="admin@confetti.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-purple-500"
                  />
                  <label htmlFor="remember-me" className="text-sm text-white/50">
                    Remember me
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="2fa"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleTwoFactorSubmit}
                className="space-y-5"
              >
                {/* 2FA header */}
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
                    <Lock className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                  <p className="mt-1 text-sm text-white/50">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {/* Code input */}
                <div>
                  <label htmlFor="twoFactorCode" className="block text-sm font-medium text-white/70 mb-1.5">
                    Authentication Code
                  </label>
                  <input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={6}
                    value={formData.twoFactorCode}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || formData.twoFactorCode.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Verifying…' : 'Verify Code'}
                </button>

                <button
                  type="button"
                  onClick={() => { setShowTwoFactor(false); setError(null); }}
                  className="w-full text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  ← Back to login
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Security notice */}
        <div className="mt-5 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-300/80 leading-relaxed">
            This is a secure administrative portal. All activities are logged and monitored. Unauthorized access attempts will be reported.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
