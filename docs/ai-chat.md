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
```

- Gemini: https://aistudio.google.com/apikey
- OpenRouter: https://openrouter.ai/keys

## Arquitetura

```
src/app/api/chat/route.ts             # API route (POST, streaming SSE)
src/shared/store/use-chat/            # Zustand store + tipos
src/shared/components/ui/chat-widget/ # Componente do widget
```

### Provider Chain

```
Gemini (gemini-2.5-flash-lite) → OpenRouter (gemma-3-4b-it:free) → Fallback estático
```

Se o Gemini falhar (sem key, API down, erro), tenta OpenRouter automaticamente.
Se ambos falharem, retorna uma mensagem estática com links de contato (LinkedIn, GitHub).

## Funcionalidades

- Streaming de respostas em tempo real
- System prompt com contexto completo da persona (por locale)
- Rate limiting básico in-memory (~20 req/min)
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
