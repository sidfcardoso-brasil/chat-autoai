export type MessageSender = "user" | "assistant";

export type MessageStatus = "sending" | "sent" | "delivered" | "error";

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  status: MessageStatus;
}

export interface ChatSession {
  sessionId: string;
  name: string;
  phone: string;
  messages: Message[];
  createdAt: Date;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  phone: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface N8nWebhookPayload {
  sessionId: string;
  response: string;
  messageId?: string;
}

export interface ChatStatusResponse {
  hasResponse: boolean;
  response?: string;
  messageId?: string;
}
