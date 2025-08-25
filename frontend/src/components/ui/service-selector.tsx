'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, Heart, Brain, Users, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  code: string;
  color?: string;
  icon?: string;
  hospitalId?: string;
  hospitalName?: string;
  hospitalCode?: string;
  stats: {
    users: number;
    patients: number;
    indicators: number;
  };
}


const getServiceIcon = (iconName?: string, color?: string) => {
  const iconClass = `h-4 w-4`;
  const iconColor = color || '#10B981';
  
  switch (iconName) {
    case 'heart':
      return <Heart className={iconClass} style={{ color: iconColor }} />;
    case 'brain':
      return <Brain className={iconClass} style={{ color: iconColor }} />;
    case 'users':
      return <Users className={iconClass} style={{ color: iconColor }} />;
    case 'stethoscope':
      return <Stethoscope className={iconClass} style={{ color: iconColor }} />;
    default:
      return <Stethoscope className={iconClass} style={{ color: iconColor }} />;
  }
};

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  selectedHospitalId?: string | null;
  onServiceChange: (serviceId: string | null) => void;
  className?: string;
}

export function ServiceSelector({
  services,
  selectedServiceId,
  selectedHospitalId,
  onServiceChange,
  className,
}: ServiceSelectorProps) {
  const [open, setOpen] = useState(false);

  // Filtrar serviços pelo hospital selecionado (se houver)
  const filteredServices = selectedHospitalId 
    ? services.filter(service => service.hospitalId === selectedHospitalId)
    : services;

  // Adicionar opção "Todos os Serviços" no início da lista
  const serviceOptions = [
    {
      id: null,
      name: 'Todos os Serviços',
      code: 'all',
      color: '#3B82F6',
      icon: 'stethoscope',
      stats: { users: 0, patients: 0, indicators: 0 }
    } as any,
    ...filteredServices,
  ];

  const selectedService = serviceOptions.find(s => (s.id || null) === selectedServiceId) || serviceOptions[0];

  const handleServiceSelect = (service: Service) => {
    console.log('Selecionando serviço:', service.name, service.id);
    onServiceChange(service.id || null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[240px] justify-between", className)}
        >
          <div className="flex items-center gap-2">
            {getServiceIcon(selectedService?.icon, selectedService?.color)}
            <span className="truncate">
              {selectedService?.name || "Selecionar serviço..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2" align="start">
        <div className="space-y-1">
          {serviceOptions.map((service) => (
            <button
              key={service.id || 'all'}
              onClick={() => handleServiceSelect(service)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-md text-left hover:bg-accent hover:text-accent-foreground transition-colors",
                selectedServiceId === (service.id || null) && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                {getServiceIcon(service.icon, service.color)}
                {service.id === null ? (
                  <span className="text-blue-600 font-medium">🔄 Visão Geral</span>
                ) : (
                  <div className="flex flex-col">
                    <span className="font-medium">{service.name}</span>
                    {service.hospitalName && (
                      <span className="text-xs text-muted-foreground">
                        {service.hospitalName}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {selectedServiceId === (service.id || null) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}