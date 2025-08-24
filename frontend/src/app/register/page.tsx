'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Users,
  Mail,
  Lock,
  Building,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Stethoscope
} from 'lucide-react';
import Link from 'next/link';
import { tenantApi } from '@/lib/api';

interface FormData {
  // Informações da empresa
  name: string;
  slug: string;
  subdomain: string;
  email: string;
  
  // Informações pessoais do admin
  adminName: string;
  adminEmail: string;
  password: string;
  confirmPassword: string;
  
  // Plano selecionado
  plan: string;
  
  // Aceitação dos termos
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

const plans = {
  basic: {
    name: 'Básico',
    price: 'R$ 299/mês',
    description: 'Ideal para pequenos consultórios',
    features: ['1 hospital', '50 usuários', '3 serviços']
  },
  professional: {
    name: 'Profissional', 
    price: 'R$ 799/mês',
    description: 'Para hospitais e redes de saúde',
    features: ['5 hospitais', '200 usuários', 'B.I completo']
  },
  enterprise: {
    name: 'Empresarial',
    price: 'R$ 1.999/mês',
    description: 'Solução completa para grandes redes',
    features: ['Ilimitado', 'White-label', 'Suporte dedicado']
  }
};

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    subdomain: '',
    email: searchParams?.get('email') || '',
    adminName: '',
    adminEmail: searchParams?.get('email') || '',
    password: '',
    confirmPassword: '',
    plan: searchParams?.get('plan') || 'professional',
    acceptTerms: false,
    acceptPrivacy: false
  });

  // Gerar slug automaticamente baseado no nome
  useEffect(() => {
    if (formData.name && currentStep === 1) {
      const generatedSlug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .replace(/^-|-$/g, ''); // Remove hífens do início/fim
      
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug,
        subdomain: generatedSlug
      }));
    }
  }, [formData.name, currentStep]);

  // Verificar disponibilidade do slug
  useEffect(() => {
    if (formData.slug && formData.slug.length >= 3) {
      const timer = setTimeout(async () => {
        setCheckingSlug(true);
        try {
          await tenantApi.getInfo(formData.slug);
          setSlugAvailable(false); // Se encontrou, não está disponível
        } catch (error) {
          setSlugAvailable(true); // Em caso de erro (404), assume disponível
        } finally {
          setCheckingSlug(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [formData.slug]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome da empresa é obrigatório';
      }
      if (!formData.slug.trim()) {
        newErrors.slug = 'Identificador é obrigatório';
      } else if (formData.slug.length < 3) {
        newErrors.slug = 'Identificador deve ter pelo menos 3 caracteres';
      } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = 'Use apenas letras minúsculas, números e hífens';
      } else if (slugAvailable === false) {
        newErrors.slug = 'Este identificador já está em uso';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    if (step === 2) {
      if (!formData.adminName.trim()) {
        newErrors.adminName = 'Nome do administrador é obrigatório';
      }
      if (!formData.adminEmail.trim()) {
        newErrors.adminEmail = 'Email do administrador é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
        newErrors.adminEmail = 'Email inválido';
      }
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha não confere';
      }
    }

    if (step === 3) {
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
      }
      if (!formData.acceptPrivacy) {
        newErrors.acceptPrivacy = 'Você deve aceitar a política de privacidade';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const data = await tenantApi.register({
        name: formData.name,
        slug: formData.slug,
        email: formData.adminEmail,
        password: formData.password,
        plan: formData.plan,
        subdomain: formData.subdomain
      });

      if (data.success) {
        // Redirecionar para página de sucesso
        router.push(`/register/success?tenant=${formData.slug}`);
      } else {
        setErrors({ submit: data.message || 'Erro ao criar conta' });
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      let errorMessage = 'Erro de conexão. Tente novamente.';
      
      if (error.response?.status === 409) {
        errorMessage = 'Email já está em uso. Tente fazer login ou use outro email.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const selectedPlan = plans[formData.plan as keyof typeof plans];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center gap-3">
              <ArrowLeft className="h-4 w-4" />
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB" 
                className="h-8 w-auto"
              />
            </Link>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Já tem uma conta?</span>
              <Link href="/login" className="text-primary hover:underline">
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 transform ${
                      step <= currentStep
                        ? 'bg-primary text-white scale-110 shadow-lg'
                        : 'bg-gray-200 text-gray-500 scale-100'
                    }`}
                  >
                    {step < currentStep ? (
                      <Check className="h-4 w-4 animate-in zoom-in duration-300" />
                    ) : step === currentStep ? (
                      <span className="animate-pulse">{step}</span>
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all duration-700 ${
                        step < currentStep 
                          ? 'bg-primary transform scale-x-100' 
                          : 'bg-gray-200 transform scale-x-75'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2 opacity-0 animate-fade-slide" style={{animationDelay: '0.1s'}}>
                {currentStep === 1 && 'Informações da Empresa'}
                {currentStep === 2 && 'Dados do Administrador'}  
                {currentStep === 3 && 'Plano e Confirmação'}
              </h1>
              <p className="text-muted-foreground opacity-0 animate-fade-slide" style={{animationDelay: '0.2s'}}>
                Passo {currentStep} de 3
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 relative overflow-hidden">
                  {/* Step 1: Empresa */}
                  {currentStep === 1 && (
                    <div className="space-y-6 opacity-0 animate-[fadeInSlideUp_0.5s_ease-in-out_forwards]">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nome da Empresa/Building2 *
                        </label>
                        <Input
                          type="text"
                          placeholder="Building2 São José"
                          value={formData.name}
                          onChange={(e) => updateFormData('name', e.target.value)}
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Identificador Único *
                        </label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="hospital-sao-jose"
                            value={formData.slug}
                            onChange={(e) => updateFormData('slug', e.target.value.toLowerCase())}
                            className={`${errors.slug ? 'border-red-500' : ''} ${
                              slugAvailable === true ? 'border-green-500' : ''
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {checkingSlug && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                            {!checkingSlug && slugAvailable === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {!checkingSlug && slugAvailable === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                        {errors.slug && (
                          <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Seu subdomínio será: <strong>{formData.slug}.fisiohub.com</strong>
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email Corporativo *
                        </label>
                        <Input
                          type="email"
                          placeholder="contato@hospitalsaojose.com"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Email principal para comunicações da empresa
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Administrador */}
                  {currentStep === 2 && (
                    <div className="space-y-6 opacity-0 animate-[fadeInSlideUp_0.5s_ease-in-out_forwards]">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nome Completo do Administrador *
                        </label>
                        <Input
                          type="text"
                          placeholder="João Silva"
                          value={formData.adminName}
                          onChange={(e) => updateFormData('adminName', e.target.value)}
                          className={errors.adminName ? 'border-red-500' : ''}
                        />
                        {errors.adminName && (
                          <p className="text-red-500 text-sm mt-1">{errors.adminName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email do Administrador *
                        </label>
                        <Input
                          type="email"
                          placeholder="joao.silva@hospitalsaojose.com"
                          value={formData.adminEmail}
                          onChange={(e) => updateFormData('adminEmail', e.target.value)}
                          className={errors.adminEmail ? 'border-red-500' : ''}
                        />
                        {errors.adminEmail && (
                          <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Senha *
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Digite uma senha segura"
                            value={formData.password}
                            onChange={(e) => updateFormData('password', e.target.value)}
                            className={errors.password ? 'border-red-500' : ''}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Confirmar Senha *
                        </label>
                        <Input
                          type="password"
                          placeholder="Digite a senha novamente"
                          value={formData.confirmPassword}
                          onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                          className={errors.confirmPassword ? 'border-red-500' : ''}
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirmação */}
                  {currentStep === 3 && (
                    <div className="space-y-6 opacity-0 animate-[fadeInSlideUp_0.5s_ease-in-out_forwards]">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Resumo da Conta</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Empresa:</span>
                            <span className="text-sm font-medium">{formData.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Subdomínio:</span>
                            <span className="text-sm font-medium">{formData.slug}.fisiohub.com</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Administrador:</span>
                            <span className="text-sm font-medium">{formData.adminName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="text-sm font-medium">{formData.adminEmail}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                            className="w-5 h-5 text-primary bg-white border-2 border-gray-300 rounded focus:ring-primary focus:ring-2 mt-0.5"
                          />
                          <label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
                            Eu aceito os{' '}
                            <Link href="/terms" className="text-primary hover:underline font-medium" target="_blank">
                              Termos de Uso
                            </Link>{' '}
                            do FisioHUB e concordo com as condições de utilização da plataforma.
                          </label>
                        </div>
                        {errors.acceptTerms && (
                          <p className="text-red-500 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.acceptTerms}
                          </p>
                        )}

                        <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <input
                            type="checkbox"
                            id="acceptPrivacy"
                            checked={formData.acceptPrivacy}
                            onChange={(e) => updateFormData('acceptPrivacy', e.target.checked)}
                            className="w-5 h-5 text-primary bg-white border-2 border-gray-300 rounded focus:ring-primary focus:ring-2 mt-0.5"
                          />
                          <label htmlFor="acceptPrivacy" className="text-sm leading-relaxed cursor-pointer">
                            Eu aceito a{' '}
                            <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                              Política de Privacidade
                            </Link>{' '}
                            e autorizo o tratamento dos meus dados pessoais conforme a LGPD.
                          </label>
                        </div>
                        {errors.acceptPrivacy && (
                          <p className="text-red-500 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.acceptPrivacy}
                          </p>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 text-blue-600 mt-0.5">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-blue-800 text-sm">Proteção de Dados Garantida</p>
                              <p className="text-blue-700 text-xs mt-1">
                                Seus dados estão seguros e protegidos conforme as melhores práticas de segurança e em total conformidade com a LGPD.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <p className="text-red-700 text-sm">{errors.submit}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t opacity-0 animate-fade-slide" style={{animationDelay: '0.4s'}}>
                    <div>
                      {currentStep > 1 && (
                        <Button 
                          variant="outline" 
                          onClick={handleBack}
                          className="transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Voltar
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      {currentStep < 3 ? (
                        <Button 
                          onClick={handleNext}
                          className="transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary"
                        >
                          Continuar
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleSubmit} 
                          disabled={loading}
                          className="transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 disabled:from-gray-400 disabled:to-gray-500"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Criando conta...
                            </>
                          ) : (
                            <>
                              Criar Conta
                              <CheckCircle className="h-4 w-4 ml-2 animate-pulse" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar com informações do plano */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 opacity-0 animate-slide-left hover:shadow-lg transition-shadow" style={{animationDelay: '0.3s'}}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Plano Selecionado</CardTitle>
                    <Badge variant="secondary">{selectedPlan.name}</Badge>
                  </div>
                  <CardDescription>{selectedPlan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">{selectedPlan.price}</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">14 dias grátis</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Cancele a qualquer momento durante o período de teste
                    </p>
                  </div>

                  <Link href="/landing#pricing" className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver todos os planos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}