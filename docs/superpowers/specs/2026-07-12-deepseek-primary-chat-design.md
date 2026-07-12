# DeepSeek Primary Chat Provider Design

## Goal

Make the official DeepSeek API the primary provider for the website chat while
preserving the existing Gemini, OpenRouter, Groq, and static-response fallback
chain.

## Scope

- Add a direct DeepSeek Chat Completions call using streaming SSE.
- Configure the provider through `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL`.
- Use the same normalized OpenAI-compatible stream parser used by OpenRouter
  and Groq.
- Change the provider order to DeepSeek, Gemini, OpenRouter, Groq, then static
  fallback.
- Update Sentry provider-availability telemetry, environment examples, and the
  chat architecture documentation.
- Add tests for DeepSeek key absence, request payload, timeout/error fallback,
  and route ordering.

## Non-goals

- Do not expose API keys to the browser.
- Do not change the public chat UI, request schema, persona prompts, rate-limit
  policy, or fallback message text.
- Do not remove any existing provider.

## Architecture

`callDeepSeek` lives beside the current provider calls in
`src/app/api/chat/chat.utils.ts`. It sends the system prompt as a `system`
message and conversation history as `user`/`assistant` messages to the official
`https://api.deepseek.com/chat/completions` endpoint. Because the response uses
the OpenAI Chat Completions SSE shape, the route returns it through the existing
`buildOpenRouterStream` transformer.

The route attempts DeepSeek first only when `DEEPSEEK_API_KEY` is configured.
A missing key, non-success HTTP response, or timeout returns `null`, allowing
the existing fallback chain to proceed without exposing provider errors to
visitors. The default model is `deepseek-chat`; deployment can select another
compatible chat model through `DEEPSEEK_MODEL`.

## Verification

1. Unit tests prove DeepSeek omits requests with no key and sends the expected
   OpenAI-compatible streaming payload when configured.
2. Route tests prove DeepSeek succeeds before other providers and falls through
   to Gemini after a DeepSeek failure.
3. `pnpm check`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
4. `.env.example` contains placeholders only and `docs/ai-chat.md` reflects the
   new provider chain.
