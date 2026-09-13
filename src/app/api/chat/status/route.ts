import { NextRequest, NextResponse } from 'next/server';
import { getAndRemoveResponse, hasResponse } from '@/lib/api/response-store';
import type { ChatStatusResponse } from '@/lib/types/chat';
import { createHmac, timingSafeEqual } from 'crypto';

const SESSION_COOKIE = 'chat_session_token';

function getSecret() {
  const value = process.env.CHAT_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('CHAT_SESSION_SECRET não configurada corretamente');
  return value;
}

function validSession(request: NextRequest, sessionId: string) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [tokenSessionId, expText, signature] = token.split('.');
  const exp = Number(expText);
  if (!tokenSessionId || !signature || tokenSessionId !== sessionId || !Number.isSafeInteger(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac('sha256', getSecret()).update(`${tokenSessionId}.${exp}`).digest('base64url');
  const a = Buffer.from(signature), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const lastMessageId = searchParams.get('lastMessageId');

    if (!sessionId || !lastMessageId) {
      return NextResponse.json<ChatStatusResponse>({ hasResponse: false }, { status: 400 });
    }

    if (!validSession(request, sessionId)) {
      return NextResponse.json({ hasResponse: false, error: 'Não autorizado' }, { status: 401 });
    }

    if (hasResponse(sessionId, lastMessageId)) {
      const response = getAndRemoveResponse(sessionId, lastMessageId);
      return NextResponse.json<ChatStatusResponse>({ hasResponse: true, response: response || '', messageId: lastMessageId });
    }

    return NextResponse.json<ChatStatusResponse>({ hasResponse: false });
  } catch (error) {
    console.error('Erro no endpoint /api/chat/status:', error);
    return NextResponse.json<ChatStatusResponse>({ hasResponse: false }, { status: 500 });
  }
}
