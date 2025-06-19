'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, verifyUser } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        const response = await verifyUser();
        if (!response?.user) {
          router.push('/sign-in');
          return;
        }

        const userRole = response.user.role;
        const currentPath = window.location.pathname;
        const pathRole = currentPath.split('/')[1];

        // If user role doesn't match the current path, redirect to appropriate dashboard
        if (pathRole !== userRole) {
          router.push(`/${userRole}/dashboard`);
        }
      } catch (error) {
        console.error('Verification failed:', error);
        router.push('/sign-in');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndRedirect();
  }, [router, verifyUser]);

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add your dashboard layout components here */}
      <main className="p-4">
        {children}
      </main>
    </div>
  );
} 