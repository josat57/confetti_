'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminProvider } from '../../contexts/AdminContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Don't redirect if we're on the admin login page
    if (pathname === '/admin/login') {
      return;
    }
  
    
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'super_admin'))) {
      router.push('/admin/login');
    } else if (!loading && user && (user.role === 'admin' || user.role === 'super_admin')) {
      console.log('User is admin, allowing access to admin dashboard');
    }
  }, [user, loading, router, pathname]);

  // If we're on the login page, render without the admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="lg:pl-64">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
} 