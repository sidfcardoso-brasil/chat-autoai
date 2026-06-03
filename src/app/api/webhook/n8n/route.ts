import { NextRequest, NextResponse } from 'next/server';
import { storeResponse, cleanOldResponses } from '@/lib/api/response-store';
import type { N8nWebhookPayload } from '@/lib/types/chat';

export async function POST(request: NextRequest) {
  try {
    const body: N8nWebhookPayload = await request.json();
    const { sessionId, response, messageId } = body;

    // Validação básica
    if (!sessionId || !response) {
      return NextResponse.json(
        { success: false, error: 'sessionId e response são obrigatórios' },
        { status: 400 }
      );
    }

    // Se não tiver messageId, gera um baseado no timestamp
    const finalMessageId = messageId || `msg-${Date.now()}`;

    // Armazena a resposta no store em memória
    storeResponse(sessionId, finalMessageId, response);

    // Limpa respostas antigas periodicamente
    cleanOldResponses();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook n8n:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

