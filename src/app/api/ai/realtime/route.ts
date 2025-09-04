import { NextRequest } from 'next/server';
import { PrintCloudRealtimeAI } from '@/lib/azure-ai-realtime';

export const dynamic = 'force-dynamic';

// Instância global do agente IA
let aiAgent: PrintCloudRealtimeAI | null = null;

// Inicializar agente se necessário
function getAIAgent(): PrintCloudRealtimeAI {
  if (!aiAgent) {
    aiAgent = new PrintCloudRealtimeAI();
  }
  return aiAgent;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, options = {} } = await request.json();
    
    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    const agent = getAIAgent();
    
    // Criar stream de resposta
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream da resposta da IA
          for await (const response of agent.streamChat(message, context, options)) {
            const data = JSON.stringify({
              content: response.content,
              isComplete: response.isComplete,
              metadata: response.metadata
            }) + '\n';
            
            controller.enqueue(encoder.encode(data));
            
            if (response.isComplete) {
              break;
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(JSON.stringify({
            content: 'Erro no processamento. Tente novamente.',
            isComplete: true,
            error: error instanceof Error ? error.message : 'Unknown error'
          }) + '\n'));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Realtime AI error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Endpoint para obter status do agente
export async function GET(request: NextRequest) {
  try {
    const agent = getAIAgent();
    const status = agent.getStatus();
    
    return new Response(JSON.stringify({
      status: 'ok',
      agent: status,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Status check error:', error);
    return new Response(
      JSON.stringify({ error: 'Status check failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Endpoint para limpar conversa
export async function DELETE(request: NextRequest) {
  try {
    const agent = getAIAgent();
    agent.clearConversation();
    
    return new Response(JSON.stringify({
      message: 'Conversation cleared',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to clear conversation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}