'use server';

import type { SendMessageRequest, SendMessageResponse } from '@/lib/types/chat';

/**
 * Server action para enviar mensagem ao n8n
 * Esta função será chamada pelo cliente e fará a requisição para a API
 */
export async function sendMessageAction(
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      return {
        success: false,
        error: error.error || 'Erro ao enviar mensagem',
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar mensagem',
    };
  }
}

