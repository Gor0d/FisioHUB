'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { ThemeSelector, CompanyNameInput } from '@/components/ui/theme-selector';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { LogOut, Users, Calendar, Activity, TrendingUp, Shield, UserPlus, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  appointmentsThisMonth: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    appointmentsThisMonth: 0,
    revenue: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do dashboard
      const dashboardResponse = await api.get('/api/dashboard/stats');
      const dashboardData = dashboardResponse.data?.data || {};
      
      setStats({
        totalPatients: dashboardData.totalPatients || 0,
        totalAppointments: dashboardData.totalAppointments || 0,
        appointmentsToday: dashboardData.appointmentsToday || 0,
        appointmentsThisWeek: dashboardData.appointmentsThisWeek || 0,
        appointmentsThisMonth: dashboardData.appointmentsThisMonth || 0,
        revenue: {
          today: dashboardData.revenue?.today || 0,
          thisWeek: dashboardData.revenue?.thisWeek || 0,
          thisMonth: dashboardData.revenue?.thisMonth || 0
        }
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header específico do Dashboard */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6 gap-4">
          <Logo size="sm" />
          
          <div className="ml-auto flex items-center gap-4">
            <CompanyNameInput />
            <ThemeSelector />
            
            <div className="flex items-center gap-4">
              {user?.specialty === 'Administrador do Sistema' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Olá, {user?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="p-6 space-y-6">
        {/* Título */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de controle do FisioHub
          </p>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalPatients}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPatients === 0 ? 
                  'Nenhum paciente cadastrado ainda' : 
                  `${stats.totalPatients} paciente${stats.totalPatients > 1 ? 's' : ''} cadastrado${stats.totalPatients > 1 ? 's' : ''}`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agendamentos Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.appointmentsToday}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.appointmentsToday === 0 ? 
                  'Nenhum agendamento para hoje' : 
                  `${stats.appointmentsToday} agendamento${stats.appointmentsToday > 1 ? 's' : ''} hoje`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Agendamentos
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalAppointments}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalAppointments === 0 ? 
                  'Nenhum agendamento realizado ainda' : 
                  `${stats.totalAppointments} agendamento${stats.totalAppointments > 1 ? 's' : ''} total`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agendamentos do Mês
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.appointmentsThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.appointmentsThisMonth === 0 ? 
                  'Nenhum agendamento este mês' : 
                  `${stats.appointmentsThisMonth} agendamento${stats.appointmentsThisMonth > 1 ? 's' : ''} este mês`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cartões de ações */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.specialty === 'Administrador do Sistema' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          <Card>
            <CardHeader>
              <CardTitle>Primeiros Passos</CardTitle>
              <CardDescription>
                Configure sua conta e comece a usar o FisioHub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stats.totalPatients > 0 ? 'bg-green-500' : 'bg-primary'}`}></div>
                  <span className="text-sm">{stats.totalPatients > 0 ? '✅ Pacientes cadastrados' : 'Cadastrar primeiro paciente'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stats.totalAppointments > 0 ? 'bg-green-500' : 'bg-muted'}`}></div>
                  <span className={`text-sm ${stats.totalAppointments > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stats.totalAppointments > 0 ? '✅ Agendamentos realizados' : 'Criar primeiro agendamento'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Registrar primeira evolução</span>
                </div>
              </div>
              <Link href="/dashboard/pacientes">
                <Button className="w-full">
                  Cadastrar Paciente
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Indicadores Clínicos
              </CardTitle>
              <CardDescription>
                Sistema de registro de indicadores quantitativos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Indicadores gerais</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Escala de Barthel (AVD)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Escala MRC (Força)</span>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/indicators">
                  <Button className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Acessar Indicadores
                  </Button>
                </Link>
                <Link href="/dashboard/melhorias">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Ver Melhorias
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
              <CardDescription>
                Customize o FisioHub para sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Use os controles no topo da página para:
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Alterar cores do sistema</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Definir nome da empresa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Adicionar logo (em breve)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.specialty === 'Administrador do Sistema' && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Administração
                </CardTitle>
                <CardDescription>
                  Ferramentas administrativas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Gerenciar usuários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Configurações globais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Relatórios gerenciais</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href="/admin/create-user">
                    <Button className="w-full flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Criar Usuário
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Suporte</CardTitle>
              <CardDescription>
                Precisa de ajuda? Estamos aqui para você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Documentação completa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Suporte via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Treinamento online</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Falar com Suporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}