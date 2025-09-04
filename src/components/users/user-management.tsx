'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Shield, 
  Users, 
  Crown,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import UserQuotaModal from './user-quota-modal';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers({
        search: searchTerm,
        role: roleFilter,
        department: departmentFilter
      });
      setUsers((response as any).users || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, departmentFilter]);

  const handleAddUser = async (userData: any) => {
    try {
      await apiClient.createUser({
        name: userData.name,
        email: userData.email,
        department: userData.department,
        role: userData.role,
        monthlyQuota: parseInt(userData.monthlyQuota) || 1000
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Erro ao adicionar usuário');
    }
  };

  const handleEditQuota = (user: any) => {
    setSelectedUser(user);
    setShowQuotaModal(true);
  };

  const handleSaveQuota = async (quotaData: any) => {
    try {
      // This would call an API to update user quota
      // For now, we'll simulate the call
      console.log('Saving quota for user:', quotaData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      fetchUsers(); // Refresh the list
      setShowQuotaModal(false);
    } catch (error) {
      console.error('Error updating quota:', error);
      setError('Erro ao atualizar cota do usuário');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="text-purple-600" size={16} />;
      case 'MANAGER':
        return <Shield className="text-blue-600" size={16} />;
      case 'USER':
        return <User className="text-gray-600" size={16} />;
      default:
        return <User className="text-gray-600" size={16} />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'USER':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const getUsagePercentage = (current: number, quota: number) => {
    return Math.round((current / quota) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (user: any) => {
    const bwPercentage = getUsagePercentage(user.currentUsage, user.monthlyQuota);
    const colorPercentage = getUsagePercentage(user.colorUsage, user.colorQuota);
    
    if (bwPercentage >= 100 || colorPercentage >= 100) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cota Excedida</span>;
    } else if (bwPercentage >= 90 || colorPercentage >= 90) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Próximo ao Limite</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Normal</span>;
  };

  const departments = Array.from(new Set(users.map(user => user.department)));

  // Since filtering is now done server-side, we just use the users array
  const filteredUsers = users;

  const formatLastPrint = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
          <p className="text-gray-600">Monitore cotas, custos e atividade dos usuários</p>
        </div>
        <Button onClick={() => setShowAddUserModal(true)}>
          <Plus size={16} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar usuários..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filtrar por papel"
              >
                <option value="all">Todos os Papéis</option>
                <option value="ADMIN">Administradores</option>
                <option value="MANAGER">Gerentes</option>
                <option value="USER">Usuários</option>
              </select>
              <select
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                aria-label="Filtrar por departamento"
              >
                <option value="all">Todos os Departamentos</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
              <Crown className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Impressões Hoje</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.reduce((sum, user) => sum + (user.printJobsCount || 0), 0)}
                </p>
              </div>
              <FileText className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Custo Total</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {users.reduce((sum, user) => sum + (user.totalCost || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-orange-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando usuários...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <p className="text-red-500 text-lg">{error}</p>
          <Button onClick={fetchUsers} className="mt-4">Tentar Novamente</Button>
        </div>
      )}

      {/* Users Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
          const bwPercentage = getUsagePercentage(user.currentUsage, user.monthlyQuota);
          const colorPercentage = getUsagePercentage(user.colorUsage, user.colorQuota);
          
          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={16} />
                  </Button>
                </div>
                <CardDescription>
                  {user.email} • {user.department}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Papel:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getRoleText(user.role)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(user)}
                </div>

                {/* Cota P&B */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cota P&B:</span>
                    <span>{user.currentUsage.toLocaleString()} / {user.monthlyQuota.toLocaleString()}</span>
                  </div>
                  <ProgressBar
                    value={user.currentUsage}
                    max={user.monthlyQuota}
                    aria-label="Cota P&B"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {bwPercentage}% utilizado
                  </div>
                </div>

                {/* Cota Colorida */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cota Color:</span>
                    <span>{user.colorUsage.toLocaleString()} / {user.colorQuota.toLocaleString()}</span>
                  </div>
                  <ProgressBar
                    value={user.colorUsage}
                    max={user.colorQuota}
                    aria-label="Cota Color"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {colorPercentage}% utilizado
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Custo Mensal:</span>
                  <span className="font-medium text-green-600">
                    R$ {user.totalCost.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Última Impressão:</span>
                  <span className="text-xs">{formatLastPrint(user.lastPrint)}</span>
                </div>

                <div className="pt-2 border-t flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditQuota(user)}>
                    Editar Cotas
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => alert('Histórico do usuário em desenvolvimento')}>
                    Ver Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Nenhum usuário encontrado</p>
          <p className="text-gray-400 text-sm">Tente ajustar os filtros ou adicionar um novo usuário</p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Adicionar Novo Usuário</h2>
              <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
                ✕
              </Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                department: formData.get('department') as string,
                role: formData.get('role') as string,
                monthlyQuota: formData.get('monthlyQuota') as string
              };
              handleAddUser(userData);
              setShowAddUserModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="joao.silva@empresa.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Departamento *</label>
                <select
                  name="department"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecionar...</option>
                  <option value="Geral">Geral</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Vendas">Vendas</option>
                  <option value="RH">RH</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="TI">TI</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Função *</label>
                <select
                  name="role"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecionar...</option>
                  <option value="USER">Usuário</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cota Mensal (páginas)</label>
                <input
                  name="monthlyQuota"
                  type="number"
                  min="1"
                  defaultValue="1000"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1000"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddUserModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Adicionar Usuário
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Quota Modal */}
      <UserQuotaModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        user={selectedUser}
        onSave={handleSaveQuota}
      />
    </div>
  );
}