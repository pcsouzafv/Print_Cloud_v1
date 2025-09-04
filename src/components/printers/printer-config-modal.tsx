'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Network, 
  Save, 
  X, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PrinterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  printer: any;
  onSave: (config: any) => void;
}

interface PrinterConfig {
  general: {
    name: string;
    location: string;
    department: string;
    monthlyQuota: number;
    isColorPrinter: boolean;
  };
  network: {
    ipAddress: string;
    snmpCommunity: string;
    pollInterval: number;
    timeout: number;
  };
  integration: {
    type: 'SNMP' | 'HTTP' | 'IPP' | 'WSD';
    endpoint: string;
    authType: 'NONE' | 'BASIC' | 'API_KEY';
    credentials?: {
      username?: string;
      password?: string;
      apiKey?: string;
    };
  };
  notifications: {
    lowTonerAlert: boolean;
    paperJamAlert: boolean;
    maintenanceAlert: boolean;
    quotaWarningThreshold: number;
  };
}

export default function PrinterConfigModal({ 
  isOpen, 
  onClose, 
  printer, 
  onSave 
}: PrinterConfigModalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [config, setConfig] = useState<PrinterConfig>({
    general: {
      name: printer?.name || '',
      location: printer?.location || '',
      department: printer?.department || 'Geral',
      monthlyQuota: printer?.monthlyQuota || 1000,
      isColorPrinter: printer?.isColorPrinter || false,
    },
    network: {
      ipAddress: printer?.ipAddress || '',
      snmpCommunity: 'public',
      pollInterval: 300,
      timeout: 30,
    },
    integration: {
      type: 'SNMP',
      endpoint: '',
      authType: 'NONE',
    },
    notifications: {
      lowTonerAlert: true,
      paperJamAlert: true,
      maintenanceAlert: true,
      quotaWarningThreshold: 80,
    }
  });

  useEffect(() => {
    if (printer) {
      setConfig(prev => ({
        ...prev,
        general: {
          name: printer.name || '',
          location: printer.location || '',
          department: printer.department || 'Geral',
          monthlyQuota: printer.monthlyQuota || 1000,
          isColorPrinter: printer.isColorPrinter || false,
        },
        network: {
          ...prev.network,
          ipAddress: printer.ipAddress || '',
        }
      }));
    }
  }, [printer]);

  const updateConfig = (section: keyof PrinterConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateCredentials = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      integration: {
        ...prev.integration,
        credentials: {
          ...prev.integration.credentials,
          [field]: value
        }
      }
    }));
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test based on configuration
      const success = config.network.ipAddress && 
                     config.integration.type && 
                     config.network.snmpCommunity;
      
      setTestResult({
        success: !!success,
        message: success 
          ? `Conexão estabelecida com sucesso! Impressora respondendo na ${config.network.ipAddress}`
          : 'Falha na conexão. Verifique as configurações de rede e credenciais.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão. Tente novamente.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...printer,
        ...config.general,
        ipAddress: config.network.ipAddress,
        // Additional integration config would be saved to printer_integrations table
        integrationConfig: config.integration,
        networkConfig: config.network,
        notificationConfig: config.notifications
      });
      onClose();
    } catch (error) {
      console.error('Error saving printer config:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', name: 'Geral', icon: Settings },
    { id: 'network', name: 'Rede', icon: Network },
    { id: 'integration', name: 'Integração', icon: TestTube },
    { id: 'notifications', name: 'Alertas', icon: AlertCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Configurar Impressora</h2>
            <p className="text-gray-600">{printer?.name || 'Nova Impressora'}</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X size={16} />
          </Button>
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
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações Gerais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome da Impressora</label>
                      <input
                        type="text"
                        value={config.general.name}
                        onChange={(e) => updateConfig('general', 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Nome da impressora"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Localização</label>
                      <input
                        type="text"
                        value={config.general.location}
                        onChange={(e) => updateConfig('general', 'location', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Localização da impressora"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Departamento</label>
                    <select
                      value={config.general.department}
                      onChange={(e) => updateConfig('general', 'department', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Selecionar departamento"
                    >
                      <option value="Geral">Geral</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Vendas">Vendas</option>
                      <option value="RH">RH</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="TI">TI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cota Mensal (páginas)</label>
                    <input
                      type="number"
                      value={config.general.monthlyQuota}
                      onChange={(e) => updateConfig('general', 'monthlyQuota', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Cota mensal em páginas"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isColorPrinter"
                    checked={config.general.isColorPrinter}
                    onChange={(e) => updateConfig('general', 'isColorPrinter', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isColorPrinter" className="text-sm font-medium">
                    Impressora Colorida
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Configurações de Rede</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Endereço IP</label>
                      <input
                        type="text"
                        value={config.network.ipAddress}
                        onChange={(e) => updateConfig('network', 'ipAddress', e.target.value)}
                        placeholder="192.168.1.100"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Endereço IP da impressora"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comunidade SNMP</label>
                      <input
                        type="text"
                        value={config.network.snmpCommunity}
                        onChange={(e) => updateConfig('network', 'snmpCommunity', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Comunidade SNMP"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Intervalo de Polling (seg)</label>
                    <input
                      type="number"
                      value={config.network.pollInterval}
                      onChange={(e) => updateConfig('network', 'pollInterval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Intervalo de polling em segundos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeout (seg)</label>
                    <input
                      type="number"
                      value={config.network.timeout}
                      onChange={(e) => updateConfig('network', 'timeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Timeout em segundos"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={testConnection} disabled={testing} variant="outline">
                    {testing ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <TestTube size={16} className="mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>

                  {testResult && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                      testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      {testResult.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'integration' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Configurações de Integração</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Integração</label>
                      <select
                        value={config.integration.type}
                        onChange={(e) => updateConfig('integration', 'type', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Selecionar tipo de integração"
                      >
                        <option value="SNMP">SNMP</option>
                        <option value="HTTP">HTTP API</option>
                        <option value="IPP">IPP</option>
                        <option value="WSD">Web Services Discovery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Autenticação</label>
                      <select
                        value={config.integration.authType}
                        onChange={(e) => updateConfig('integration', 'authType', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Selecionar tipo de autenticação"
                      >
                        <option value="NONE">Nenhuma</option>
                        <option value="BASIC">Básica (usuário/senha)</option>
                        <option value="API_KEY">API Key</option>
                      </select>
                    </div>
                  </div>
                </div>

                {config.integration.authType === 'BASIC' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Usuário</label>
                      <input
                        type="text"
                        value={config.integration.credentials?.username || ''}
                        onChange={(e) => updateCredentials('username', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Usuário para autenticação"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Senha</label>
                      <input
                        type="password"
                        value={config.integration.credentials?.password || ''}
                        onChange={(e) => updateCredentials('password', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Senha para autenticação"
                      />
                    </div>
                  </div>
                )}

                {config.integration.authType === 'API_KEY' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key</label>
                    <input
                      type="text"
                      value={config.integration.credentials?.apiKey || ''}
                      onChange={(e) => updateCredentials('apiKey', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      aria-label="Chave da API"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Endpoint</label>
                  <input
                    type="text"
                    value={config.integration.endpoint}
                    onChange={(e) => updateConfig('integration', 'endpoint', e.target.value)}
                    placeholder={`${config.network.ipAddress}/api/v1`}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Configurações de Alertas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="lowTonerAlert"
                        checked={config.notifications.lowTonerAlert}
                        onChange={(e) => updateConfig('notifications', 'lowTonerAlert', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="lowTonerAlert" className="text-sm font-medium">
                        Alerta de Toner Baixo
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="paperJamAlert"
                        checked={config.notifications.paperJamAlert}
                        onChange={(e) => updateConfig('notifications', 'paperJamAlert', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="paperJamAlert" className="text-sm font-medium">
                        Alerta de Atolamento de Papel
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="maintenanceAlert"
                        checked={config.notifications.maintenanceAlert}
                        onChange={(e) => updateConfig('notifications', 'maintenanceAlert', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="maintenanceAlert" className="text-sm font-medium">
                        Alerta de Manutenção
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Limite de Alerta de Cota (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={config.notifications.quotaWarningThreshold}
                        onChange={(e) => updateConfig('notifications', 'quotaWarningThreshold', parseInt(e.target.value))}
                        className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        aria-label="Limite de alerta de cota em porcentagem"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}