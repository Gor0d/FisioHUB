'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showCompanyName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showCompanyName = true, size = 'md' }: LogoProps) {
  const { theme, companyName } = useTheme();

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {/* Ícone do FisioHub */}
      <div className={cn(
        'flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold',
        iconSizes[size]
      )}>
        <span className={cn('leading-none', size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-xl')}>
          F
        </span>
      </div>
      
      {/* Texto do Logo */}
      <div className="flex flex-col">
        <span className={cn('font-bold text-foreground', sizeClasses[size])}>
          FisioHub
        </span>
        {showCompanyName && companyName && (
          <span className={cn(
            'text-muted-foreground -mt-1',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}>
            {companyName}
          </span>
        )}
      </div>
    </div>
  );
}

export function LogoIcon({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const iconSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-xl'
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold',
      iconSizes[size],
      className
    )}>
      <span className="leading-none">F</span>
    </div>
  );
}