# Deploy com Supabase

1. Crie a tabela executando `supabase/migrations/202609130001_chat_responses.sql`.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` no ambiente da aplicação.
3. Configure `SUPABASE_SERVICE_ROLE_KEY` somente no ambiente server-side.
4. Configure `CHAT_SESSION_SECRET` com pelo menos 32 caracteres.
5. Configure `N8N_WEBHOOK_SECRET` com o mesmo segredo usado no n8n.
6. Publique a branch após validar o build.
