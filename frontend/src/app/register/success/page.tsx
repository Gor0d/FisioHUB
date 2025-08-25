'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { tenantApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle,
  Mail,
  ExternalLink,
  ArrowRight,
  Clock,
  Shield,
  Stethoscope,
  Users,
  Settings,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface TenantInfo {
  name: string;
  slug: string;
  subdomain: string;
  trialEndsAt: string;
}

const onboardingSteps = [
  {
    icon: Users,
    title: 'Convide sua equipe',
    description: 'Adicione colaboradores e organize por hospitais e serviços',
    action: 'Gerenciar usuários'
  },
  {
    icon: Settings,
    title: 'Configure seus serviços',
    description: 'Defina os departamentos e especialidades do seu hospital',
    action: 'Configurar serviços'
  },
  {
    icon: BarChart3,
    title: 'Importe dados existentes',
    description: 'Migre dados de pacientes e históricos de indicadores',
    action: 'Importar dados'
  }
];

export default function RegisterSuccessPage() {
  const searchParams = useSearchParams();
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const tenantSlug = searchParams?.get('tenant');

  useEffect(() => {
    if (tenantSlug) {
      fetchTenantInfo(tenantSlug);
    }
  }, [tenantSlug]);

  const fetchTenantInfo = async (slug: string) => {
    try {
      const data = await tenantApi.getInfo(slug);
      setTenantInfo({
        name: data.name,
        slug: data.slug,
        subdomain: `${data.slug}.fisiohub.app`,
        trialEndsAt: data.createdAt // Usando createdAt como fallback para trial
      });
    } catch (error) {
      console.error('Erro ao carregar informações do tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold mb-2">Tenant não encontrado</h1>
            <p className="text-muted-foreground mb-4">
              Não foi possível encontrar as informações da conta.
            </p>
            <Link href="/register">
              <Button>Tentar novamente</Button>
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
            <img 
              src="/fisiohub.png" 
              alt="FisioHUB" 
              className="h-8 w-auto"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🎉 Conta criada com sucesso!
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Bem-vindo ao FisioHUB, <strong>{tenantInfo.name}</strong>! 
              Sua conta foi criada e está pronta para uso.
            </p>

            <div className="bg-white border border-green-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Período de teste ativo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Você tem <strong>{trialDaysLeft} dias grátis</strong> para explorar 
                todas as funcionalidades do FisioHUB.
              </p>
            </div>
          </div>

          {/* Access Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Acesso à Plataforma
                </CardTitle>
                <CardDescription>
                  Use estas informações para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      URL da sua conta:
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                        https://{tenantInfo.subdomain}
                      </code>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://${tenantInfo.subdomain}`);
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Link href={`https://${tenantInfo.subdomain}/login`}>
                      <Button className="w-full">
                        Acessar Minha Conta
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Próximos Passos
                </CardTitle>
                <CardDescription>
                  Verifique seu email para ativar a conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Verifique seu email</p>
                      <p className="text-sm text-muted-foreground">
                        Enviamos instruções para ativar sua conta
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Faça seu primeiro login</p>
                      <p className="text-sm text-muted-foreground">
                        Use suas credenciais para acessar o dashboard
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Configure sua conta</p>
                      <p className="text-sm text-muted-foreground">
                        Siga o assistente de configuração inicial
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Steps */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Configure sua conta em 3 passos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {onboardingSteps.map((step, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      {step.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <Card className="bg-gray-50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-muted-foreground mb-4">
                Nossa equipe está aqui para ajudar você a começar com o FisioHUB
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/docs">
                  <Button variant="outline">
                    Documentação
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline">
                    Suporte Técnico
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button>
                    Agendar Demo
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Suporte especializado incluído em todos os planos</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
              <Shield className="h-4 w-4" />
              <span>Seus dados estão seguros e protegidos conforme LGPD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}