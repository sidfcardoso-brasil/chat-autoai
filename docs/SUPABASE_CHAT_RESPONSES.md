# Armazenamento de respostas do chat no Supabase

A aplicação agora persiste respostas recebidas do n8n na tabela `public.chat_responses`, em vez de depender de memória do processo Next.js.

## Configuração

Configure no ambiente do servidor:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CHAT_SESSION_SECRET`
- `N8N_WEBHOOK_SECRET`

A `SUPABASE_SERVICE_ROLE_KEY` é exclusivamente server-side e não deve usar o prefixo `NEXT_PUBLIC_`.

## Banco

Execute a migration `supabase/migrations/202609130001_chat_responses.sql` no projeto Supabase.

O endpoint do webhook grava a resposta e o endpoint de status recupera e remove a resposta em uma única operação de banco, evitando que dois polls consumam a mesma resposta.
