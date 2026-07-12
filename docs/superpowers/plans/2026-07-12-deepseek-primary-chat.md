# DeepSeek Primary Chat Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the official DeepSeek API as the primary streaming chat provider while retaining Gemini, OpenRouter, Groq, and the static fallback.

**Architecture:** Add `callDeepSeek` to the existing provider utility module, using the OpenAI-compatible request and SSE response shape already used by OpenRouter and Groq. The route tries DeepSeek first and returns its response through `buildOpenRouterStream`; an unavailable key, timeout, or failed response returns `null` so the existing chain continues.

**Tech Stack:** Next.js Route Handlers, TypeScript, native Fetch/ReadableStream, Vitest, Zod, Sentry.

## Global Constraints

- Keep `DEEPSEEK_API_KEY` server-only; never use a `NEXT_PUBLIC_` variable.
- Default `DEEPSEEK_MODEL` to `deepseek-chat` and allow deployment override.
- Preserve UI, request schema, persona prompts, rate-limit policy, and static fallback text.
- Do not remove Gemini, OpenRouter, or Groq.
- Do not commit, push, or open a pull request without explicit authorization.

---

### Task 1: Add a tested DeepSeek provider call

**Files:**
- Modify: `src/app/api/chat/chat.utils.ts:40-214`
- Modify: `src/app/api/chat/__tests__/chat.utils.test.ts:1-111`

**Interfaces:**
- Produces `callDeepSeek(systemPrompt: string, messages: ParsedRequest['messages']): Promise<Response | null>`.
- Consumes `fetchWithTimeout`, `isTimeoutError`, `OpenRouterMessage`, and `ParsedRequest` from the existing module.

- [ ] **Step 1: Write failing provider tests**

Add these tests after the rate-limit tests:

```ts
import { callDeepSeek } from '../chat.utils'

it('skips DeepSeek when no API key is configured', async () => {
  const result = await callDeepSeek('system policy', [{ role: 'user', content: 'Oi' }])
  expect(result).toBeNull()
  expect(global.fetch).not.toHaveBeenCalled()
})

it('sends an OpenAI-compatible streaming request to DeepSeek', async () => {
  vi.stubEnv('DEEPSEEK_API_KEY', 'deepseek-test-key')
  vi.stubEnv('DEEPSEEK_MODEL', 'deepseek-chat')
  global.fetch = vi.fn().mockResolvedValue(new Response('', { status: 200 }))

  await callDeepSeek('system policy', [{ role: 'user', content: 'Oi' }])

  expect(global.fetch).toHaveBeenCalledWith(
    'https://api.deepseek.com/chat/completions',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer deepseek-test-key' }),
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'system policy' },
          { role: 'user', content: 'Oi' },
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    }),
  )
})
```

- [ ] **Step 2: Verify the tests fail because the provider is absent**

Run: `pnpm exec vitest run src/app/api/chat/__tests__/chat.utils.test.ts`

Expected: FAIL with `callDeepSeek is not a function`.

- [ ] **Step 3: Implement the minimal provider call**

Add `callDeepSeek` beside `callGroq`, using this request shape:

```ts
const deepSeekMessages: OpenRouterMessage[] = [
  { role: 'system', content: systemPrompt },
  ...messages.map((message) => ({
    role: message.role as 'user' | 'assistant',
    content: message.content,
  })),
]

const response = await fetchWithTimeout('https://api.deepseek.com/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat',
    messages: deepSeekMessages,
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
  }),
})
```

Return `null` on an unavailable key, non-success response, timeout, or thrown error. Log provider failures without logging the API key.

- [ ] **Step 4: Verify the focused tests pass**

Run: `pnpm exec vitest run src/app/api/chat/__tests__/chat.utils.test.ts`

Expected: PASS, including the two DeepSeek tests.

### Task 2: Make DeepSeek the route primary and protect fallback order

**Files:**
- Modify: `src/app/api/chat/route.ts:10-85`
- Create: `src/app/api/chat/__tests__/route.test.ts`

**Interfaces:**
- Consumes `callDeepSeek`, `callGemini`, `callOpenRouter`, `callGroq`, and `buildOpenRouterStream`.
- Produces the unchanged `POST(request: NextRequest): Promise<Response>` route contract.

- [ ] **Step 1: Write failing route-order tests**

Mock every provider from `../chat.utils`. Test that a successful `callDeepSeek` returns status 200 and leaves Gemini, OpenRouter, and Groq uncalled. Test that a `null` DeepSeek result invokes Gemini next. Use a streaming `Response` with an OpenAI-compatible `choices[0].delta.content` event body for the successful case.

- [ ] **Step 2: Verify the new route tests fail**

Run: `pnpm exec vitest run src/app/api/chat/__tests__/route.test.ts`

Expected: FAIL because the route does not import or invoke `callDeepSeek`.

- [ ] **Step 3: Change only provider ordering and telemetry**

Import and call `callDeepSeek` before Gemini:

```ts
const deepSeekResponse = await callDeepSeek(systemPrompt, messages)
if (deepSeekResponse) {
  return new Response(buildOpenRouterStream(deepSeekResponse), { headers: SSE_HEADERS })
}

console.warn('DeepSeek unavailable, trying Gemini...')
```

Update later warnings to preserve the order Gemini → OpenRouter → Groq. Add `hasDeepSeekApiKey: Boolean(process.env.DEEPSEEK_API_KEY)` to the Sentry fallback metadata.

- [ ] **Step 4: Verify fallback behavior**

Run: `pnpm exec vitest run src/app/api/chat/__tests__/route.test.ts`

Expected: PASS with DeepSeek-first and DeepSeek-to-Gemini fallback assertions.

### Task 3: Document and verify deployment configuration

**Files:**
- Modify: `.env.example:20-31`
- Modify: `docs/ai-chat.md:5-46`

**Interfaces:**
- Produces the deployment variables `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL`.
- Preserves all existing provider configuration variables.

- [ ] **Step 1: Update environment examples and provider documentation**

Add only placeholders:

```bash
# DeepSeek API (primary provider)
DEEPSEEK_API_KEY=your-deepseek-api-key-here
DEEPSEEK_MODEL=deepseek-chat
```

Update `docs/ai-chat.md` to describe the official DeepSeek endpoint and the chain: DeepSeek → Gemini → OpenRouter → Groq → static fallback.

- [ ] **Step 2: Run full verification**

Run: `pnpm check && pnpm typecheck && pnpm test && NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST pnpm build`

Expected: all commands exit 0.

- [ ] **Step 3: Check scope before version-control actions**

Run: `git diff --check && git status --short`

Expected: only the source, tests, environment example, documentation, and approved design/plan files listed above are changed.
