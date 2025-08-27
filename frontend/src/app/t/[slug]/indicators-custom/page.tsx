'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndicatorConfig {
  id: string;
  indicatorKey: string;
  indicatorName: string;
  description: string;
  category: string;
  unit: string;
  calculationType: 'automatic' | 'manual' | 'semi-automatic';
  isActive: boolean;
  displayOrder: number;
  target: number | null;
  alertThreshold: number | null;
}

interface CalculatedIndicator {
  config: IndicatorConfig;
  value: number;
  trend: 'up' | 'down' | 'stable';
  isOnTarget: boolean;
  needsAlert: boolean;
}

interface DashboardData {
  indicators: Record<string, CalculatedIndicator>;
  summary: {
    total: number;
    onTarget: number;
    needsAlert: number;
    performance: number;
  };
}

interface BrandingConfig {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  reportHeader: string;
}

const CATEGORY_COLORS = {
  volume: 'bg-blue-500',
  desfecho: 'bg-red-500',
  respiratorio: 'bg-green-500',
  mobilidade: 'bg-purple-500',
  procedimentos: 'bg-orange-500'
};

const CATEGORY_LABELS = {
  volume: 'Volume',
  desfecho: 'Desfecho',
  respiratorio: 'Respiratório',
  mobilidade: 'Mobilidade',
  procedimentos: 'Procedimentos'
};

export default function CustomIndicatorsPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const fetchDashboard = async () => {
    if (!tenant?.publicId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch branding configuration
      const brandingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/${tenant.publicId}/branding`);
      const brandingData = await brandingResponse.json();
      
      if (brandingData.success) {
        setBranding(brandingData.data);
      }

      // Fetch dashboard data
      const params = new URLSearchParams({
        period: selectedPeriod
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/indicators/custom-dashboard/${tenant.publicId}?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dashboard');
      }

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [tenant?.publicId, selectedPeriod]);

  const formatValue = (value: number, unit: string, calculationType: string) => {
    if (unit === '%') {
      return `${value}%`;
    }
    return `${value} ${unit}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Tenant não encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ 
      '--primary-color': branding?.primaryColor || '#3B82F6',
      '--secondary-color': branding?.secondaryColor || '#1E40AF'
    } as any}>
      {/* Custom Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          {branding?.logoUrl && (
            <img 
              src={branding.logoUrl} 
              alt={tenant.name} 
              className="h-16 w-auto"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {branding?.dashboardTitle || 'Indicadores Clínicos'}
            </h1>
            {branding?.dashboardSubtitle && (
              <p className="text-gray-600">
                {branding.dashboardSubtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={fetchDashboard} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Period Filters */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant={selectedPeriod === '7d' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedPeriod('7d')}
        >
          7 dias
        </Button>
        <Button 
          variant={selectedPeriod === '30d' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedPeriod('30d')}
        >
          30 dias
        </Button>
        <Button 
          variant={selectedPeriod === '90d' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedPeriod('90d')}
        >
          90 dias
        </Button>
      </div>

      {/* Summary Cards */}
      {dashboardData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                {dashboardData.summary.total}
              </div>
              <div className="text-sm text-gray-600">Total Indicadores</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{dashboardData.summary.onTarget}</div>
              <div className="text-sm text-gray-600">Na Meta</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{dashboardData.summary.needsAlert}</div>
              <div className="text-sm text-gray-600">Precisam Atenção</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--secondary-color)' }}>
                {dashboardData.summary.performance}%
              </div>
              <div className="text-sm text-gray-600">Performance</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando indicadores...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">❌ {error}</p>
            <Button onClick={fetchDashboard} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Indicators by Category */}
      {!loading && !error && dashboardData && (
        <div className="space-y-8">
          {Object.entries(
            Object.values(dashboardData.indicators).reduce((acc, indicator) => {
              const category = indicator.config.category;
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(indicator);
              return acc;
            }, {} as Record<string, CalculatedIndicator[]>)
          ).map(([category, indicators]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'w-4 h-4 rounded-full',
                  CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500'
                )}></div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {indicators
                  .sort((a, b) => a.config.displayOrder - b.config.displayOrder)
                  .map((indicator) => (
                  <Card key={indicator.config.id} className={cn(
                    "hover:shadow-md transition-shadow",
                    indicator.needsAlert ? "border-red-200 bg-red-50" : "",
                    indicator.isOnTarget ? "border-green-200" : ""
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {indicator.config.indicatorName}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          {indicator.needsAlert && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          {indicator.isOnTarget && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {getTrendIcon(indicator.trend)}
                        </div>
                      </div>
                      <CardDescription className="text-sm">
                        {indicator.config.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {formatValue(indicator.value, indicator.config.unit, indicator.config.calculationType)}
                        </div>
                        
                        {indicator.config.target && (
                          <div className="text-sm text-gray-500">
                            Meta: {formatValue(indicator.config.target, indicator.config.unit, indicator.config.calculationType)}
                          </div>
                        )}
                        
                        <Badge 
                          variant={indicator.config.calculationType === 'automatic' ? 'default' : 'secondary'}
                          className="mt-2"
                        >
                          {indicator.config.calculationType === 'automatic' ? 'Automático' : 'Manual'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && dashboardData && Object.keys(dashboardData.indicators).length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum indicador configurado
            </h3>
            <p className="text-gray-600 mb-6">
              Configure os indicadores específicos para este cliente
            </p>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Indicadores
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}