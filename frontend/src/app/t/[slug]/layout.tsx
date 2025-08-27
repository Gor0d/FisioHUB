'use client';

import { TenantProvider } from '@/hooks/use-tenant';
import TenantLayout from '@/components/tenant/tenant-layout';

export default function TenantPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <TenantLayout>
        {children}
      </TenantLayout>
    </TenantProvider>
  );
}