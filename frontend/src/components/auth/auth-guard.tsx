'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      // Redirect to tenant login page
      const tenantSlug = params.slug;
      router.push(`/t/${tenantSlug}/login`);
    }
  }, [isAuthenticated, loading, requireAuth, router, params.slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}