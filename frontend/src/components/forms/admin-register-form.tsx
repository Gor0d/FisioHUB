'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@fisiohub/shared';
import { UserRole } from '@fisiohub/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, Shield, UserCheck, Users } from 'lucide-react';

interface AdminRegisterFormProps {
  onSwitchToLogin?: () => void;
}

export function AdminRegisterForm({ onSwitchToLogin }: AdminRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const { register: registerUser } = useAuth();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      crf: '',
      phone: '',
      specialty: '',
      role: UserRole.ADMIN,
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(undefined);
      await registerUser(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="h-4 w-4" />;
      case UserRole.PHYSIOTHERAPIST:
        return <UserCheck className="h-4 w-4" />;
      case UserRole.RECEPTIONIST:
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.PHYSIOTHERAPIST:
        return 'Fisioterapeuta';
      case UserRole.RECEPTIONIST:
        return 'Recepcionista';
      default:
        return 'Usuário';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Criar Usuário</CardTitle>
        <CardDescription>
          Crie uma nova conta para o sistema FisioHub
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {/* Seletor de Tipo de Usuário */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tipo de usuário *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(UserRole).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => form.setValue('role', role)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-md border transition-colors ${
                    selectedRole === role
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {getRoleIcon(role)}
                  <span className="text-xs font-medium">
                    {getRoleLabel(role)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Nome completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder={
                  selectedRole === UserRole.ADMIN ? "Administrador do Sistema" :
                  selectedRole === UserRole.PHYSIOTHERAPIST ? "Dr. João Silva" :
                  "Maria Santos"
                }
                className="pl-10"
                {...form.register('name')}
              />
            </div>
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@fisiohub.com"
                className="pl-10"
                {...form.register('email')}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                className="pl-10 pr-10"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="crf" className="text-sm font-medium text-foreground">
                {selectedRole === UserRole.PHYSIOTHERAPIST ? 'CRF' : 'Registro'}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="crf"
                  placeholder={
                    selectedRole === UserRole.PHYSIOTHERAPIST ? "12345-F" : 
                    selectedRole === UserRole.ADMIN ? "ADM-001" : 
                    "REC-001"
                  }
                  className="pl-10"
                  {...form.register('crf')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  className="pl-10"
                  {...form.register('phone')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="specialty" className="text-sm font-medium text-foreground">
              {selectedRole === UserRole.PHYSIOTHERAPIST ? 'Especialidade' : 'Área/Função'}
            </label>
            <Input
              id="specialty"
              placeholder={
                selectedRole === UserRole.PHYSIOTHERAPIST ? "Ex: Ortopedia, Neurologia, Esportiva..." :
                selectedRole === UserRole.ADMIN ? "Administrador do Sistema" :
                "Recepção e Atendimento"
              }
              {...form.register('specialty')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Criando usuário...' : `Criar ${getRoleLabel(selectedRole)}`}
          </Button>

          {onSwitchToLogin && (
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                Faça login
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}