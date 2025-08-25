'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tenantApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Loader2,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  createdAt: string;
  trialEndsAt?: string;
}

export default function TenantPage() {
  const params = useParams();
  const router = useRouter();
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMode, setLoginMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      fetchTenantInfo(slug);
    }
  }, [slug]);

  const fetchTenantInfo = async (tenantSlug: string) => {
    setLoading(true);
    try {
      const data = await tenantApi.getInfo(tenantSlug);
      setTenantInfo(data);
    } catch (error) {
      console.error('Erro ao carregar tenant:', error);
      // Always create fallback tenant info for development
      const fallbackName = tenantSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      setTenantInfo({
        id: `fallback-${tenantSlug}`,
        name: fallbackName,
        slug: tenantSlug,
        status: 'trial',
        plan: 'professional',
        createdAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Por enquanto, simulação de login - implementar autenticação real depois
    if (loginData.email && loginData.password) {
      // Redirecionar para dashboard do tenant
      router.push(`/t/${slug}/dashboard`);
    } else {
      setLoginError('Email e senha são obrigatórios');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando informações do tenant...</p>
        </div>
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Tenant não encontrado</h1>
            <p className="text-muted-foreground mb-4">
              O tenant "{slug}" não foi encontrado ou não está ativo.
            </p>
            <Link href="/register">
              <Button>Criar Nova Conta</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trialDaysLeft = tenantInfo.trialEndsAt 
    ? Math.ceil((new Date(tenantInfo.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 14;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB" 
                className="h-8 w-auto"
              />
              <div className="border-l pl-3">
                <h1 className="font-semibold text-lg">{tenantInfo.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {tenantInfo.plan} • {tenantInfo.status}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {trialDaysLeft > 0 && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{trialDaysLeft} dias restantes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {!loginMode ? (
            // Página de apresentação do tenant
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Bem-vindo ao {tenantInfo.name}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Sistema de gestão completo para fisioterapia
              </p>

              <div className="flex justify-center gap-4">
                <Button onClick={() => setLoginMode(true)} size="lg">
                  <LogIn className="h-5 w-5 mr-2" />
                  Fazer Login
                </Button>
                <Link href="/register">
                  <Button variant="outline" size="lg">
                    Criar Nova Conta
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Formulário de login
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Entrar em {tenantInfo.name}</CardTitle>
                  <CardDescription>
                    Digite suas credenciais para acessar o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Senha
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Sua senha"
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          required
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

                    {loginError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <p className="text-red-700 text-sm">{loginError}</p>
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      Entrar
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t text-center">
                    <button
                      onClick={() => setLoginMode(false)}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      ← Voltar
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Grid - apenas quando não está em login */}
          {!loginMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Gestão de Pacientes</h3>
                  <p className="text-sm text-muted-foreground">
                    Prontuários digitais, histórico médico e acompanhamento completo
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Indicadores & Escalas</h3>
                  <p className="text-sm text-muted-foreground">
                    Barthel, MRC e indicadores customizados para avaliação
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Relatórios Avançados</h3>
                  <p className="text-sm text-muted-foreground">
                    Analytics, dashboards e exportação de dados completa
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Notice */}
          {!loginMode && (
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
                <Shield className="h-4 w-4" />
                <span>Dados protegidos conforme LGPD • SSL/TLS • Backup automático</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}