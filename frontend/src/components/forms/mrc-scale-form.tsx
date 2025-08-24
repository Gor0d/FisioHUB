'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
// import { type MrcScaleInput, type Patient } from '@fisiohub/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'

interface MrcScaleFormProps {
  patientId?: string
  evolutionId?: string
  onSubmit: (data: MrcScaleInput & { totalScore: number; averageScore: number; classification: string }) => Promise<void>
  initialData?: Partial<MrcScaleInput>
}

// Escala MRC (0-5 pontos para cada grupo muscular)
const mrcOptions = [
  { value: 0, label: '0 - Nenhuma contração visível', description: 'Paralisia completa' },
  { value: 1, label: '1 - Contração visível, sem movimento', description: 'Contração muscular palpável ou visível' },
  { value: 2, label: '2 - Movimento ativo com eliminação da gravidade', description: 'Movimento ativo em plano perpendicular à gravidade' },
  { value: 3, label: '3 - Movimento ativo contra gravidade', description: 'Movimento ativo contra a gravidade' },
  { value: 4, label: '4 - Movimento ativo contra resistência moderada', description: 'Movimento ativo contra gravidade e resistência moderada' },
  { value: 5, label: '5 - Força normal', description: 'Força muscular normal' }
]

const muscleGroups = {
  shoulderAbduction: 'Abdução do Ombro',
  elbowFlexion: 'Flexão do Cotovelo',
  wristExtension: 'Extensão do Punho',
  hipFlexion: 'Flexão do Quadril',
  kneeExtension: 'Extensão do Joelho',
  ankleFlexion: 'Flexão do Tornozelo',
  neckFlexion: 'Flexão do Pescoço',
  trunkFlexion: 'Flexão do Tronco',
  shoulderAdduction: 'Adução do Ombro',
  elbowExtension: 'Extensão do Cotovelo'
}

export function MrcScaleForm({ patientId, evolutionId, onSubmit, initialData }: MrcScaleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState(patientId || '')
  const [evaluationType, setEvaluationType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA')
  const [scores, setScores] = useState<Record<string, number>>({
    shoulderAbduction: 0,
    elbowFlexion: 0,
    wristExtension: 0,
    hipFlexion: 0,
    kneeExtension: 0,
    ankleFlexion: 0,
    neckFlexion: 0,
    trunkFlexion: 0,
    shoulderAdduction: 0,
    elbowExtension: 0,
    ...initialData
  })

  const { handleSubmit, formState: { errors } } = useForm({
    mode: 'onSubmit'
  })

  // Carregar pacientes
  useEffect(() => {
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
    
    fetchPatients()
  }, [])

  // Dados atualizados automaticamente via state

  // Calcular pontuação total e média
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const averageScore = totalScore / Object.keys(muscleGroups).length

  // Classificação baseada na média
  const getClassification = (average: number): string => {
    if (average >= 4.5) return 'Força Normal/Excelente'
    if (average >= 4.0) return 'Boa Força Muscular'
    if (average >= 3.0) return 'Força Moderada'
    if (average >= 2.0) return 'Força Fraca'
    if (average >= 1.0) return 'Força Muito Fraca'
    return 'Paralisia/Força Ausente'
  }

  const classification = getClassification(averageScore)

  const handleScoreChange = (muscle: string, value: number | string) => {
    const numericValue = Number(value)
    setScores(prev => ({ ...prev, [muscle]: numericValue }))
  }

  const onFormSubmit = async () => {
    setIsLoading(true)
    try {
      // Converter todos os valores numéricos para garantir que sejam números
      const numericData = {
        patientId: selectedPatient,
        type: evaluationType,
        evaluationDate: new Date().toISOString(),
        shoulderAbduction: Number(scores.shoulderAbduction || 0),
        elbowFlexion: Number(scores.elbowFlexion || 0),
        wristExtension: Number(scores.wristExtension || 0),
        hipFlexion: Number(scores.hipFlexion || 0),
        kneeExtension: Number(scores.kneeExtension || 0),
        ankleFlexion: Number(scores.ankleFlexion || 0),
        neckFlexion: Number(scores.neckFlexion || 0),
        trunkFlexion: Number(scores.trunkFlexion || 0),
        shoulderAdduction: Number(scores.shoulderAdduction || 0),
        elbowExtension: Number(scores.elbowExtension || 0),
        totalScore,
        averageScore: Math.round(averageScore * 10) / 10,
        classification
      }
      
      await onSubmit(numericData)
      
      // Resetar formulário após sucesso
      setScores({
        shoulderAbduction: 0,
        elbowFlexion: 0,
        wristExtension: 0,
        hipFlexion: 0,
        kneeExtension: 0,
        ankleFlexion: 0,
        neckFlexion: 0,
        trunkFlexion: 0,
        shoulderAdduction: 0,
        elbowExtension: 0
      })
      setSelectedPatient('')
      setEvaluationType('ENTRADA')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💪 Escala MRC (Medical Research Council)
          <span className="text-lg font-semibold ml-auto">
            {averageScore.toFixed(1)}/5.0
          </span>
        </CardTitle>
        <CardDescription>
          Avaliação da Força Muscular - {classification}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onFormSubmit(); }} className="space-y-6">
          {/* Seleção de Paciente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select
                value={selectedPatient}
                onValueChange={(value) => setSelectedPatient(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente">
                    {selectedPatient ? 
                      patients.find(p => p.id === selectedPatient)?.name + 
                      (patients.find(p => p.id === selectedPatient)?.cpf ? ` - ${patients.find(p => p.id === selectedPatient)?.cpf}` : '')
                      : "Selecione um paciente"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} {patient.cpf ? `- ${patient.cpf}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Avaliação *</Label>
              <Select
                value={evaluationType}
                onValueChange={(value) => setEvaluationType(value as 'ENTRADA' | 'SAIDA')}
              >
                <SelectTrigger>
                  <SelectValue>
                    {evaluationType === 'ENTRADA' ? '🔵 Entrada do Paciente' : '🟢 Saída do Paciente'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">🔵 Entrada do Paciente</SelectItem>
                  <SelectItem value="SAIDA">🟢 Saída do Paciente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                {evaluationType === 'ENTRADA' ? 
                  'Primeira avaliação do paciente no início do tratamento' : 
                  'Avaliação final para comparar a melhoria do paciente'
                }
              </p>
            </div>
          </div>
          {Object.entries(muscleGroups).map(([muscle, label]) => (
            <div key={muscle} className="space-y-3">
              <Label className="text-base font-medium">{label}</Label>
              <div className="grid gap-2">
                {mrcOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name={muscle}
                      value={option.value}
                      checked={scores[muscle] === option.value}
                      onChange={() => handleScoreChange(muscle, option.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{option.label}</span>
                          <span className="font-bold text-blue-600 text-sm">
                            {option.value}/5
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 mt-1">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors[muscle as keyof MrcScaleInput] && (
                <p className="text-red-500 text-sm">
                  {errors[muscle as keyof MrcScaleInput]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-2">
                Resultado da Avaliação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalScore}/50
                  </div>
                  <div className="text-sm text-gray-600">Pontuação Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {averageScore.toFixed(1)}/5.0
                  </div>
                  <div className="text-sm text-gray-600">Média</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-700">
                    {classification}
                  </div>
                  <div className="text-sm text-gray-600">Classificação</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mt-2">
                {averageScore >= 4.5 ? '✅ Força muscular excelente' :
                 averageScore >= 4.0 ? '👍 Boa força muscular' :
                 averageScore >= 3.0 ? '⚠️ Força moderada - exercícios recomendados' :
                 averageScore >= 2.0 ? '🔄 Força fraca - reabilitação necessária' :
                 averageScore >= 1.0 ? '🆘 Força muito fraca - cuidados especiais' :
                 '🏥 Paralisia - intervenção imediata necessária'}
              </div>
            </div>

            {/* Gráfico visual da força */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">
                Distribuição da Força Muscular
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                {Object.entries(muscleGroups).map(([muscle, label]) => (
                  <div key={muscle} className="text-center">
                    <div className="h-2 bg-gray-200 rounded mb-1">
                      <div
                        className="h-full bg-blue-500 rounded transition-all duration-300"
                        style={{ width: `${(scores[muscle] / 5) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">{scores[muscle]}/5</div>
                    <div className="text-xs text-gray-500 truncate">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !selectedPatient}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : `Salvar Avaliação de ${evaluationType}`}
            </Button>
            {!selectedPatient && (
              <p className="text-red-500 text-sm text-center">
                Selecione um paciente para continuar
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}