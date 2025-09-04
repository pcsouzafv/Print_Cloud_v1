'use client';

import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Printer, 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  LogOut,
  Home,
  BarChart3,
  Shield,
  Brain
} from 'lucide-react';
import PrinterManagement from '@/components/printers/printer-management';
import UserManagement from '@/components/users/user-management';
import AIInsights from '@/components/ai/ai-insights';
import AIAssistant from '@/components/ai/ai-assistant';
import RealtimeChat from '@/components/ai/realtime-chat';
import { apiClient } from '@/lib/api-client';

// Import the pages that were previously "in development"
import ReportsPage from '@/app/reports/page';
import SettingsPage from '@/app/settings/page';

type ActiveSection = 'dashboard' | 'printers' | 'users' | 'ai-insights' | 'ai-realtime' | 'reports' | 'settings';

export default function Dashboard() {
  const { instance, accounts } = useMsal();
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  const handleLogout = () => {
    instance.logoutPopup().catch((e) => {
      console.error('Logout failed:', e);
    });
  };

  const user = accounts[0];

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'printers', label: 'Impressoras', icon: Printer },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'ai-insights', label: 'Insights IA', icon: Brain },
    { id: 'ai-realtime', label: 'IA Tempo Real', icon: Brain },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'printers':
        return <PrinterManagement />;
      case 'users':
        return <UserManagement />;
      case 'ai-insights':
        return <AIInsights userId={user?.localAccountId} department={user?.username?.split('@')[1]} />;
      case 'ai-realtime':
        return <RealtimeChat userId={user?.localAccountId} department={user?.username?.split('@')[1]} />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Printer className="text-blue-600" size={24} />
                <h1 className="text-xl font-bold text-gray-900">Print Cloud</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.name}</span>
                <span className="ml-2 text-gray-400">{user?.username}</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-[calc(100vh-64px)] border-r">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id as ActiveSection)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>

      {/* AI Assistant - Always available */}
      <AIAssistant 
        userId={user?.localAccountId} 
        department={user?.username?.split('@')[1]}
      />
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState({
    totalPrinters: 0,
    activePrinters: 0,
    totalUsers: 0,
    totalJobs: 0,
    totalCost: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [printersResponse, usersResponse] = await Promise.all([
        apiClient.getPrinters(),
        apiClient.getUsers()
      ]);

      const printers = (printersResponse as any).printers || [];
      const users = (usersResponse as any).users || [];

      setStats({
        totalPrinters: printers.length,
        activePrinters: printers.filter((p: any) => p.status === 'ACTIVE').length,
        totalUsers: users.length,
        totalJobs: users.reduce((sum: number, user: any) => sum + (user.printJobsCount || 0), 0),
        totalCost: users.reduce((sum: number, user: any) => sum + (user.totalCost || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Impressoras Ativas',
      value: loading ? '...' : `${stats.activePrinters}`,
      description: `${stats.totalPrinters - stats.activePrinters} em manutenção/erro`,
      icon: Printer,
      color: 'text-blue-600',
    },
    {
      title: 'Usuários Ativos',
      value: loading ? '...' : `${stats.totalUsers}`,
      description: 'Total de usuários',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Impressões do Mês',
      value: loading ? '...' : `${stats.totalJobs.toLocaleString()}`,
      description: 'Total de jobs processados',
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      title: 'Custo Mensal',
      value: loading ? '...' : `R$ ${stats.totalCost.toFixed(2)}`,
      description: 'Custo total das impressões',
      icon: DollarSign,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral do sistema de impressão</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nova impressora adicionada</p>
                  <p className="text-xs text-gray-500">HP LaserJet Pro - Há 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Usuário cadastrado</p>
                  <p className="text-xs text-gray-500">João Silva - Há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Impressora em manutenção</p>
                  <p className="text-xs text-gray-500">Canon ImageRunner - Há 1 hora</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Monitoramento em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="text-green-500" size={16} />
                  <span className="text-sm">Conexão Azure AD</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Printer className="text-green-500" size={16} />
                  <span className="text-sm">Serviço de Impressão</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Ativo</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="text-green-500" size={16} />
                  <span className="text-sm">Banco de Dados</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Normal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}