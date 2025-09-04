'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Send,
  Bot,
  User,
  Loader2,
  Zap,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: any;
}

interface RealtimeChatProps {
  userId?: string;
  department?: string;
  onActionRequired?: (action: string, data: any) => void;
}

export default function RealtimeChat({ userId, department, onActionRequired }: RealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content: '🤖 Print Cloud AI está online! Como posso ajudá-lo a otimizar seu ambiente de impressão hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Simular conexão com Azure AI
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);

    // Preparar mensagem do assistente para streaming
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Simular contexto do usuário
      const context = {
        userId: userId || 'demo-user',
        department: department || 'TI',
        recentPrintJobs: generateMockJobs(),
        printerStatus: generateMockPrinters(),
        costData: generateMockCosts(),
        systemMetrics: {}
      };

      // Chamada real para API de streaming
      const response = await fetch('/api/ai/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context,
          options: { stream: true }
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o assistente');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { 
                        ...msg, 
                        content: data.content,
                        isStreaming: !data.isComplete,
                        metadata: data.metadata 
                      }
                    : msg
                ));

                if (data.isComplete) {
                  break;
                }
              } catch (parseError) {
                console.error('Error parsing streaming data:', parseError);
              }
            }
          }
        } catch (streamError) {
          console.error('Streaming error:', streamError);
        } finally {
          reader.releaseLock();
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessage.id
          ? {
              ...msg,
              content: '❌ Erro ao processar sua solicitação. Tente novamente.',
              isStreaming: false
            }
          : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const simulateAIStreaming = async (
    message: string, 
    context: any, 
    onChunk: (chunk: string, isComplete: boolean, metadata?: any) => void
  ) => {
    const responses = getContextualResponse(message, context);
    
    for (let i = 0; i < responses.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      onChunk(responses[i], i === responses.length - 1);
    }
  };

  const getContextualResponse = (message: string, context: any): string[] => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('custo') || lowerMessage.includes('economia')) {
      return [
        '📊 Analisando seus custos de impressão...\n\n',
        '**Análise de Custos (últimos 30 dias):**\n',
        `• Total gasto: R$ ${(Math.random() * 500 + 200).toFixed(2)}\n`,
        `• Impressão colorida: ${(Math.random() * 40 + 20).toFixed(0)}% do total\n`,
        `• Custo por página: R$ ${(Math.random() * 0.1 + 0.05).toFixed(3)}\n\n`,
        '🎯 **Recomendações de Economia:**\n',
        '• Configurar duplex como padrão (-30% papel)\n',
        '• Revisar política de impressão colorida\n',
        '• Implementar cotas por usuário\n\n',
        `💰 **Economia potencial:** R$ ${(Math.random() * 100 + 50).toFixed(2)}/mês`
      ];
    }

    if (lowerMessage.includes('impressora') || lowerMessage.includes('printer')) {
      return [
        '🖨️ Verificando status das impressoras...\n\n',
        '**Status Atual:**\n',
        '• HP LaserJet Pro: ✅ Online (85% utilização)\n',
        '• Canon ImageRunner: ⚠️ Toner baixo (60% utilização)\n',
        '• Epson EcoTank: ✅ Online (45% utilização)\n\n',
        '⚡ **Otimizações Sugeridas:**\n',
        '• Redistribuir carga da HP LaserJet\n',
        '• Agendar troca de toner da Canon\n',
        '• Considerar consolidação de equipamentos'
      ];
    }

    if (lowerMessage.includes('sustentabilidade') || lowerMessage.includes('ambiente')) {
      return [
        '🌱 Calculando impacto ambiental...\n\n',
        '**Métricas de Sustentabilidade:**\n',
        `• Páginas impressas: ${(Math.random() * 2000 + 1000).toFixed(0)} (último mês)\n`,
        `• Equivalente em árvores: ${(Math.random() * 0.5 + 0.1).toFixed(2)} árvores\n`,
        `• Pegada de carbono: ${(Math.random() * 10 + 5).toFixed(1)} kg CO₂\n\n`,
        '♻️ **Iniciativas Recomendadas:**\n',
        '• Impressão duplex automática\n',
        '• Política de revisão digital\n',
        '• Meta: -25% redução mensal\n\n',
        '📈 **Impacto projetado:** 40% menos papel, 30% menos energia'
      ];
    }

    if (lowerMessage.includes('usuário') || lowerMessage.includes('cota')) {
      return [
        '👥 Analisando padrões de usuário...\n\n',
        '**Top Usuários (volume):**\n',
        '• João Silva (Marketing): 245 páginas\n',
        '• Ana Costa (Vendas): 198 páginas\n',
        '• Carlos Lima (Financeiro): 156 páginas\n\n',
        '⚙️ **Recomendações de Cota:**\n',
        '• Marketing: 200 pág/mês (atual: ilimitado)\n',
        '• Vendas: 150 pág/mês + 20 coloridas\n',
        '• Financeiro: 100 pág/mês\n\n',
        '🎯 **Economia estimada:** R$ 180/mês com cotas otimizadas'
      ];
    }

    // Resposta padrão
    return [
      '🤖 Entendi sua solicitação! ',
      `Baseado nos dados do departamento ${context.department}, `,
      'posso ajudá-lo com:\n\n',
      '📊 **Análise de Custos** - Identifique oportunidades de economia\n',
      '🖨️ **Otimização de Impressoras** - Balanceamento e eficiência\n',
      '👥 **Gestão de Usuários** - Cotas e controle de acesso\n',
      '🌱 **Relatórios de Sustentabilidade** - Impacto ambiental\n',
      '⚡ **Manutenção Preditiva** - Previna problemas\n\n',
      'O que gostaria de explorar primeiro?'
    ];
  };

  const generateMockJobs = () => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: `job-${i}`,
      userId: userId,
      pages: Math.floor(Math.random() * 10) + 1,
      copies: Math.floor(Math.random() * 3) + 1,
      isColor: Math.random() > 0.7,
      cost: Math.random() * 5 + 1
    }));
  };

  const generateMockPrinters = () => {
    return [
      { printerId: '1', name: 'HP LaserJet Pro', utilization: 85 },
      { printerId: '2', name: 'Canon ImageRunner', utilization: 60 },
      { printerId: '3', name: 'Epson EcoTank', utilization: 45 }
    ];
  };

  const generateMockCosts = () => {
    return [
      { department: 'Marketing', totalCost: 250, colorCost: 100 },
      { department: 'Vendas', totalCost: 180, colorCost: 60 },
      { department: 'TI', totalCost: 120, colorCost: 30 }
    ];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'connecting':
        return <Clock className="text-yellow-500" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={16} />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Azure AI Online';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Erro de Conexão';
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="text-blue-600" size={20} />
            <span>Print Cloud AI - Tempo Real</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {getStatusIcon()}
            <span className="text-gray-600">{getStatusText()}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.role === 'system'
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500 text-white'
                }`}>
                  {message.role === 'user' ? (
                    <User size={16} />
                  ) : message.role === 'system' ? (
                    <Lightbulb size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>
                
                <div className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.role === 'system'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-flex ml-1">
                        <div className="animate-pulse">▊</div>
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={connectionStatus === 'connected' 
                ? "Digite sua pergunta sobre impressão, custos, otimização..." 
                : "Aguarde conexão com Azure AI..."
              }
              disabled={isStreaming || connectionStatus !== 'connected'}
              className="flex-1 resize-none border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isStreaming || connectionStatus !== 'connected'}
              className="px-4 py-2"
            >
              {isStreaming ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
          
          {connectionStatus === 'connected' && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setInputValue('Analise meus custos de impressão')}
                disabled={isStreaming}
              >
                <TrendingUp size={12} className="mr-1" />
                Analisar Custos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setInputValue('Como otimizar minhas impressoras?')}
                disabled={isStreaming}
              >
                <Zap size={12} className="mr-1" />
                Otimizar Impressoras
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setInputValue('Gerar relatório de sustentabilidade')}
                disabled={isStreaming}
              >
                <Lightbulb size={12} className="mr-1" />
                Sustentabilidade
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}