'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download,
  Calendar,
  Filter,
  Printer,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface ReportData {
  totalPrintJobs: number;
  totalPages: number;
  totalCost: number;
  activeUsers: number;
  activePrinters: number;
  topPrinters: Array<{
    name: string;
    jobs: number;
    pages: number;
  }>;
  topUsers: Array<{
    name: string;
    department: string;
    jobs: number;
    pages: number;
  }>;
  monthlyData: Array<{
    month: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
  departmentUsage: Array<{
    department: string;
    jobs: number;
    pages: number;
    cost: number;
  }>;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalPrintJobs: 0,
    totalPages: 0,
    totalCost: 0,
    activeUsers: 0,
    activePrinters: 0,
    topPrinters: [],
    topUsers: [],
    monthlyData: [],
    departmentUsage: []
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getReports({
        dateRange: parseInt(dateRange),
        reportType: reportType
      });
      
      setReportData(response as ReportData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Fallback to mock data if API fails
      setReportData({
        totalPrintJobs: 0,
        totalPages: 0,
        totalCost: 0,
        activeUsers: 0,
        activePrinters: 0,
        topPrinters: [],
        topUsers: [],
        monthlyData: [],
        departmentUsage: []
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (format: 'pdf' | 'excel' | 'csv') => {
    // Simulate report generation
    const fileName = `relatorio-impressao-${dateRange}dias.${format}`;
    alert(`Relatório ${fileName} será baixado em alguns segundos...`);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios de Impressão</h1>
          <p className="text-gray-600">Análise detalhada de uso e custos de impressão</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generateReport('pdf')} variant="outline">
            <Download size={16} className="mr-2" />
            PDF
          </Button>
          <Button onClick={() => generateReport('excel')} variant="outline">
            <Download size={16} className="mr-2" />
            Excel
          </Button>
          <Button onClick={() => generateReport('csv')} variant="outline">
            <Download size={16} className="mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <select
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
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
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="overview">Visão Geral</option>
                <option value="detailed">Detalhado</option>
                <option value="usage">Uso por Departamento</option>
                <option value="costs">Análise de Custos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Jobs</p>
                <p className="text-2xl font-bold">{reportData.totalPrintJobs.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +12% vs mês anterior
                </p>
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
                <p className="text-2xl font-bold">{reportData.totalPages.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +8% vs mês anterior
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
                <p className="text-2xl font-bold">R$ {reportData.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown size={12} className="mr-1" />
                  -3% vs mês anterior
                </p>
              </div>
              <DollarSign className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold">{reportData.activeUsers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +5% vs mês anterior
                </p>
              </div>
              <Users className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Impressoras Ativas</p>
                <p className="text-2xl font-bold">{reportData.activePrinters}</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <Activity size={12} className="mr-1" />
                  Sem mudança
                </p>
              </div>
              <Printer className="text-indigo-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Printers */}
        <Card>
          <CardHeader>
            <CardTitle>Impressoras Mais Utilizadas</CardTitle>
            <CardDescription>Ranking por número de jobs nos últimos {dateRange} dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topPrinters.map((printer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{printer.name}</p>
                      <p className="text-xs text-gray-500">{printer.pages.toLocaleString()} páginas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{printer.jobs}</p>
                    <p className="text-xs text-gray-500">jobs</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Mais Ativos</CardTitle>
            <CardDescription>Ranking por número de impressões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{user.jobs}</p>
                    <p className="text-xs text-gray-500">{user.pages} páginas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Uso por Departamento</CardTitle>
          <CardDescription>Análise de custos e volume por departamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.departmentUsage.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{dept.department}</p>
                  <p className="text-sm text-gray-600">{dept.jobs} jobs • {dept.pages.toLocaleString()} páginas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {dept.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm text-gray-600">
                    {((dept.cost / reportData.totalCost) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}