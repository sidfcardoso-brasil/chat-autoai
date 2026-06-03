# Loja de Carros - Chat Automático com IA

Aplicação Next.js com interface de chat estilo WhatsApp integrada com n8n para atendimento automático de loja de carros.

## 🚀 Getting Started

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
#Nome do projeto
NEXT_PUBLIC_NAME="ShowCar"

# URL do webhook do n8n (onde enviamos mensagens)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat

# URL base da aplicação Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# URL do webhook que o n8n deve chamar (onde recebemos respostas)
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000/api/webhook/n8n
```

**Nota:** Você pode copiar o arquivo `env.example.txt` como base.

### 3. Executar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000/autochat](http://localhost:3000/autochat) no navegador.

## 📚 Documentação

- [Documentação dos Endpoints da API](./docs/API_ENDPOINTS.md)
- [Variáveis de Ambiente](./docs/ENV_VARIABLES.md)

## 🏗️ Estrutura do Projeto

- `/src/app/autochat` - Página principal do chat
- `/src/app/api/chat` - Endpoint para enviar mensagens
- `/src/app/api/webhook/n8n` - Endpoint para receber respostas do n8n
- `/src/components/chat` - Componentes do chat
- `/src/lib` - Utilitários e data access

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
