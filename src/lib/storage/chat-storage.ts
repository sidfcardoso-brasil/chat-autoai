import type { Message } from '@/lib/types/chat';

const MESSAGES_KEY_PREFIX = 'chat_messages_';

/**
 * Obtém a chave do localStorage para as mensagens de uma sessão
 */
function getMessagesKey(sessionId: string): string {
  return `${MESSAGES_KEY_PREFIX}${sessionId}`;
}

/**
 * Salva uma mensagem no localStorage
 */
export function saveMessage(sessionId: string, message: Message): void {
  if (typeof window === 'undefined') return;
  const messages = getMessages(sessionId);
  messages.push(message);
  localStorage.setItem(getMessagesKey(sessionId), JSON.stringify(messages));
}

/**
 * Recupera todas as mensagens de uma sessão do localStorage
 */
export function getMessages(sessionId: string): Message[] {
  if (typeof window === 'undefined') return [];
  const messagesData = localStorage.getItem(getMessagesKey(sessionId));
  if (!messagesData) return [];
  try {
    const messages = JSON.parse(messagesData) as Message[];
    // Converter timestamps de string para Date
    return messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch {
    return [];
  }
}

/**
 * Limpa o histórico de mensagens de uma sessão
 */
export function clearChat(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getMessagesKey(sessionId));
}

/**
 * Atualiza o status de uma mensagem
 */
export function updateMessageStatus(
  sessionId: string,
  messageId: string,
  status: Message['status']
): void {
  if (typeof window === 'undefined') return;
  const messages = getMessages(sessionId);
  const messageIndex = messages.findIndex((msg) => msg.id === messageId);
  if (messageIndex !== -1) {
    messages[messageIndex].status = status;
    localStorage.setItem(getMessagesKey(sessionId), JSON.stringify(messages));
  }
}

