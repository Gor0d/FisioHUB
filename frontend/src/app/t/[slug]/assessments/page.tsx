'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  Activity,
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Calendar,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AssessmentForm from '@/components/assessments/assessment-form';
import AssessmentHistory from '@/components/assessments/assessment-history';

interface AssessmentStats {
  period: string;
  totalAssessments: number;
  byType: {
    mrc: number;
    barthel: number;
  };
  averageScores: {
    mrc?: { totalScore: number; percentage: number };
    barthel?: { totalScore: number; percentage: number };
  };
}

interface Patient {
  id: string;
  name: string;
  medicalRecord: string;
  bedNumber: string;
}

export default function AssessmentsPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadData = async () => {
    if (!tenant?.publicId) return;

    try {
      setLoading(true);

      // Load stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/assessments/stats/${tenant.publicId}?period=${selectedPeriod}`
      );
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // Load active patients
      const patientsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/patients?status=active&limit=50`
      );
      
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        if (patientsData.success) {
          setPatients(patientsData.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            medicalRecord: p.attendanceNumber || p.id,
            bedNumber: p.bedNumber || 'N/A'
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant?.publicId, selectedPeriod]);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    setShowHistory(true);
  };

  if (tenantLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando avaliações...</p>
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
            📝 Escalas MRC & Barthel
          </h1>
          <p className="text-gray-600">
            Avaliações de força muscular e independência funcional
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={loadData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowAssessmentForm(true)} variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Period Selector */}
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
        <Button 
          variant={selectedPeriod === '1y' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedPeriod('1y')}
        >
          1 ano
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Avaliações</p>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalAssessments}
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escala MRC</p>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.byType.mrc}
                  </div>
                  {stats.averageScores.mrc && (
                    <p className="text-xs text-gray-500">
                      Média: {stats.averageScores.mrc.totalScore} pts ({stats.averageScores.mrc.percentage}%)
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Scale className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Índice Barthel</p>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.byType.barthel}
                  </div>
                  {stats.averageScores.barthel && (
                    <p className="text-xs text-gray-500">
                      Média: {stats.averageScores.barthel.totalScore} pts ({stats.averageScores.barthel.percentage}%)
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
                  <div className="text-2xl font-bold text-purple-600">
                    {patients.length}
                  </div>
                  <p className="text-xs text-gray-500">
                    Disponíveis para avaliação
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scale Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Escala MRC</CardTitle>
                <CardDescription>Medical Research Council - Força Muscular</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Pontuação:</span>
                <span>0-60 pontos</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Músculos avaliados:</span>
                <span>12 grupos musculares</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Classificação:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">0</Badge>
                    <span>Nenhuma contração</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">1</Badge>
                    <span>Contração visível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">2</Badge>
                    <span>Sem gravidade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">3</Badge>
                    <span>Contra gravidade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">4</Badge>
                    <span>Resistência moderada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">5</Badge>
                    <span>Força normal</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Índice de Barthel</CardTitle>
                <CardDescription>Independência Funcional - Atividades de Vida Diária</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Pontuação:</span>
                <span>0-100 pontos</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Atividades:</span>
                <span>10 atividades básicas</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Interpretação:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>0-20 pts</span>
                    <Badge variant="destructive">Dependência total</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>21-60 pts</span>
                    <Badge variant="secondary">Dependência severa</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>61-90 pts</span>
                    <Badge variant="outline">Dependência moderada</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>91-99 pts</span>
                    <Badge className="bg-yellow-500">Dependência leve</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>100 pts</span>
                    <Badge className="bg-green-600">Independente</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pacientes para Avaliação</CardTitle>
              <CardDescription>
                Clique em um paciente para ver o histórico de avaliações
              </CardDescription>
            </div>
            <Badge variant="outline">{patients.length} pacientes ativos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum paciente ativo</h3>
              <p className="text-sm">
                Cadastre pacientes para começar a fazer avaliações
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {patient.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {patient.bedNumber}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {patient.medicalRecord}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePatientSelect(patient.id)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Histórico
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient.id);
                          setShowAssessmentForm(true);
                        }}
                        className="flex-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Avaliar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Form Modal */}
      <AssessmentForm
        open={showAssessmentForm}
        onOpenChange={setShowAssessmentForm}
        selectedPatientId={selectedPatient}
        onSuccess={loadData}
      />

      {/* Assessment History Modal */}
      {showHistory && selectedPatient && (
        <AssessmentHistory
          open={showHistory}
          onOpenChange={setShowHistory}
          patientId={selectedPatient}
          tenantId={tenant.publicId}
        />
      )}
    </div>
  );
}