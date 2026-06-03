"use client";

import { useState } from "react";
import { generateSessionId, saveSession } from "@/lib/storage/session";
import { FaWhatsapp } from "react-icons/fa";
import { extractNumbers, formatPhone, PHONE_CONFIG } from "@/utils/formater";

interface WelcomeFormProps {
  onSessionStart: (sessionId: string, name: string, phone: string) => void;
}

export default function WelcomeForm({ onSessionStart }: WelcomeFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação básica
    if (!name.trim()) {
      setError("Por favor, informe seu nome");
      return;
    }

    // Validação de telefone completo (11 dígitos: DDD + 9 dígitos)
    const phoneNumbers = extractNumbers(phone);
    if (phoneNumbers.length < PHONE_CONFIG.MAX_LENGTH) {
      setError("Por favor, informe um telefone completo (DDD + número)");
      return;
    }

    setIsSubmitting(true);

    // Gera sessionId e salva sessão
    const sessionId = generateSessionId();
    saveSession(sessionId, name.trim(), phoneNumbers.trim());

    // Chama callback para iniciar chat
    setTimeout(() => {
      onSessionStart(sessionId, name.trim(), phoneNumbers.trim());
      setIsSubmitting(false);
    }, 100);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e5ddd5] p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold text-gray-800">
          Fale com nossa equipe
        </h1>
        <div className="flex items-center gap-1 mb-6">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-gray-600">Lucas está online</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 text-black"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 text-black"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Iniciando..."
            ) : (
              <>
                Iniciar Conversa <FaWhatsapp size={20} color="#FFF" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
