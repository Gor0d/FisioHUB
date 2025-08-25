'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Phone } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground">
            Última atualização: 25 de agosto de 2025
          </p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">1. Informações que Coletamos</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Informações de Cadastro:</strong> Nome, email, senha e dados da empresa/hospital.
                </p>
                <p>
                  <strong>Dados de Pacientes:</strong> Informações inseridas pelos profissionais da saúde, incluindo dados de avaliações e indicadores.
                </p>
                <p>
                  <strong>Dados de Uso:</strong> Logs de acesso, funcionalidades utilizadas e métricas de performance.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">2. Como Usamos suas Informações</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Fornecer e melhorar nossos serviços</li>
                <li>• Processar transações e pagamentos</li>
                <li>• Enviar comunicações importantes sobre o serviço</li>
                <li>• Garantir a segurança e integridade dos dados</li>
                <li>• Cumprir obrigações legais e regulamentares</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">3. Proteção de Dados (LGPD)</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  O FisioHUB está em total conformidade com a Lei Geral de Proteção de Dados (LGPD):
                </p>
                <ul className="space-y-2">
                  <li>• <strong>Consentimento:</strong> Coletamos dados apenas com seu consentimento explícito</li>
                  <li>• <strong>Finalidade:</strong> Dados são usados apenas para os fins informados</li>
                  <li>• <strong>Minimização:</strong> Coletamos apenas os dados necessários</li>
                  <li>• <strong>Transparência:</strong> Você sempre sabe quais dados temos e como os usamos</li>
                  <li>• <strong>Segurança:</strong> Implementamos medidas técnicas e organizacionais rigorosas</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">4. Seus Direitos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Acesso e Portabilidade</h3>
                  <p className="text-sm text-muted-foreground">Solicitar cópia de seus dados</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Correção</h3>
                  <p className="text-sm text-muted-foreground">Corrigir dados incorretos</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Exclusão</h3>
                  <p className="text-sm text-muted-foreground">Solicitar remoção de dados</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Revogação</h3>
                  <p className="text-sm text-muted-foreground">Retirar consentimento</p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">5. Contato</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-muted-foreground mb-2">
                  Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
                </p>
                <p className="font-medium">Email: privacidade@fisiohub.app</p>
                <p className="font-medium">DPO (Encarregado): dpo@fisiohub.app</p>
              </div>
            </section>

            <section className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 text-sm">Compromisso com a Segurança</p>
                    <p className="text-blue-700 text-xs mt-1">
                      Utilizamos criptografia avançada, backups seguros e auditoria contínua para proteger seus dados conforme as melhores práticas internacionais.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}