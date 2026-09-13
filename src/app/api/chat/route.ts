import type { SendMessageRequest, SendMessageResponse } from "@/lib/types/chat";
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { v4 as uuidv4 } from "uuid";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const SESSION_COOKIE = "chat_session_token";
const SESSION_TTL = 24 * 60 * 60;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function getSecret() {
  const value = process.env.CHAT_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("CHAT_SESSION_SECRET deve ter pelo menos 32 caracteres");
  return value;
}

function createToken(sessionId: string, exp: number) {
  const data = `${sessionId}.${exp}`;
  const signature = createHmac("sha256", getSecret()).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function validToken(token: string | undefined, sessionId: string) {
  if (!token) return false;
  const [tokenSessionId, expText, signature] = token.split(".");
  const exp = Number(expText);
  if (!tokenSessionId || !signature || tokenSessionId !== sessionId || !Number.isSafeInteger(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", getSecret()).update(`${tokenSessionId}.${exp}`).digest("base64url");
  const a = Buffer.from(signature), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function rateLimited(key: string) {
  const now = Date.now();
  const current = rateLimit.get(key);
  if (!current || current.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 30;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { sessionId, message, phone } = body;

    if (!sessionId || !message || !phone || !message.trim()) {
      return NextResponse.json({ success: false, error: "Dados obrigatórios ausentes" }, { status: 400 });
    }
    if (sessionId.length > 100 || message.length > 4000 || phone.length > 30) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(`${ip}:${sessionId}`)) {
      return NextResponse.json({ success: false, error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 });
    }

    const existingToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (existingToken && !validToken(existingToken, sessionId)) {
      return NextResponse.json({ success: false, error: "Sessão inválida ou expirada" }, { status: 401 });
    }

    const messageId = uuidv4();
    if (!N8N_WEBHOOK_URL) {
      const response = NextResponse.json<SendMessageResponse>({ success: true, messageId });
      if (!existingToken) setSessionCookie(response, sessionId);
      return response;
    }

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.N8N_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify({ sessionId, message, messageId, phone }),
      cache: "no-store",
    });

    if (!n8nResponse.ok) {
      console.error("Erro ao enviar para n8n:", n8nResponse.status, n8nResponse.statusText);
      return NextResponse.json({ success: false, error: "Erro ao comunicar com o serviço de IA" }, { status: 502 });
    }

    const response = NextResponse.json<SendMessageResponse>({ success: true, messageId });
    if (!existingToken) setSessionCookie(response, sessionId);
    return response;
  } catch (error) {
    console.error("Erro no endpoint /api/chat:", error);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

function setSessionCookie(response: NextResponse, sessionId: string) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  response.cookies.set(SESSION_COOKIE, createToken(sessionId, exp), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}
