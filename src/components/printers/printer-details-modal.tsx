'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Activity, 
  AlertCircle, 
  BarChart3, 
  Clock, 
  MapPin,
  Network,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface PrinterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  printer: any;
}

interface PrinterDetails {
  printer: any;
  recentJobs: any[];
  monthlyStats: {
    totalJobs: number;
    totalPages: number;
    totalCost: number;
    avgJobsPerDay: number;
  };
  topUsers: any[];
  statusHistory: any[];
}

export default function PrinterDetailsModal({ 
  isOpen, 
  onClose, 
  printer 
}: PrinterDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [details, setDetails] = useState<PrinterDetails>({
    printer: null,
    recentJobs: [],
    monthlyStats: {
      totalJobs: 0,
      totalPages: 0,
      totalCost: 0,
      avgJobsPerDay: 0
    },
    topUsers: [],
    statusHistory: []
  });

  useEffect(() => {
    if (isOpen && printer) {
      loadPrinterDetails();
    }
  }, [isOpen, printer]);

  const loadPrinterDetails = async () => {
    if (!printer?.id) return;
    
    setLoading(true);
    try {
      const [printerDetails, printJobs] = await Promise.all([
        apiClient.getPrinters({ printerId: printer.id }),
        apiClient.getPrintJobs({ printerId: printer.id, limit: 50 })
      ]);

      // Calculate monthly stats
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const monthlyJobs = (printJobs as any).printJobs?.filter((job: any) => 
        new Date(job.submittedAt) >= currentMonth
      ) || [];

      const monthlyStats = {
        totalJobs: monthlyJobs.length,
        totalPages: monthlyJobs.reduce((sum: number, job: any) => sum + (job.pages * job.copies), 0),
        totalCost: monthlyJobs.reduce((sum: number, job: any) => sum + job.cost, 0),
        avgJobsPerDay: monthlyJobs.length / new Date().getDate()
      };

      // Get top users
      const userStats = monthlyJobs.reduce((acc: any, job: any) => {
        if (!acc[job.user.id]) {
          acc[job.user.id] = {
            user: job.user,
            jobs: 0,
            pages: 0,
            cost: 0
          };
        }
        acc[job.user.id].jobs++;
        acc[job.user.id].pages += job.pages * job.copies;
        acc[job.user.id].cost += job.cost;
        return acc;
      }, {});

      const topUsers = Object.values(userStats)
        .sort((a: any, b: any) => b.jobs - a.jobs)
        .slice(0, 5);

      setDetails({
        printer,
        recentJobs: (printJobs as any).printJobs?.slice(0, 10) || [],
        monthlyStats,
        topUsers,
        statusHistory: [] // Would load from status history API
      });
    } catch (error) {
      console.error('Error loading printer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setRefreshing(true);
    try {
      // Simulate status refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadPrinterDetails();
    } catch (error) {
      console.error('Error refreshing status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'MAINTENANCE': return 'text-yellow-600 bg-yellow-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: Activity },
    { id: 'jobs', name: 'Trabalhos', icon: FileText },
    { id: 'stats', name: 'Estatísticas', icon: BarChart3 },
    { id: 'status', name: 'Status', icon: AlertCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Printer className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{printer?.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {printer?.location}
                </span>
                <span className="flex items-center gap-1">
                  <Network size={14} />
                  {printer?.ipAddress}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {printer?.department}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(printer?.status)}`}>
              {printer?.status === 'ACTIVE' ? 'Ativa' : 
               printer?.status === 'MAINTENANCE' ? 'Manutenção' :
               printer?.status === 'ERROR' ? 'Erro' : 'Inativa'}
            </span>
            <Button variant="outline" onClick={refreshStatus} disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r p-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Carregando detalhes...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{details.monthlyStats.totalJobs}</p>
                            <p className="text-sm text-gray-600">Jobs este mês</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{details.monthlyStats.totalPages.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Páginas impressas</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(details.monthlyStats.totalCost)}</p>
                            <p className="text-sm text-gray-600">Custo total</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{Math.round(details.monthlyStats.avgJobsPerDay)}</p>
                            <p className="text-sm text-gray-600">Jobs/dia (média)</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Informações da Impressora</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Modelo:</span>
                            <span className="font-medium">{printer?.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Número de Série:</span>
                            <span className="font-medium">{printer?.serialNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tipo:</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              printer?.isColorPrinter ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {printer?.isColorPrinter ? 'Colorida' : 'P&B'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cota Mensal:</span>
                            <span className="font-medium">{printer?.monthlyQuota?.toLocaleString()} páginas</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Uso Atual:</span>
                            <span className="font-medium">{printer?.currentUsage?.toLocaleString()} páginas</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Principais Usuários</CardTitle>
                          <CardDescription>Top 5 usuários este mês</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {details.topUsers.map((userStat: any, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{userStat.user.name}</p>
                                  <p className="text-xs text-gray-500">{userStat.user.department}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-sm">{userStat.jobs} jobs</p>
                                  <p className="text-xs text-gray-500">{userStat.pages} páginas</p>
                                </div>
                              </div>
                            ))}
                            {details.topUsers.length === 0 && (
                              <p className="text-gray-500 text-sm">Nenhum usuário este mês</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Trabalhos Recentes</CardTitle>
                      <CardDescription>Últimos 10 trabalhos de impressão</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {details.recentJobs.map((job: any) => (
                          <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{job.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {job.user.name} • {formatDateTime(job.submittedAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">{job.pages} × {job.copies}</p>
                              <p className="text-xs text-gray-500">{formatCurrency(job.cost)}</p>
                            </div>
                            <div className="ml-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                job.status === 'PRINTING' ? 'bg-blue-100 text-blue-800' :
                                job.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                job.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {job.status === 'COMPLETED' ? 'Concluído' :
                                 job.status === 'PRINTING' ? 'Imprimindo' :
                                 job.status === 'PENDING' ? 'Pendente' :
                                 job.status === 'FAILED' ? 'Falhou' : 'Cancelado'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {details.recentJobs.length === 0 && (
                          <p className="text-gray-500 text-center py-8">Nenhum trabalho encontrado</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'stats' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Estatísticas Mensais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Total de Jobs:</span>
                          <span className="font-bold">{details.monthlyStats.totalJobs}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Total de Páginas:</span>
                          <span className="font-bold">{details.monthlyStats.totalPages.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Custo Total:</span>
                          <span className="font-bold">{formatCurrency(details.monthlyStats.totalCost)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Média Jobs/Dia:</span>
                          <span className="font-bold">{Math.round(details.monthlyStats.avgJobsPerDay)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Uso da Cota</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Uso Atual</span>
                              <span>{Math.round((printer?.currentUsage / printer?.monthlyQuota) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((printer?.currentUsage / printer?.monthlyQuota) * 100, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {printer?.currentUsage?.toLocaleString()} / {printer?.monthlyQuota?.toLocaleString()} páginas
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'status' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Status da Impressora</CardTitle>
                      <CardDescription>Informações técnicas e de conectividade</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-3">Conectividade</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">IP Address:</span>
                              <span className="font-mono">{printer?.ipAddress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status de Rede:</span>
                              <span className="text-green-600 flex items-center gap-1">
                                <Activity size={12} />
                                Online
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Última Verificação:</span>
                              <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Informações do Sistema</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(printer?.status)}`}>
                                {printer?.status === 'ACTIVE' ? 'Operacional' : printer?.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Última Atualização:</span>
                              <span>{formatDateTime(printer?.updatedAt || new Date().toISOString())}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Simulação de Status Técnico</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Papel</p>
                            <p className="text-2xl font-bold text-green-600">OK</p>
                            <p className="text-xs text-green-600">Bandeja cheia</p>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800">Toner</p>
                            <p className="text-2xl font-bold text-yellow-600">65%</p>
                            <p className="text-xs text-yellow-600">Nível adequado</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">Fila</p>
                            <p className="text-2xl font-bold text-blue-600">0</p>
                            <p className="text-xs text-blue-600">Jobs pendentes</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}