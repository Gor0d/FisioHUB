'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NavigationHeader } from '@/components/ui/navigation-header'
import { api } from '@/lib/api'
// import { Patient } from '@fisiohub/shared'
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react'
import { Patient } from '@/types'

interface DashboardData {
  summary: {
    totalPatients: number
    totalBarthelImprovements: number
    totalMrcImprovements: number
    totalImprovements: number
  }
  patientBreakdown: Array<{
    patient: Patient
    barthel: number
    mrc: number
  }>
  period: {
    startDate: string
    endDate: string
  }
}

interface PatientImprovements {
  patient: Patient
  barthel: {
    improvements: Array<{
      entryId: string
      exitId: string
      entryDate: string
      exitDate: string
      entryScore: number
      exitScore: number
      scoreDifference: number
      improvement: boolean
      entryClassification: string
      exitClassification: string
    }>
    totalComparisons: number
    totalImprovements: number
  }
  mrc: {
    improvements: Array<{
      entryId: string
      exitId: string
      entryDate: string
      exitDate: string
      entryScore: number
      exitScore: number
      scoreDifference: number
      improvement: boolean
      entryClassification: string
      exitClassification: string
    }>
    totalComparisons: number
    totalImprovements: number
  }
  summary: {
    totalComparisons: number
    totalImprovements: number
  }
}

export default function MelhoriasPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [selectedPatientData, setSelectedPatientData] = useState<PatientImprovements | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get('/api/scales/improvements/dashboard', { params })
      
      if (response.data.success) {
        setDashboardData(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      alert('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientData = async (patientId: string) => {
    if (!patientId) return

    setLoading(true)
    try {
      const params: any = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await api.get(`/api/scales/improvements/patient/${patientId}`, { params })
      
      if (response.data.success) {
        setSelectedPatientData(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error)
      alert('Erro ao carregar dados do paciente')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients')
      if (response.data.success) {
        setPatients(response.data.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    fetchPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient)
    }
  }, [selectedPatient])

  const handleDateFilter = () => {
    fetchDashboardData()
    if (selectedPatient) {
      fetchPatientData(selectedPatient)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getImprovementIcon = (improvement: boolean) => {
    return improvement ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader title="Relatório de Melhorias" />
      <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatório de Melhorias</h1>
        <p className="text-gray-600">Análise de melhorias dos pacientes baseada nas escalas de avaliação</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleDateFilter} disabled={loading}>
                {loading ? 'Carregando...' : 'Aplicar Filtros'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes com Melhorias</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.summary.totalPatients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Melhorias Barthel</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.summary.totalBarthelImprovements}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Melhorias MRC</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.summary.totalMrcImprovements}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Melhorias</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.summary.totalImprovements}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="paciente">Análise por Paciente</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          {dashboardData && (
            <Card>
              <CardHeader>
                <CardTitle>Pacientes com Melhorias</CardTitle>
                <CardDescription>
                  Resumo de melhorias por paciente no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.patientBreakdown.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold mb-2">Nenhuma melhoria encontrada</h3>
                    <p className="mb-2">Para calcular melhorias, você precisa:</p>
                    <div className="text-sm space-y-1">
                      <p>• Cadastrar pacientes</p>
                      <p>• Fazer avaliação de <strong>ENTRADA</strong> (Barthel ou MRC)</p>
                      <p>• Fazer avaliação de <strong>SAÍDA</strong> para o mesmo paciente</p>
                      <p>• O sistema calculará automaticamente se houve melhoria</p>
                    </div>
                    <div className="mt-4 text-blue-600">
                      <p>💡 Vá para a página de Indicadores para criar avaliações</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.patientBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.patient.name}</h4>
                          {item.patient.cpf && (
                            <p className="text-sm text-gray-600">CPF: {item.patient.cpf}</p>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold">{item.barthel}</div>
                            <div className="text-gray-600">Barthel</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{item.mrc}</div>
                            <div className="text-gray-600">MRC</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{item.barthel + item.mrc}</div>
                            <div className="text-gray-600">Total</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="paciente" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} {patient.cpf ? `- ${patient.cpf}` : ''}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {selectedPatientData && (
            <Card>
              <CardHeader>
                <CardTitle>Melhorias de {selectedPatientData.patient.name}</CardTitle>
                <CardDescription>
                  Análise detalhada das melhorias do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumo do Paciente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedPatientData.summary.totalComparisons}
                    </div>
                    <div className="text-sm text-gray-600">Total de Comparações</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedPatientData.summary.totalImprovements}
                    </div>
                    <div className="text-sm text-gray-600">Melhorias Alcançadas</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {selectedPatientData.summary.totalComparisons > 0 
                        ? Math.round((selectedPatientData.summary.totalImprovements / selectedPatientData.summary.totalComparisons) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Taxa de Melhoria</div>
                  </div>
                </div>

                {/* Escalas Barthel */}
                {selectedPatientData.barthel.improvements.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Escala de Barthel (Atividades de Vida Diária)</h4>
                    <div className="space-y-3">
                      {selectedPatientData.barthel.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              {getImprovementIcon(improvement.improvement)}
                              <span className="font-medium">
                                {formatDate(improvement.entryDate)} → {formatDate(improvement.exitDate)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {improvement.entryClassification} → {improvement.exitClassification}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {improvement.entryScore} → {improvement.exitScore}
                            </div>
                            <div className={`text-sm ${improvement.improvement ? 'text-green-600' : 'text-red-600'}`}>
                              {improvement.improvement ? '+' : ''}{improvement.scoreDifference} pontos
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Escalas MRC */}
                {selectedPatientData.mrc.improvements.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Escala MRC (Força Muscular)</h4>
                    <div className="space-y-3">
                      {selectedPatientData.mrc.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              {getImprovementIcon(improvement.improvement)}
                              <span className="font-medium">
                                {formatDate(improvement.entryDate)} → {formatDate(improvement.exitDate)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {improvement.entryClassification} → {improvement.exitClassification}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {improvement.entryScore.toFixed(1)} → {improvement.exitScore.toFixed(1)}
                            </div>
                            <div className={`text-sm ${improvement.improvement ? 'text-green-600' : 'text-red-600'}`}>
                              {improvement.improvement ? '+' : ''}{improvement.scoreDifference.toFixed(1)} pontos
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPatientData.barthel.improvements.length === 0 && selectedPatientData.mrc.improvements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">Nenhuma comparação disponível</h3>
                    <p className="mb-2">Para este paciente, você precisa de:</p>
                    <div className="text-sm space-y-1">
                      <p>• <strong>1 avaliação de ENTRADA</strong> (primeira avaliação do tratamento)</p>
                      <p>• <strong>1 avaliação de SAÍDA</strong> (avaliação final do tratamento)</p>
                      <p>• As avaliações podem ser Barthel, MRC ou ambas</p>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                      <p>💡 <strong>Como fazer:</strong></p>
                      <p>1. Vá para a página de Indicadores</p>
                      <p>2. Selecione este paciente</p>
                      <p>3. Escolha "Entrada do Paciente" e faça a primeira avaliação</p>
                      <p>4. Depois, faça uma nova avaliação escolhendo "Saída do Paciente"</p>
                      <p>5. O sistema calculará automaticamente a melhoria!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}