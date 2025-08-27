'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTenant } from '@/hooks/use-tenant';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Activity,
  Scale,
  FileText,
  UserPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  BarChart3
} from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
}

export default function TenantSidebar() {
  const { slug } = useParams();
  const pathname = usePathname();
  const { tenant } = useTenant();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const basePath = `/t/${slug}`;

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: `${basePath}/dashboard`,
      icon: <Home className="h-4 w-4" />,
      isActive: pathname === `${basePath}/dashboard`
    },
    {
      label: 'Pacientes',
      href: `${basePath}/patients`,
      icon: <Users className="h-4 w-4" />,
      isActive: pathname.startsWith(`${basePath}/patients`)
    },
    {
      label: 'Indicadores',
      href: `${basePath}/indicators`,
      icon: <Activity className="h-4 w-4" />,
      isActive: pathname.startsWith(`${basePath}/indicators`)
    },
    {
      label: 'Escalas MRC/Barthel',
      href: `${basePath}/assessments`,
      icon: <Scale className="h-4 w-4" />,
      isActive: pathname.startsWith(`${basePath}/assessments`)
    },
    {
      label: 'Evoluções',
      href: `${basePath}/evolutions`,
      icon: <FileText className="h-4 w-4" />,
      isActive: pathname.startsWith(`${basePath}/evolutions`)
    },
    {
      label: 'Fisioterapeutas',
      href: `${basePath}/staff`,
      icon: <UserPlus className="h-4 w-4" />,
      isActive: pathname.startsWith(`${basePath}/staff`)
    },
    {
      label: 'Relatórios',
      href: `${basePath}/reports`,
      icon: <BarChart3 className="h-4 w-4" />,
      isActive: pathname.startsWith(`${basePath}/reports`)
    }
  ];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900 truncate">
                {tenant?.name || 'Hospital'}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                FisioHUB Sistema
              </p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 shrink-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <Button
              variant={item.isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10",
                isCollapsed && "justify-center px-2",
                item.isActive && "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {item.icon}
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link href={`${basePath}/settings`}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span>Configurações</span>}
          </Button>
        </Link>
      </div>
    </aside>
  );
}