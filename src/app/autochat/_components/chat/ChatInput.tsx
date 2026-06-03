"use client";

import { useState } from "react";
import { MdSend } from "react-icons/md";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSending?: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  isSending = false,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isSending && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite sua mensagem..."
        disabled={isSending || disabled}
        className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50 text-black"
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || isSending || disabled}
        className="rounded-full bg-green-500 p-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Enviar mensagem"
      >
        <MdSend size={18} color="#FFF" />
      </button>
    </div>
  );
}
