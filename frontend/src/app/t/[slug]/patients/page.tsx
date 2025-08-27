'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  Loader2,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Patient } from '@/types';
import { PatientActions } from '@/components/ui/patient-actions';
import { useTenant, useTenantUrls } from '@/hooks/use-tenant';

export default function PatientsPage() {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const tenantUrls = useTenantUrls();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Show tenant loading or error state
  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando informações da organização...</p>
        </div>
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Organização não encontrada</h2>
          <p className="text-gray-600 mb-4">{tenantError || 'Verifique a URL e tente novamente'}</p>
          <Link href="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patients');
      
      if (response.data.success) {
        setPatients(response.data.data.data || []);
      } else {
        setError('Erro ao carregar pacientes');
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Advanced filtering logic
  const filteredPatients = patients.filter(patient => {
    // Search term filter
    const matchesSearch = !searchTerm || (
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient as any).diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient as any).attendanceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient as any).bedNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && patient.isActive) ||
      (statusFilter === 'inactive' && !patient.isActive);
    
    // Date filter (admission date)
    let matchesDate = true;
    if (dateFilter !== 'all' && (patient as any).admissionDate) {
      const admissionDate = new Date((patient as any).admissionDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

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
                  {tenant.name || tenant.publicId}
                </p>
              </div>
            </div>
            
            <Link href={tenantUrls?.dashboard || '#'}>
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
              Gerencie todos os pacientes do {tenant.name || tenant.publicId}
            </p>
          </div>
          
          <Link href={tenantUrls?.newPatient || '#'}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, atendimento, leito, email ou diagnóstico..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant={showFilters ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm">
                    Exportar
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Status</label>
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full p-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="all">Todos os pacientes</option>
                        <option value="active">Somente ativos</option>
                        <option value="inactive">Somente inativos</option>
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Data de Internação</label>
                      <select 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="w-full p-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="all">Todas as datas</option>
                        <option value="today">Hoje</option>
                        <option value="week">Última semana</option>
                        <option value="month">Último mês</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Ações</label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setDateFilter('all');
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Busca: "{searchTerm}"
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Status: {statusFilter === 'active' ? 'Ativos' : 'Inativos'}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                      </span>
                    )}
                    {dateFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Data: {
                          dateFilter === 'today' ? 'Hoje' :
                          dateFilter === 'week' ? 'Última semana' : 'Último mês'
                        }
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFilter('all')} />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="font-semibold text-lg mb-2">Carregando pacientes...</h3>
              <p className="text-muted-foreground">
                Buscando dados no servidor...
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-red-700">Erro ao carregar</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : 
        
        /* Patients List */
        filteredPatients.length === 0 ? (
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
                <Link href={tenantUrls?.newPatient || '#'}>
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
                          {(patient as any).attendanceNumber && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {(patient as any).attendanceNumber}
                            </div>
                          )}
                          {(patient as any).bedNumber && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Leito {(patient as any).bedNumber}
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.birthDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {calculateAge(patient.birthDate)} anos
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {(patient as any).diagnosis || (patient as any).medicalHistory || 'Sem diagnóstico'}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            patient.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {patient.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={tenantUrls?.patient(patient.id) || '#'}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      
                      <PatientActions 
                        patient={patient}
                        onUpdate={fetchPatients}
                      />
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-4">
                <span>
                  <strong>{filteredPatients.length}</strong> de <strong>{patients.length}</strong> pacientes
                </span>
                <span>•</span>
                <span>
                  <strong className="text-green-600">{filteredPatients.filter(p => p.isActive).length}</strong> ativos
                </span>
                <span>•</span>
                <span>
                  <strong className="text-gray-600">{filteredPatients.filter(p => !p.isActive).length}</strong> inativos
                </span>
              </div>
              
              {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                <span className="text-blue-600 font-medium">
                  Filtros ativos
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}