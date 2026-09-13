import { NextRequest, NextResponse } from 'next/server';
import { storeResponse, cleanOldResponses } from '@/lib/api/response-store';
import type { N8nWebhookPayload } from '@/lib/types/chat';
import { timingSafeEqual } from 'crypto';

function validWebhookSecret(request: NextRequest) {
  const configured = process.env.N8N_WEBHOOK_SECRET;
  if (!configured) return false;
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(token);
  const b = Buffer.from(configured);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  try {
    if (!validWebhookSecret(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body: N8nWebhookPayload = await request.json();
    const { sessionId, response, messageId } = body;

    if (!sessionId || !response || sessionId.length > 100 || response.length > 10000) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 });
    }

    if (!messageId || messageId.length > 100) {
      return NextResponse.json({ success: false, error: 'messageId é obrigatório' }, { status: 400 });
    }

    await storeResponse(sessionId, messageId, response);
    await cleanOldResponses();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook n8n:', error);
    return NextResponse.json({ success: false, error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
