'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// import { barthelScaleSchema, type BarthelScaleInput, type Patient } from '@fisiohub/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'

interface BarthelScaleFormProps {
  patientId?: string
  evolutionId?: string
  onSubmit: (data: BarthelScaleInput & { totalScore: number; classification: string }) => Promise<void>
  initialData?: Partial<BarthelScaleInput>
}

// Opções para cada atividade da Escala de Barthel
const activityOptions = {
  feeding: [
    { value: 0, label: 'Incapaz' },
    { value: 5, label: 'Precisa de ajuda para cortar, passar manteiga, etc.' },
    { value: 10, label: 'Independente' }
  ],
  bathing: [
    { value: 0, label: 'Dependente' },
    { value: 5, label: 'Independente (banho de chuveiro/banheira)' }
  ],
  grooming: [
    { value: 0, label: 'Precisa de ajuda com cuidado pessoal' },
    { value: 5, label: 'Independente para barbear-se, dentes, rosto, cabelo' }
  ],
  dressing: [
    { value: 0, label: 'Dependente' },
    { value: 5, label: 'Precisa de ajuda mas consegue fazer cerca de metade sem ajuda' },
    { value: 10, label: 'Independente (incluindo botões, ziper, laços)' }
  ],
  bowelControl: [
    { value: 0, label: 'Incontinente (ou precisa de enemas)' },
    { value: 5, label: 'Acidente ocasional' },
    { value: 10, label: 'Continente' }
  ],
  bladderControl: [
    { value: 0, label: 'Incontinente ou cateterizado e incapaz de se cuidar' },
    { value: 5, label: 'Acidente ocasional' },
    { value: 10, label: 'Continente' }
  ],
  toileting: [
    { value: 0, label: 'Dependente' },
    { value: 5, label: 'Precisa de alguma ajuda, mas consegue algo sozinho' },
    { value: 10, label: 'Independente (sentar, levantar, limpar-se)' }
  ],
  transfer: [
    { value: 0, label: 'Incapaz, não tem equilíbrio ao sentar' },
    { value: 5, label: 'Grande ajuda (uma ou duas pessoas), consegue sentar' },
    { value: 10, label: 'Pequena ajuda (verbal ou física)' },
    { value: 15, label: 'Independente' }
  ],
  mobility: [
    { value: 0, label: 'Imóvel ou < 50 metros' },
    { value: 5, label: 'Cadeira de rodas independente, incluindo cantos, > 50 metros' },
    { value: 10, label: 'Anda com ajuda de uma pessoa (verbal ou física) > 50 metros' },
    { value: 15, label: 'Independente (mas pode usar qualquer auxílio) > 50 metros' }
  ],
  stairs: [
    { value: 0, label: 'Incapaz' },
    { value: 5, label: 'Precisa de ajuda (verbal, física, transporte do auxílio)' },
    { value: 10, label: 'Independente' }
  ]
}

const activityLabels = {
  feeding: 'Alimentação',
  bathing: 'Banho',
  grooming: 'Cuidados Pessoais',
  dressing: 'Vestuário',
  bowelControl: 'Controle Intestinal',
  bladderControl: 'Controle Vesical',
  toileting: 'Uso do Banheiro',
  transfer: 'Transferência (cama/cadeira)',
  mobility: 'Mobilidade',
  stairs: 'Subir Escadas'
}

export function BarthelScaleForm({ patientId, evolutionId, onSubmit, initialData }: BarthelScaleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState(patientId || '')
  const [evaluationType, setEvaluationType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA')
  const [scores, setScores] = useState<Record<string, number>>({
    feeding: 0,
    bathing: 0,
    grooming: 0,
    dressing: 0,
    bowelControl: 0,
    bladderControl: 0,
    toileting: 0,
    transfer: 0,
    mobility: 0,
    stairs: 0,
    ...initialData
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BarthelScaleInput>({
    mode: 'onSubmit', // Só valida na submissão, não em tempo real
    defaultValues: {
      patientId: patientId || '',
      evolutionId,
      type: 'ENTRADA',
      feeding: 0,
      bathing: 0,
      grooming: 0,
      dressing: 0,
      bowelControl: 0,
      bladderControl: 0,
      toileting: 0,
      transfer: 0,
      mobility: 0,
      stairs: 0,
      ...initialData
    }
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

  // Atualizar formulário quando paciente ou tipo mudarem
  useEffect(() => {
    setValue('patientId', selectedPatient)
    setValue('type', evaluationType)
  }, [selectedPatient, evaluationType, setValue])

  // Calcular pontuação total
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)

  // Classificação baseada na pontuação total
  const getClassification = (total: number): string => {
    if (total >= 90) return 'Independente'
    if (total >= 60) return 'Dependência leve'
    if (total >= 40) return 'Dependência moderada'
    if (total >= 20) return 'Dependência severa'
    return 'Dependência total'
  }

  const classification = getClassification(totalScore)

  const handleScoreChange = (activity: string, value: number | string) => {
    const numericValue = Number(value)
    setScores(prev => ({ ...prev, [activity]: numericValue }))
    setValue(activity as keyof BarthelScaleInput, numericValue, { shouldValidate: true })
  }

  const onFormSubmit = async (data: BarthelScaleInput) => {
    setIsLoading(true)
    try {
      // Converter todos os valores numéricos para garantir que sejam números
      const numericData = {
        ...data,
        patientId: selectedPatient, // Garantir que o patientId selecionado seja incluído
        type: evaluationType, // Garantir que o tipo seja incluído
        evaluationDate: new Date().toISOString(), // Adicionar data de avaliação
        feeding: Number(scores.feeding || 0),
        bathing: Number(scores.bathing || 0),
        grooming: Number(scores.grooming || 0),
        dressing: Number(scores.dressing || 0),
        bowelControl: Number(scores.bowelControl || 0),
        bladderControl: Number(scores.bladderControl || 0),
        toileting: Number(scores.toileting || 0),
        transfer: Number(scores.transfer || 0),
        mobility: Number(scores.mobility || 0),
        stairs: Number(scores.stairs || 0),
        totalScore,
        classification
      }
      
      await onSubmit(numericData)
      
      // Resetar formulário após sucesso
      setScores({
        feeding: 0,
        bathing: 0,
        grooming: 0,
        dressing: 0,
        bowelControl: 0,
        bladderControl: 0,
        toileting: 0,
        transfer: 0,
        mobility: 0,
        stairs: 0
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
          📊 Escala de Barthel
          <span className="text-lg font-semibold ml-auto">
            {totalScore}/100 pontos
          </span>
        </CardTitle>
        <CardDescription>
          Avaliação das Atividades de Vida Diária (AVD) - {classification}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
          {Object.entries(activityLabels).map(([activity, label]) => (
            <div key={activity} className="space-y-3">
              <Label className="text-base font-medium">{label}</Label>
              <div className="grid gap-2">
                {activityOptions[activity as keyof typeof activityOptions].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      {...register(activity as keyof BarthelScaleInput)}
                      value={option.value}
                      checked={scores[activity] === option.value}
                      onChange={() => handleScoreChange(activity, option.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{option.label}</span>
                        <span className="font-semibold text-blue-600">
                          {option.value} pts
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors[activity as keyof BarthelScaleInput] && (
                <p className="text-red-500 text-sm">
                  {errors[activity as keyof BarthelScaleInput]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-2">
                Resultado da Avaliação
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalScore}/100
              </div>
              <div className="text-lg font-semibold text-blue-700">
                {classification}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {totalScore >= 90 ? '✅ Paciente independente para AVDs' :
                 totalScore >= 60 ? '⚠️ Supervisão mínima necessária' :
                 totalScore >= 40 ? '🔄 Assistência moderada necessária' :
                 totalScore >= 20 ? '🆘 Assistência significativa necessária' :
                 '🏥 Cuidados intensivos necessários'}
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