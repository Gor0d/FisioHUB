'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig, defaultTheme, applyTheme } from '@/lib/themes';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  companyName?: string;
  setCompanyName: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);
  const [companyName, setCompanyName] = useState<string>();

  const setTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fisiohub-theme', JSON.stringify(newTheme));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Usar localStorage global para temas e empresa (não por usuário)
      const savedTheme = localStorage.getItem('fisiohub-theme');
      const savedCompanyName = localStorage.getItem('fisiohub-company-name');
      
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          setThemeState(parsedTheme);
          applyTheme(parsedTheme);
        } catch (error) {
          console.error('Error parsing saved theme:', error);
        }
      } else {
        applyTheme(defaultTheme);
      }

      if (savedCompanyName) {
        setCompanyName(savedCompanyName);
      }
    } else {
      applyTheme(defaultTheme);
    }
  }, []);

  const handleSetCompanyName = (name: string) => {
    setCompanyName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fisiohub-company-name', name);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      companyName, 
      setCompanyName: handleSetCompanyName 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}