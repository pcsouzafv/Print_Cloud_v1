'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Network,
  DollarSign,
  Users,
  Printer,
  Shield,
  Bell,
  Database,
  Globe,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface SettingsData {
  general: {
    companyName: string;
    defaultPrinterQuota: number;
    costPerPageBW: number;
    costPerPageColor: number;
    currency: string;
  };
  network: {
    defaultNetworkRange: string;
    scanTimeout: number;
    autoDiscovery: boolean;
    snmpCommunity: string;
  };
  departments: string[];
  notifications: {
    quotaWarningEnabled: boolean;
    quotaWarningThreshold: number;
    maintenanceAlerts: boolean;
    emailNotifications: boolean;
    adminEmail: string;
  };
  security: {
    userAuthRequired: boolean;
    departmentRestrictions: boolean;
    auditLogging: boolean;
    dataRetentionDays: number;
  };
  system: {
    backupEnabled: boolean;
    backupFrequency: string;
    logLevel: string;
    maxConcurrentJobs: number;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      companyName: 'Print Cloud Company',
      defaultPrinterQuota: 1000,
      costPerPageBW: 0.05,
      costPerPageColor: 0.25,
      currency: 'BRL'
    },
    network: {
      defaultNetworkRange: '192.168.1.1-254',
      scanTimeout: 30,
      autoDiscovery: true,
      snmpCommunity: 'public'
    },
    departments: ['Marketing', 'Vendas', 'RH', 'Financeiro', 'TI', 'Geral'],
    notifications: {
      quotaWarningEnabled: true,
      quotaWarningThreshold: 80,
      maintenanceAlerts: true,
      emailNotifications: true,
      adminEmail: 'admin@empresa.com'
    },
    security: {
      userAuthRequired: true,
      departmentRestrictions: true,
      auditLogging: true,
      dataRetentionDays: 90
    },
    system: {
      backupEnabled: true,
      backupFrequency: 'daily',
      logLevel: 'INFO',
      maxConcurrentJobs: 50
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSettings();
      setSettings(response as SettingsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiClient.updateSettings(settings);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addDepartment = () => {
    const name = prompt('Nome do novo departamento:');
    if (name && !settings.departments.includes(name)) {
      setSettings(prev => ({
        ...prev,
        departments: [...prev.departments, name]
      }));
    }
  };

  const removeDepartment = (dept: string) => {
    if (confirm(`Remover departamento "${dept}"?`)) {
      setSettings(prev => ({
        ...prev,
        departments: prev.departments.filter(d => d !== dept)
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'Geral', icon: SettingsIcon },
    { id: 'network', name: 'Rede', icon: Network },
    { id: 'departments', name: 'Departamentos', icon: Users },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'system', name: 'Sistema', icon: Database }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações globais do Print Cloud</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="flex items-center gap-2">
          {saving ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configurações básicas da empresa e custos de impressão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
                  <input
                    type="text"
                    value={settings.general.companyName}
                    onChange={(e) => updateSettings('general', 'companyName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cota Padrão Mensal (páginas)</label>
                    <input
                      type="number"
                      value={settings.general.defaultPrinterQuota}
                      onChange={(e) => updateSettings('general', 'defaultPrinterQuota', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Moeda</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => updateSettings('general', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="BRL">Real (BRL)</option>
                      <option value="USD">Dólar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Custo por Página P&B (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.general.costPerPageBW}
                      onChange={(e) => updateSettings('general', 'costPerPageBW', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Custo por Página Colorida (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.general.costPerPageColor}
                      onChange={(e) => updateSettings('general', 'costPerPageColor', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'network' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Rede</CardTitle>
                <CardDescription>Configurações para descoberta automática de impressoras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Faixa de Rede Padrão</label>
                  <input
                    type="text"
                    value={settings.network.defaultNetworkRange}
                    onChange={(e) => updateSettings('network', 'defaultNetworkRange', e.target.value)}
                    placeholder="192.168.1.1-254"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Formato: IP_INICIAL-FINAL (ex: 192.168.1.1-254)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeout de Scan (segundos)</label>
                    <input
                      type="number"
                      value={settings.network.scanTimeout}
                      onChange={(e) => updateSettings('network', 'scanTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Comunidade SNMP</label>
                    <input
                      type="text"
                      value={settings.network.snmpCommunity}
                      onChange={(e) => updateSettings('network', 'snmpCommunity', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoDiscovery"
                    checked={settings.network.autoDiscovery}
                    onChange={(e) => updateSettings('network', 'autoDiscovery', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoDiscovery" className="text-sm font-medium">
                    Descoberta Automática de Impressoras
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'departments' && (
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Departamentos</CardTitle>
                <CardDescription>Gerencie os departamentos da empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Departamentos Cadastrados</h3>
                    <Button onClick={addDepartment} size="sm">
                      <Users size={16} className="mr-2" />
                      Adicionar Departamento
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {settings.departments.map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>{dept}</span>
                        {dept !== 'Geral' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeDepartment(dept)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>Configure alertas e notificações do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="quotaWarning"
                      checked={settings.notifications.quotaWarningEnabled}
                      onChange={(e) => updateSettings('notifications', 'quotaWarningEnabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="quotaWarning" className="text-sm font-medium">
                      Alertas de Cota de Impressão
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Limite de Alerta de Cota (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.notifications.quotaWarningThreshold}
                      onChange={(e) => updateSettings('notifications', 'quotaWarningThreshold', parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="maintenanceAlerts"
                      checked={settings.notifications.maintenanceAlerts}
                      onChange={(e) => updateSettings('notifications', 'maintenanceAlerts', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="maintenanceAlerts" className="text-sm font-medium">
                      Alertas de Manutenção
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSettings('notifications', 'emailNotifications', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="emailNotifications" className="text-sm font-medium">
                      Notificações por Email
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email do Administrador</label>
                    <input
                      type="email"
                      value={settings.notifications.adminEmail}
                      onChange={(e) => updateSettings('notifications', 'adminEmail', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>Configurações de autenticação e auditoria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="userAuth"
                      checked={settings.security.userAuthRequired}
                      onChange={(e) => updateSettings('security', 'userAuthRequired', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="userAuth" className="text-sm font-medium">
                      Autenticação de Usuário Obrigatória
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="deptRestrictions"
                      checked={settings.security.departmentRestrictions}
                      onChange={(e) => updateSettings('security', 'departmentRestrictions', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="deptRestrictions" className="text-sm font-medium">
                      Restrições por Departamento
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="auditLogging"
                      checked={settings.security.auditLogging}
                      onChange={(e) => updateSettings('security', 'auditLogging', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="auditLogging" className="text-sm font-medium">
                      Log de Auditoria
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Retenção de Dados (dias)</label>
                    <input
                      type="number"
                      min="1"
                      value={settings.security.dataRetentionDays}
                      onChange={(e) => updateSettings('security', 'dataRetentionDays', parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Configurações avançadas de sistema e performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="backupEnabled"
                      checked={settings.system.backupEnabled}
                      onChange={(e) => updateSettings('system', 'backupEnabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="backupEnabled" className="text-sm font-medium">
                      Backup Automático Habilitado
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Frequência de Backup</label>
                    <select
                      value={settings.system.backupFrequency}
                      onChange={(e) => updateSettings('system', 'backupFrequency', e.target.value)}
                      className="w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nível de Log</label>
                    <select
                      value={settings.system.logLevel}
                      onChange={(e) => updateSettings('system', 'logLevel', e.target.value)}
                      className="w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ERROR">Apenas Erros</option>
                      <option value="WARN">Avisos</option>
                      <option value="INFO">Informações</option>
                      <option value="DEBUG">Debug</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Máximo de Jobs Simultâneos</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={settings.system.maxConcurrentJobs}
                      onChange={(e) => updateSettings('system', 'maxConcurrentJobs', parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}