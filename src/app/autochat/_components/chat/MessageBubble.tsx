"use client";

import type { Message } from "@/lib/types/chat";
import { IoMdClock, IoMdCheckmark } from "react-icons/io";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const isSending = message.status === "sending";

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 ${
          isUser
            ? "bg-[#dcf8c6] rounded-tr-none"
            : "bg-white rounded-tl-none shadow-sm"
        }`}
      >
        <p className="text-sm text-gray-800 whitespace-pre-wrap wrap-break-word">
          {message.text}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {isUser && (
            <span className="text-xs text-gray-400">
              {isSending ? (
                <IoMdClock size={14} color="#99a1af" />
              ) : (
                <IoMdCheckmark size={14} color="#99a1af" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
