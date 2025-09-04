'use client';

import { useState } from 'react';
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
  CheckCircle,
  Clock,
  DollarSign,
  Lightbulb,
  Target,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Users,
  Settings,
  Zap,
  X
} from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  potentialSaving: number;
  effort: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
  onImplement?: (recommendation: Recommendation) => void;
}

export default function RecommendationDetailsModal({
  isOpen,
  onClose,
  recommendation,
  onImplement
}: RecommendationDetailsModalProps) {
  const [implementing, setImplementing] = useState(false);

  if (!recommendation) return null;

  const handleImplement = async () => {
    setImplementing(true);
    try {
      // Simulate implementation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onImplement) {
        onImplement(recommendation);
      }
      
      alert('Recomendação marcada para implementação! Acompanhe o progresso no dashboard.');
      onClose();
    } catch (error) {
      console.error('Error implementing recommendation:', error);
    } finally {
      setImplementing(false);
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getImplementationSteps = (recommendation: Recommendation): string[] => {
    // Generate contextual steps based on the recommendation content
    const content = recommendation.description.toLowerCase();
    
    if (content.includes('duplex') || content.includes('papel')) {
      return [
        'Configurar impressão duplex como padrão nos drivers',
        'Atualizar políticas de impressão no servidor',
        'Treinar usuários sobre novas configurações',
        'Monitorar economia de papel por 30 dias',
        'Ajustar configurações baseado nos resultados'
      ];
    }
    
    if (content.includes('cor') || content.includes('colorid')) {
      return [
        'Implementar política de aprovação para impressões coloridas',
        'Configurar sistema de cotas por usuário/departamento',
        'Criar workflow de solicitação de impressão colorida',
        'Treinar equipe sobre novas políticas',
        'Monitorar redução de custos mensalmente'
      ];
    }
    
    if (content.includes('cota') || content.includes('limit')) {
      return [
        'Analisar padrões de uso históricos por usuário',
        'Definir cotas personalizadas por departamento',
        'Configurar alertas de aproximação do limite',
        'Implementar sistema de aprovação para exceções',
        'Avaliar eficácia das cotas trimestralmente'
      ];
    }
    
    if (content.includes('impressora') || content.includes('utilização')) {
      return [
        'Avaliar utilização atual de cada impressora',
        'Redistribuir impressoras subutilizadas',
        'Consolidar equipamentos quando possível',
        'Otimizar localização física dos equipamentos',
        'Monitorar balanceamento de carga mensal'
      ];
    }
    
    // Generic steps
    return [
      'Avaliar impacto e viabilidade da implementação',
      'Definir cronograma e responsáveis',
      'Comunicar mudanças aos usuários afetados',
      'Implementar mudanças em fase piloto',
      'Monitorar resultados e ajustar conforme necessário'
    ];
  };

  const implementationSteps = getImplementationSteps(recommendation);
  const estimatedWeeks = recommendation.effort === 'low' ? '2-3' : recommendation.effort === 'medium' ? '4-6' : '8-12';
  const estimatedROI = recommendation.potentialSaving * 12; // Annual ROI

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getPriorityColor(recommendation.priority)}`}>
                <Lightbulb size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl">{recommendation.title}</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Detalhes e plano de implementação
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="text-green-600" size={16} />
                  <span className="text-sm font-medium">Economia Potencial</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {recommendation.potentialSaving.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">mensal</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="text-blue-600" size={16} />
                  <span className="text-sm font-medium">Tempo de Implementação</span>
                </div>
                <div className="text-2xl font-bold">{estimatedWeeks}</div>
                <div className="text-xs text-gray-500">semanas</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="text-purple-600" size={16} />
                  <span className="text-sm font-medium">ROI Anual</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  R$ {estimatedROI.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">economia/ano</div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target size={16} />
                <span>Descrição e Objetivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{recommendation.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <div className={`px-3 py-1 rounded-full text-xs border ${getEffortColor(recommendation.effort)}`}>
                  Esforço: {recommendation.effort === 'low' ? 'Baixo' : recommendation.effort === 'medium' ? 'Médio' : 'Alto'}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${getPriorityColor(recommendation.priority)}`}>
                  Prioridade: {recommendation.priority === 'high' ? 'Alta' : recommendation.priority === 'medium' ? 'Média' : 'Baixa'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings size={16} />
                <span>Plano de Implementação</span>
              </CardTitle>
              <CardDescription>
                Etapas recomendadas para implementar esta melhoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {implementationSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expected Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap size={16} />
                <span>Benefícios Esperados</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm">Redução de custos operacionais</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm">Melhoria da eficiência</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm">Redução do impacto ambiental</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm">Melhor controle de recursos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risks and Considerations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="text-yellow-500" size={16} />
                <span>Considerações e Riscos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                  <span className="text-sm text-gray-700">
                    Pode haver resistência inicial dos usuários às mudanças
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                  <span className="text-sm text-gray-700">
                    Necessário treinamento da equipe sobre novas políticas
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                  <span className="text-sm text-gray-700">
                    Resultados podem levar algumas semanas para se materializar
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button 
              onClick={handleImplement} 
              disabled={implementing}
              className="bg-green-600 hover:bg-green-700"
            >
              {implementing ? (
                <>
                  <Clock className="animate-spin mr-2" size={14} />
                  Implementando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={14} />
                  Implementar Recomendação
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}