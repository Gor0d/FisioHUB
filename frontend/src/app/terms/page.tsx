'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Users, Shield, Gavel } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/register" className="flex items-center gap-3">
              <ArrowLeft className="h-4 w-4" />
              <img 
                src="/fisiohub.png" 
                alt="FisioHUB" 
                className="h-8 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground">
            Última atualização: 25 de agosto de 2025
          </p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
              </div>
              <p className="text-muted-foreground">
                Ao usar o FisioHUB, você concorda com estes termos de uso. Se não concordar, 
                não utilize nossa plataforma. Estes termos podem ser atualizados periodicamente.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">2. Descrição do Serviço</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  O FisioHUB é uma plataforma SaaS para gestão de fisioterapia e saúde que oferece:
                </p>
                <ul className="space-y-2">
                  <li>• Sistema de avaliação de pacientes</li>
                  <li>• Indicadores de qualidade e performance</li>
                  <li>• Dashboard e relatórios gerenciais</li>
                  <li>• Multitenancy para hospitais e clínicas</li>
                  <li>• Conformidade com regulamentações de saúde</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">3. Planos e Pagamentos</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Básico - R$ 299/mês</h3>
                    <p className="text-sm">1 hospital, 50 usuários, 3 serviços</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Profissional - R$ 799/mês</h3>
                    <p className="text-sm">5 hospitais, 200 usuários, B.I completo</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Empresarial - R$ 1.999/mês</h3>
                    <p className="text-sm">Ilimitado, White-label, Suporte dedicado</p>
                  </div>
                </div>
                <p>
                  <strong>Período de Teste:</strong> 14 dias grátis para todos os planos. 
                  Cobrança automática após o período de teste, com possibilidade de cancelamento a qualquer momento.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">4. Responsabilidades do Usuário</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Fornecer informações precisas e atualizadas</li>
                <li>• Manter a confidencialidade de suas credenciais de acesso</li>
                <li>• Usar a plataforma apenas para fins legais e éticos</li>
                <li>• Respeitar dados pessoais de pacientes conforme LGPD</li>
                <li>• Não tentar acessar áreas restritas ou dados de outros tenants</li>
                <li>• Reportar bugs ou problemas de segurança</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Gavel className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">5. Limitações e Garantias</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Disponibilidade:</strong> Nos esforçamos para manter 99.9% de uptime, 
                  mas não garantimos disponibilidade ininterrupta.
                </p>
                <p>
                  <strong>Dados:</strong> Realizamos backups regulares, mas recomendamos que mantenha 
                  cópias próprias de dados críticos.
                </p>
                <p>
                  <strong>Responsabilidade:</strong> Nossa responsabilidade é limitada ao valor 
                  pago pelo serviço nos últimos 12 meses.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">6. Cancelamento e Rescisão</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento 
                  através do painel administrativo ou entrando em contato conosco.
                </p>
                <p>
                  <strong>Dados após Cancelamento:</strong> Seus dados ficam disponíveis por 30 dias 
                  após o cancelamento para eventual reativação.
                </p>
                <p>
                  <strong>Violação dos Termos:</strong> Reservamos o direito de suspender contas 
                  que violem estes termos, com aviso prévio quando possível.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">7. Segurança e Conformidade</h2>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2 text-green-800">
                  <p><strong>LGPD:</strong> Total conformidade com a Lei Geral de Proteção de Dados</p>
                  <p><strong>CFM:</strong> Aderente às normas do Conselho Federal de Medicina</p>
                  <p><strong>ANVISA:</strong> Conforme regulamentações sanitárias aplicáveis</p>
                  <p><strong>ISO 27001:</strong> Seguimos padrões internacionais de segurança</p>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-muted-foreground mb-2">
                  <strong>Contato para Questões Legais:</strong>
                </p>
                <p className="font-medium">Email: legal@fisiohub.app</p>
                <p className="font-medium">Suporte: suporte@fisiohub.app</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Foro: Comarca de São Paulo, SP - Lei Brasileira
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}