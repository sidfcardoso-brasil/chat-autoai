# Variáveis de Ambiente

Este documento descreve as variáveis de ambiente necessárias para a aplicação.

## 📋 Variáveis Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
#Nome do projeto
NEXT_PUBLIC_NAME="ShowCar"

# URL do webhook do n8n para onde enviamos as mensagens do usuário
# Esta é a URL do workflow do n8n que receberá as mensagens
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/chat

# URL base da aplicação Next.js
# Usado para construir URLs completas em server actions
# Em desenvolvimento: http://localhost:3000
# Em produção: https://seu-dominio.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# URL do webhook da nossa aplicação que o n8n deve chamar
# Esta é a URL que o n8n deve usar para enviar as respostas de volta
# Em desenvolvimento: http://localhost:3000/api/webhook/n8n
# Em produção: https://seu-dominio.com/api/webhook/n8n
# NOTA: Se estiver rodando localmente, você pode precisar usar um serviço como ngrok
# para expor sua aplicação: https://seu-ngrok-url.ngrok.io/api/webhook/n8n
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000/api/webhook/n8n
```

## 🔧 Configuração

### Desenvolvimento Local

1. Copie o conteúdo acima para um arquivo `.env.local` na raiz do projeto
2. Configure `N8N_WEBHOOK_URL` com a URL do seu webhook do n8n
3. Se o n8n estiver em outro servidor, use ngrok para expor sua aplicação local:
   ```bash
   ngrok http 3000
   ```
   E use a URL do ngrok em `NEXT_PUBLIC_WEBHOOK_URL`

### Produção

1. Configure as variáveis no painel de deploy (Vercel, Netlify, etc.)
2. Use URLs HTTPS completas
3. Certifique-se de que o n8n pode acessar a URL do webhook

## 📝 Exemplo de Configuração

### Desenvolvimento

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000/api/webhook/n8n
```

### Produção

```env
N8N_WEBHOOK_URL=https://n8n.seudominio.com/webhook/chat
NEXT_PUBLIC_APP_URL=https://app.seudominio.com
NEXT_PUBLIC_WEBHOOK_URL=https://app.seudominio.com/api/webhook/n8n
```

### Com ngrok (Desenvolvimento)

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEBHOOK_URL=https://abc123.ngrok.io/api/webhook/n8n
```

## ⚠️ Importante

- Nunca commite o arquivo `.env.local` no Git
- Use `.env.local` para desenvolvimento local
- Use as variáveis de ambiente do seu provedor de hospedagem para produção
- Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente
- Variáveis sem `NEXT_PUBLIC_` são apenas do servidor
