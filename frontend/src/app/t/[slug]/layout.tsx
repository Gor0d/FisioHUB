'use client';

import { TenantProvider } from '@/hooks/use-tenant';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      {children}
    </TenantProvider>
  );
}