'use client';

import { useState, useEffect } from 'react';
import TenantSidebar from './tenant-sidebar';
import { useTenant } from '@/hooks/use-tenant';

interface TenantLayoutProps {
  children: React.ReactNode;
}

export default function TenantLayout({ children }: TenantLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TenantSidebar />
      
      {/* Main Content */}
      <main 
        className="flex-1 transition-all duration-300 ml-64"
        style={{ 
          marginLeft: sidebarCollapsed ? '4rem' : '16rem'
        }}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}