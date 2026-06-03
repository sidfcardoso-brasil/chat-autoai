"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/storage/session";
import WelcomeForm from "./_components/chat/WelcomeForm";
import ChatInterface from "./_components/chat/ChatInterface";

export default function AutoChatPage() {
  const [session, setSession] = useState<{
    sessionId: string;
    name: string;
    phone: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = getSession();
    if (savedSession) {
      setSession({
        sessionId: savedSession.sessionId,
        name: savedSession.name,
        phone: savedSession.phone,
      });
    }
    setIsLoading(false);
  }, []);

  const handleSessionStart = (
    sessionId: string,
    name: string,
    phone: string
  ) => {
    setSession({ sessionId, name, phone });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e5ddd5]">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return <WelcomeForm onSessionStart={handleSessionStart} />;
  }

  return (
    <ChatInterface
      sessionId={session.sessionId}
      name={session.name}
      phone={session.phone}
    />
  );
}
