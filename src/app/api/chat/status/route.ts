import { NextRequest, NextResponse } from 'next/server';
import { getAndRemoveResponse, hasResponse } from '@/lib/api/response-store';
import type { ChatStatusResponse } from '@/lib/types/chat';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const lastMessageId = searchParams.get('lastMessageId');

    if (!sessionId || !lastMessageId) {
      return NextResponse.json<ChatStatusResponse>(
        {
          hasResponse: false,
        },
        { status: 200 }
      );
    }

    // Verifica se existe resposta pendente
    if (hasResponse(sessionId, lastMessageId)) {
      const response = getAndRemoveResponse(sessionId, lastMessageId);
      return NextResponse.json<ChatStatusResponse>({
        hasResponse: true,
        response: response || '',
        messageId: lastMessageId,
      });
    }

    return NextResponse.json<ChatStatusResponse>({
      hasResponse: false,
    });
  } catch (error) {
    console.error('Erro no endpoint /api/chat/status:', error);
    return NextResponse.json<ChatStatusResponse>(
      {
        hasResponse: false,
      },
      { status: 500 }
    );
  }
}

