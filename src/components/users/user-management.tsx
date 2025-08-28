'use client';

import { useState } from 'react';
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
  DollarSign
} from 'lucide-react';

// Mock data - será substituído pela API real
const mockUsers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    department: 'Administração',
    role: 'USER',
    azureId: 'azure-1',
    monthlyQuota: 500,
    currentUsage: 234,
    colorQuota: 100,
    colorUsage: 45,
    totalCost: 23.40,
    lastPrint: '2024-01-23T14:30:00',
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    department: 'Marketing',
    role: 'MANAGER',
    azureId: 'azure-2',
    monthlyQuota: 1000,
    currentUsage: 678,
    colorQuota: 300,
    colorUsage: 189,
    totalCost: 89.50,
    lastPrint: '2024-01-23T16:15:00',
    status: 'active'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@empresa.com',
    department: 'Vendas',
    role: 'USER',
    azureId: 'azure-3',
    monthlyQuota: 800,
    currentUsage: 756,
    colorQuota: 200,
    colorUsage: 198,
    totalCost: 145.30,
    lastPrint: '2024-01-23T17:45:00',
    status: 'active'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@empresa.com',
    department: 'Financeiro',
    role: 'ADMIN',
    azureId: 'azure-4',
    monthlyQuota: 1500,
    currentUsage: 423,
    colorQuota: 500,
    colorUsage: 67,
    totalCost: 56.78,
    lastPrint: '2024-01-23T13:20:00',
    status: 'active'
  },
  {
    id: '5',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@empresa.com',
    department: 'TI',
    role: 'USER',
    azureId: 'azure-5',
    monthlyQuota: 300,
    currentUsage: 298,
    colorQuota: 50,
    colorUsage: 49,
    totalCost: 45.67,
    lastPrint: '2024-01-22T11:30:00',
    status: 'quota_exceeded'
  }
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

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

  const departments = Array.from(new Set(mockUsers.map(user => user.department)));

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const formatLastPrint = (dateString: string) => {
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
        <Button>
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
                <p className="text-2xl font-bold">{mockUsers.length}</p>
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
                  {mockUsers.filter(u => u.role === 'ADMIN').length}
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
                <p className="text-2xl font-bold text-green-600">1,234</p>
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
                <p className="text-2xl font-bold text-orange-600">R$ 360,65</p>
              </div>
              <DollarSign className="text-orange-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Grid */}
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
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar Cotas
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Nenhum usuário encontrado</p>
          <p className="text-gray-400 text-sm">Tente ajustar os filtros ou adicionar um novo usuário</p>
        </div>
      )}
    </div>
  );
}