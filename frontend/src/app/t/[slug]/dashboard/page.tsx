'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { tenantApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Calendar,
  BarChart3, 
  Settings, 
  Loader2,
  Plus,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  Bell
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

const dashboardStats = [
  {
    title: "Pacientes Ativos",
    value: "0",
    change: "+0%",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Consultas Hoje",
    value: "0", 
    change: "+0%",
    icon: Calendar,
    color: "text-green-600"
  },
  {
    title: "Avaliações",
    value: "0",
    change: "+0%",
    icon: BarChart3,
    color: "text-purple-600"
  },
  {
    title: "Taxa de Melhora",
    value: "0%",
    change: "+0%",
    icon: TrendingUp,
    color: "text-orange-600"
  }
];

export default function TenantDashboard() {
  const params = useParams();
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const slug = params?.slug as string;

  // Create quickActions function to ensure slug is available
  const getQuickActions = (currentSlug: string) => [
    {
      title: "Novo Paciente",
      description: "Cadastrar um novo paciente no sistema",
      icon: Users,
      href: `/t/${currentSlug}/patients/new`,
      color: "bg-blue-500"
    },
    {
      title: "Ver Pacientes",
      description: "Gerenciar pacientes cadastrados",
      icon: Users,
      href: `/t/${currentSlug}/patients`,
      color: "bg-blue-600"
    },
    {
      title: "Agendar Consulta",
      description: "Marcar nova consulta ou sessão",
      icon: Calendar,
      href: `/t/${currentSlug}/appointments/new`,
      color: "bg-green-500"
    },
    {
      title: "Aplicar Escala",
      description: "Barthel, MRC ou indicadores customizados",
      icon: BarChart3,
      href: `/t/${currentSlug}/assessments/new`,
      color: "bg-purple-500"
    },
    {
      title: "Relatórios",
      description: "Visualizar dashboards e métricas",
      icon: Activity,
      href: `/t/${currentSlug}/reports`,
      color: "bg-orange-500"
    }
  ];

  const quickActions = slug ? getQuickActions(slug) : [];

  useEffect(() => {
    if (slug) {
      // Always create tenant info from slug - no API dependency
      const fallbackName = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      setTenantInfo({
        id: `tenant-${slug}`,
        name: fallbackName,
        slug: slug,
        status: 'trial',
        plan: 'professional',
        createdAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      setLoading(false);
      
      // Optional: Try to fetch real data in background (non-blocking)
      fetchTenantInfo(slug);
    }
  }, [slug]);

  const fetchTenantInfo = async (tenantSlug: string) => {
    try {
      const data = await tenantApi.getInfo(tenantSlug);
      // Update with real data if available
      setTenantInfo(data);
    } catch (error) {
      console.error('API not available, using local tenant info:', error);
      // Keep using the fallback data already set
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold mb-2">Erro ao carregar</h1>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar as informações do tenant.
            </p>
            <Link href={`/t/${slug}`}>
              <Button>Voltar</Button>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB" 
                className="h-8 w-auto"
              />
              <div className="border-l pl-4">
                <h1 className="font-semibold text-lg">{tenantInfo.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Dashboard • {tenantInfo.plan}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {trialDaysLeft > 0 && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{trialDaysLeft} dias restantes</span>
                </div>
              )}
              
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao seu Dashboard! 👋
          </h2>
          <p className="text-muted-foreground">
            Gerencie pacientes, consultas e avaliações de forma simples e eficiente.
          </p>
        </div>

        {/* Trial Banner */}
        {trialDaysLeft > 0 && (
          <div className="mb-8">
            <Card className="border-l-4 border-l-green-500 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800">Período de Teste Ativo</h3>
                      <p className="text-sm text-green-700">
                        Você tem {trialDaysLeft} dias para explorar todas as funcionalidades gratuitamente.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                    Ver Planos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} vs. mês anterior</p>
                  </div>
                  <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso direto às funcionalidades mais utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href} className="block">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm">{action.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas ações realizadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-muted-foreground mb-2">Nenhuma atividade ainda</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comece cadastrando seu primeiro paciente ou agendando uma consulta.
                  </p>
                  <Link href={`/t/${slug}/patients/new`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Paciente
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Primeiros Passos</CardTitle>
                <CardDescription>
                  Configure sua conta em poucos minutos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">✓</span>
                  </div>
                  <span className="text-sm text-muted-foreground line-through">Conta criada</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <span className="text-sm">Cadastrar primeiro paciente</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">3</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Aplicar primeira avaliação</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">4</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Convidar equipe</span>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Ajuda & Suporte</CardTitle>
                <CardDescription>
                  Recursos para começar rapidamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  Guia de Início Rápido
                </Button>
                
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Tutoriais em Vídeo
                </Button>
                
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Contatar Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}