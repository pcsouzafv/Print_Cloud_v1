'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Settings,
  MoreVertical, 
  AlertCircle, 
  CheckCircle, 
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';

// Mock data - será substituído pela API real
const mockPrinters = [
  {
    id: '1',
    name: 'HP LaserJet Pro M404dn',
    model: 'M404dn',
    location: 'Administração - 1º Andar',
    ipAddress: '192.168.1.101',
    status: 'ACTIVE',
    department: 'Administração',
    isColorPrinter: false,
    monthlyQuota: 5000,
    currentUsage: 2340,
    lastMaintenance: '2024-01-15'
  },
  {
    id: '2',
    name: 'Canon ImageRunner C3226i',
    model: 'C3226i',
    location: 'Marketing - 2º Andar',
    ipAddress: '192.168.1.102',
    status: 'MAINTENANCE',
    department: 'Marketing',
    isColorPrinter: true,
    monthlyQuota: 3000,
    currentUsage: 1250,
    lastMaintenance: '2024-01-20'
  },
  {
    id: '3',
    name: 'Xerox VersaLink C405',
    model: 'C405',
    location: 'Vendas - 1º Andar',
    ipAddress: '192.168.1.103',
    status: 'ERROR',
    department: 'Vendas',
    isColorPrinter: true,
    monthlyQuota: 4000,
    currentUsage: 3800,
    lastMaintenance: '2024-01-10'
  },
  {
    id: '4',
    name: 'Brother HL-L6400DW',
    model: 'HL-L6400DW',
    location: 'Financeiro - 1º Andar',
    ipAddress: '192.168.1.104',
    status: 'ACTIVE',
    department: 'Financeiro',
    isColorPrinter: false,
    monthlyQuota: 6000,
    currentUsage: 4200,
    lastMaintenance: '2024-01-18'
  }
];

declare module 'react' {
  interface CSSProperties {
    '--progress-width'?: string;
  }
}

const progressBarStyle = `
  .progress-bar-fill {
    width: var(--progress-width, 0%);
    height: 100%;
    border-radius: 9999px;
    transition: width 0.3s ease;
  }
`;

export default function PrinterManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'MAINTENANCE':
        return <AlertCircle className="text-yellow-500" size={16} />;
      case 'ERROR':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'MAINTENANCE':
        return 'Manutenção';
      case 'ERROR':
        return 'Erro';
      case 'INACTIVE':
        return 'Inativa';
      default:
        return 'Desconhecido';
    }
  };

  const getUsagePercentage = (current: number, quota: number) => {
    return Math.round((current / quota) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredPrinters = mockPrinters.filter(printer => {
    const matchesSearch = printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         printer.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || printer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Impressoras</h2>
          <p className="text-gray-600">Monitore e gerencie todas as impressoras da empresa</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Nova Impressora
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
                placeholder="Buscar impressoras..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrar por status da impressora"
              >
                <option value="all">Todos os Status</option>
                <option value="ACTIVE">Ativas</option>
                <option value="MAINTENANCE">Manutenção</option>
                <option value="ERROR">Com Erro</option>
                <option value="INACTIVE">Inativas</option>
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
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{mockPrinters.length}</p>
              </div>
              <Printer className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockPrinters.filter(p => p.status === 'ACTIVE').length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Manutenção</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mockPrinters.filter(p => p.status === 'MAINTENANCE').length}
                </p>
              </div>
              <AlertCircle className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Com Erro</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockPrinters.filter(p => p.status === 'ERROR').length}
                </p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrinters.map((printer) => {
          const usagePercentage = getUsagePercentage(printer.currentUsage, printer.monthlyQuota);
          
          return (
            <Card key={printer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(printer.status)}
                    <CardTitle className="text-lg">{printer.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={16} />
                  </Button>
                </div>
                <CardDescription>
                  {printer.model} • {printer.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    printer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    printer.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                    printer.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(printer.status)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uso Mensal:</span>
                    <span>{printer.currentUsage.toLocaleString()} / {printer.monthlyQuota.toLocaleString()}</span>
                  </div>
                  <ProgressBar 
                    value={Math.round(usagePercentage)} 
                    max={100}
                    className={getUsageColor(usagePercentage)}
                    label={`Progresso de uso: ${Math.round(usagePercentage)}%`}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {usagePercentage}% utilizado
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">IP:</span>
                  <span className="font-mono">{printer.ipAddress}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Departamento:</span>
                  <span>{printer.department}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tipo:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    printer.isColorPrinter ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {printer.isColorPrinter ? 'Colorida' : 'P&B'}
                  </span>
                </div>

                <div className="pt-2 border-t flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings size={14} className="mr-1" />
                    Configurar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPrinters.length === 0 && (
        <div className="text-center py-12">
          <Printer className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Nenhuma impressora encontrada</p>
          <p className="text-gray-400 text-sm">Tente ajustar os filtros ou adicionar uma nova impressora</p>
        </div>
      )}
    </div>
  );
}