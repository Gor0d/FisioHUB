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
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Palette
} from 'lucide-react';

interface NavigationItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  isActive: boolean;
  children?: NavigationItem[];
}

export default function TenantSidebar() {
  const { slug } = useParams();
  const pathname = usePathname();
  const { tenant } = useTenant();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['indicators']); // Auto expand indicators

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
      icon: <Activity className="h-4 w-4" />,
      isActive: pathname.startsWith(`${basePath}/indicators`) || pathname.startsWith(`${basePath}/admin/branding`),
      children: [
        {
          label: 'Dashboard Hospital',
          href: `${basePath}/indicators-custom`,
          icon: <TrendingUp className="h-4 w-4" />,
          isActive: pathname === `${basePath}/indicators-custom`
        },
        {
          label: 'Indicadores Padrão',
          href: `${basePath}/indicators`,
          icon: <Activity className="h-4 w-4" />,
          isActive: pathname === `${basePath}/indicators`
        },
        {
          label: 'Configurar Branding',
          href: `${basePath}/admin/branding`,
          icon: <Palette className="h-4 w-4" />,
          isActive: pathname === `${basePath}/admin/branding`
        }
      ]
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
      label: 'Colaboradores',
      href: `${basePath}/admin/collaborators`,
      icon: <UserPlus className="h-4 w-4" />,
      isActive: pathname.startsWith(`${basePath}/admin/collaborators`)
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

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems(prev => 
      prev.includes(itemLabel) 
        ? prev.filter(item => item !== itemLabel)
        : [...prev, itemLabel]
    );
  };

  const isExpanded = (itemLabel: string) => {
    return expandedItems.includes(itemLabel);
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    
    if (hasChildren) {
      return (
        <div key={item.label}>
          {/* Parent Item */}
          <Button
            variant={item.isActive ? "default" : "ghost"}
            onClick={() => !isCollapsed && toggleExpanded(item.label)}
            className={cn(
              "w-full justify-start gap-3 h-10",
              isCollapsed && "justify-center px-2",
              item.isActive && "bg-blue-600 text-white hover:bg-blue-700",
              level > 0 && "ml-4 w-[calc(100%-1rem)]"
            )}
          >
            {item.icon}
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  isExpanded(item.label) ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                )}
              </>
            )}
          </Button>

          {/* Children Items */}
          {!isCollapsed && isExpanded(item.label) && item.children && (
            <div className="ml-6 mt-2 space-y-1">
              {item.children.map((child) => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Regular item with href
    return (
      <Link key={item.label} href={item.href!}>
        <Button
          variant={item.isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 h-10",
            isCollapsed && "justify-center px-2",
            item.isActive && "bg-blue-600 text-white hover:bg-blue-700",
            level > 0 && "ml-4 w-[calc(100%-1rem)] text-sm"
          )}
        >
          {item.icon}
          {!isCollapsed && (
            <span className="truncate">{item.label}</span>
          )}
        </Button>
      </Link>
    );
  };

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
        {navigationItems.map((item) => renderNavigationItem(item))}
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