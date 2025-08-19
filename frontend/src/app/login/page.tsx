'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/forms/login-form';
import { RegisterForm } from '@/components/forms/register-form';
import { Logo } from '@/components/ui/logo';
import { ThemeSelector, CompanyNameInput } from '@/components/ui/theme-selector';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
      {/* Header com controles de personalização */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-4">
          <CompanyNameInput />
          <ThemeSelector />
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado esquerdo - Informações */}
          <div className="space-y-8 text-center lg:text-left">
            <div>
              <Logo size="lg" className="justify-center lg:justify-start mb-6" />
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Sistema de Gestão para Fisioterapeutas
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                Gerencie seus pacientes, agendamentos e evoluções de forma simples e eficiente. 
                A solução completa para sua clínica de fisioterapia.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Clínicas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5K+</div>
                <div className="text-sm text-muted-foreground">Pacientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Sessões</div>
              </div>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <span>Controle total de pacientes e agendamentos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <span>Registro detalhado de evoluções</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <span>Dashboard com métricas em tempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <span>Interface personalizável por empresa</span>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="flex justify-center">
            {isRegister ? (
              <RegisterForm onSwitchToLogin={() => setIsRegister(false)} />
            ) : (
              <LoginForm onSwitchToRegister={() => setIsRegister(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t">
        <div className="flex items-center justify-center gap-4">
          <span>© 2024 FisioHub. Todos os direitos reservados.</span>
          <span>•</span>
          <span>Versão 1.0.0</span>
        </div>
      </footer>
    </div>
  );
}