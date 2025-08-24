'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  ArrowRight, 
  Star, 
  Users, 
  Building2 as Hospital, 
  BarChart3, 
  Shield, 
  Globe, 
  Zap,
  Heart,
  Brain,
  Stethoscope
} from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Básico',
    slug: 'basic',
    price: 'R$ 299',
    period: '/mês',
    description: 'Ideal para pequenos consultórios',
    popular: false,
    features: [
      '1 hospital/clínica',
      'Até 50 colaboradores',
      '3 serviços médicos',
      '1.000 pacientes',
      '5.000 indicadores/mês',
      'Dashboard básico',
      'Suporte por email'
    ],
    limits: {
      hospitals: 1,
      users: 50,
      services: 3,
      patients: 1000
    }
  },
  {
    name: 'Profissional',
    slug: 'professional',
    price: 'R$ 799',
    period: '/mês',
    description: 'Para hospitais e redes de saúde',
    popular: true,
    features: [
      'Até 5 hospitais',
      'Até 200 colaboradores',
      'Serviços ilimitados',
      '10.000 pacientes',
      '50.000 indicadores/mês',
      'B.I completo',
      'API access',
      'Suporte prioritário',
      'Integrações customizadas'
    ],
    limits: {
      hospitals: 5,
      users: 200,
      services: -1,
      patients: 10000
    }
  },
  {
    name: 'Empresarial',
    slug: 'enterprise',
    price: 'R$ 1.999',
    period: '/mês',
    description: 'Solução completa para grandes redes',
    popular: false,
    features: [
      'Hospitais ilimitados',
      'Colaboradores ilimitados',
      'Todos os serviços',
      'Pacientes ilimitados',
      'Indicadores ilimitados',
      'White-label',
      'SLA garantido',
      'Suporte dedicado',
      'Implementação guiada'
    ],
    limits: {
      hospitals: -1,
      users: -1,
      services: -1,
      patients: -1
    }
  }
];

const features = [
  {
    icon: BarChart3,
    title: 'Indicadores Clínicos',
    description: 'Acompanhe métricas de qualidade e performance em tempo real'
  },
  {
    icon: Users,
    title: 'Gestão de Equipes',
    description: 'Organize colaboradores por hospitais e serviços especializados'
  },
  {
    icon: Hospital,
    title: 'Multi-hospitais',
    description: 'Gerencie múltiplas unidades com visão consolidada'
  },
  {
    icon: Shield,
    title: 'Segurança LGPD',
    description: 'Proteção completa de dados dos pacientes e conformidade'
  },
  {
    icon: Globe,
    title: 'Acesso Anywhere',
    description: 'Web, mobile e APIs para integração com outros sistemas'
  },
  {
    icon: Zap,
    title: 'Tempo Real',
    description: 'Atualizações instantâneas e sincronização automática'
  }
];

const testimonials = [
  {
    name: 'Dr. Maria Silva',
    role: 'Coordenadora de Fisioterapia',
    hospital: 'Hospital São José',
    content: 'O FisioHUB revolucionou nossa gestão de indicadores. Conseguimos melhorar nossos resultados em 30% no primeiro trimestre.',
    rating: 5
  },
  {
    name: 'Carlos Santos',
    role: 'Diretor Clínico',
    hospital: 'Rede Hospitalar ABC',
    content: 'Implementação simples e resultados imediatos. A visão consolidada de todas nossas unidades é fantástica.',
    rating: 5
  },
  {
    name: 'Dra. Ana Costa',
    role: 'Gerente de Qualidade',
    hospital: 'Hospital Municipal',
    content: 'Relatórios automáticos que economizam horas de trabalho. Recomendo para qualquer instituição de saúde.',
    rating: 5
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    if (email) {
      // Redirecionar para página de cadastro com email preenchido
      window.location.href = `/register?email=${encodeURIComponent(email)}`;
    } else {
      window.location.href = '/register';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img 
              src="/fisiohub.png" 
              alt="FisioHUB" 
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-4">
              <Link href="#pricing" className="text-sm hover:text-primary">
                Preços
              </Link>
              <Link href="#features" className="text-sm hover:text-primary">
                Funcionalidades
              </Link>
              <Link href="/login" className="text-sm hover:text-primary">
                Entrar
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Logo destacada no hero */}
            <div className="mb-8">
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB Logo" 
                className="h-24 w-auto mx-auto mb-6"
              />
            </div>
            
            <Badge className="mb-4" variant="secondary">
              ✨ Novo: B.I avançado com IA
            </Badge>
            
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Gestão de Indicadores Clínicos
              <span className="text-primary"> Inteligente</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transforme seus dados de saúde em insights poderosos. 
              Monitore qualidade, performance e resultados clínicos em tempo real 
              com a plataforma mais completa do mercado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="seu.email@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-80 rounded-r-none"
                />
                <Button onClick={handleGetStarted} className="rounded-l-none">
                  Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              💳 <strong>14 dias grátis</strong> • ⚡ Setup em 5 minutos • 🔒 LGPD compliant
            </p>

            {/* Trust indicators */}
            <div className="flex justify-center items-center gap-8 mt-12 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-500" />
                <span className="text-sm">500+ Hospitais</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <span className="text-sm">50k+ Profissionais</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span className="text-sm">2M+ Indicadores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Por que escolher o FisioHUB?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Desenvolvido especialmente para profissionais de saúde, 
              com foco em resultados e facilidade de uso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Escolha o plano ideal para sua instituição
            </h2>
            <p className="text-lg text-muted-foreground">
              Todos os planos incluem 14 dias grátis e suporte especializado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.slug} 
                className={`relative ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={`/register?plan=${plan.slug}`}>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Começar Teste Grátis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            💡 Precisa de um plano customizado? 
            <Link href="/contact" className="text-primary hover:underline ml-1">
              Fale conosco
            </Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.hospital}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar sua gestão de indicadores?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/80">
            Junte-se a centenas de instituições que já confiam no FisioHUB
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-primary">
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Agendar Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <img 
                  src="/fisiohub.png" 
                  alt="FisioHUB" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma completa de gestão de indicadores clínicos para instituições de saúde.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-white">Funcionalidades</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Preços</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">Sobre</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contato</Link></li>
                <li><Link href="/careers" className="hover:text-white">Carreiras</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white">Central de Ajuda</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentação</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 FisioHUB. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}