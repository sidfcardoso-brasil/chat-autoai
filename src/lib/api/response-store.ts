/**
 * Store em memória para armazenar respostas pendentes do n8n
 * Key: `${sessionId}-${messageId}`
 * Value: resposta do n8n
 */
const responseStore = new Map<string, { response: string; timestamp: Date }>();

/**
 * Armazena uma resposta do n8n
 */
export function storeResponse(sessionId: string, messageId: string, response: string): void {
  const key = `${sessionId}-${messageId}`;
  responseStore.set(key, {
    response,
    timestamp: new Date(),
  });
}

/**
 * Recupera e remove uma resposta do store
 */
export function getAndRemoveResponse(
  sessionId: string,
  messageId: string
): string | null {
  const key = `${sessionId}-${messageId}`;
  const stored = responseStore.get(key);
  if (stored) {
    responseStore.delete(key);
    return stored.response;
  }
  return null;
}

/**
 * Verifica se existe resposta pendente
 */
export function hasResponse(sessionId: string, messageId: string): boolean {
  const key = `${sessionId}-${messageId}`;
  return responseStore.has(key);
}

/**
 * Limpa respostas antigas (mais de 1 hora)
 */
export function cleanOldResponses(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, value] of responseStore.entries()) {
    if (value.timestamp.getTime() < oneHourAgo) {
      responseStore.delete(key);
    }
  }
}

