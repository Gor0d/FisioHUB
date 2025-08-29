'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/hooks/use-tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, Building2, Save, RotateCcw } from 'lucide-react';

interface IndicatorField {
  key: string;
  label: string;
  unit: string;
  category: string;
  required?: boolean;
}

const SETORES = [
  { id: 'enfermaria_verde', name: 'Enfermaria Verde', tipo: 'medica' },
  { id: 'enfermaria_amarela', name: 'Enfermaria Amarela', tipo: 'medica' },
  { id: 'enfermaria_laranja', name: 'Enfermaria Laranja', tipo: 'ortopedica' },
  { id: 'enfermaria_azul', name: 'Enfermaria Azul', tipo: 'ortopedica' },
  { id: 'uti', name: 'UTI', tipo: 'medica' }
];

const TURNOS = [
  { id: 'manha', name: 'Manhã', horario: '06:00-14:00' },
  { id: 'tarde', name: 'Tarde', horario: '14:00-22:00' },
  { id: 'noite', name: 'Noite', horario: '22:00-06:00' }
];

const INDICADORES: IndicatorField[] = [
  { key: 'pacientes_internados', label: 'Pacientes Internados', unit: 'pacientes', category: 'volume', required: true },
  { key: 'pacientes_prescritos', label: 'Pacientes Prescritos para Fisioterapia', unit: 'pacientes', category: 'volume', required: true },
  { key: 'altas', label: 'Altas', unit: 'pacientes', category: 'desfecho' },
  { key: 'intubacoes', label: 'Intubações', unit: 'procedimentos', category: 'respiratorio' },
  { key: 'extubacoes_programadas', label: 'Extubações Programadas', unit: 'procedimentos', category: 'respiratorio' },
  { key: 'obitos', label: 'Óbitos', unit: 'pacientes', category: 'desfecho' },
  { key: 'pcr', label: 'PCR (Parada Cardiorrespiratória)', unit: 'eventos', category: 'desfecho' },
  { key: 'fisio_respiratoria', label: 'Fisioterapia Respiratória Realizada', unit: 'atendimentos', category: 'respiratorio', required: true },
  { key: 'fisio_motora', label: 'Fisioterapia Motora Realizada', unit: 'atendimentos', category: 'mobilidade', required: true },
  { key: 'via_aerea_artificial', label: 'Pacientes com Via Aérea Artificial', unit: 'pacientes', category: 'respiratorio' },
  { key: 'aspiracao_necessaria', label: 'Pacientes que Precisaram ser Aspirados', unit: 'pacientes', category: 'respiratorio' },
  { key: 'sedestacao_expectativa', label: 'Pacientes que Esperam Chegar à Sedestação', unit: 'pacientes', category: 'mobilidade' },
  { key: 'sedestacao_realizada', label: 'Sedestações Realizadas', unit: 'procedimentos', category: 'mobilidade' },
  { key: 'ortostatismo_expectativa', label: 'Pacientes que Esperam Chegar ao Ortostatismo', unit: 'pacientes', category: 'mobilidade' },
  { key: 'ortostatismo_realizado', label: 'Ortostatismo Realizado', unit: 'procedimentos', category: 'mobilidade' },
  { key: 'deambulacao_realizada', label: 'Deambulação Realizada', unit: 'procedimentos', category: 'mobilidade' },
  { key: 'pronacao', label: 'Pronação', unit: 'procedimentos', category: 'respiratorio' },
  { key: 'oxigenoterapia', label: 'Pacientes que Usam Oxigenoterapia', unit: 'pacientes', category: 'respiratorio' },
  { key: 'ventilacao_nao_invasiva', label: 'Ventilação Não Invasiva Realizada', unit: 'atendimentos', category: 'respiratorio' },
  { key: 'ventilacao_invasiva', label: 'Ventilação Mecânica Invasiva Realizada', unit: 'atendimentos', category: 'respiratorio' },
  { key: 'traqueostomia', label: 'Traqueostomia', unit: 'procedimentos', category: 'respiratorio' },
  { key: 'nao_deambulavam', label: 'Pacientes que Não Deambulavam (Pré-fisio)', unit: 'pacientes', category: 'mobilidade' },
  { key: 'visita_multidisciplinar', label: 'Visita Multidisciplinar', unit: 'visitas', category: 'multidisciplinar' }
];

export default function IndicatorsFeedPage() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'manha',
    sector: '',
    sectorType: 'medica',
    indicators: {} as Record<string, string>
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSectorChange = (sectorId: string) => {
    const sector = SETORES.find(s => s.id === sectorId);
    setFormData(prev => ({
      ...prev,
      sector: sectorId,
      sectorType: sector?.tipo || 'medica'
    }));
  };

  const handleIndicatorChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      indicators: {
        ...prev.indicators,
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const payload = {
        date: formData.date,
        shift: formData.shift,
        sector: formData.sector,
        sectorType: formData.sectorType,
        collaborator: user?.name || 'Não identificado',
        indicators: formData.indicators
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/indicators/feed-bulk/${tenant?.publicId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            indicators: {}
          }));
          setSuccess(false);
        }, 2000);
      } else {
        alert('Erro: ' + result.message);
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      alert('Erro ao enviar dados');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      indicators: {}
    }));
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      volume: 'bg-blue-100 text-blue-800',
      respiratorio: 'bg-green-100 text-green-800',
      mobilidade: 'bg-purple-100 text-purple-800',
      desfecho: 'bg-orange-100 text-orange-800',
      multidisciplinar: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const groupedIndicators = INDICADORES.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, IndicatorField[]>);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Alimentação de Indicadores
        </h1>
        <p className="text-gray-600">
          Preencha os indicadores do seu turno conforme a planilha atual
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ Indicadores salvos com sucesso!</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Informações do Turno */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Informações do Turno
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Turno</Label>
              <Select value={formData.shift} onValueChange={(value) => setFormData(prev => ({ ...prev, shift: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TURNOS.map(turno => (
                    <SelectItem key={turno.id} value={turno.id}>
                      {turno.name} ({turno.horario})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Select value={formData.sector} onValueChange={handleSectorChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {SETORES.map(setor => (
                    <SelectItem key={setor.id} value={setor.id}>
                      {setor.name} ({setor.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Colaborador</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user?.name || 'Não identificado'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores por Categoria */}
        {Object.entries(groupedIndicators).map(([category, indicators]) => (
          <Card key={category} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <Badge className={getCategoryBadgeColor(category)}>
                  {indicators.length} indicadores
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicators.map(indicator => (
                  <div key={indicator.key} className="space-y-2">
                    <Label htmlFor={indicator.key} className="text-sm">
                      {indicator.label}
                      {indicator.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id={indicator.key}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={formData.indicators[indicator.key] || ''}
                        onChange={(e) => handleIndicatorChange(indicator.key, e.target.value)}
                        required={indicator.required}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        {indicator.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar Formulário
          </Button>
          
          <Button type="submit" disabled={loading || !formData.sector}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Indicadores'}
          </Button>
        </div>
      </form>
    </div>
  );
}