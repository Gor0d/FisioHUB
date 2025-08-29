'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Mail, 
  Edit, 
  Trash2, 
  Activity,
  Calendar,
  Shield,
  UserCheck,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
}

interface ProductivityStats {
  indicatorsCount: number;
  evolutionsCount: number;
  assessmentsCount: number;
  totalActivities: number;
  period: string;
  startDate: string;
  endDate: string;
}

export default function CollaboratorsPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [productivity, setProductivity] = useState<ProductivityStats | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'physiotherapist'
  });

  const fetchUsers = async () => {
    if (!tenant?.publicId) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${tenant.publicId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar colaboradores');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.message || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Erro ao carregar colaboradores:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductivity = async (userId: string) => {
    if (!tenant?.publicId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${tenant.publicId}/${userId}/productivity?period=30d`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtividade');
      }

      const data = await response.json();
      
      if (data.success) {
        setProductivity(data.productivity);
      }
    } catch (err) {
      console.error('Erro ao carregar produtividade:', err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.publicId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${tenant.publicId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (data.success) {
        setUsers([data.user, ...users]);
        setNewUser({ email: '', name: '', role: 'physiotherapist' });
        setShowAddDialog(false);
        
        // Show success message
        alert(`Colaborador adicionado com sucesso! ${data.emailSent ? 'Convite enviado por email.' : ''}`);
        if (data.tempPassword) {
          alert(`Senha temporária: ${data.tempPassword}`);
        }
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      alert('Erro ao adicionar colaborador');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!tenant?.publicId) return;
    
    if (!confirm('Tem certeza que deseja desativar este colaborador?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${tenant.publicId}/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: false } : user
        ));
        alert('Colaborador desativado com sucesso!');
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao desativar colaborador:', error);
      alert('Erro ao desativar colaborador');
    }
  };

  const handleShowStats = async (user: User) => {
    setSelectedUser(user);
    setProductivity(null);
    setShowStatsDialog(true);
    await fetchProductivity(user.id);
  };

  useEffect(() => {
    fetchUsers();
  }, [tenant?.publicId]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'physiotherapist':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'physiotherapist':
        return 'Fisioterapeuta';
      case 'supervisor':
        return 'Supervisor';
      default:
        return role;
    }
  };

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Tenant não encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 Gestão de Colaboradores
          </h1>
          <p className="text-gray-600">
            Gerencie a equipe de fisioterapeutas do {tenant.name}
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Colaborador</DialogTitle>
              <DialogDescription>
                Adicione um novo membro à equipe. Um convite será enviado por email.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="João Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="joao.silva@galileu.com.br"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physiotherapist">Fisioterapeuta</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Convite
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="physiotherapist">Fisioterapeuta</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'physiotherapist').length}
            </div>
            <div className="text-sm text-gray-600">Fisioterapeutas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Administradores</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando colaboradores...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">❌ {error}</p>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Collaborators List */}
      {!loading && !error && (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className={cn(
              'hover:shadow-md transition-shadow',
              !user.isActive && 'opacity-60 bg-gray-50'
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <Badge className={cn('text-xs', getRoleColor(user.role))}>
                          {getRoleName(user.role)}
                        </Badge>
                        {user.role === 'admin' && (
                          <Shield className="h-4 w-4 text-red-500" />
                        )}
                        {!user.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{user.email}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {user.lastLoginAt && (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            Último acesso: {new Date(user.lastLoginAt).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowStats(user)}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Produtividade
                    </Button>
                    
                    {user.isActive && user.role !== 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivateUser(user.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredUsers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum colaborador encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || roleFilter !== 'all' 
                ? 'Nenhum colaborador corresponde aos filtros aplicados'
                : 'Comece adicionando membros à sua equipe'
              }
            </p>
            {(!searchTerm && roleFilter === 'all') && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Colaborador
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Productivity Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Produtividade - {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Estatísticas dos últimos 30 dias
            </DialogDescription>
          </DialogHeader>
          
          {productivity ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{productivity.indicatorsCount}</div>
                  <div className="text-sm text-gray-600">Indicadores</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{productivity.evolutionsCount}</div>
                  <div className="text-sm text-gray-600">Evoluções</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{productivity.assessmentsCount}</div>
                  <div className="text-sm text-gray-600">Avaliações</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{productivity.totalActivities}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
              
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Período: {productivity.period} 
                  ({new Date(productivity.startDate).toLocaleDateString('pt-BR')} - {new Date(productivity.endDate).toLocaleDateString('pt-BR')})
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowStatsDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}