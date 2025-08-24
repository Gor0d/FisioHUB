'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Heart, 
  Brain, 
  Users, 
  Stethoscope,
  Activity,
  Apple,
  Hand
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    patients: number;
    indicators: number;
    indicatorTemplates: number;
  };
}

const getServiceIcon = (iconName?: string, color?: string) => {
  const iconClass = `h-5 w-5`;
  const iconColor = color || '#10B981';
  
  switch (iconName) {
    case 'heart':
      return <Heart className={iconClass} style={{ color: iconColor }} />;
    case 'brain':
      return <Brain className={iconClass} style={{ color: iconColor }} />;
    case 'users':
      return <Users className={iconClass} style={{ color: iconColor }} />;
    case 'stethoscope':
      return <Stethoscope className={iconClass} style={{ color: iconColor }} />;
    case 'activity':
      return <Activity className={iconClass} style={{ color: iconColor }} />;
    case 'apple':
      return <Apple className={iconClass} style={{ color: iconColor }} />;
    case 'hand':
      return <Hand className={iconClass} style={{ color: iconColor }} />;
    default:
      return <Stethoscope className={iconClass} style={{ color: iconColor }} />;
  }
};

const iconOptions = [
  { value: 'heart', label: 'Coração', icon: Heart },
  { value: 'brain', label: 'Cérebro', icon: Brain },
  { value: 'users', label: 'Pessoas', icon: Users },
  { value: 'stethoscope', label: 'Estetoscópio', icon: Stethoscope },
  { value: 'activity', label: 'Atividade', icon: Activity },
  { value: 'apple', label: 'Maçã', icon: Apple },
  { value: 'hand', label: 'Mão', icon: Hand },
];

const colorOptions = [
  { value: '#10B981', label: 'Verde' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#F59E0B', label: 'Âmbar' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#6B7280', label: 'Cinza' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#14B8A6', label: 'Teal' },
];

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#10B981',
    icon: 'stethoscope',
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/services');
      const servicesData = response.data?.data || [];
      setServices(servicesData);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateService = async () => {
    try {
      await api.post('/api/services', formData);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        color: '#10B981',
        icon: 'stethoscope',
      });
      fetchServices();
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
    }
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;
    
    try {
      await api.put(`/api/services/${selectedService.id}`, {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
      });
      setIsEditModalOpen(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm(`Tem certeza que deseja remover o serviço "${service.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/services/${service.id}`);
      fetchServices();
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      code: service.code,
      description: service.description || '',
      color: service.color || '#10B981',
      icon: service.icon || 'stethoscope',
    });
    setIsEditModalOpen(true);
  };

  if (user?.specialty !== 'Administrador do Sistema' && user?.specialty !== 'CEO MaisFisio') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button>Voltar ao Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Serviços</h1>
            <p className="text-muted-foreground">
              Configure os serviços disponíveis no hospital
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Voltar ao Dashboard</Button>
            </Link>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Carregando serviços...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum serviço encontrado.' : 'Nenhum serviço cadastrado ainda.'}
              </p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id} className="border-2 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(service.icon, service.color)}
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription className="font-mono text-xs">
                          {service.code}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={service.active ? 'default' : 'secondary'}>
                      {service.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {service.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Usuários:</span>
                      <span className="font-medium">{service._count.users}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pacientes:</span>
                      <span className="font-medium">{service._count.patients}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Indicadores:</span>
                      <span className="font-medium">{service._count.indicators}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditModal(service)}
                      className="flex-1"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteService(service)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Service Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Serviço</DialogTitle>
              <DialogDescription>
                Adicione um novo serviço ao hospital
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Serviço</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Fisioterapia"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Código</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="ex: fisioterapia"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição (opcional)</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do serviço..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cor</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color.value ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Ícone</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon.value}
                        onClick={() => setFormData({ ...formData, icon: icon.value })}
                        className={`p-2 rounded border ${
                          formData.icon === icon.value ? 'border-gray-900 bg-gray-100' : 'border-gray-300'
                        }`}
                        title={icon.label}
                      >
                        <icon.icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateService}>
                Criar Serviço
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Service Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Serviço</DialogTitle>
              <DialogDescription>
                Atualize as informações do serviço
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Serviço</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Código</label>
                <Input
                  value={formData.code}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O código não pode ser alterado após criação
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cor</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color.value ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Ícone</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon.value}
                        onClick={() => setFormData({ ...formData, icon: icon.value })}
                        className={`p-2 rounded border ${
                          formData.icon === icon.value ? 'border-gray-900 bg-gray-100' : 'border-gray-300'
                        }`}
                        title={icon.label}
                      >
                        <icon.icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateService}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}