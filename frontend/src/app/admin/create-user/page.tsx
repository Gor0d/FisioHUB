'use client';

import React from 'react';
import { AdminRegisterForm } from '@/components/forms/admin-register-form';
import { Logo } from '@/components/ui/logo';
import { ThemeSelector, CompanyNameInput } from '@/components/ui/theme-selector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function CreateUserPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Painel Administrativo</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <CompanyNameInput />
          <ThemeSelector />
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado esquerdo - Informações */}
          <div className="space-y-8 text-center lg:text-left">
            <div>
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  Criar Usuário
                </h1>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                Crie novos usuários para o sistema FisioHub. Defina o tipo de acesso 
                e as permissões adequadas para cada função.
              </p>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Administrador</div>
                  <div>Acesso completo ao sistema e configurações</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">F</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">Fisioterapeuta</div>
                  <div>Gerencia pacientes, consultas e tratamentos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">Recepcionista</div>
                  <div>Agendamentos, cadastros e atendimento inicial</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-card border rounded-lg max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-foreground">Dica Importante</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Usuários podem ter seu tipo alterado posteriormente nas configurações do sistema. 
                Mantenha sempre pelo menos um administrador ativo.
              </p>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="flex justify-center">
            <AdminRegisterForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t">
        <div className="flex items-center justify-center gap-4">
          <span>FisioHub - Painel Administrativo</span>
          <span>•</span>
          <span>Criação de Usuários</span>
        </div>
      </footer>
    </div>
  );
}