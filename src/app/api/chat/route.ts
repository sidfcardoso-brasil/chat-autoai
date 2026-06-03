import type { SendMessageRequest, SendMessageResponse } from "@/lib/types/chat";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { sessionId, message, phone } = body;

    // Validação básica
    if (!sessionId || !message || !phone || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "sessionId e message são obrigatórios" },
        { status: 400 }
      );
    }

    const messageId = uuidv4();

    // Envia para o webhook do n8n
    if (!N8N_WEBHOOK_URL) {
      console.warn(
        "N8N_WEBHOOK_URL não configurada. Retornando resposta mock."
      );
      // Em desenvolvimento, retorna uma resposta mock
      return NextResponse.json<SendMessageResponse>({
        success: true,
        messageId,
      });
    }

    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message,
          messageId,
          phone,
        }),
      });

      if (!n8nResponse.ok) {
        console.error("Erro ao enviar para n8n:", n8nResponse.statusText);
        return NextResponse.json<SendMessageResponse>(
          {
            success: false,
            error: "Erro ao comunicar com o serviço de IA",
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Erro ao enviar para n8n:", error);
      return NextResponse.json<SendMessageResponse>(
        {
          success: false,
          error: "Erro ao comunicar com o serviço de IA",
        },
        { status: 500 }
      );
    }

    return NextResponse.json<SendMessageResponse>({
      success: true,
      messageId,
    });
  } catch (error) {
    console.error("Erro no endpoint /api/chat:", error);
    return NextResponse.json<SendMessageResponse>(
      {
        success: false,
        error: "Erro ao processar requisição",
      },
      { status: 500 }
    );
  }
}
