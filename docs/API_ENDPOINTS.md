# Documentação dos Endpoints da API

Esta documentação descreve como usar os endpoints da aplicação para integração com o n8n.

## 📋 Índice

1. [Endpoint: Enviar Mensagem para n8n](#1-endpoint-enviar-mensagem-para-n8n)
2. [Endpoint: Webhook para Receber Resposta do n8n](#2-endpoint-webhook-para-receber-resposta-do-n8n)
3. [Endpoint: Status da Resposta (Polling)](#3-endpoint-status-da-resposta-polling)
4. [Configuração do n8n](#4-configuração-do-n8n)
5. [Exemplos de Uso](#5-exemplos-de-uso)

---

## 1. Endpoint: Enviar Mensagem para n8n

**URL:** `POST /api/chat`

**Descrição:** Este endpoint recebe mensagens do frontend e as encaminha para o webhook do n8n.

### Request

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "sessionId": "string (obrigatório)",
  "message": "string (obrigatório)"
}
```

**Exemplo:**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Vocês têm algum SUV automático até 90 mil?"
}
```

### Response

**Sucesso (200):**

```json
{
  "success": true,
  "messageId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Erro (400):**

```json
{
  "success": false,
  "error": "sessionId e message são obrigatórios"
}
```

**Erro (500):**

```json
{
  "success": false,
  "error": "Erro ao comunicar com o serviço de IA"
}
```

### Fluxo

1. Frontend envia mensagem para `/api/chat`
2. Aplicação gera um `messageId` único
3. Aplicação envia para o webhook do n8n (configurado em `N8N_WEBHOOK_URL`)
4. Payload enviado ao n8n:
   ```json
   {
     "sessionId": "550e8400-e29b-41d4-a716-446655440000",
     "message": "Vocês têm algum SUV automático até 90 mil?",
     "messageId": "550e8400-e29b-41d4-a716-446655440001"
   }
   ```
5. Retorna `messageId` para o frontend

---

## 2. Endpoint: Webhook para Receber Resposta do n8n

**URL:** `POST /api/webhook/n8n`

**Descrição:** Este endpoint recebe as respostas do n8n após o processamento da mensagem. O n8n deve chamar este endpoint após consultar o Google Sheets e gerar a resposta com IA.

### Request

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "sessionId": "string (obrigatório)",
  "response": "string (obrigatório)",
  "messageId": "string (opcional)"
}
```

**Exemplo:**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Sim, temos o Creta 2020 automático por R$ 89.900. Deseja mais detalhes ou agendar uma visita?",
  "messageId": "550e8400-e29b-41d4-a716-446655440001"
}
```

### Response

**Sucesso (200):**

```json
{
  "success": true
}
```

**Erro (400):**

```json
{
  "success": false,
  "error": "sessionId e response são obrigatórios"
}
```

**Erro (500):**

```json
{
  "success": false,
  "error": "Erro ao processar webhook"
}
```

### Importante

- O `messageId` deve ser o mesmo que foi enviado pelo endpoint `/api/chat`
- Se o `messageId` não for fornecido, será gerado automaticamente
- A resposta é armazenada em memória e ficará disponível para o polling
- Respostas antigas (mais de 1 hora) são limpas automaticamente

### URL do Webhook

A URL completa do webhook deve ser configurada no n8n:

**Desenvolvimento:**

```
http://localhost:3000/api/webhook/n8n
```

**Produção:**

```
https://seu-dominio.com/api/webhook/n8n
```

**Nota:** Se estiver rodando localmente e o n8n estiver em outro servidor, você precisará usar um serviço como [ngrok](https://ngrok.com/) para expor sua aplicação:

```
https://seu-ngrok-url.ngrok.io/api/webhook/n8n
```

---

## 3. Endpoint: Status da Resposta (Polling)

**URL:** `GET /api/chat/status`

**Descrição:** Este endpoint é usado pelo frontend para fazer polling e verificar se há resposta pendente do n8n.

### Request

**Query Parameters:**

- `sessionId` (obrigatório): ID da sessão
- `lastMessageId` (obrigatório): ID da última mensagem enviada

**Exemplo:**

```
GET /api/chat/status?sessionId=550e8400-e29b-41d4-a716-446655440000&lastMessageId=550e8400-e29b-41d4-a716-446655440001
```

### Response

**Sem resposta pendente (200):**

```json
{
  "hasResponse": false
}
```

**Com resposta pendente (200):**

```json
{
  "hasResponse": true,
  "response": "Sim, temos o Creta 2020 automático por R$ 89.900. Deseja mais detalhes ou agendar uma visita?",
  "messageId": "550e8400-e29b-41d4-a716-446655440001"
}
```

### Fluxo de Polling

1. Frontend envia mensagem via `/api/chat`
2. Frontend recebe `messageId` da resposta
3. Frontend inicia polling em `/api/chat/status` a cada 2 segundos
4. Quando `hasResponse: true`, frontend exibe a mensagem e para o polling
5. A resposta é removida do store após ser recuperada

---

## 4. Configuração do n8n

### Workflow do n8n

O workflow do n8n deve seguir este fluxo:

```
1. Webhook Trigger (recebe mensagem do Next.js)
   ↓
2. Consulta Google Sheets (busca carros disponíveis)
   ↓
3. Processa com IA (OpenAI/Claude/etc)
   ↓
4. HTTP Request (envia resposta para /api/webhook/n8n)
```

### Configuração do Webhook Trigger (n8n)

1. Adicione um nó **Webhook**
2. Configure o método: **POST**
3. Copie a URL do webhook gerada
4. Configure esta URL na variável `N8N_WEBHOOK_URL` do `.env`

### Configuração do HTTP Request (n8n)

1. Adicione um nó **HTTP Request**
2. Configure:
   - **Method:** POST
   - **URL:** Use a variável de ambiente `NEXT_PUBLIC_WEBHOOK_URL` da aplicação Next.js
     - **Opção 1 (Recomendado):** Configure como variável de ambiente no n8n e use `{{ $env.NEXT_PUBLIC_WEBHOOK_URL }}`
     - **Opção 2:** Use a URL completa diretamente: `http://localhost:3000/api/webhook/n8n` (desenvolvimento) ou `https://seu-dominio.com/api/webhook/n8n` (produção)
   - **Headers:**
     ```
     Content-Type: application/json
     ```
   - **Body (JSON):**
     ```json
     {
       "sessionId": "{{ $json.sessionId }}",
       "response": "{{ $json.aiResponse }}",
       "messageId": "{{ $json.messageId }}"
     }
     ```

**Importante:** A URL do webhook deve corresponder à variável `NEXT_PUBLIC_WEBHOOK_URL` configurada no arquivo `.env.local` da aplicação Next.js.

### Exemplo de Workflow n8n (JSON)

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "chat"
      }
    },
    {
      "name": "Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "read",
        "sheetId": "SEU_SHEET_ID",
        "range": "A1:G100"
      }
    },
    {
      "name": "OpenAI",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "chat",
        "model": "gpt-4",
        "messages": [
          {
            "role": "system",
            "content": "Você é um vendedor de carros. Responda apenas com base nos dados fornecidos."
          },
          {
            "role": "user",
            "content": "{{ $json.message }}\n\nDados disponíveis:\n{{ $json.sheetData }}"
          }
        ]
      }
    },
    {
      "name": "Enviar Resposta",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $env.NEXT_PUBLIC_WEBHOOK_URL }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "sessionId",
              "value": "={{ $json.sessionId }}"
            },
            {
              "name": "response",
              "value": "={{ $json.choices[0].message.content }}"
            },
            {
              "name": "messageId",
              "value": "={{ $json.messageId }}"
            }
          ]
        }
      }
    }
  ]
}
```

---

## 5. Exemplos de Uso

### Exemplo 1: Enviar Mensagem (Frontend)

```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    message: "Vocês têm algum SUV automático até 90 mil?",
  }),
});

const data = await response.json();
console.log("MessageId:", data.messageId);
```

### Exemplo 2: Fazer Polling (Frontend)

```typescript
const checkStatus = async (sessionId: string, messageId: string) => {
  const response = await fetch(
    `/api/chat/status?sessionId=${sessionId}&lastMessageId=${messageId}`
  );
  const data = await response.json();

  if (data.hasResponse) {
    console.log("Resposta recebida:", data.response);
    return data.response;
  }

  return null;
};

// Polling a cada 2 segundos
const interval = setInterval(async () => {
  const response = await checkStatus(sessionId, messageId);
  if (response) {
    clearInterval(interval);
    // Exibir mensagem no chat
  }
}, 2000);
```

### Exemplo 3: Enviar Resposta do n8n (cURL)

```bash
curl -X POST http://localhost:3000/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "response": "Sim, temos o Creta 2020 automático por R$ 89.900.",
    "messageId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

### Exemplo 4: Testar Endpoint de Status (cURL)

```bash
curl "http://localhost:3000/api/chat/status?sessionId=550e8400-e29b-41d4-a716-446655440000&lastMessageId=550e8400-e29b-41d4-a716-446655440001"
```

---

## 🔒 Segurança

**Nota:** Em produção, considere adicionar:

1. **Autenticação:** Token de API ou webhook secret
2. **Rate Limiting:** Limitar requisições por IP/sessão
3. **Validação:** Validar formato e tamanho das mensagens
4. **HTTPS:** Sempre usar HTTPS em produção

### Exemplo de Autenticação (Opcional)

Você pode adicionar um header de autenticação:

```typescript
// No n8n HTTP Request node
Headers:
  Authorization: Bearer SEU_TOKEN_SECRET
```

E validar no endpoint:

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## 📝 Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis no arquivo `.env.local` (crie este arquivo na raiz do projeto):

```env
# URL do webhook do n8n (onde enviamos mensagens)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat

# URL base da aplicação Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# URL do webhook que o n8n deve chamar (onde recebemos respostas)
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000/api/webhook/n8n
```

**Como configurar:**

1. Copie o arquivo `env.example.txt` para `.env.local` na raiz do projeto
2. Configure `N8N_WEBHOOK_URL` com a URL do seu webhook do n8n
3. Configure `NEXT_PUBLIC_WEBHOOK_URL` com a URL que o n8n deve usar para enviar respostas
4. Reinicie o servidor Next.js após alterar as variáveis

**Nota:** O arquivo `.env.local` não deve ser commitado no Git (já está no `.gitignore`).

---

## 🐛 Troubleshooting

### Problema: Resposta não aparece no chat

**Solução:**

1. Verifique se o n8n está chamando o endpoint correto
2. Verifique se o `messageId` corresponde ao enviado
3. Verifique os logs do servidor para erros
4. Teste o endpoint de status manualmente

### Problema: n8n não recebe mensagens

**Solução:**

1. Verifique se `N8N_WEBHOOK_URL` está configurada corretamente
2. Teste o webhook do n8n manualmente com cURL
3. Verifique se o n8n está acessível da aplicação

### Problema: Erro de CORS

**Solução:**

- O Next.js já configura CORS automaticamente para rotas de API
- Se necessário, adicione headers CORS manualmente nas rotas

---

## 📚 Recursos Adicionais

- [Documentação do n8n](https://docs.n8n.io/)
- [Documentação do Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [ngrok para desenvolvimento local](https://ngrok.com/)
