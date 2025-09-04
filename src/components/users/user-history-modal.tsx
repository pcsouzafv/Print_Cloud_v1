'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  FileText,
  Printer,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Eye,
  X,
  Activity,
  BarChart3
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  printJobsCount: number;
  totalCost: number;
  currentUsage: number;
  monthlyLimit: number;
  colorUsage: number;
  colorLimit: number;
}

interface PrintJob {
  id: string;
  documentName: string;
  pages: number;
  copies: number;
  isColor: boolean;
  cost: number;
  submittedAt: Date;
  status: 'PENDING' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  printerName: string;
}

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserHistoryModal({ isOpen, onClose, user }: UserHistoryModalProps) {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // 30 days default
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalPages: 0,
    totalCost: 0,
    colorJobs: 0,
    failedJobs: 0,
    avgPagesPerJob: 0,
    mostUsedPrinter: '',
    peakUsageDay: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      fetchUserHistory();
    }
  }, [user, isOpen, selectedPeriod, selectedStatus]);

  const fetchUserHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Simulated API call - replace with actual API endpoint
      const response = await fetch(`/api/users/${user.id}/history?period=${selectedPeriod}&status=${selectedStatus}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user history');
      }
      
      const data = await response.json();
      setPrintJobs(data.printJobs || []);
      
      // Calculate stats from the data
      calculateStats(data.printJobs || []);
      
    } catch (error) {
      console.error('Error fetching user history:', error);
      
      // Fallback to mock data for development
      const mockJobs = generateMockPrintJobs(user);
      setPrintJobs(mockJobs);
      calculateStats(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPrintJobs = (user: User): PrintJob[] => {
    const jobs: PrintJob[] = [];
    const printers = ['HP LaserJet Pro', 'Canon ImageRunner', 'Epson EcoTank', 'Brother HL-L2350'];
    const documents = [
      'Relatório Mensal.pdf', 'Contrato Cliente.pdf', 'Apresentação.pptx', 
      'Planilha Orçamento.xlsx', 'Manual Usuário.pdf', 'Política Empresa.docx',
      'Invoice #12345.pdf', 'Meeting Notes.docx', 'Budget Analysis.xlsx'
    ];
    
    const statuses: PrintJob['status'][] = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'CANCELLED'];
    
    for (let i = 0; i < Math.max(15, Math.floor(Math.random() * 30)); i++) {
      const isColor = Math.random() > 0.7;
      const pages = Math.floor(Math.random() * 20) + 1;
      const copies = Math.floor(Math.random() * 3) + 1;
      
      jobs.push({
        id: `job-${i + 1}`,
        documentName: documents[Math.floor(Math.random() * documents.length)],
        pages,
        copies,
        isColor,
        cost: (pages * copies * (isColor ? 0.15 : 0.05)),
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        status: statuses[Math.floor(Math.random() * statuses.length)],
        printerName: printers[Math.floor(Math.random() * printers.length)]
      });
    }
    
    return jobs.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  };

  const calculateStats = (jobs: PrintJob[]) => {
    const completedJobs = jobs.filter(job => job.status === 'COMPLETED');
    const totalJobs = completedJobs.length;
    const totalPages = completedJobs.reduce((sum, job) => sum + (job.pages * job.copies), 0);
    const totalCost = completedJobs.reduce((sum, job) => sum + job.cost, 0);
    const colorJobs = completedJobs.filter(job => job.isColor).length;
    const failedJobs = jobs.filter(job => job.status === 'FAILED' || job.status === 'CANCELLED').length;
    
    // Find most used printer
    const printerUsage: { [key: string]: number } = {};
    completedJobs.forEach(job => {
      printerUsage[job.printerName] = (printerUsage[job.printerName] || 0) + 1;
    });
    const mostUsedPrinter = Object.entries(printerUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    // Find peak usage day
    const dailyUsage: { [key: string]: number } = {};
    completedJobs.forEach(job => {
      const day = job.submittedAt.toDateString();
      dailyUsage[day] = (dailyUsage[day] || 0) + 1;
    });
    const peakUsageDay = Object.entries(dailyUsage).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    setStats({
      totalJobs,
      totalPages,
      totalCost,
      colorJobs,
      failedJobs,
      avgPagesPerJob: totalJobs > 0 ? Math.round(totalPages / totalJobs) : 0,
      mostUsedPrinter,
      peakUsageDay
    });
  };

  const getStatusIcon = (status: PrintJob['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'PRINTING':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'PENDING':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'FAILED':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'CANCELLED':
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const getStatusText = (status: PrintJob['status']) => {
    const statusMap = {
      'COMPLETED': 'Concluído',
      'PRINTING': 'Imprimindo',
      'PENDING': 'Pendente',
      'FAILED': 'Falhou',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const filteredJobs = selectedStatus === 'all' 
    ? printJobs 
    : printJobs.filter(job => job.status === selectedStatus);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="text-blue-600" size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl">Histórico de Impressão</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {user.name} • {user.department}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <select
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                aria-label="Selecionar período do histórico"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Último ano</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filtrar por status"
              >
                <option value="all">Todos os Status</option>
                <option value="COMPLETED">Concluído</option>
                <option value="FAILED">Falhou</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="PENDING">Pendente</option>
              </select>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Jobs</p>
                    <p className="text-2xl font-bold">{stats.totalJobs}</p>
                  </div>
                  <FileText className="text-blue-500" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Páginas</p>
                    <p className="text-2xl font-bold">{stats.totalPages.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="text-green-500" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Custo Total</p>
                    <p className="text-2xl font-bold">R$ {stats.totalCost.toFixed(2)}</p>
                  </div>
                  <DollarSign className="text-yellow-500" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Jobs Coloridos</p>
                    <p className="text-2xl font-bold">{stats.colorJobs}</p>
                  </div>
                  <Printer className="text-purple-500" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 mb-1">Média Páginas/Job</div>
                <div className="text-xl font-bold">{stats.avgPagesPerJob}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 mb-1">Impressora Preferida</div>
                <div className="text-sm font-medium truncate">{stats.mostUsedPrinter}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 mb-1">Jobs com Erro</div>
                <div className="text-xl font-bold text-red-600">{stats.failedJobs}</div>
              </CardContent>
            </Card>
          </div>

          {/* Print Jobs List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Histórico de Impressões</CardTitle>
                  <CardDescription>
                    {filteredJobs.length} jobs encontrados
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Carregando histórico...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredJobs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma impressão encontrada para os filtros selecionados.
                    </p>
                  ) : (
                    filteredJobs.map((job, index) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          {getStatusIcon(job.status)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-sm">{job.documentName}</p>
                              {job.isColor && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                  Colorido
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>{job.pages} pág. × {job.copies}</span>
                              <span>•</span>
                              <span>{job.printerName}</span>
                              <span>•</span>
                              <span>{new Date(job.submittedAt).toLocaleDateString('pt-BR')}</span>
                              <span>{new Date(job.submittedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-medium text-sm">R$ {job.cost.toFixed(2)}</div>
                            <div className={`text-xs ${
                              job.status === 'COMPLETED' ? 'text-green-600' :
                              job.status === 'FAILED' ? 'text-red-600' :
                              job.status === 'CANCELLED' ? 'text-gray-600' :
                              'text-yellow-600'
                            }`}>
                              {getStatusText(job.status)}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye size={14} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}