import { createClient, SupabaseClient } from '@supabase/supabase-js';

type ChatResponseRow = {
  session_id: string;
  message_id: string;
  response: string;
};

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  }

  supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return supabase;
}

export async function storeResponse(
  sessionId: string,
  messageId: string,
  response: string
): Promise<void> {
  const { error } = await getSupabase()
    .from('chat_responses')
    .upsert(
      { session_id: sessionId, message_id: messageId, response },
      { onConflict: 'session_id,message_id' }
    );

  if (error) throw new Error(`Erro ao salvar resposta: ${error.message}`);
}

export async function getAndRemoveResponse(
  sessionId: string,
  messageId: string
): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from('chat_responses')
    .delete()
    .eq('session_id', sessionId)
    .eq('message_id', messageId)
    .select('response')
    .maybeSingle<Pick<ChatResponseRow, 'response'>>();

  if (error) throw new Error(`Erro ao recuperar resposta: ${error.message}`);
  return data?.response ?? null;
}

export async function cleanOldResponses(): Promise<void> {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { error } = await getSupabase()
    .from('chat_responses')
    .delete()
    .lt('created_at', cutoff);

  if (error) throw new Error(`Erro ao limpar respostas: ${error.message}`);
}
