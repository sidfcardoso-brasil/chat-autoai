import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "chat_session";
const SESSION_ID_KEY = "chat_session_id";

export interface SessionData {
  sessionId: string;
  name: string;
  phone: string;
  createdAt: string;
}

/**
 * Gera um sessionId único baseado em nome, telefone e timestamp
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Recupera o sessionId do localStorage
 */
export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_ID_KEY);
}

/**
 * Recupera os dados completos da sessão do localStorage
 */
export function getSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  try {
    return JSON.parse(sessionData) as SessionData;
  } catch {
    return null;
  }
}

/**
 * Salva a sessão no localStorage
 */
export function saveSession(
  sessionId: string,
  name: string,
  phone: string
): void {
  if (typeof window === "undefined") return;
  const sessionData: SessionData = {
    sessionId,
    name,
    phone,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  localStorage.setItem(SESSION_ID_KEY, sessionId);
}

/**
 * Limpa a sessão do localStorage
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_ID_KEY);
}
