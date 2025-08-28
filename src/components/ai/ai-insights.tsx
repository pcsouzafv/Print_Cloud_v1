'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Leaf,
  Zap,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

interface AIInsightsProps {
  department?: string;
  userId?: string;
  period?: number;
}

interface Insight {
  type: 'positive' | 'warning' | 'suggestion';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'cost' | 'sustainability' | 'efficiency';
}

interface Recommendation {
  title: string;
  description: string;
  potentialSaving: number;
  effort: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
}

export default function AIInsights({ department, userId, period = 30 }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [potentialSavings, setPotentialSavings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cost' | 'sustainability' | 'efficiency'>('all');
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    loadInsights();
  }, [department, userId, period, selectedCategory]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Load analysis data
      const analysisParams = new URLSearchParams();
      if (department) analysisParams.append('department', department);
      if (userId) analysisParams.append('userId', userId);
      analysisParams.append('period', period.toString());

      const analysisResponse = await fetch(`/api/ai/analysis?${analysisParams}`);
      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData);

      // Load recommendations
      const recParams = new URLSearchParams();
      if (department) recParams.append('department', department);
      if (userId) recParams.append('userId', userId);
      recParams.append('type', selectedCategory === 'all' ? 'general' : selectedCategory);

      const recommendationsResponse = await fetch(`/api/ai/recommendations?${recParams}`);
      const recommendationsData = await recommendationsResponse.json();
      
      // Process insights from analysis
      const processedInsights = processAnalysisInsights(analysisData);
      setInsights(processedInsights);

      // Process recommendations
      const processedRecommendations = processRecommendations(recommendationsData.recommendations);
      setRecommendations(processedRecommendations);
      setPotentialSavings(recommendationsData.potentialSavings);

    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalysisInsights = (data: any): Insight[] => {
    const insights: Insight[] = [];

    if (data.analysis?.insights) {
      data.analysis.insights.forEach((insight: string, index: number) => {
        insights.push({
          type: 'suggestion',
          title: `Insight ${index + 1}`,
          description: insight,
          impact: 'medium',
          category: 'efficiency',
        });
      });
    }

    // Add insights based on stats
    if (data.stats) {
      const { totalCost, colorJobs, totalJobs, averageCostPerPage } = data.stats;
      
      if (colorJobs / totalJobs > 0.4) {
        insights.push({
          type: 'warning',
          title: 'Alto uso de impressão colorida',
          description: `${Math.round((colorJobs / totalJobs) * 100)}% das impressões são coloridas. Considere políticas para otimizar o uso.`,
          impact: 'high',
          category: 'cost',
        });
      }

      if (totalCost > 100) {
        insights.push({
          type: 'warning',
          title: 'Custo mensal elevado',
          description: `Custo total de R$ ${totalCost.toFixed(2)} no período. Há oportunidades de economia.`,
          impact: 'high',
          category: 'cost',
        });
      } else {
        insights.push({
          type: 'positive',
          title: 'Custo controlado',
          description: `Custo mensal de R$ ${totalCost.toFixed(2)} está dentro de parâmetros aceitáveis.`,
          impact: 'low',
          category: 'cost',
        });
      }

      if (averageCostPerPage < 0.05) {
        insights.push({
          type: 'positive',
          title: 'Eficiência de custo por página',
          description: `Custo médio de R$ ${averageCostPerPage.toFixed(3)} por página demonstra boa eficiência.`,
          impact: 'medium',
          category: 'efficiency',
        });
      }
    }

    return insights;
  };

  const processRecommendations = (rawRecommendations: string[]): Recommendation[] => {
    return rawRecommendations.map((rec, index) => ({
      title: `Recomendação ${index + 1}`,
      description: rec,
      potentialSaving: Math.random() * 50 + 10, // Mock savings for now
      effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
    }));
  };

  const getInsightIcon = (insight: Insight) => {
    switch (insight.type) {
      case 'positive':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'suggestion':
        return <Lightbulb className="text-blue-500" size={16} />;
      default:
        return <Brain className="text-gray-500" size={16} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cost':
        return <DollarSign className="text-green-600" size={16} />;
      case 'sustainability':
        return <Leaf className="text-green-600" size={16} />;
      case 'efficiency':
        return <Zap className="text-blue-600" size={16} />;
      default:
        return <Brain className="text-gray-600" size={16} />;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-bold">Insights de IA</h2>
            <p className="text-gray-600 text-sm">Análises inteligentes dos seus padrões de impressão</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadInsights}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={14} />
            ) : (
              <RefreshCw size={14} />
            )}
            <span className="ml-2">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        {[
          { id: 'all', label: 'Todos', icon: Brain },
          { id: 'cost', label: 'Custos', icon: DollarSign },
          { id: 'sustainability', label: 'Sustentabilidade', icon: Leaf },
          { id: 'efficiency', label: 'Eficiência', icon: Zap },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={selectedCategory === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(id as any)}
          >
            <Icon size={14} className="mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
          <p className="text-gray-600">Analisando padrões com IA...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="text-yellow-500" size={20} />
                <span>Insights Descobertos</span>
              </CardTitle>
              <CardDescription>
                Padrões e oportunidades identificadas pela IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredInsights.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum insight disponível para os filtros selecionados.</p>
              ) : (
                filteredInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    {getInsightIcon(insight)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        {getCategoryIcon(insight.category)}
                      </div>
                      <p className="text-gray-600 text-xs">{insight.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.impact}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-green-500" size={20} />
                  <span>Recomendações</span>
                </div>
                {potentialSavings && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      R$ {potentialSavings.totalPotential?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-gray-500">economia potencial</div>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Ações recomendadas para otimização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-gray-500 text-sm">Carregando recomendações...</p>
              ) : (
                recommendations.slice(0, 5).map((rec, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getEffortColor(rec.effort)}`}>
                          {rec.effort}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            R$ {rec.potentialSaving.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">economia</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs mb-2">{rec.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <ChevronRight size={12} />
                      Ver detalhes
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Insights</p>
                  <p className="text-2xl font-bold">{insights.length}</p>
                </div>
                <Brain className="text-blue-500" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recomendações</p>
                  <p className="text-2xl font-bold">{recommendations.length}</p>
                </div>
                <Lightbulb className="text-yellow-500" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Economia Potencial</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {potentialSavings?.totalPotential?.toFixed(0) || '0'}
                  </p>
                </div>
                <TrendingDown className="text-green-500" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Período Analisado</p>
                  <p className="text-2xl font-bold">{period} dias</p>
                </div>
                <RefreshCw className="text-gray-500" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}