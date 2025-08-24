'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { ThemeSelector, CompanyNameInput } from '@/components/ui/theme-selector';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { LogOut, Users, Calendar, Activity, TrendingUp, Shield, UserPlus, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { HospitalSelector } from '@/components/ui/hospital-selector';
import { ServiceSelector } from '@/components/ui/service-selector';

interface DashboardStats {
  totalPatients: number;
  // Dados de indicadores e escalas para hospital
  indicatorsToday: number;
  barthelScalesToday: number;
  mrcScalesToday: number;
  totalActivitiesToday: number;
  // Dados específicos para usuário master
  isMasterUser?: boolean;
  hospitals?: Array<{
    id: string;
    name: string;
    code: string;
    active: boolean;
    stats: {
      patients: number;
      users: number;
      services: number;
    };
  }>;
  services?: Array<{
    id: string;
    name: string;
    code: string;
    color?: string;
    icon?: string;
    hospitalId?: string;
    hospitalName?: string;
    hospitalCode?: string;
    stats: {
      users: number;
      patients: number;
      indicators: number;
    };
  }>;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    // Dados de indicadores e escalas para hospital
    indicatorsToday: 0,
    barthelScalesToday: 0,
    mrcScalesToday: 0,
    totalActivitiesToday: 0,
    isMasterUser: false,
    hospitals: [],
    services: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [allHospitals, setAllHospitals] = useState<Array<{
    id: string;
    name: string;
    code: string;
    active: boolean;
  }>>([]);
  const [allServices, setAllServices] = useState<Array<{
    id: string;
    name: string;
    code: string;
    color?: string;
    icon?: string;
    hospitalId?: string;
    hospitalName?: string;
    hospitalCode?: string;
    stats: {
      users: number;
      patients: number;
      indicators: number;
    };
  }>>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do dashboard com filtros de hospital e serviço se necessário
      const params = new URLSearchParams();
      if (selectedHospitalId) params.append('hospitalId', selectedHospitalId);
      if (selectedServiceId) params.append('serviceId', selectedServiceId);
      
      const queryString = params.toString();
      const dashboardResponse = await api.get(`/api/dashboard/stats${queryString ? `?${queryString}` : ''}`);
      const dashboardData = dashboardResponse.data?.data || {};
      
      setStats({
        totalPatients: dashboardData.totalPatients || 0,
        // Dados de indicadores e escalas para hospital
        indicatorsToday: dashboardData.indicatorsToday || 0,
        barthelScalesToday: dashboardData.barthelScalesToday || 0,
        mrcScalesToday: dashboardData.mrcScalesToday || 0,
        totalActivitiesToday: dashboardData.totalActivitiesToday || 0,
        isMasterUser: dashboardData.isMasterUser || false,
        hospitals: dashboardData.hospitals || [],
        services: dashboardData.services || []
      });
      
      // Armazenar listas para os seletores
      if (dashboardData.hospitals && (!allHospitals.length || !selectedHospitalId)) {
        setAllHospitals(dashboardData.hospitals);
      }
      if (dashboardData.services) {
        setAllServices(dashboardData.services);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedHospitalId, selectedServiceId]); // Recarregar dados quando hospital ou serviço mudarem

  // Funções para lidar com as mudanças de filtros
  const handleHospitalChange = (hospitalId: string | null) => {
    setSelectedHospitalId(hospitalId);
    // Reset do serviço quando trocar hospital
    if (selectedServiceId) {
      setSelectedServiceId(null);
    }
  };

  const handleServiceChange = (serviceId: string | null) => {
    setSelectedServiceId(serviceId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header específico do Dashboard */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6 gap-4">
          <Logo size="sm" />
          
          <div className="ml-auto flex items-center gap-4">
            <CompanyNameInput />
            <DarkModeToggle />
            <ThemeSelector />
            
            {/* Seletor de hospital - apenas para usuários master */}
            {stats.isMasterUser && allHospitals.length > 0 && (
              <HospitalSelector
                hospitals={allHospitals}
                selectedHospitalId={selectedHospitalId}
                onHospitalChange={handleHospitalChange}
                className="w-[250px]"
              />
            )}
            
            {/* Seletor de serviços */}
            {allServices.length > 0 && (
              <ServiceSelector
                services={allServices}
                selectedServiceId={selectedServiceId}
                selectedHospitalId={selectedHospitalId}
                onServiceChange={handleServiceChange}
                className="w-[220px]"
              />
            )}
            
            <div className="flex items-center gap-4">
              {user?.specialty === 'CEO MaisFisio' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm">
                  <Shield className="h-3 w-3" />
                  <span>CEO MaisFisio</span>
                </div>
              )}
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
          <h1 className="text-3xl font-bold text-foreground">
            {(() => {
              const hospitalName = allHospitals.find(h => h.id === selectedHospitalId)?.name;
              const serviceName = allServices.find(s => s.id === selectedServiceId)?.name;
              
              if (stats.isMasterUser) {
                if (selectedServiceId && selectedHospitalId) {
                  return `Dashboard ${serviceName} - ${hospitalName}`;
                } else if (selectedServiceId) {
                  return `Dashboard ${serviceName} - Geral`;
                } else if (selectedHospitalId) {
                  return `Dashboard ${hospitalName}`;
                } else {
                  return 'Dashboard MaisFisio - Visão Geral';
                }
              } else {
                if (selectedServiceId) {
                  return `Dashboard ${serviceName}`;
                } else {
                  return 'Dashboard Hospitalar';
                }
              }
            })()}
          </h1>
          <p className="text-muted-foreground">
            {(() => {
              const hospitalName = allHospitals.find(h => h.id === selectedHospitalId)?.name;
              const serviceName = allServices.find(s => s.id === selectedServiceId)?.name;
              
              if (stats.isMasterUser) {
                if (selectedServiceId && selectedHospitalId) {
                  return `Painel específico do serviço ${serviceName} no ${hospitalName}`;
                } else if (selectedServiceId) {
                  return `Painel consolidado do serviço ${serviceName} em todos os hospitais`;
                } else if (selectedHospitalId) {
                  return `Painel específico do ${hospitalName}`;
                } else {
                  return 'Painel consolidado de todos os hospitais da rede MaisFisio';
                }
              } else {
                if (selectedServiceId) {
                  return `Painel de controle do serviço ${serviceName}`;
                } else {
                  return 'Painel de controle para fisioterapia hospitalar';
                }
              }
            })()}
          </p>
        </div>

        {/* Cards de métricas hospitalares */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Cadastrados
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
                  `${stats.totalPatients} paciente${stats.totalPatients > 1 ? 's' : ''} no sistema`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Indicadores Hoje
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.indicatorsToday}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.indicatorsToday === 0 ? 
                  'Nenhum indicador registrado hoje' : 
                  `${stats.indicatorsToday} indicador${stats.indicatorsToday !== 1 ? 'es' : ''} hoje`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Escalas Barthel Hoje
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.barthelScalesToday}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.barthelScalesToday === 0 ? 
                  'Nenhuma escala Barthel hoje' : 
                  `${stats.barthelScalesToday} avaliação${stats.barthelScalesToday > 1 ? 'ões' : ''} hoje`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Escalas MRC Hoje
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.mrcScalesToday}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.mrcScalesToday === 0 ? 
                  'Nenhuma escala MRC hoje' : 
                  `${stats.mrcScalesToday} avaliação${stats.mrcScalesToday > 1 ? 'ões' : ''} hoje`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção especial para usuário master - Hospitais (apenas quando visualizando todos) */}
        {stats.isMasterUser && !selectedHospitalId && stats.hospitals && stats.hospitals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Hospitais da Rede</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.hospitals.map((hospital) => (
                <Card key={hospital.id} className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${hospital.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {hospital.name}
                    </CardTitle>
                    <CardDescription>
                      Código: {hospital.code} • {hospital.active ? 'Ativo' : 'Inativo'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Pacientes:</span>
                        <span className="text-sm font-medium">{hospital.stats.patients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Usuários:</span>
                        <span className="text-sm font-medium">{hospital.stats.users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Serviços:</span>
                        <span className="text-sm font-medium">{hospital.stats.services}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Serviços (quando não há filtro específico de serviço) */}
        {!selectedServiceId && allServices.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {stats.isMasterUser && selectedHospitalId 
                ? `Serviços do ${allHospitals.find(h => h.id === selectedHospitalId)?.name}`
                : stats.isMasterUser 
                  ? 'Serviços da Rede' 
                  : 'Serviços Disponíveis'
              }
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allServices
                .filter(service => selectedHospitalId ? service.hospitalId === selectedHospitalId : true)
                .map((service) => (
                <Card 
                  key={service.id} 
                  className="border-2 hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderColor: service.color || '#10B981' }}
                  onClick={() => handleServiceChange(service.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: service.color || '#10B981' }}
                      ></div>
                      {service.name}
                    </CardTitle>
                    {service.hospitalName && (
                      <CardDescription>
                        {service.hospitalName}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Usuários:</span>
                        <span className="text-sm font-medium">{service.stats.users}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pacientes:</span>
                        <span className="text-sm font-medium">{service.stats.patients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Indicadores:</span>
                        <span className="text-sm font-medium">{service.stats.indicators}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cartões de ações hospitalares */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.specialty === 'Administrador do Sistema' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          <Card>
            <CardHeader>
              <CardTitle>Fisioterapia Hospitalar</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stats.totalPatients > 0 ? 'bg-green-500' : 'bg-primary'}`}></div>
                  <span className="text-sm">{stats.totalPatients > 0 ? '✅ Pacientes cadastrados' : 'Cadastrar primeiro paciente'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stats.indicatorsToday > 0 ? 'bg-green-500' : 'bg-muted'}`}></div>
                  <span className={`text-sm ${stats.indicatorsToday > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stats.indicatorsToday > 0 ? '✅ Indicadores registrados' : 'Registrar indicadores'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stats.totalActivitiesToday > 0 ? 'bg-green-500' : 'bg-muted'}`}></div>
                  <span className={`text-sm ${stats.totalActivitiesToday > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stats.totalActivitiesToday > 0 ? '✅ Atividades hoje' : 'Registrar avaliações'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/dashboard/pacientes">
                  <Button className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Pacientes
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Relatórios
                  </Button>
                </Link>
              </div>
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
                    <span className="text-sm">Gerenciar serviços</span>
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
                  <Link href="/admin/services">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Gerenciar Serviços
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