'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  Heart,
  Brain,
  Zap,
  Clock,
  RotateCcw,
  Star,
  Target,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import IndicatorForm from '@/components/indicators/indicator-form';

interface IndicatorData {
  config: {
    name: string;
    description: string;
    unit: string;
    target: number;
    format: string;
    category: string;
  };
  values: Array<{
    value: number;
    date: string;
    patientId?: string;
  }>;
  latest: {
    value: number;
    date: string;
  } | null;
  average: number;
  trend: 'up' | 'down' | 'stable';
}

interface DashboardSummary {
  total: number;
  onTarget: number;
  improving: number;
  deteriorating: number;
  stable: number;
  performance: number;
}

const CATEGORY_ICONS = {
  mobility: Activity,
  respiratory: Heart,
  functional: Brain,
  strength: Zap,
  efficiency: Clock,
  quality: RotateCcw,
  satisfaction: Star
};

const CATEGORY_COLORS = {
  mobility: 'bg-blue-500',
  respiratory: 'bg-red-500',
  functional: 'bg-purple-500',
  strength: 'bg-orange-500',
  efficiency: 'bg-green-500',
  quality: 'bg-yellow-500',
  satisfaction: 'bg-pink-500'
};

export default function IndicatorsPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const [dashboardData, setDashboardData] = useState<Record<string, IndicatorData>>({});
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showIndicatorForm, setShowIndicatorForm] = useState(false);

  const fetchDashboard = async () => {
    if (!tenant?.id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${tenant.publicId}?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dashboard');
      }

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data.indicators);
        setSummary(data.data.summary);
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
  }, [tenant?.id, selectedPeriod, selectedCategory]);

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'decimal':
        return `${value.toFixed(1)} ${unit}`;
      case 'integer':
        return `${Math.round(value)} ${unit}`;
      default:
        return `${value} ${unit}`;
    }
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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const isOnTarget = (value: number, target: number, category: string) => {
    const threshold = 0.1; // 10% tolerance
    
    switch (category) {
      case 'efficiency':
      case 'respiratory':
      case 'quality':
        // Lower is better
        return value <= target * (1 + threshold);
      default:
        // Higher is better
        return value >= target * (1 - threshold);
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Indicadores Clínicos
          </h1>
          <p className="text-gray-600">
            Monitoramento em tempo real dos indicadores de qualidade assistencial
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={fetchDashboard} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowIndicatorForm(true)} variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>
      </div>

      {/* Period and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
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
          <Button 
            variant={selectedPeriod === '1y' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedPeriod('1y')}
          >
            1 ano
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Badge>
          {Object.entries(CATEGORY_COLORS).map(([category, colorClass]) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer capitalize',
                selectedCategory === category && colorClass.replace('bg-', 'bg-') + ' text-white'
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{summary.onTarget}</div>
              <div className="text-sm text-gray-600">Na Meta</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{summary.improving}</div>
              <div className="text-sm text-gray-600">Melhorando</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{summary.deteriorating}</div>
              <div className="text-sm text-gray-600">Piorando</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.performance}%</div>
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

      {/* Indicators Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(dashboardData).map(([type, indicator]) => {
            const IconComponent = CATEGORY_ICONS[indicator.config.category as keyof typeof CATEGORY_ICONS] || Target;
            const colorClass = CATEGORY_COLORS[indicator.config.category as keyof typeof CATEGORY_COLORS];
            
            return (
              <Card key={type} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg text-white', colorClass)}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">
                          {indicator.config.name}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {indicator.config.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(indicator.trend)}
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {indicator.config.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {indicator.latest ? (
                    <div className="space-y-4">
                      {/* Current Value */}
                      <div className="text-center border rounded-lg p-4">
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {formatValue(indicator.latest.value, indicator.config.format, indicator.config.unit)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Último registro: {new Date(indicator.latest.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className={cn(
                          'text-sm font-medium mt-2',
                          isOnTarget(indicator.latest.value, indicator.config.target, indicator.config.category) 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        )}>
                          {isOnTarget(indicator.latest.value, indicator.config.target, indicator.config.category) 
                            ? '✅ Na meta' 
                            : '❌ Fora da meta'
                          }
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm font-medium text-gray-600">Meta</div>
                          <div className="text-lg font-semibold">
                            {formatValue(indicator.config.target, indicator.config.format, indicator.config.unit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">Média</div>
                          <div className="text-lg font-semibold">
                            {formatValue(indicator.average, indicator.config.format, indicator.config.unit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">Tendência</div>
                          <div className={cn('text-lg font-semibold', getTrendColor(indicator.trend))}>
                            {indicator.trend === 'up' ? 'Subindo' : 
                             indicator.trend === 'down' ? 'Descendo' : 'Estável'}
                          </div>
                        </div>
                      </div>

                      {/* Data Points */}
                      <div className="text-center text-sm text-gray-500">
                        {indicator.values.length} registro{indicator.values.length !== 1 ? 's' : ''} no período
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum registro encontrado</p>
                      <p className="text-sm">no período selecionado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && Object.keys(dashboardData).length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum indicador encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece registrando os primeiros indicadores clínicos
            </p>
            <Button onClick={() => setShowIndicatorForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeiro Indicador
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Indicator Form Modal */}
      <IndicatorForm
        open={showIndicatorForm}
        onOpenChange={setShowIndicatorForm}
        onSuccess={fetchDashboard}
      />
    </div>
  );
}