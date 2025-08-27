'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface IndicatorType {
  name: string;
  description: string;
  unit: string;
  target: number;
  format: string;
  category: string;
}

interface IndicatorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const INDICATOR_TYPES: Record<string, string> = {
  EARLY_MOBILIZATION: 'early_mobilization',
  MECHANICAL_VENTILATION: 'mechanical_ventilation',
  FUNCTIONAL_INDEPENDENCE: 'functional_independence',
  MUSCLE_STRENGTH: 'muscle_strength',
  HOSPITAL_STAY: 'hospital_stay',
  READMISSION_30D: 'readmission_30d',
  PATIENT_SATISFACTION: 'patient_satisfaction',
  DISCHARGE_DESTINATION: 'discharge_destination'
};

export default function IndicatorForm({ open, onOpenChange, onSuccess }: IndicatorFormProps) {
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [indicatorTypes, setIndicatorTypes] = useState<Record<string, IndicatorType>>({});
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    value: '',
    patientId: '',
    measurementDate: new Date().toISOString().split('T')[0],
    metadata: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load indicator types and patients
  useEffect(() => {
    if (open) {
      loadIndicatorTypes();
      loadPatients();
    }
  }, [open]);

  const loadIndicatorTypes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/indicators/types`);
      const data = await response.json();
      
      if (data.success) {
        setIndicatorTypes(data.data.config);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de indicadores:', error);
    }
  };

  const loadPatients = async () => {
    if (!tenant?.publicId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients?status=active&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Selecione um tipo de indicador';
    }

    if (!formData.value || isNaN(Number(formData.value))) {
      newErrors.value = 'Informe um valor numérico válido';
    }

    if (!formData.measurementDate) {
      newErrors.measurementDate = 'Selecione a data da medição';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !tenant?.publicId) return;

    setLoading(true);

    try {
      const payload = {
        tenantId: tenant.publicId,
        type: formData.type,
        value: Number(formData.value),
        patientId: formData.patientId || null,
        measurementDate: formData.measurementDate,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : {}
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/indicators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          type: '',
          value: '',
          patientId: '',
          measurementDate: new Date().toISOString().split('T')[0],
          metadata: ''
        });
        setErrors({});
        
        onOpenChange(false);
        onSuccess?.();
        
        alert('Indicador registrado com sucesso!');
      } else {
        alert(data.message || 'Erro ao registrar indicador');
      }
    } catch (error) {
      console.error('Erro ao registrar indicador:', error);
      alert('Erro ao registrar indicador');
    } finally {
      setLoading(false);
    }
  };

  const selectedIndicator = indicatorTypes[formData.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>📊 Registrar Indicador Clínico</DialogTitle>
          <DialogDescription>
            Registre um novo valor para acompanhamento de qualidade assistencial
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Indicador */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Indicador *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(indicatorTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span className="font-medium">{config.name}</span>
                        <span className="text-sm text-gray-500 capitalize">
                          {config.category} • {config.unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-600 text-sm">{errors.type}</p>}
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Valor *
                {selectedIndicator && (
                  <span className="text-sm text-gray-500 ml-1">
                    (Meta: {selectedIndicator.target} {selectedIndicator.unit})
                  </span>
                )}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              />
              {errors.value && <p className="text-red-600 text-sm">{errors.value}</p>}
            </div>

            {/* Paciente */}
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente (opcional)</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Indicador geral (sem paciente)</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data da Medição */}
            <div className="space-y-2">
              <Label htmlFor="measurementDate">Data da Medição *</Label>
              <Input
                id="measurementDate"
                type="date"
                value={formData.measurementDate}
                onChange={(e) => setFormData(prev => ({ ...prev, measurementDate: e.target.value }))}
              />
              {errors.measurementDate && (
                <p className="text-red-600 text-sm">{errors.measurementDate}</p>
              )}
            </div>
          </div>

          {/* Informações do Indicador Selecionado */}
          {selectedIndicator && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-blue-900">{selectedIndicator.name}</h4>
                <Badge variant="outline" className="capitalize">
                  {selectedIndicator.category}
                </Badge>
              </div>
              <p className="text-blue-700 text-sm mb-3">
                {selectedIndicator.description}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900">Unidade:</span>
                  <div className="text-blue-700">{selectedIndicator.unit}</div>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Meta:</span>
                  <div className="text-blue-700">{selectedIndicator.target}</div>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Formato:</span>
                  <div className="text-blue-700 capitalize">{selectedIndicator.format}</div>
                </div>
              </div>
            </div>
          )}

          {/* Metadados */}
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadados (JSON - opcional)</Label>
            <Textarea
              id="metadata"
              placeholder='{"observacoes": "Paciente apresentou melhora", "responsavel": "Dr. João"}'
              value={formData.metadata}
              onChange={(e) => setFormData(prev => ({ ...prev, metadata: e.target.value }))}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Informações adicionais em formato JSON (opcional)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </>
              ) : (
                'Registrar Indicador'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}