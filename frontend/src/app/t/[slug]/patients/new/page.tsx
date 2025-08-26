'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  MapPin,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface PatientData {
  name: string;
  email: string;
  phone: string;
  attendanceNumber: string;
  bedNumber: string;
  admissionDate: string;  // Data de internação
  birthDate: string;
  address: string;
  diagnosis: string;
  observations: string;
}

export default function NewPatientPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const slug = params?.slug as string;

  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    email: '',
    phone: '',
    attendanceNumber: '',
    bedNumber: '',
    admissionDate: '',
    birthDate: '',
    address: '',
    diagnosis: '',
    observations: ''
  });

  const updateField = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!patientData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!patientData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (patientData.email && !/\S+@\S+\.\S+/.test(patientData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!patientData.attendanceNumber.trim()) {
      newErrors.attendanceNumber = 'Número do atendimento é obrigatório';
    }

    if (!patientData.admissionDate.trim()) {
      newErrors.admissionDate = 'Data de internação é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Integração com API real
      const patientPayload = {
        ...patientData,
        birthDate: patientData.birthDate ? new Date(patientData.birthDate).toISOString() : null,
        admissionDate: patientData.admissionDate ? new Date(patientData.admissionDate).toISOString() : null
      };

      console.log('Enviando paciente para API:', patientPayload);
      const response = await api.post('/api/patients', patientPayload);

      if (response.data.success) {
        console.log('Paciente criado com sucesso:', response.data.data);
        setSuccess(true);
        
        // Redirecionar após sucesso
        setTimeout(() => {
          router.push(`/t/${slug}/patients`);
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Erro ao salvar paciente');
      }
      
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      setErrors({ general: 'Erro ao salvar paciente. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
                  <h1 className="font-semibold text-lg">Novo Paciente</h1>
                  <p className="text-sm text-muted-foreground">
                    {slug}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Paciente cadastrado com sucesso!
            </h1>
            
            <p className="text-muted-foreground mb-8">
              {patientData.name} foi adicionado ao sistema e está pronto para atendimento.
            </p>

            <div className="flex gap-4 justify-center">
              <Link href={`/t/${slug}/patients/new`}>
                <Button variant="outline">
                  Cadastrar Outro
                </Button>
              </Link>
              
              <Link href={`/t/${slug}/patients`}>
                <Button>
                  Ver Pacientes
                </Button>
              </Link>
            </div>
          </div>
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
                <h1 className="font-semibold text-lg">Novo Paciente</h1>
                <p className="text-sm text-muted-foreground">
                  {slug}
                </p>
              </div>
            </div>
            
            <Link href={`/t/${slug}/dashboard`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cadastro de Novo Paciente
              </CardTitle>
              <CardDescription>
                Preencha as informações do paciente para criar um novo registro no sistema.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      type="text"
                      placeholder="João Silva"
                      value={patientData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="joao@email.com"
                        value={patientData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Telefone *
                      </label>
                      <Input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={patientData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Número do Atendimento *
                      </label>
                      <Input
                        type="text"
                        placeholder="ATD-2024-001"
                        value={patientData.attendanceNumber}
                        onChange={(e) => updateField('attendanceNumber', e.target.value)}
                        className={errors.attendanceNumber ? 'border-red-500' : ''}
                      />
                      {errors.attendanceNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.attendanceNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Leito
                      </label>
                      <Input
                        type="text"
                        placeholder="101-A"
                        value={patientData.bedNumber}
                        onChange={(e) => updateField('bedNumber', e.target.value)}
                        className={errors.bedNumber ? 'border-red-500' : ''}
                      />
                      {errors.bedNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.bedNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Data de Internação *
                      </label>
                      <Input
                        type="datetime-local"
                        value={patientData.admissionDate}
                        onChange={(e) => updateField('admissionDate', e.target.value)}
                        className={errors.admissionDate ? 'border-red-500' : ''}
                      />
                      {errors.admissionDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.admissionDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Data de Nascimento
                      </label>
                      <Input
                        type="date"
                        value={patientData.birthDate}
                        onChange={(e) => updateField('birthDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Endereço
                    </label>
                    <Input
                      type="text"
                      placeholder="Rua das Flores, 123 - Centro, São Paulo - SP"
                      value={patientData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                    />
                  </div>
                </div>

                {/* Dados Clínicos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Clínicos</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Diagnóstico
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Lombalgia crônica"
                      value={patientData.diagnosis}
                      onChange={(e) => updateField('diagnosis', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Observações
                    </label>
                    <Textarea
                      placeholder="Observações sobre o paciente, histórico médico, alergias, etc."
                      value={patientData.observations}
                      onChange={(e) => updateField('observations', e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {errors.general && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-red-700 text-sm">{errors.general}</p>
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex justify-between pt-6 border-t">
                  <Link href={`/t/${slug}/dashboard`}>
                    <Button type="button" variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </Link>
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Cadastrar Paciente
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}