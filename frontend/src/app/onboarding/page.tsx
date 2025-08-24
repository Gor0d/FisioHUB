'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Building2 as Hospital,
  Users,
  Settings,
  Upload,
  CheckCircle,
  Plus,
  X,
  Stethoscope,
  Building,
  UserPlus,
  FileUp as FileUpload,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

interface Hospital {
  name: string;
  address: string;
  phone: string;
}

interface Service {
  name: string;
  description: string;
}

interface Collaborator {
  name: string;
  email: string;
  role: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  
  // Step data
  const [hospitals, setHospitals] = useState<Hospital[]>([{ name: '', address: '', phone: '' }]);
  const [services, setServices] = useState<Service[]>([{ name: '', description: '' }]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([{ name: '', email: '', role: 'Colaborador' }]);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Configure seus Hospitais',
      description: 'Adicione as unidades hospitalares que farão parte do sistema',
      icon: Hospital,
      completed: false
    },
    {
      id: 2,
      title: 'Defina os Serviços',
      description: 'Configure os departamentos e especialidades médicas',
      icon: Settings,
      completed: false
    },
    {
      id: 3,
      title: 'Convide sua Equipe',
      description: 'Adicione colaboradores e defina suas permissões',
      icon: Users,
      completed: false
    },
    {
      id: 4,
      title: 'Importe Dados',
      description: 'Migre dados existentes ou configure templates iniciais',
      icon: Upload,
      completed: false
    }
  ];

  useEffect(() => {
    // Verificar se o usuário está autenticado e obter informações do tenant
    fetchTenantInfo();
  }, []);

  const fetchTenantInfo = async () => {
    try {
      // Mock data - na implementação real, viria da API
      setTenantInfo({
        name: 'Hospital São José',
        slug: 'hospital-sao-jose',
        plan: 'professional'
      });
    } catch (error) {
      console.error('Erro ao carregar informações do tenant:', error);
    }
  };

  const addHospital = () => {
    setHospitals([...hospitals, { name: '', address: '', phone: '' }]);
  };

  const removeHospital = (index: number) => {
    if (hospitals.length > 1) {
      setHospitals(hospitals.filter((_, i) => i !== index));
    }
  };

  const updateHospital = (index: number, field: keyof Hospital, value: string) => {
    const updated = hospitals.map((hospital, i) => 
      i === index ? { ...hospital, [field]: value } : hospital
    );
    setHospitals(updated);
  };

  const addService = () => {
    setServices([...services, { name: '', description: '' }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updated = services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setServices(updated);
  };

  const addCollaborator = () => {
    setCollaborators([...collaborators, { name: '', email: '', role: 'Colaborador' }]);
  };

  const removeCollaborator = (index: number) => {
    if (collaborators.length > 1) {
      setCollaborators(collaborators.filter((_, i) => i !== index));
    }
  };

  const updateCollaborator = (index: number, field: keyof Collaborator, value: string) => {
    const updated = collaborators.map((collaborator, i) => 
      i === index ? { ...collaborator, [field]: value } : collaborator
    );
    setCollaborators(updated);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return hospitals.some(h => h.name.trim() !== '');
      case 2:
        return services.some(s => s.name.trim() !== '');
      case 3:
        return collaborators.some(c => c.name.trim() !== '' && c.email.trim() !== '');
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Salvar todas as configurações
      const onboardingData = {
        hospitals: hospitals.filter(h => h.name.trim()),
        services: services.filter(s => s.name.trim()),
        collaborators: collaborators.filter(c => c.name.trim() && c.email.trim())
      };

      // Mock API call - implementar com endpoint real
      console.log('Saving onboarding data:', onboardingData);

      // Redirecionar para o dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB" 
                className="h-8 w-auto"
              />
              {tenantInfo && (
                <Badge variant="secondary">
                  {tenantInfo.name}
                </Badge>
              )}
            </div>
            
            <Button variant="ghost" onClick={handleSkip} className="text-sm">
              Pular configuração
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Bem-vindo ao FisioHUB! 🎉
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Vamos configurar sua conta em alguns passos simples. 
              Isso nos ajudará a personalizar a experiência para sua instituição.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                ⏱️ Configuração estimada: <strong>5-10 minutos</strong>
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-20 h-1 mx-2 ${
                        step.id < currentStep ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-muted-foreground">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Step 1: Hospitais */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Building className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Configure seus Hospitais</h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione as unidades hospitalares que farão parte do sistema
                    </p>
                  </div>

                  <div className="space-y-4">
                    {hospitals.map((hospital, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Hospital {index + 1}</h4>
                          {hospitals.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeHospital(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Nome do Hospital *
                            </label>
                            <Input
                              type="text"
                              placeholder="Hospital São José"
                              value={hospital.name}
                              onChange={(e) => updateHospital(index, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Endereço
                            </label>
                            <Input
                              type="text"
                              placeholder="Rua das Flores, 123"
                              value={hospital.address}
                              onChange={(e) => updateHospital(index, 'address', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Telefone
                            </label>
                            <Input
                              type="text"
                              placeholder="(11) 99999-9999"
                              value={hospital.phone}
                              onChange={(e) => updateHospital(index, 'phone', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addHospital} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Hospital
                  </Button>
                </div>
              )}

              {/* Step 2: Serviços */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Defina os Serviços</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure os departamentos e especialidades médicas
                    </p>
                  </div>

                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Serviço {index + 1}</h4>
                          {services.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeService(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Nome do Serviço *
                            </label>
                            <Input
                              type="text"
                              placeholder="Fisioterapia Cardíaca"
                              value={service.name}
                              onChange={(e) => updateService(index, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Descrição
                            </label>
                            <Textarea
                              placeholder="Descrição do serviço..."
                              value={service.description}
                              onChange={(e) => updateService(index, 'description', e.target.value)}
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addService} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
              )}

              {/* Step 3: Colaboradores */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Convide sua Equipe</h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione colaboradores e defina suas permissões
                    </p>
                  </div>

                  <div className="space-y-4">
                    {collaborators.map((collaborator, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Colaborador {index + 1}</h4>
                          {collaborators.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCollaborator(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Nome Completo *
                            </label>
                            <Input
                              type="text"
                              placeholder="João Silva"
                              value={collaborator.name}
                              onChange={(e) => updateCollaborator(index, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Email *
                            </label>
                            <Input
                              type="email"
                              placeholder="joao@hospital.com"
                              value={collaborator.email}
                              onChange={(e) => updateCollaborator(index, 'email', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Função
                            </label>
                            <select
                              className="w-full h-10 px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                              value={collaborator.role}
                              onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
                            >
                              <option value="Colaborador">Colaborador</option>
                              <option value="Gerente de Serviço">Gerente de Serviço</option>
                              <option value="Admin Hospitalar">Admin Hospitalar</option>
                              <option value="Admin Geral">Admin Geral</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addCollaborator} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Colaborador
                  </Button>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-yellow-600 mt-0.5">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-yellow-800 text-sm">Convites serão enviados</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          Os colaboradores receberão um email de convite para criar suas contas e acessar o sistema.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Importação de Dados */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <FileUpload className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Importe Dados (Opcional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Migre dados existentes ou configure templates iniciais
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-dashed">
                      <CardHeader className="text-center">
                        <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                        <CardTitle className="text-lg">Dados de Pacientes</CardTitle>
                        <CardDescription>
                          Importe planilhas com dados de pacientes existentes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Selecionar Arquivo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Formatos: CSV, XLSX (máx. 10MB)
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed">
                      <CardHeader className="text-center">
                        <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
                        <CardTitle className="text-lg">Templates de Indicadores</CardTitle>
                        <CardDescription>
                          Configure modelos padrão para seus indicadores
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Usar Templates Padrão
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Indicadores pré-configurados para fisioterapia
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-blue-600 mt-0.5">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800 text-sm">Pule se preferir</p>
                        <p className="text-blue-700 text-sm mt-1">
                          Você pode importar dados e configurar templates a qualquer momento após o setup inicial.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <div>
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleSkip} className="text-sm">
                    Pular
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                      Continuar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleComplete} disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Finalizando...
                        </>
                      ) : (
                        <>
                          Finalizar Setup
                          <CheckCircle className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}