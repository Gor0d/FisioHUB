'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Scale, TrendingUp, Save, X } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  medicalRecord: string;
  bedNumber: string;
}

interface AssessmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPatientId?: string | null;
  onSuccess?: () => void;
}

const MRC_MUSCLE_GROUPS = [
  'Deltóide direito',
  'Deltóide esquerdo', 
  'Bíceps direito',
  'Bíceps esquerdo',
  'Extensores do punho direito',
  'Extensores do punho esquerdo',
  'Iliopsoas direito',
  'Iliopsoas esquerdo',
  'Quadríceps direito',
  'Quadríceps esquerdo',
  'Dorsiflexores direito',
  'Dorsiflexores esquerdo'
];

const BARTHEL_ACTIVITIES = [
  { name: 'Alimentação', scores: [0, 5, 10] },
  { name: 'Banho', scores: [0, 5] },
  { name: 'Higiene pessoal', scores: [0, 5] },
  { name: 'Vestir-se', scores: [0, 5, 10] },
  { name: 'Controle intestinal', scores: [0, 5, 10] },
  { name: 'Controle urinário', scores: [0, 5, 10] },
  { name: 'Uso do banheiro', scores: [0, 5, 10] },
  { name: 'Transferência cama/cadeira', scores: [0, 5, 10, 15] },
  { name: 'Mobilidade', scores: [0, 5, 10, 15] },
  { name: 'Escadas', scores: [0, 5, 10] }
];

export default function AssessmentForm({ open, onOpenChange, selectedPatientId, onSuccess }: AssessmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [assessmentType, setAssessmentType] = useState<'mrc' | 'barthel'>('mrc');
  const [mrcScores, setMrcScores] = useState<Record<string, number>>({});
  const [barthelScores, setBarthelScores] = useState<Record<string, number>>({});
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (open) {
      loadPatients();
      if (selectedPatientId) {
        setSelectedPatient(selectedPatientId);
      }
    }
  }, [open, selectedPatientId]);

  const loadPatients = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients?status=active`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPatients(data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            medicalRecord: p.attendanceNumber || p.id,
            bedNumber: p.bedNumber || 'N/A'
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setLoading(true);
    try {
      const scores = assessmentType === 'mrc' ? mrcScores : barthelScores;
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          assessmentType,
          scores,
          totalScore,
          observations
        }),
      });

      if (response.ok) {
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      } else {
        console.error('Erro ao salvar avaliação');
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setAssessmentType('mrc');
    setMrcScores({});
    setBarthelScores({});
    setObservations('');
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);
  const currentScores = assessmentType === 'mrc' ? mrcScores : barthelScores;
  const totalScore = Object.values(currentScores).reduce((sum, score) => sum + score, 0);
  const maxScore = assessmentType === 'mrc' ? 60 : 100;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {assessmentType === 'mrc' ? (
              <Scale className="h-5 w-5 text-orange-600" />
            ) : (
              <TrendingUp className="h-5 w-5 text-green-600" />
            )}
            Nova Avaliação - {assessmentType === 'mrc' ? 'Escala MRC' : 'Índice de Barthel'}
          </DialogTitle>
          <DialogDescription>
            Preencha todos os campos para realizar a avaliação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paciente *</label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.bedNumber} - {patient.medicalRecord}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assessment Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Avaliação *</label>
            <Select value={assessmentType} onValueChange={(value: string) => setAssessmentType(value as 'mrc' | 'barthel')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mrc">Escala MRC - Força Muscular</SelectItem>
                <SelectItem value="barthel">Índice de Barthel - Independência Funcional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Score Summary */}
          {selectedPatientData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Resumo da Avaliação</span>
                  <Badge variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}>
                    {totalScore}/{maxScore} pts ({percentage}%)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-600">
                  Paciente: <strong>{selectedPatientData.name}</strong> • 
                  Leito: <strong>{selectedPatientData.bedNumber}</strong> • 
                  Registro: <strong>{selectedPatientData.medicalRecord}</strong>
                </div>
              </CardContent>
            </Card>
          )}

          {/* MRC Scale */}
          {assessmentType === 'mrc' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Grupos Musculares - Escala MRC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MRC_MUSCLE_GROUPS.map((muscle) => (
                    <div key={muscle} className="space-y-2">
                      <label className="text-sm font-medium">{muscle}</label>
                      <Select
                        value={mrcScores[muscle]?.toString() || ''}
                        onValueChange={(value) => setMrcScores(prev => ({ ...prev, [muscle]: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a pontuação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 - Nenhuma contração</SelectItem>
                          <SelectItem value="1">1 - Contração visível</SelectItem>
                          <SelectItem value="2">2 - Movimento sem gravidade</SelectItem>
                          <SelectItem value="3">3 - Movimento contra gravidade</SelectItem>
                          <SelectItem value="4">4 - Resistência moderada</SelectItem>
                          <SelectItem value="5">5 - Força normal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Barthel Index */}
          {assessmentType === 'barthel' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Atividades de Vida Diária - Índice de Barthel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {BARTHEL_ACTIVITIES.map((activity) => (
                    <div key={activity.name} className="space-y-2">
                      <label className="text-sm font-medium">{activity.name}</label>
                      <Select
                        value={barthelScores[activity.name]?.toString() || ''}
                        onValueChange={(value) => setBarthelScores(prev => ({ ...prev, [activity.name]: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a pontuação" />
                        </SelectTrigger>
                        <SelectContent>
                          {activity.scores.map((score) => (
                            <SelectItem key={score} value={score.toString()}>
                              {score} pontos
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observations */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações sobre a avaliação (opcional)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedPatient}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}