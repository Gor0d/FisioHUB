'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  Calendar,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

// Dados de exemplo - substituir por dados da API
const mockPatients = [
  {
    id: 1,
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 99999-1234',
    birthDate: '1985-03-15',
    diagnosis: 'Lombalgia crônica',
    createdAt: '2025-08-20',
    status: 'Ativo'
  },
  {
    id: 2,
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-5678',
    birthDate: '1978-07-22',
    diagnosis: 'Artrose de joelho',
    createdAt: '2025-08-18',
    status: 'Ativo'
  },
  {
    id: 3,
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '(11) 99999-9876',
    birthDate: '1992-11-03',
    diagnosis: 'Tendinite de ombro',
    createdAt: '2025-08-15',
    status: 'Inativo'
  }
];

export default function PatientsPage() {
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients] = useState(mockPatients);

  const slug = params?.slug as string;

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

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
                <h1 className="font-semibold text-lg">Pacientes</h1>
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
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pacientes</h2>
            <p className="text-muted-foreground">
              Gerencie todos os pacientes do {slug}
            </p>
          </div>
          
          <Link href={`/t/${slug}/patients/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou diagnóstico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca ou limpar os filtros.'
                  : 'Comece cadastrando seu primeiro paciente no sistema.'
                }
              </p>
              
              {!searchTerm && (
                <Link href={`/t/${slug}/patients/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Paciente
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {calculateAge(patient.birthDate)} anos
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {patient.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {patient.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{patient.diagnosis}</span>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            patient.status === 'Ativo' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {patient.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Total: {filteredPatients.length} pacientes</span>
              <span>
                Ativos: {filteredPatients.filter(p => p.status === 'Ativo').length} • 
                Inativos: {filteredPatients.filter(p => p.status === 'Inativo').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}