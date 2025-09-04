'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  DollarSign,
  FileText,
  Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (quotaData: any) => void;
}

interface QuotaData {
  monthlyLimit: number;
  colorLimit: number;
  costPerPageBW: number;
  costPerPageColor: number;
  resetDate: string;
  autoApproveExcess: boolean;
  notifyAtThreshold: number;
  departmentOverride: boolean;
}

export default function UserQuotaModal({ 
  isOpen, 
  onClose, 
  user, 
  onSave 
}: UserQuotaModalProps) {
  const [saving, setSaving] = useState(false);
  const [quotaData, setQuotaData] = useState<QuotaData>({
    monthlyLimit: 1000,
    colorLimit: 100,
    costPerPageBW: 0.05,
    costPerPageColor: 0.25,
    resetDate: '1',
    autoApproveExcess: false,
    notifyAtThreshold: 80,
    departmentOverride: false
  });

  useEffect(() => {
    if (user?.printQuotas?.[0]) {
      const quota = user.printQuotas[0];
      setQuotaData({
        monthlyLimit: quota.monthlyLimit || 1000,
        colorLimit: quota.colorLimit || 100,
        costPerPageBW: quota.costPerPageBW || 0.05,
        costPerPageColor: quota.costPerPageColor || 0.25,
        resetDate: quota.resetDate || '1',
        autoApproveExcess: quota.autoApproveExcess || false,
        notifyAtThreshold: quota.notifyAtThreshold || 80,
        departmentOverride: quota.departmentOverride || false
      });
    }
  }, [user]);

  const updateQuota = (field: keyof QuotaData, value: any) => {
    setQuotaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        userId: user.id,
        ...quotaData
      });
      onClose();
    } catch (error) {
      console.error('Error saving quota:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateMonthlyCost = () => {
    return (quotaData.monthlyLimit * quotaData.costPerPageBW) + 
           (quotaData.colorLimit * quotaData.costPerPageColor);
  };

  const getCurrentUsagePercentage = () => {
    if (!user?.printQuotas?.[0]) return 0;
    const quota = user.printQuotas[0];
    return Math.round((quota.currentUsage / quotaData.monthlyLimit) * 100);
  };

  const getColorUsagePercentage = () => {
    if (!user?.printQuotas?.[0]) return 0;
    const quota = user.printQuotas[0];
    return Math.round((quota.colorUsage / quotaData.colorLimit) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Editar Cota de Impressão</h2>
              <p className="text-gray-600">{user?.name} • {user?.department}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Usage Overview */}
          {user?.printQuotas?.[0] && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {user.printQuotas[0].currentUsage || 0}
                    </p>
                    <p className="text-sm text-gray-600">Páginas P&B usadas</p>
                    <p className="text-xs text-gray-500">{getCurrentUsagePercentage()}% da cota</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {user.printQuotas[0].colorUsage || 0}
                    </p>
                    <p className="text-sm text-gray-600">Páginas coloridas</p>
                    <p className="text-xs text-gray-500">{getColorUsagePercentage()}% da cota</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(calculateMonthlyCost())}
                    </p>
                    <p className="text-sm text-gray-600">Custo mensal estimado</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quota Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Limites de Impressão</CardTitle>
                <CardDescription>Configure os limites mensais para o usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Limite Mensal P&B (páginas)
                  </label>
                  <input
                    type="number"
                    value={quotaData.monthlyLimit}
                    onChange={(e) => updateQuota('monthlyLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Limite Mensal Colorida (páginas)
                  </label>
                  <input
                    type="number"
                    value={quotaData.colorLimit}
                    onChange={(e) => updateQuota('colorLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dia de Reset da Cota
                  </label>
                  <select
                    value={quotaData.resetDate}
                    onChange={(e) => updateQuota('resetDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(28)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Dia {i + 1} do mês
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custos por Página</CardTitle>
                <CardDescription>Configure os custos específicos para este usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custo P&B (R$ por página)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quotaData.costPerPageBW}
                    onChange={(e) => updateQuota('costPerPageBW', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custo Colorida (R$ por página)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quotaData.costPerPageColor}
                    onChange={(e) => updateQuota('costPerPageColor', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Limite de Alerta (%)
                  </label>
                  <input
                    type="number"
                    value={quotaData.notifyAtThreshold}
                    onChange={(e) => updateQuota('notifyAtThreshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Notificar quando atingir este percentual da cota
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>Opções especiais de controle e aprovação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoApproveExcess"
                  checked={quotaData.autoApproveExcess}
                  onChange={(e) => updateQuota('autoApproveExcess', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoApproveExcess" className="text-sm font-medium">
                  Aprovar automaticamente impressões que excedem a cota
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="departmentOverride"
                  checked={quotaData.departmentOverride}
                  onChange={(e) => updateQuota('departmentOverride', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="departmentOverride" className="text-sm font-medium">
                  Sobrescrever configurações padrão do departamento
                </label>
              </div>

              {!quotaData.autoApproveExcess && (
                <div className="p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Aprovação Manual Necessária
                    </p>
                    <p className="text-xs text-yellow-700">
                      Impressões que excedem a cota precisarão de aprovação manual.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Projection */}
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Uso</CardTitle>
              <CardDescription>Estimativas baseadas nas configurações atuais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FileText className="mx-auto mb-2 text-gray-600" size={24} />
                  <p className="font-bold">{quotaData.monthlyLimit + quotaData.colorLimit}</p>
                  <p className="text-xs text-gray-600">Total páginas/mês</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
                  <p className="font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(calculateMonthlyCost())}
                  </p>
                  <p className="text-xs text-gray-600">Custo máximo/mês</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Calendar className="mx-auto mb-2 text-blue-600" size={24} />
                  <p className="font-bold text-blue-600">Dia {quotaData.resetDate}</p>
                  <p className="text-xs text-gray-600">Reset mensal</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
                  <p className="font-bold text-purple-600">{quotaData.notifyAtThreshold}%</p>
                  <p className="text-xs text-gray-600">Alerta em</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            As alterações entrarão em vigor imediatamente
          </div>
          <div className="flex gap-2">
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
                  Salvar Cota
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}