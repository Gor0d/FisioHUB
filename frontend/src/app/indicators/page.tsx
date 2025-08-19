'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IndicatorsForm } from '@/components/forms/indicators-form'
import { BarthelScaleForm } from '@/components/forms/barthel-scale-form'
import { MrcScaleForm } from '@/components/forms/mrc-scale-form'
// import { useToast } from '@/hooks/use-toast'
import type { IndicatorInput, BarthelScaleInput, MrcScaleInput } from '@fisiohub/shared'
import { api } from '@/lib/api'

export default function IndicatorsPage() {
  const { user } = useAuth()
  // const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const showSuccess = (message: string) => {
    alert(`✅ ${message}`)
  }

  const showError = (message: string) => {
    alert(`❌ ${message}`)
  }

  const handleIndicatorsSubmit = async (data: IndicatorInput) => {
    setIsLoading(true)
    try {
      const response = await api.post('/api/indicators', data)
      
      if (response.data.success) {
        const indicator = response.data.data
        showSuccess(`✅ Indicadores salvos com sucesso!\n\n📊 Registro ID: ${indicator.id}\n📅 Data: ${new Date(indicator.date).toLocaleDateString('pt-BR')}\n💾 Dados foram salvos no banco de dados`)
      } else {
        throw new Error(response.data.message || 'Erro ao salvar indicadores')
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Erro ao salvar indicadores. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarthelSubmit = async (data: BarthelScaleInput & { totalScore: number; classification: string }) => {
    setIsLoading(true)
    try {
      const response = await api.post('/api/scales/barthel', data)
      
      if (response.data.success) {
        const scale = response.data.data
        const patientName = scale.patient?.name || 'Paciente'
        const scoreText = `${scale.totalScore}/100 pontos (${scale.classification})`
        const typeText = scale.type === 'ENTRADA' ? 'Entrada' : 'Saída'
        
        showSuccess(`✅ Escala de Barthel salva com sucesso!\n\n👤 Paciente: ${patientName}\n🎯 Tipo: ${typeText}\n📊 Pontuação: ${scoreText}\n📅 Data: ${new Date(scale.evaluationDate).toLocaleDateString('pt-BR')}\n💾 Avaliação salva no banco de dados`)
      } else {
        throw new Error(response.data.message || 'Erro ao salvar Escala de Barthel')
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Erro ao salvar Escala de Barthel. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMrcSubmit = async (data: MrcScaleInput & { totalScore: number; averageScore: number; classification: string }) => {
    setIsLoading(true)
    try {
      const response = await api.post('/api/scales/mrc', data)
      
      if (response.data.success) {
        const scale = response.data.data
        const patientName = scale.patient?.name || 'Paciente'
        const scoreText = `${scale.averageScore.toFixed(1)}/5.0 média (${scale.classification})`
        const typeText = scale.type === 'ENTRADA' ? 'Entrada' : 'Saída'
        
        showSuccess(`✅ Escala MRC salva com sucesso!\n\n👤 Paciente: ${patientName}\n🎯 Tipo: ${typeText}\n📊 Pontuação: ${scoreText}\n📅 Data: ${new Date(scale.evaluationDate).toLocaleDateString('pt-BR')}\n💾 Avaliação salva no banco de dados`)
      } else {
        throw new Error(response.data.message || 'Erro ao salvar Escala MRC')
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Erro ao salvar Escala MRC. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Indicadores Clínicos</h1>
        <p className="text-gray-600 mt-2">
          Sistema de registro de indicadores quantitativos para substituir planilhas manuais
        </p>
      </div>

      {/* Cards de visão geral */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicadores Gerais</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600">registros hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalas de Barthel</CardTitle>
            <span className="text-2xl">🏥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✅</div>
            <p className="text-xs text-gray-600">Funcional com pacientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalas MRC</CardTitle>
            <span className="text-2xl">💪</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✅</div>
            <p className="text-xs text-gray-600">Funcional com pacientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulários */}
      <Tabs defaultValue="indicadores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="indicadores">Indicadores Gerais</TabsTrigger>
          <TabsTrigger value="barthel">Escala de Barthel</TabsTrigger>
          <TabsTrigger value="mrc">Escala MRC</TabsTrigger>
        </TabsList>

        <TabsContent value="indicadores" className="mt-6">
          <div className="flex justify-center">
            <IndicatorsForm onSubmit={handleIndicatorsSubmit} />
          </div>
        </TabsContent>

        <TabsContent value="barthel" className="mt-6">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>Novo:</strong> Agora você pode selecionar pacientes reais e indicar se é entrada ou saída para calcular melhorias!
                </p>
              </div>
              <BarthelScaleForm
                onSubmit={handleBarthelSubmit}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mrc" className="mt-6">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>Novo:</strong> Agora você pode selecionar pacientes reais e indicar se é entrada ou saída para calcular melhorias!
                </p>
              </div>
              <MrcScaleForm
                onSubmit={handleMrcSubmit}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Informações sobre as escalas */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📚 Sobre a Escala de Barthel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              A Escala de Barthel avalia a independência funcional em atividades de vida diária (AVD).
            </p>
            <div className="space-y-2 text-sm">
              <div><strong>0-20 pontos:</strong> Dependência total</div>
              <div><strong>21-40 pontos:</strong> Dependência severa</div>
              <div><strong>41-60 pontos:</strong> Dependência moderada</div>
              <div><strong>61-89 pontos:</strong> Dependência leve</div>
              <div><strong>90-100 pontos:</strong> Independente</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💪 Sobre a Escala MRC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              A Escala MRC (Medical Research Council) avalia a força muscular de 0 a 5.
            </p>
            <div className="space-y-2 text-sm">
              <div><strong>0:</strong> Nenhuma contração visível</div>
              <div><strong>1:</strong> Contração visível, sem movimento</div>
              <div><strong>2:</strong> Movimento sem gravidade</div>
              <div><strong>3:</strong> Movimento contra gravidade</div>
              <div><strong>4:</strong> Movimento contra resistência moderada</div>
              <div><strong>5:</strong> Força normal</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}