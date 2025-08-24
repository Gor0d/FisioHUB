'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Stethoscope,
  User,
  Mail,
  Building,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

interface InviteData {
  token: string;
  email: string;
  name: string;
  role: string;
  tenantName: string;
  tenantSlug: string;
  hospitalName?: string;
  serviceName?: string;
  isValid: boolean;
  isExpired: boolean;
  alreadyAccepted: boolean;
}

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  const token = params?.token as string;

  useEffect(() => {
    if (token) {
      validateInvite();
    }
  }, [token]);

  const validateInvite = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invites/${token}/validate`);
      const data = await response.json();

      if (data.success) {
        setInviteData(data.data);
        setFormData(prev => ({ ...prev, name: data.data.name || '' }));
      } else {
        setError(data.message || 'Convite inválido');
      }
    } catch (error) {
      setError('Erro ao validar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirecionar para login ou dashboard
        router.push(`/login?tenant=${inviteData?.tenantSlug}&email=${inviteData?.email}&message=invite-accepted`);
      } else {
        setError(data.message || 'Erro ao aceitar convite');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.password) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Confirmação de senha não confere');
      return false;
    }
    
    setError('');
    return true;
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img 
              src="/fisiohub.png" 
              alt="FisioHUB" 
              className="h-8 w-auto"
            />
            
            <Link href="/login" className="text-sm text-primary hover:underline">
              Fazer Login
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          {/* Error or Invalid Invite */}
          {(error && !inviteData) || (inviteData && (!inviteData.isValid || inviteData.isExpired || inviteData.alreadyAccepted)) && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                
                <h1 className="text-xl font-bold text-foreground mb-2">
                  {inviteData?.isExpired && 'Convite Expirado'}
                  {inviteData?.alreadyAccepted && 'Convite já Aceito'}
                  {(!inviteData || !inviteData.isValid) && 'Convite Inválido'}
                </h1>
                
                <p className="text-muted-foreground mb-4">
                  {inviteData?.isExpired && 'Este convite expirou. Entre em contato com o administrador para solicitar um novo convite.'}
                  {inviteData?.alreadyAccepted && 'Este convite já foi aceito anteriormente. Você pode fazer login normalmente.'}
                  {(!inviteData || !inviteData.isValid) && 'Este convite não é válido ou foi cancelado.'}
                </p>

                <div className="flex flex-col gap-2">
                  <Link href={`/login${inviteData?.tenantSlug ? `?tenant=${inviteData.tenantSlug}` : ''}`}>
                    <Button className="w-full">
                      Ir para Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" className="w-full">
                      Criar Nova Conta
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Valid Invite Form */}
          {inviteData && inviteData.isValid && !inviteData.isExpired && !inviteData.alreadyAccepted && (
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                
                <CardTitle className="text-2xl">Você foi convidado!</CardTitle>
                <CardDescription>
                  Complete seu cadastro para acessar o FisioHUB
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Invite Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Organização:</span>
                      <span className="font-medium text-blue-900">{inviteData.tenantName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Email:</span>
                      <span className="font-medium text-blue-900">{inviteData.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Função:</span>
                      <Badge variant="secondary">{inviteData.role}</Badge>
                    </div>
                    {inviteData.hospitalName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Hospital:</span>
                        <span className="font-medium text-blue-900">{inviteData.hospitalName}</span>
                      </div>
                    )}
                    {inviteData.serviceName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Serviço:</span>
                        <span className="font-medium text-blue-900">{inviteData.serviceName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Senha *
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite uma senha segura"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirmar Senha *
                    </label>
                    <Input
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleAccept} 
                    disabled={submitting} 
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando conta...
                      </>
                    ) : (
                      <>
                        Aceitar Convite
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao aceitar o convite, você concorda com os{' '}
                    <Link href="/terms" className="text-primary hover:underline" target="_blank">
                      Termos de Uso
                    </Link>{' '}
                    e a{' '}
                    <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                      Política de Privacidade
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}