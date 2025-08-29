'use client';

import { TenantProvider } from '@/hooks/use-tenant';
import { AuthProvider } from '@/contexts/auth-context';
import TenantLayout from '@/components/tenant/tenant-layout';

export default function TenantPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <TenantProvider>
        <TenantLayout>
          {children}
        </TenantLayout>
      </TenantProvider>
    </AuthProvider>
  );
}