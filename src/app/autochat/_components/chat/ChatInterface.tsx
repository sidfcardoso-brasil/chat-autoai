"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Message } from "@/lib/types/chat";
import {
  getMessages,
  saveMessage,
  updateMessageStatus,
} from "@/lib/storage/chat-storage";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

interface ChatInterfaceProps {
  sessionId: string;
  name: string;
  phone: string;
}

export default function ChatInterface({
  sessionId,
  name,
  phone,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    const storedMessages = getMessages(sessionId);
    setMessages(storedMessages);
  }, [sessionId]);

  useLayoutEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      isInitialLoad.current = false;
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const localMessageId = `msg-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)}`;

      const userMessage: Message = {
        id: localMessageId,
        text: messageText,
        sender: "user",
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, userMessage]);
      saveMessage(sessionId, userMessage);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message: messageText,
          phone: phone,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      const data = await response.json();
      const apiMessageId = data.messageId || localMessageId;

      updateMessageStatus(sessionId, localMessageId, "sent");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === localMessageId ? { ...msg, status: "sent" } : msg
        )
      );

      setPendingMessageId(apiMessageId);

      return apiMessageId;
    },
    onError: (error) => {
      console.error("Erro ao enviar mensagem:", error);
      // Atualiza status para erro na última mensagem do usuário
      setMessages((prev) => {
        const lastUserMessage = [...prev]
          .reverse()
          .find((msg) => msg.sender === "user");
        if (lastUserMessage) {
          updateMessageStatus(sessionId, lastUserMessage.id, "error");
          return prev.map((msg) =>
            msg.id === lastUserMessage.id ? { ...msg, status: "error" } : msg
          );
        }
        return prev;
      });
      setPendingMessageId(null);
    },
  });

  const { data: statusData } = useQuery({
    queryKey: ["chat-status", sessionId, pendingMessageId],
    queryFn: async () => {
      if (!pendingMessageId) return null;
      const response = await fetch(
        `/api/chat/status?sessionId=${sessionId}&lastMessageId=${pendingMessageId}`
      );

      console.log("RESPONSE: ", response);

      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!pendingMessageId && sendMessageMutation.isSuccess,
    refetchInterval: (query) => {
      // Para de fazer polling se já recebeu resposta
      const data = query.state.data;
      if (data?.hasResponse) {
        return false;
      }
      return 2000; // Polling a cada 2 segundos
    },
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (statusData?.hasResponse && statusData.response) {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        text: statusData.response,
        sender: "assistant",
        timestamp: new Date(),
        status: "delivered",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      saveMessage(sessionId, assistantMessage);

      // Limpa o messageId pendente
      setPendingMessageId(null);
    }
  }, [statusData, sessionId]);

  const handleSendMessage = (messageText: string) => {
    sendMessageMutation.mutate(messageText);
  };

  return (
    <div className="flex h-dvh flex-col bg-[#e5ddd5]">
      {/* Header */}
      <div className="bg-[#075e54] px-4 py-3 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar do atendente */}
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
                <Image
                  src="https://ui-avatars.com/api/?name=ShowCar&background=25D366&color=fff&size=128&bold=true"
                  alt="Atendente ShowCar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  unoptimized
                />
              </div>
            </div>

            <div>
              <h1 className="text-lg font-semibold">
                {process.env.NEXT_PUBLIC_NAME ?? ""} – Atendimento exclusivo
              </h1>
              <div className="flex items-center gap-2 text-xs text-green-200">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="mb-2 text-lg font-medium">Olá, {name}! 👋</p>
              <p className="text-sm">Como posso ajudá-lo hoje?</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isSending={sendMessageMutation.isPending}
      />
    </div>
  );
}
