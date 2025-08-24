'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Hospital {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

interface HospitalSelectorProps {
  hospitals: Hospital[];
  selectedHospitalId: string | null;
  onHospitalChange: (hospitalId: string | null) => void;
  className?: string;
}

export function HospitalSelector({
  hospitals,
  selectedHospitalId,
  onHospitalChange,
  className,
}: HospitalSelectorProps) {
  const [open, setOpen] = useState(false);

  // Adicionar opção "Todos os Hospitais" no início da lista
  const hospitalOptions = [
    {
      id: null,
      name: 'Todos os Hospitais',
      code: 'all',
      active: true,
    },
    ...hospitals.filter(h => h.active),
  ];

  const selectedHospital = hospitalOptions.find(h => h.id === selectedHospitalId) || hospitalOptions[0];

  const handleHospitalSelect = (hospital: typeof hospitalOptions[0]) => {
    console.log('Selecionando hospital:', hospital.name, hospital.id);
    onHospitalChange(hospital.id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[280px] justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {selectedHospital?.name || "Selecionar hospital..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-2" align="start">
        <div className="space-y-1">
          {hospitalOptions.map((hospital) => (
            <button
              key={hospital.id || 'all'}
              onClick={() => handleHospitalSelect(hospital)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-md text-left hover:bg-accent hover:text-accent-foreground transition-colors",
                selectedHospitalId === hospital.id && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {hospital.id === null ? (
                  <span className="text-blue-600 font-medium">📊 Visão Consolidada</span>
                ) : (
                  <div className="flex flex-col">
                    <span className="font-medium">{hospital.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {hospital.code}
                    </span>
                  </div>
                )}
              </div>
              {selectedHospitalId === hospital.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}