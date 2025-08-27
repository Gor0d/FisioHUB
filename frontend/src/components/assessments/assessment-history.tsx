'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, TrendingUp, Calendar, User, FileText, X, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Assessment {
  id: string;
  assessmentType: 'mrc' | 'barthel';
  totalScore: number;
  scores: Record<string, number>;
  observations?: string;
  createdAt: string;
  updatedAt: string;
  assessedBy?: string;
}

interface Patient {
  id: string;
  name: string;
  medicalRecord: string;
  bedNumber: string;
}

interface AssessmentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  tenantId: string;
}

export default function AssessmentHistory({ open, onOpenChange, patientId, tenantId }: AssessmentHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'mrc' | 'barthel'>('all');

  useEffect(() => {
    if (open && patientId) {
      loadData();
    }
  }, [open, patientId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load patient data
      const patientResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patientId}`);
      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        if (patientData.success) {
          setPatient({
            id: patientData.data.id,
            name: patientData.data.name,
            medicalRecord: patientData.data.attendanceNumber || patientData.data.id,
            bedNumber: patientData.data.bedNumber || 'N/A'
          });
        }
      }

      // Load assessments (mock data for now until API is implemented)
      setAssessments([]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(assessment => 
    selectedType === 'all' || assessment.assessmentType === selectedType
  );

  const mrcAssessments = assessments.filter(a => a.assessmentType === 'mrc');
  const barthelAssessments = assessments.filter(a => a.assessmentType === 'barthel');

  const getScoreBadgeVariant = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    if (percentage >= 40) return 'outline';
    return 'destructive';
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  const renderScoreDetails = (assessment: Assessment) => {
    if (assessment.assessmentType === 'mrc') {
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(assessment.scores).map(([muscle, score]) => (
            <div key={muscle} className="flex justify-between">
              <span>{muscle}:</span>
              <Badge variant="outline">{score}</Badge>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-1 text-xs">
          {Object.entries(assessment.scores).map(([activity, score]) => (
            <div key={activity} className="flex justify-between">
              <span>{activity}:</span>
              <Badge variant="outline">{score} pts</Badge>
            </div>
          ))}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando histórico...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Avaliações
          </DialogTitle>
          <DialogDescription>
            {patient && (
              <span>
                {patient.name} • Leito {patient.bedNumber} • {patient.medicalRecord}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{assessments.length}</div>
              <p className="text-xs text-gray-500">Avaliações realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">MRC</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{mrcAssessments.length}</div>
              <p className="text-xs text-gray-500">
                {mrcAssessments.length > 0 && 
                  `Última: ${mrcAssessments[0]?.totalScore}/60 pts`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Barthel</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{barthelAssessments.length}</div>
              <p className="text-xs text-gray-500">
                {barthelAssessments.length > 0 && 
                  `Última: ${barthelAssessments[0]?.totalScore}/100 pts`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          <Button 
            variant={selectedType === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            Todas ({assessments.length})
          </Button>
          <Button 
            variant={selectedType === 'mrc' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedType('mrc')}
          >
            MRC ({mrcAssessments.length})
          </Button>
          <Button 
            variant={selectedType === 'barthel' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedType('barthel')}
          >
            Barthel ({barthelAssessments.length})
          </Button>
        </div>

        {/* Assessments List */}
        <div className="space-y-4">
          {filteredAssessments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedType === 'all' ? 'Nenhuma avaliação encontrada' :
                   selectedType === 'mrc' ? 'Nenhuma avaliação MRC' :
                   'Nenhuma avaliação Barthel'}
                </h3>
                <p className="text-gray-600">
                  {selectedType === 'all' 
                    ? 'Este paciente ainda não possui avaliações registradas.'
                    : `Este paciente ainda não possui avaliações do tipo ${selectedType.toUpperCase()}.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAssessments.map((assessment, index) => (
              <Card key={assessment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {assessment.assessmentType === 'mrc' ? (
                        <Scale className="h-4 w-4 text-orange-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                      {assessment.assessmentType === 'mrc' ? 'Escala MRC' : 'Índice de Barthel'}
                      <Badge variant="outline">#{filteredAssessments.length - index}</Badge>
                    </CardTitle>
                    <Badge 
                      variant={getScoreBadgeVariant(
                        assessment.totalScore, 
                        assessment.assessmentType === 'mrc' ? 60 : 100
                      )}
                    >
                      {assessment.totalScore}/{assessment.assessmentType === 'mrc' ? 60 : 100} pts
                      ({Math.round((assessment.totalScore / (assessment.assessmentType === 'mrc' ? 60 : 100)) * 100)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(assessment.createdAt)}
                    </div>
                    {assessment.assessedBy && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {assessment.assessedBy}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Score Details */}
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Pontuações Detalhadas</h4>
                      {renderScoreDetails(assessment)}
                    </div>

                    {/* Observations */}
                    {assessment.observations && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Observações
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          {assessment.observations}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}