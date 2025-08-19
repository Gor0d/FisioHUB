'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { indicatorSchema, type IndicatorInput } from '@fisiohub/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface IndicatorsFormProps {
  patientId?: string
  onSubmit: (data: IndicatorInput) => Promise<void>
  initialData?: Partial<IndicatorInput>
}

const shiftOptions = ['Manhã', 'Tarde', 'Noite', 'Integral']
const sectorOptions = ['UTI', 'Enfermaria', 'Pronto Socorro', 'Ambulatório', 'Domiciliar']

export function IndicatorsForm({ patientId, onSubmit, initialData }: IndicatorsFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<IndicatorInput>({
    resolver: zodResolver(indicatorSchema),
    defaultValues: {
      patientId,
      ...initialData
    }
  })

  const onFormSubmit = async (data: IndicatorInput) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Indicadores Clínicos
        </CardTitle>
        <CardDescription>
          Registro de indicadores quantitativos para geração de relatórios automatizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collaborator">Colaborador</Label>
              <Input
                id="collaborator"
                {...register('collaborator')}
                placeholder="Nome do fisioterapeuta"
              />
              {errors.collaborator && <p className="text-red-500 text-sm">{errors.collaborator.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Select onValueChange={(value) => setValue('sector', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectorOptions.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sector && <p className="text-red-500 text-sm">{errors.sector.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Turno</Label>
              <Select onValueChange={(value) => setValue('shift', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar turno" />
                </SelectTrigger>
                <SelectContent>
                  {shiftOptions.map(shift => (
                    <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.shift && <p className="text-red-500 text-sm">{errors.shift.message}</p>}
            </div>
          </div>

          <Tabs defaultValue="internacao" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="internacao">Internação</TabsTrigger>
              <TabsTrigger value="respiratorio">Respiratório</TabsTrigger>
              <TabsTrigger value="motor">Motor</TabsTrigger>
              <TabsTrigger value="mobilizacao">Mobilização</TabsTrigger>
            </TabsList>

            {/* Indicadores de Internação */}
            <TabsContent value="internacao" className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Indicadores de Internação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientsHospitalized">Pacientes Internados</Label>
                  <Input
                    id="patientsHospitalized"
                    type="number"
                    min="0"
                    {...register('patientsHospitalized', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.patientsHospitalized && <p className="text-red-500 text-sm">{errors.patientsHospitalized.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientsPrescribed">Pacientes com Prescrição</Label>
                  <Input
                    id="patientsPrescribed"
                    type="number"
                    min="0"
                    {...register('patientsPrescribed', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.patientsPrescribed && <p className="text-red-500 text-sm">{errors.patientsPrescribed.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientsCaptured">Pacientes Captados</Label>
                  <Input
                    id="patientsCaptured"
                    type="number"
                    min="0"
                    {...register('patientsCaptured', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.patientsCaptured && <p className="text-red-500 text-sm">{errors.patientsCaptured.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discharges">Altas</Label>
                  <Input
                    id="discharges"
                    type="number"
                    min="0"
                    {...register('discharges', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.discharges && <p className="text-red-500 text-sm">{errors.discharges.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intubations">Intubações</Label>
                  <Input
                    id="intubations"
                    type="number"
                    min="0"
                    {...register('intubations', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.intubations && <p className="text-red-500 text-sm">{errors.intubations.message}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Indicadores Respiratórios */}
            <TabsContent value="respiratorio" className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Indicadores Respiratórios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="respiratoryTherapyCount">Fisioterapia Respiratória (Qtd)</Label>
                  <Input
                    id="respiratoryTherapyCount"
                    type="number"
                    min="0"
                    {...register('respiratoryTherapyCount', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.respiratoryTherapyCount && <p className="text-red-500 text-sm">{errors.respiratoryTherapyCount.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extubationEffectivenessRate">Taxa de Efetividade da Extubação (%)</Label>
                  <Input
                    id="extubationEffectivenessRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register('extubationEffectivenessRate', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.extubationEffectivenessRate && <p className="text-red-500 text-sm">{errors.extubationEffectivenessRate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="respiratoryTherapyRate">Taxa de Fisioterapia Respiratória (%)</Label>
                  <Input
                    id="respiratoryTherapyRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register('respiratoryTherapyRate', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.respiratoryTherapyRate && <p className="text-red-500 text-sm">{errors.respiratoryTherapyRate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deaths">Óbitos</Label>
                  <Input
                    id="deaths"
                    type="number"
                    min="0"
                    {...register('deaths', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.deaths && <p className="text-red-500 text-sm">{errors.deaths.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcr">PCR</Label>
                  <Input
                    id="pcr"
                    type="number"
                    min="0"
                    {...register('pcr', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.pcr && <p className="text-red-500 text-sm">{errors.pcr.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracheostomy">Traqueostomia</Label>
                  <Input
                    id="tracheostomy"
                    type="number"
                    min="0"
                    {...register('tracheostomy', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.tracheostomy && <p className="text-red-500 text-sm">{errors.tracheostomy.message}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Indicadores Motores */}
            <TabsContent value="motor" className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Indicadores Motores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motorTherapyRate">Taxa de Fisioterapia Motora (%)</Label>
                  <Input
                    id="motorTherapyRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register('motorTherapyRate', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.motorTherapyRate && <p className="text-red-500 text-sm">{errors.motorTherapyRate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artificialAirwayPatients">Pacientes com Via Aérea Artificial</Label>
                  <Input
                    id="artificialAirwayPatients"
                    type="number"
                    min="0"
                    {...register('artificialAirwayPatients', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.artificialAirwayPatients && <p className="text-red-500 text-sm">{errors.artificialAirwayPatients.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aspirationRate">Taxa de Aspiração (%)</Label>
                  <Input
                    id="aspirationRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register('aspirationRate', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.aspirationRate && <p className="text-red-500 text-sm">{errors.aspirationRate.message}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Indicadores de Mobilização */}
            <TabsContent value="mobilizacao" className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Indicadores de Mobilização</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sedestationExpected">Sedestação Esperada</Label>
                  <Input
                    id="sedestationExpected"
                    type="number"
                    min="0"
                    {...register('sedestationExpected', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.sedestationExpected && <p className="text-red-500 text-sm">{errors.sedestationExpected.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sedestationRate">Taxa de Sedestação (%)</Label>
                  <Input
                    id="sedestationRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register('sedestationRate', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.sedestationRate && <p className="text-red-500 text-sm">{errors.sedestationRate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orthostatismExpected">Ortostatismo Esperado</Label>
                  <Input
                    id="orthostatismExpected"
                    type="number"
                    min="0"
                    {...register('orthostatismExpected', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.orthostatismExpected && <p className="text-red-500 text-sm">{errors.orthostatismExpected.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orthostatismRate">Taxa de Ortostatismo (%)</Label>
                  <Input
                    id="orthostatismRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register('orthostatismRate', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.orthostatismRate && <p className="text-red-500 text-sm">{errors.orthostatismRate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ambulationRate">Taxa de Deambulação (%)</Label>
                  <Input
                    id="ambulationRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register('ambulationRate', { valueAsNumber: true })}
                    placeholder="0.0"
                  />
                  {errors.ambulationRate && <p className="text-red-500 text-sm">{errors.ambulationRate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fallsAndIncidents">Quedas e Incidentes</Label>
                  <Input
                    id="fallsAndIncidents"
                    type="number"
                    min="0"
                    {...register('fallsAndIncidents', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.fallsAndIncidents && <p className="text-red-500 text-sm">{errors.fallsAndIncidents.message}</p>}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : 'Salvar Indicadores'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}