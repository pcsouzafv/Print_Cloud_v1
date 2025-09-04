'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Settings,
  MoreVertical, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { apiClient } from '@/lib/api-client';
import PrinterDiscoveryModal from './printer-discovery-modal';

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
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPrinters({
        search: searchTerm,
        status: statusFilter
      });
      setPrinters((response as any).printers || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar impressoras');
      console.error('Error fetching printers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrinters();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleAddPrinter = async (printerData: any) => {
    try {
      await apiClient.createPrinter({
        name: printerData.name,
        ipAddress: printerData.ip,
        model: printerData.model || `${printerData.manufacturer || 'Unknown'} Printer`,
        location: printerData.location || 'Não especificado',
        department: printerData.department || 'Geral',
        serialNumber: printerData.serialNumber || `SN-${Date.now()}`,
        isColorPrinter: printerData.isColorPrinter || false,
        monthlyQuota: printerData.monthlyQuota || 1000,
        status: printerData.status === 'online' ? 'ACTIVE' : 'ACTIVE'
      });
      fetchPrinters(); // Refresh the list
    } catch (error) {
      console.error('Error adding printer:', error);
      setError('Erro ao adicionar impressora');
    }
  };

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

  // Since filtering is now done server-side, we just use the printers array
  const filteredPrinters = printers;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Impressoras</h2>
          <p className="text-gray-600">Monitore e gerencie todas as impressoras da empresa</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowDiscoveryModal(true)}>
            <Network size={16} className="mr-2" />
            Descobrir na Rede
          </Button>
          <Button variant="outline" onClick={() => setShowManualModal(true)}>
            <Plus size={16} className="mr-2" />
            Adicionar Manual
          </Button>
        </div>
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
                <p className="text-2xl font-bold">{printers.length}</p>
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
                  {printers.filter(p => p.status === 'ACTIVE').length}
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
                  {printers.filter(p => p.status === 'MAINTENANCE').length}
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
                  {printers.filter(p => p.status === 'ERROR').length}
                </p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando impressoras...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <p className="text-red-500 text-lg">{error}</p>
          <Button onClick={fetchPrinters} className="mt-4">Tentar Novamente</Button>
        </div>
      )}

      {/* Printers Grid */}
      {!loading && !error && (
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
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => alert('Configuração de impressora em desenvolvimento')}>
                    <Settings size={14} className="mr-1" />
                    Configurar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => alert('Detalhes da impressora em desenvolvimento')}>
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}

      {!loading && !error && filteredPrinters.length === 0 && (
        <div className="text-center py-12">
          <Printer className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Nenhuma impressora encontrada</p>
          <p className="text-gray-400 text-sm">Tente ajustar os filtros ou adicionar uma nova impressora</p>
        </div>
      )}

      {/* Manual Printer Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Adicionar Impressora Manual</h2>
              <Button variant="outline" onClick={() => setShowManualModal(false)}>
                ✕
              </Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const printerData = {
                name: formData.get('name') as string,
                ip: formData.get('ip') as string,
                model: formData.get('model') as string,
                manufacturer: formData.get('manufacturer') as string,
                serialNumber: formData.get('serialNumber') as string,
                location: formData.get('location') as string,
                department: formData.get('department') as string,
                status: 'online'
              };
              handleAddPrinter(printerData);
              setShowManualModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Impressora *</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: HP LaserJet Pro - Sala 101"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Endereço IP *</label>
                <input
                  name="ip"
                  type="text"
                  required
                  pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="192.168.1.100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Fabricante</label>
                  <select
                    name="manufacturer"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    aria-label="Selecionar fabricante da impressora"
                  >
                    <option value="">Selecionar...</option>
                    <option value="HP">HP</option>
                    <option value="Canon">Canon</option>
                    <option value="Epson">Epson</option>
                    <option value="Brother">Brother</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Xerox">Xerox</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo</label>
                  <input
                    name="model"
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="LaserJet Pro"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Número de Série</label>
                <input
                  name="serialNumber"
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: HP123456 (deixe em branco para gerar automaticamente)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Localização</label>
                <input
                  name="location"
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Sala 101, 2º Andar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Departamento</label>
                <select
                  name="department"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Selecionar departamento da impressora"
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
              
              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowManualModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Adicionar Impressora
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printer Discovery Modal */}
      <PrinterDiscoveryModal
        isOpen={showDiscoveryModal}
        onClose={() => setShowDiscoveryModal(false)}
        onAddPrinter={handleAddPrinter}
      />
    </div>
  );
}