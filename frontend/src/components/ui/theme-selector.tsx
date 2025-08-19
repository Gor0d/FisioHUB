'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { availableThemes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Palette className="h-4 w-4" />
        Tema
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-20 p-2">
            <div className="text-sm font-medium text-foreground mb-2 px-2">
              Escolha um tema:
            </div>
            {availableThemes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => {
                  setTheme(themeOption);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                  theme.id === themeOption.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{
                      backgroundColor: `hsl(${themeOption.colors.primary})`
                    }}
                  />
                  {themeOption.name}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function CompanyNameInput() {
  const { companyName, setCompanyName } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(companyName || '');

  const handleSave = () => {
    setCompanyName(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(companyName || '');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {companyName || 'Nome da Empresa'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-xs h-6"
        >
          Editar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nome da Empresa"
        className="text-sm bg-background border border-border rounded px-2 py-1 w-32"
        autoFocus
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        className="text-xs h-6"
      >
        Salvar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        className="text-xs h-6"
      >
        Cancelar
      </Button>
    </div>
  );
}