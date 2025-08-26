'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Activity,
  Clock,
  Bed,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Patient } from '@/types';
import { PatientActions } from '@/components/ui/patient-actions';
import { TransferHistory } from '@/components/patient/transfer-history';

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const slug = params?.slug as string;
  const patientId = params?.id as string;

  // Fetch patient details
  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      // Por enquanto, buscamos da lista de pacientes até criarmos o endpoint específico
      const response = await api.get('/api/patients');
      
      if (response.data.success) {
        const patients = response.data.data.data || [];
        const foundPatient = patients.find((p: Patient) => p.id === patientId);
        
        if (foundPatient) {
          setPatient(foundPatient);
        } else {
          setError('Paciente não encontrado');
        }
      } else {
        setError('Erro ao carregar paciente');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do paciente:', error);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB" 
                className="h-8 w-auto"
              />
              <div className="border-l pl-4">
                <h1 className="font-semibold text-lg">Detalhes do Paciente</h1>
                <p className="text-sm text-muted-foreground">{slug}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="font-semibold text-lg mb-2">Carregando detalhes...</h3>
              <p className="text-muted-foreground">
                Buscando informações do paciente...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB" 
                className="h-8 w-auto"
              />
              <div className="border-l pl-4">
                <h1 className="font-semibold text-lg">Detalhes do Paciente</h1>
                <p className="text-sm text-muted-foreground">{slug}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-red-700">Erro ao carregar</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => fetchPatientDetails()}
                  variant="outline"
                >
                  Tentar Novamente
                </Button>
                <Link href={`/t/${slug}/patients`}>
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar à Lista
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB" 
                className="h-8 w-auto"
              />
              <div className="border-l pl-4">
                <h1 className="font-semibold text-lg">Detalhes do Paciente</h1>
                <p className="text-sm text-muted-foreground">{slug}</p>
              </div>
            </div>
            
            <Link href={`/t/${slug}/patients`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Lista
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Patient Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={patient.isActive ? "default" : "secondary"}>
                    {patient.isActive ? 'Ativo' : 'Alta'}
                  </Badge>
                  {(patient as any).attendanceNumber && (
                    <span className="text-sm text-muted-foreground">
                      Atendimento: {(patient as any).attendanceNumber}
                    </span>
                  )}
                  {(patient as any).bedNumber && (
                    <span className="text-sm text-muted-foreground">
                      Leito: {(patient as any).bedNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <PatientActions 
                patient={patient}
                onUpdate={fetchPatientDetails}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {patient.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Telefone</p>
                        <p className="text-sm text-muted-foreground">{patient.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {patient.birthDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Data de Nascimento</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateOnly(patient.birthDate)} ({calculateAge(patient.birthDate)} anos)
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {patient.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Endereço</p>
                        <p className="text-sm text-muted-foreground">{patient.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clinical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações Clínicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(patient as any).diagnosis && (
                  <div>
                    <p className="text-sm font-medium mb-2">Diagnóstico</p>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                      {(patient as any).diagnosis}
                    </p>
                  </div>
                )}
                
                {(patient as any).observations && (
                  <div>
                    <p className="text-sm font-medium mb-2">Observações</p>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                      {(patient as any).observations}
                    </p>
                  </div>
                )}
                
                {!(patient as any).diagnosis && !(patient as any).observations && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma informação clínica registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transfer History */}
            <TransferHistory 
              patientId={patient.id}
              patientName={patient.name}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hospital Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Informações Hospitalares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(patient as any).attendanceNumber && (
                  <div>
                    <p className="text-sm font-medium">Número do Atendimento</p>
                    <p className="text-sm text-muted-foreground">{(patient as any).attendanceNumber}</p>
                  </div>
                )}
                
                {(patient as any).bedNumber && (
                  <div>
                    <p className="text-sm font-medium">Leito Atual</p>
                    <p className="text-sm text-muted-foreground">{(patient as any).bedNumber}</p>
                  </div>
                )}
                
                {(patient as any).admissionDate && (
                  <div>
                    <p className="text-sm font-medium">Data de Internação</p>
                    <p className="text-sm text-muted-foreground">{formatDate((patient as any).admissionDate)}</p>
                  </div>
                )}
                
                {(patient as any).dischargeDate && (
                  <div>
                    <p className="text-sm font-medium">Data da Alta</p>
                    <p className="text-sm text-muted-foreground">{formatDate((patient as any).dischargeDate)}</p>
                  </div>
                )}
                
                {(patient as any).dischargeReason && (
                  <div>
                    <p className="text-sm font-medium">Motivo da Alta</p>
                    <p className="text-sm text-muted-foreground">{(patient as any).dischargeReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={patient.isActive ? "default" : "secondary"} className="mt-1">
                    {patient.isActive ? 'Paciente Ativo' : 'Paciente com Alta'}
                  </Badge>
                </div>
                
                {patient.createdAt && (
                  <div>
                    <p className="text-sm font-medium">Cadastrado em</p>
                    <p className="text-sm text-muted-foreground">{formatDate(patient.createdAt)}</p>
                  </div>
                )}
                
                {patient.updatedAt && (
                  <div>
                    <p className="text-sm font-medium">Última atualização</p>
                    <p className="text-sm text-muted-foreground">{formatDate(patient.updatedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}