# AI Chat Persona

Chat widget com IA que permite visitantes interagirem com o "Rani" — versão digital do Ranielli.

## Stack

- **API**: Next.js API Route (`/api/chat`) com provider chain (Gemini → OpenRouter → fallback)
- **State**: Zustand store (`useChat`) com streaming SSE
- **UI**: FAB flutuante + painel de chat com Framer Motion
- **i18n**: Suporte a pt, en, es via `next-intl`

## Variáveis de Ambiente

```bash
GEMINI_API_KEY=your-gemini-api-key-here        # Provider primário
OPENROUTER_API_KEY=your-openrouter-api-key-here  # Fallback
GROQ_API_KEY=your-groq-api-key-here            # Fallback adicional
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-rest-token-here
```

- Gemini: https://aistudio.google.com/apikey
- OpenRouter: https://openrouter.ai/keys
- Upstash Redis REST: https://upstash.com/docs/redis/features/restapi

## Arquitetura

```
src/app/api/chat/route.ts             # API route (POST, streaming SSE)
src/shared/store/use-chat/            # Zustand store + tipos
src/shared/components/ui/chat-widget/ # Componente do widget
```

### Provider Chain

```
Gemini (gemini-2.5-flash-lite) → OpenRouter (gemma-3-4b-it:free) → Groq (llama-3.1-8b-instant) → Fallback estático
```

Se o Gemini falhar (sem key, API down, erro), tenta OpenRouter automaticamente.
Se o OpenRouter falhar, tenta Groq.
Se todos falharem, retorna uma mensagem estática com links de contato (LinkedIn, GitHub).

## Funcionalidades

- Streaming de respostas em tempo real
- System prompt com contexto completo da persona (por locale)
- Rate limiting persistente via Upstash Redis REST, com fallback local in-memory (~20 req/min)
- Sugestões de perguntas iniciais
- Validação Zod na request
- Markdown rendering (**bold**, [links](url))
- Dark/light mode
- Responsivo (mobile-first)
- Acessibilidade (ARIA, keyboard nav)

## Limites Free Tier

| Provider | Limite | Modelo |
|----------|--------|--------|
| Gemini | ~1500 req/dia | gemini-2.5-flash-lite |
| OpenRouter | Variável (rate-limited) | gemma-3-4b-it:free |
