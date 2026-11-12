# Redesign 2026 — Fase 1 (abertura + ciclo na prévia) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar no ar, em `next.ranimontagna.com` (sem indexação), a nova abertura (retrato em código + nome + tese) e a cena "como ele trabalha" (ciclo fixado com quatro capítulos), seguidas das seções atuais, para o primeiro ponto de aprovação do Ranielli (meta: ~16/11/2026).

**Architecture:** Branch longa `redesign-2026` (a partir de `docs/redesign-2026`, que é a `main` + spec + este plano). A home troca só o topo: `Hero2026` → `StackMarquee` → `WorkCycle` → `HomeSections` atuais. GSAP + ScrollTrigger (já no projeto) e Lenis (novo) entram por import dinâmico depois da primeira pintura, com caminho estático para `prefers-reduced-motion`. Um app separado no Dokploy publica a branch.

**Tech Stack:** Next.js 16, React 19, next-intl 4, Tailwind v4, GSAP 3.15 + ScrollTrigger, Lenis 1.x, Vitest 5 + Testing Library (jsdom), pnpm 10.28.

**Spec:** `docs/superpowers/specs/2026-11-07-redesign-2026-design.md`

## Global Constraints

- Nenhum `backdrop-filter` / `backdrop-blur-*` em `src/` (crbug.com/414525204; PR #80).
- Todo texto novo em `messages/pt.json`, `messages/en.json` e `messages/es.json`. Nesta fase en/es são rascunho; a revisão vem depois da aprovação do pt (spec §8).
- Cores só pelos tokens do tema (`--accent`, `--foreground`, `--background`, `--surface*`, `--line*`, `--muted`). Hex fixo só dentro de artefatos que imitam terminal ou interface de terceiros.
- Animar só `transform` e `opacity` (exceção: `clip-path` nas transições do ciclo).
- Nada depende de JS para ficar visível. Entrada sem JS só com `@keyframes` CSS que terminam sozinhas; o resto é JS que esconde depois de montar.
- GSAP, ScrollTrigger e Lenis nunca entram por import estático em componente da primeira pintura; sempre via `loadScrollMotion()` (Task 3).
- `prefers-reduced-motion: reduce` → sem Lenis, sem pin, sem scrub, sem canvas animado; todo conteúdo visível.
- Celular é `(max-width: 760px)` e tem composição própria; toque substitui hover.
- Canvas desenha só quando visível e com `devicePixelRatio` limitado a 2.
- Não gerar com IA imagem do Ranielli nem tela de produto; telas são capturas reais. Ambientes podem ser FLUX 3 local.
- Conteúdo honesto: nenhum número, cliente ou depoimento inventado.
- Comandos com `npx pnpm@10.28.0` (o pnpm global da máquina é 9.0.0 e não lê o `pnpm-workspace.yaml`).
- Antes de cada commit: `npx pnpm@10.28.0 exec vitest run <arquivos da task>`, `npx pnpm@10.28.0 typecheck` e `npx pnpm@10.28.0 exec biome check <arquivos>`.
- Commits convencionais terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Movimento reduzido:** a abertura mostra a foto real, sem canvas, e o ciclo vira quatro blocos empilhados e legíveis. Testes nas Tasks 5, 6 e 9.
2. **JS falhou ou demorou:** o HTML do servidor já traz nome, tese, botões, a foto e os quatro capítulos. Testes nas Tasks 6 e 9.
3. **Só toque:** o retrato reage a `touchmove` e nenhuma informação fica atrás de hover. Teste na Task 5.
4. **Resize e rotação do celular:** a grade de caracteres é reconstruída e a timeline do ciclo é refeita para o novo breakpoint. Testes nas Tasks 5 e 9.
5. **Foto do retrato não carrega:** nada lança exceção, o canvas não desenha e o `<img alt>` continua como conteúdo. Teste na Task 5.

---

### Task 1: Branch de prévia e chave de não indexação

**Files:**
- Create: `src/shared/lib/seo/indexing.ts`
- Modify: `src/app/[locale]/layout.tsx:66-76` (literal `robots` em `generateMetadata`)
- Modify: `src/proxy.ts` (hoje só `createMiddleware(routing)`)
- Modify: `Dockerfile` (antes do `RUN ... pnpm build`)
- Test: `src/shared/lib/seo/__tests__/indexing.test.ts`

**Interfaces:**
- Produces: `isIndexingDisabled(env?: Record<string, string | undefined>): boolean` (true só com `SITE_NOINDEX === '1'`); `robotsMetadata(disabled: boolean): Metadata['robots']`; `withNoindexHeader<T extends Response>(response: T, disabled: boolean): T`.

- [ ] **Step 1:** `git fetch && git checkout -b redesign-2026 origin/docs/redesign-2026 && git push -u origin redesign-2026`.
- [ ] **Step 2: Escrever o teste que falha**

```ts
import { isIndexingDisabled, robotsMetadata, withNoindexHeader } from '../indexing'

describe('indexing', () => {
  it('is disabled only when SITE_NOINDEX is "1"', () => {
    expect(isIndexingDisabled({ SITE_NOINDEX: '1' })).toBe(true)
    expect(isIndexingDisabled({ SITE_NOINDEX: '0' })).toBe(false)
    expect(isIndexingDisabled({})).toBe(false)
  })
  it('returns noindex robots when disabled and the production robots otherwise', () => {
    expect(robotsMetadata(true)).toEqual({ index: false, follow: false, googleBot: { index: false, follow: false } })
    expect(robotsMetadata(false)).toMatchObject({ index: true, follow: true, googleBot: { index: true, 'max-image-preview': 'large' } })
  })
  it('adds X-Robots-Tag only when disabled', () => {
    expect(withNoindexHeader(new Response(), true).headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(withNoindexHeader(new Response(), false).headers.get('x-robots-tag')).toBeNull()
  })
})
```

- [ ] **Step 3:** `npx pnpm@10.28.0 exec vitest run src/shared/lib/seo/__tests__/indexing.test.ts` → FAIL (módulo não existe).
- [ ] **Step 4: Implementar.** O objeto de `robotsMetadata(false)` é o literal que hoje está no `layout.tsx`; trocar o literal por `robotsMetadata(isIndexingDisabled(process.env))`. Em `src/proxy.ts`, embrulhar o middleware do next-intl: `(req) => withNoindexHeader(intl(req), isIndexingDisabled(process.env))` (o proxy lê o env em tempo de execução). No `Dockerfile`, `ARG SITE_NOINDEX` + `ENV SITE_NOINDEX=${SITE_NOINDEX}` antes do build, porque a metadata das páginas estáticas é gerada no build. O `public/robots.txt` continua liberando tudo: o Google precisa rastrear a página para ler o `noindex`.
- [ ] **Step 5:** rodar o teste → PASS; `npx pnpm@10.28.0 build` sem `SITE_NOINDEX` e `grep -rl "noindex" .next/server/app` → vazio.
- [ ] **Step 6: Commit** `feat(seo): allow disabling indexing for preview deployments`.

### Task 2: Teste-guarda contra `backdrop-filter`

**Files:**
- Test: `src/tests/constraints/no-backdrop-filter.test.ts`

- [ ] **Step 1: Escrever o teste.** Varre `src/` com `node:fs` ignorando `__tests__/` e aplica: em `.css`, `/backdrop-filter\s*:\s*(?!none\b)/` e `/@apply[^;]*backdrop-/`; em `.ts`/`.tsx`, `/backdrop-(blur|filter)|backdropFilter/`. Hoje só existem `backdrop-filter: none` e um seletor `[class*="backdrop-blur-"]` em `retro-mode.css`, e um comentário em `globals.css`; nenhum casa com essas regras.

```ts
it('has no backdrop-filter or backdrop-blur in src (crbug.com/414525204)', () => {
  expect(findBackdropOffenders('src')).toEqual([])
})
```

- [ ] **Step 2:** rodar → PASS na base atual. Conferir que acusa: criar temporariamente um `.tsx` com `className="backdrop-blur-md"`, ver FAIL, apagar.
- [ ] **Step 3: Commit** `test: guard against backdrop-filter`.

### Task 3: Carregador de movimento e rolagem suave

**Files:**
- Modify: `package.json` / `pnpm-lock.yaml` (`lenis` em dependencies)
- Create: `src/shared/components/motion/load-scroll-motion.ts`
- Create: `src/shared/components/motion/smooth-scroll.tsx`
- Create: `src/shared/components/motion/index.ts`
- Create: `src/tests/mocks/match-media.ts`
- Test: `src/shared/components/motion/__tests__/smooth-scroll.test.tsx`

**Interfaces:**
- Produces:
  - `REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'`, `MOBILE_QUERY = '(max-width: 760px)'`, `DESKTOP_QUERY = '(min-width: 761px)'`
  - `prefersReducedMotion(): boolean`
  - `type ScrollMotion = { gsap: typeof import('gsap').gsap; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }`
  - `loadScrollMotion(): Promise<ScrollMotion>` (memoizado; `registerPlugin(ScrollTrigger)` uma vez)
  - `<SmoothScroll>{children}</SmoothScroll>` (client); `useScrollVelocity(): React.RefObject<number>` (|velocidade| do Lenis; 0 sem Lenis ou fora do provider)
  - Teste: `mockMatchMedia(matches: Record<string, boolean>): void` (consultas não listadas → false). O mock global de `src/tests/mocks/index.ts` responde `true` para qualquer consulta, inclusive movimento reduzido, então todo teste de movimento chama `mockMatchMedia` explicitamente.

- [ ] **Step 1:** `npx pnpm@10.28.0 add lenis` e conferir que o lockfile só ganhou o lenis (`git diff --stat pnpm-lock.yaml`).
- [ ] **Step 2: Escrever os testes que falham** (`vi.mock('lenis')` como classe espiã com `on`, `raf`, `destroy`; `vi.mock('gsap')` e `vi.mock('gsap/ScrollTrigger')` com `ticker.add/remove/lagSmoothing`, `registerPlugin`, `ScrollTrigger.update`):

```tsx
it('does not create Lenis when the user prefers reduced motion', async () => {
  mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
  render(<SmoothScroll><p>x</p></SmoothScroll>)
  await new Promise((r) => setTimeout(r, 0))
  expect(LenisMock).not.toHaveBeenCalled()
})
it('creates Lenis, feeds ScrollTrigger and destroys it on unmount', async () => {
  mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
  const { unmount } = render(<SmoothScroll><p>x</p></SmoothScroll>)
  await waitFor(() => expect(LenisMock).toHaveBeenCalledWith(expect.objectContaining({ lerp: 0.09 })))
  expect(lenisInstance.on).toHaveBeenCalledWith('scroll', ScrollTrigger.update)
  unmount()
  expect(lenisInstance.destroy).toHaveBeenCalled()
  expect(gsap.ticker.remove).toHaveBeenCalled()
})
it('useScrollVelocity is 0 outside the provider', () => {
  const { result } = renderHook(() => useScrollVelocity())
  expect(result.current.current).toBe(0)
})
```

- [ ] **Step 3:** rodar → FAIL.
- [ ] **Step 4: Implementar.** `SmoothScroll` importa `lenis` e chama `loadScrollMotion()` dentro do `useEffect` (import dinâmico); `gsap.ticker.add((t) => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`; velocidade gravada num ref a cada `scroll`. Importar `lenis/dist/lenis.css` no componente. Se `globals.css` tiver `scroll-behavior: smooth` no `html`, limitar a `html:not(.lenis)`.
- [ ] **Step 5:** rodar → PASS.
- [ ] **Step 6: Commit** `feat(motion): lazy scroll motion loader and smooth scroll provider`.

### Task 4: Grade de caracteres do retrato (lógica pura)

**Files:**
- Create: `src/features/home/components/portrait/glyph-grid.ts`
- Test: `src/features/home/components/portrait/__tests__/glyph-grid.test.ts`

**Interfaces:**
- Produces (regras da prévia v5, bloco "CODE PORTRAIT"):
  - `GLYPH_RAMP = ' .:-=+*#%@'`, `CODE_GLYPHS = '{}[]()<>/=;:+*#$&|_?!'`, `CELL_ASPECT = 1.55`
  - `type GlyphCell = { x: number; y: number; l: number; t: number }` (`l` = luminância com ganho; `t` = limiar aleatório de dissolução)
  - `glyphFor(l: number): string` = `GLYPH_RAMP[min(len - 1, floor(l * len))]`
  - `coverCrop(srcW: number, srcH: number, cols: number, rows: number): { sx: number; sy: number; sw: number; sh: number }` (cobre a grade de proporção `cols / (rows * CELL_ASPECT)`; foto mais alta ancora a 20% do topo, foto mais larga centraliza)
  - `buildGlyphGrid(pixels: Uint8ClampedArray, cols: number, rows: number, random?: () => number): GlyphCell[]` (luminância `(0.299r + 0.587g + 0.114b) / 255`, ganho `min(1, l ** 0.9 * 1.25)`, ordem por linha)
  - `cellSizeFor(viewportWidth: number): { w: number; h: number }` (≤ 760 → `w = 9`, senão `w = 8`; `h = w * CELL_ASPECT`)

- [ ] **Step 1: Escrever os testes que falham**

```ts
it('maps luminance to the ramp', () => {
  expect(glyphFor(0)).toBe(' ')
  expect(glyphFor(0.5)).toBe('+')
  expect(glyphFor(1)).toBe('@')
})
it('applies the gain per pixel, keeps row-major order and stores the threshold', () => {
  const px = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255])
  const cells = buildGlyphGrid(px, 2, 1, () => 0.5)
  expect(cells.map((c) => [c.x, c.y])).toEqual([[0, 0], [1, 0]])
  expect(cells[0].l).toBe(0)
  expect(cells[1].l).toBe(1)
  expect(cells[0].t).toBe(0.5)
})
it('crops a tall photo anchored at 20% from the top', () => {
  const c = coverCrop(1000, 2000, 100, 100)
  expect(c.sx).toBe(0); expect(c.sw).toBe(1000)
  expect(c.sh).toBeCloseTo(1550); expect(c.sy).toBeCloseTo(90)
})
it('crops a wide photo centered', () => {
  const c = coverCrop(2000, 1000, 100, 100)
  expect(c.sy).toBe(0); expect(c.sh).toBe(1000)
  expect(c.sw).toBeCloseTo(645.16, 1); expect(c.sx).toBeCloseTo(677.42, 1)
})
it('uses bigger cells on phones', () => {
  expect(cellSizeFor(390)).toEqual({ w: 9, h: 13.95 })
  expect(cellSizeFor(1440)).toEqual({ w: 8, h: 12.4 })
})
```

- [ ] **Step 2:** rodar → FAIL. **Step 3:** implementar. **Step 4:** rodar → PASS.
- [ ] **Step 5: Commit** `feat(hero): glyph grid for the code portrait`.

### Task 5: Componente `CodePortrait`

**Files:**
- Create: `src/features/home/components/portrait/code-portrait.tsx`
- Create: `src/tests/mocks/canvas.ts`
- Test: `src/features/home/components/portrait/__tests__/code-portrait.test.tsx`

**Interfaces:**
- Consumes: Task 4; `prefersReducedMotion`, `MOBILE_QUERY` (Task 3).
- Produces: `CodePortrait({ src, alt, getReveal }: { src: string; alt: string; getReveal: () => number })` (client). `getReveal()` vai de 0 (só caracteres) a 1 (só foto). Raiz `data-testid="code-portrait"`, `<img>` real com `alt`, `<canvas aria-hidden="true">`.
- Teste: `src/tests/mocks/canvas.ts` exporta `mockCanvas2d()` (stub de `getContext('2d')` com `clearRect`, `setTransform`, `drawImage`, `fillText`, `getImageData` devolvendo `data` do tamanho pedido), `installFrameStub(): { flush(frames?: number): void }` (rAF manual) e `captureIntersection(): { setVisible(v: boolean): void }`.

- [ ] **Step 1: Escrever os testes que falham** (para carregar a foto: definir `naturalWidth`/`naturalHeight` com `Object.defineProperty` e disparar `load`):

```tsx
it('renders the real photo with alt as the accessible element', () => {
  render(<CodePortrait src="/photo.webp" alt="Ranielli Montagna" getReveal={() => 0} />)
  expect(screen.getByAltText('Ranielli Montagna')).toBeInTheDocument()
  expect(document.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
})
it('keeps the photo and never draws under reduced motion', () => { /* mockMatchMedia reduced; load; flush(3) → fillText not called; img opacity '1' */ })
it('stops drawing while off-screen', () => { /* load; setVisible(false); fillText.mockClear(); flush(3) → not called */ })
it('turns cells near a touch point into code glyphs', () => { /* load; touchmove at the canvas origin; flush → some fillText arg is in CODE_GLYPHS */ })
it('rebuilds the grid on resize', () => { /* load; change getBoundingClientRect width; fire resize; getImageData called again with the new cols */ })
it('does not throw and keeps the img when the photo fails', () => { /* fire error; flush(3) → no throw, getImageData not called, img present */ })
```

- [ ] **Step 2:** rodar → FAIL.
- [ ] **Step 3: Implementar** a partir do bloco "CODE PORTRAIT" de `previa-v5.html`:
  - Começa no `load` da foto, ou na montagem se `complete && naturalWidth > 0`.
  - A primeira pintura mostra a foto. Ao montar com movimento liberado, a foto cai para opacidade 0 em 400 ms enquanto os caracteres entram.
  - A cada quadro, a célula some quando `t < getReveal() * 1.15`, e a foto fica com opacidade `min(1, getReveal() * 1.6)`.
  - Interação: raio `dx² + dy² < 5200`, via `pointermove` e `touchmove` passivo; `pointerleave` zera.
  - Troca aleatória de caractere com chance de `0.004` por quadro.
  - Desenho: fonte `600 {w*1.25}px JetBrains Mono` e alfa `0.35 + l * 0.65` via `globalAlpha`.
  - Cor: `--accent` perto do ponteiro ou quando `l > 0.78`; `--foreground` no resto. As duas vêm de `getComputedStyle(document.documentElement)`, lidas na montagem e de novo quando um `MutationObserver` vê mudar `class`/`data-*` do `<html>` (troca de tema).
- [ ] **Step 4:** rodar → PASS.
- [ ] **Step 5: Commit** `feat(hero): code portrait canvas`.

### Task 6: Nova abertura `Hero2026`

**Files:**
- Create: `src/features/home/components/hero/hero-2026.tsx` (server)
- Create: `src/features/home/components/hero/hero-portrait.tsx` (client)
- Create: `src/features/home/components/hero/altair-trigger.tsx` (client)
- Create: `src/shared/lib/altair-events.ts`
- Modify: `src/app/[locale]/globals.css` (`@keyframes letter-rise` + `--animate-letter-rise` no `@theme`)
- Modify: `src/features/home/components/home-client-widgets.tsx` (ouvir `altair:open` e chamar o `openChat` que já existe)
- Modify: `messages/{pt,en,es}.json` (namespace `hero2026`)
- Test: `src/features/home/components/hero/__tests__/hero-2026.test.tsx`; caso novo no teste de `home-client-widgets` (criar o arquivo em `src/features/home/components/__tests__/` se não existir)

**Interfaces:**
- Consumes: Task 5 (`CodePortrait`), Task 3 (`loadScrollMotion`, `prefersReducedMotion`, `MOBILE_QUERY`).
- Produces:
  - `Hero2026(): Promise<JSX.Element>`, raiz `<section data-hero-2026>`
  - `HeroPortrait({ src, alt }: { src: string; alt: string })`: dono do ref de revelação e do ScrollTrigger; repassa `getReveal` ao `CodePortrait` (função não atravessa de server para client)
  - `AltairTrigger({ children, className }: { children: React.ReactNode; className?: string })`: `<button type="button">` que chama `openAltair()`
  - `ALTAIR_OPEN_EVENT = 'altair:open'`, `openAltair(): void` (a Fase 3 troca o chat atual pelo Altair sem mudar quem dispara)
- Nome fixo no código (`Ranielli` / `Montagna`), não no i18n. Chaves `hero2026` em pt:
  - `lead` = "Engenheiro de produto. Pego a dor de alguém e entrego o produto no ar, com IA escrevendo o código e eu decidindo o que importa."
  - `ctaAltair` = "Pergunte ao Altair"
  - `ctaWork` = "Ver o que está no ar"
  - `portraitAlt` = "Retrato de Ranielli Montagna"
  - `hint` = "passe o mouse no retrato · role para revelar"
  - `hintTouch` = "toque no retrato · role para revelar" (usada no celular)

- [ ] **Step 1: Escrever os testes que falham** (`vi.mock('next-intl/server')` como em `hero.test.tsx`; `vi.mock('../hero-portrait')` devolvendo um `<img alt>` simples):

```tsx
it('server-renders the name, lead and both actions', async () => {
  render(await Hero2026())
  expect(screen.getByRole('heading', { level: 1, name: 'Ranielli Montagna' })).toBeInTheDocument()
  expect(screen.getByText('lead')).toBeVisible()
  expect(screen.getByRole('button', { name: 'ctaAltair' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'ctaWork' })).toHaveAttribute('href', '#projects')
})
it('splits the name into aria-hidden letters for the CSS entrance', async () => {
  render(await Hero2026())
  expect(document.querySelectorAll('h1 [data-letter][aria-hidden="true"]')).toHaveLength('RanielliMontagna'.length)
})
it('the Altair action dispatches altair:open', async () => {
  const spy = vi.fn(); window.addEventListener('altair:open', spy)
  render(await Hero2026()); fireEvent.click(screen.getByRole('button', { name: 'ctaAltair' }))
  expect(spy).toHaveBeenCalledTimes(1)
})
```

```tsx
// home-client-widgets
it('opens the chat when altair:open fires', async () => {
  const loadChatWidget = vi.fn().mockResolvedValue(() => null)
  render(<HomeClientWidgets loadChatWidget={loadChatWidget} loadCommandMenu={vi.fn()} />)
  act(() => { window.dispatchEvent(new Event('altair:open')) })
  await waitFor(() => expect(loadChatWidget).toHaveBeenCalled())
  expect(useChat.getState().isOpen).toBe(true)
})
```

- [ ] **Step 2:** rodar → FAIL.
- [ ] **Step 3: Implementar.**
  - **Nome:** `h1` com `aria-label="Ranielli Montagna"` e duas linhas com `overflow: hidden`. Cada letra vai num `<span data-letter aria-hidden>` com `motion-safe:animate-letter-rise` e `animation-delay: i * 35ms`. A animação `letter-rise` vai de `translateY(105%)` a `none`, em 1.1 s, com `cubic-bezier(.16,1,.3,1)` e `fill-mode: both`.
  - **`HeroPortrait`:** sem movimento reduzido, carrega `loadScrollMotion()` e cria um `ScrollTrigger` na `[data-hero-2026]` mais próxima, com `scrub: true`, `start: 'top top'` e `end: 'bottom top'` (no celular, `'+=55%'`). Guarda o progresso no ref. No mesmo trecho, parallax do `h1` com `yPercent: -18`. Mata tudo no unmount.
  - **Layout:** no desktop, duas colunas (texto | retrato `photo.webp`). No celular, o retrato em cima (58svh) e o texto embaixo.
  - **Título:** `clamp(60px, 8.4vw, 150px)`, o tamanho que parou de quebrar na v5.
- [ ] **Step 4:** rodar → PASS.
- [ ] **Step 5: Commit** `feat(hero): 2026 opening with code portrait`.

### Task 7: Faixa de tecnologias

**Files:**
- Create: `src/features/home/components/stack-marquee/stack-marquee.tsx`
- Modify: `messages/{pt,en,es}.json` (`hero2026.stackAi` = "Agentes de IA", `hero2026.stackProduct` = "Produto")
- Test: `src/features/home/components/stack-marquee/__tests__/stack-marquee.test.tsx`

**Interfaces:**
- Consumes: Task 3 (`useScrollVelocity`, `prefersReducedMotion`).
- Produces: `StackMarquee()` (client). Itens fixos no código, nesta ordem: React, Next.js, React Native, Node, TypeScript, `stackAi`, MCP, Cloudflare, Svelte, `stackProduct`.

- [ ] **Step 1: Escrever os testes que falham**

```tsx
it('renders the items for readers and a hidden copy for the loop', () => {
  render(<StackMarquee />)
  expect(screen.getAllByText('React')).toHaveLength(2)
  expect(document.querySelector('[data-loop-copy]')).toHaveAttribute('aria-hidden', 'true')
  expect(screen.getAllByText('stackAi')).toHaveLength(2)
})
it('stays static under reduced motion', () => {
  mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
  render(<StackMarquee />)
  expect(document.querySelector('[data-animated]')).toHaveAttribute('data-animated', 'false')
})
```

- [ ] **Step 2:** FAIL.
- [ ] **Step 3: Implementar como na v5.**
  - A cada quadro, `x -= 0.6 + boost`, com `boost = min(30, |v| * 0.8)` e decaimento de `0.92`.
  - `x` volta a 0 ao passar metade da largura.
  - O rAF para quando a faixa sai da tela.
  - Cores: fundo `--accent`, texto `--background`.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Commit** `feat(home): velocity-reactive stack marquee`.

### Task 8: Imagens das cenas e capturas reais

**Files:**
- Create: `public/redesign/scenes/{discovery,night-setup,keyboard,fog-window,server}.webp`
- Create: `public/redesign/products/{klick-timer,klick-mobile,grimory-sheet}.webp`
- Create: `docs/redesign/assets.md`

- [ ] **Step 1: Cenas.**
  - Converter para webp, com 1600 px no lado maior e ≤ 250 KB, as cinco cenas FLUX 3 Klein da prévia: `~/Projetos/pessoal/ranimontagna.com/.superpowers/brainstorm/48220-1794065355/content/f-{descoberta,setup-noite,maos-terminal,neblina-janela,servidor-luz}.jpg`.
  - Os prompts estão em `scratchpad/pv/gen.py`, da sessão de 07/11/2026 (semente `20261107`, 8 passos, 1536×1024). Copiar os prompts para o `assets.md`.
  - Se precisar gerar de novo: ligar o ComfyUI do PC com `ssh win` e `D:\grimory-arte\scripts\comfy-start.ps1`, abrir o túnel com `ssh -N -L 4460:127.0.0.1:8188 win` e rodar `comfy-stop.ps1` ao terminar.
- [ ] **Step 2: Capturas reais.** Klick: `~/Projetos/pessoal/klick/docs/screenshots/{timer,timer-mobile}.png`. Grimory: `~/Projetos/pessoal/grimory/.superpowers/reports/joao-1b/pena-ficha-desktop-escuro-depois.png`. Abrir cada uma e conferir que não há dado pessoal antes de copiar.
- [ ] **Step 3:** `find public/redesign -size +250k` → vazio. Escrever `docs/redesign/assets.md` (arquivo, origem, prompt/semente/modelo ou caminho da captura, data).
- [ ] **Step 4: Commit** `chore(assets): scene images and product captures for the redesign`.

### Task 9: Cena "como ele trabalha" (`WorkCycle`)

**Files:**
- Create: `src/features/home/components/cycle/cycle.data.ts`
- Create: `src/features/home/components/cycle/cycle-timeline.ts`
- Create: `src/features/home/components/cycle/artifacts/{thread,spec,product,terminal}-artifact.tsx`
- Create: `src/features/home/components/cycle/work-cycle.tsx` (client)
- Modify: `messages/{pt,en,es}.json` (namespace `cycle`)
- Test: `src/features/home/components/cycle/__tests__/cycle-timeline.test.ts`, `__tests__/work-cycle.test.tsx`

**Interfaces:**
- Consumes: Task 8 (imagens), Task 3 (`loadScrollMotion`, `prefersReducedMotion`, `MOBILE_QUERY`, `DESKTOP_QUERY`, `ScrollMotion`).
- Produces:
  - `type ChapterId = 'pain' | 'solution' | 'product' | 'code'`; `type Transition = 'card' | 'wipe-up' | 'circle' | 'split'`
  - `CYCLE_CHAPTERS: readonly { id: ChapterId; transition: Transition; background: string }[]`: pain/card/`discovery`, solution/wipe-up/`fog-window`, product/circle/`night-setup`, code/split/`keyboard` (arquivos da Task 8)
  - `TERMINAL_LINES: readonly string[]`: o fluxo real (pedido ao agente → plano → teste falhando → implementação → testes verdes → revisão humana → deploy), sem números inventados
  - `terminalLinesFor(progress: number, total: number): number` = `round(clamp(progress, 0, 1) * total)`
  - `buildCycleTimeline(motion: ScrollMotion, root: HTMLElement, opts: { mobile: boolean; onTerminal: (lines: number) => void }): gsap.core.Timeline`
- Chaves `cycle.<id>.{kicker,title,body}` em pt (spec §4.3: artefatos de projetos diferentes):
  - pain: "a dor" / "Começa ouvindo." / "Antes do código, alguém perdendo três anos de dados de treino. É daí que o produto sai."
  - solution: "a solução" / "Decide o que importa." / "O que resolver primeiro, o que deixar de fora e quem decide. No Grimory: a IA propõe, as regras validam, o jogador decide."
  - product: "o produto" / "Coloca no ar." / "Grimory na mesa do grupo, Klick no bolso de quem treina. Produtos no ar, usados de verdade."
  - code: "o código" / "Com IA, sob julgamento." / "Agentes escrevem a maior parte do código. Cada mudança passa pela revisão dele antes de ir para o ar."
- Artefatos: conversa (pedido de um usuário do Klick), especificação (cartão da spec do Grimory), produto (captura do Grimory + Klick no celular), terminal (`TERMINAL_LINES`).

- [ ] **Step 1: Escrever os testes que falham.** `cycle-timeline.test.ts` usa um `gsap` falso cujo `timeline()` devolve um stub encadeável (`to`, `fromTo`, `set`, `add` e `call` devolvem o próprio stub):

```ts
it('maps scroll progress to terminal lines', () => {
  expect(terminalLinesFor(0, 10)).toBe(0)
  expect(terminalLinesFor(0.55, 10)).toBe(6)
  expect(terminalLinesFor(2, 10)).toBe(10)
  expect(terminalLinesFor(-1, 10)).toBe(0)
})
it('pins with a scrubbed timeline sized per breakpoint', () => {
  buildCycleTimeline(fakeMotion, root, { mobile: false, onTerminal: vi.fn() })
  expect(fakeMotion.gsap.timeline).toHaveBeenCalledWith(expect.objectContaining({
    scrollTrigger: expect.objectContaining({ trigger: root, pin: true, scrub: 0.6, end: '+=420%' }),
  }))
  buildCycleTimeline(fakeMotion, root, { mobile: true, onTerminal: vi.fn() })
  expect(fakeMotion.gsap.timeline).toHaveBeenLastCalledWith(expect.objectContaining({
    scrollTrigger: expect.objectContaining({ end: '+=320%' }),
  }))
})
```

```tsx
// work-cycle.test.tsx (vi.mock de '@/shared/components/motion' e de '../cycle-timeline')
it('first render shows all four chapters stacked and readable', () => {
  mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
  render(<WorkCycle />)
  for (const id of ['pain', 'solution', 'product', 'code']) expect(screen.getByText(`${id}.title`)).toBeVisible()
})
it('does not load motion under reduced motion', async () => {
  mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
  render(<WorkCycle />)
  await new Promise((r) => setTimeout(r, 0))
  expect(loadScrollMotion).not.toHaveBeenCalled()
})
it('builds the timeline for the current breakpoint', async () => {
  mockMatchMedia({ [REDUCED_MOTION_QUERY]: false, [DESKTOP_QUERY]: true })
  render(<WorkCycle />)
  await waitFor(() => expect(buildCycleTimeline).toHaveBeenCalledWith(expect.anything(), expect.any(HTMLElement), expect.objectContaining({ mobile: false })))
})
```

- [ ] **Step 2:** rodar → FAIL.
- [ ] **Step 3: Implementar** a partir do bloco "CYCLE" da v5.
  - **Markup estático:** os quatro capítulos empilhados. É o fallback e o conteúdo que vem do servidor.
  - **Ao montar, sem movimento reduzido:** chamar `loadScrollMotion()` e depois `gsap.matchMedia()` com `DESKTOP_QUERY` e `MOBILE_QUERY`, cada um chamando `buildCycleTimeline`. O matchMedia desfaz e refaz a timeline na troca de breakpoint e na rotação.
  - **Cenas:** sobrepostas. A transição de cada capítulo é por `clip-path`, conforme `transition`:
    - `card`: inset do cartão até a tela cheia;
    - `wipe-up`: cortina de baixo para cima;
    - `circle`: círculo que abre do centro;
    - `split`: abertura a partir do meio.
  - **Antes de cada cena nova:** `.copy` e `.art` da anterior saem com `autoAlpha: 0, y: -30`.
  - **Fundo:** `scale` de 1.15 para 1.
  - **Barra de progresso:** 4 segmentos.
  - **Terminal:** via `onTerminal(terminalLinesFor(...))`, alternando as linhas direto no DOM, sem `setState` por quadro.
  - **Celular:** a arte fica em cima (topo 110 px, 90vw) e o texto embaixo.
- [ ] **Step 4:** rodar → PASS.
- [ ] **Step 5: Commit** `feat(home): pinned work cycle with four chapters`.

### Task 10: Montar a home e publicar a prévia

**Files:**
- Modify: `src/app/[locale]/page.tsx` (`Hero2026` no lugar de `Hero`; `SmoothScroll` em volta da home)
- Modify: `src/features/home/home.tsx` (`<StackMarquee />` e `<WorkCycle />` entre `heroContent` e `<HomeSections />`)
- Test: testes existentes de `src/features/home/` que dependam de `Hero` ou da ordem

- [ ] **Step 1:** atualizar os testes da home para a ordem nova (abertura → faixa → ciclo → seções atuais) e rodar a suíte: `npx pnpm@10.28.0 test` → verde.
- [ ] **Step 2:** `npx pnpm@10.28.0 typecheck`, `npx pnpm@10.28.0 check` e `npx pnpm@10.28.0 build` → sem erro.
- [ ] **Step 3:** commit `feat(home): 2026 opening and work cycle on the home` e `git push origin redesign-2026`.
- [ ] **Step 4: DNS antes de qualquer acesso.** Registro `A next → 169.58.70.121`, com proxy, na zona `ranimontagna.com`, pelo MCP da Cloudflare. Ninguém abre o subdomínio antes disso (o macOS guarda NXDOMAIN por até 30 min).
- [ ] **Step 5: App no Dokploy pessoal.** No projeto do site, criar o app `site-next`:
  - **Origem e build:** GitHub `raniellimontagna/ranimontagna.com`, branch `redesign-2026`, build `dockerfile`, build arg `SITE_NOINDEX=1`.
  - **Domínio:** `next.ranimontagna.com` na porta 3000, com HTTPS.
  - **Saúde:** healthcheck e update `start-first` iguais aos do app de produção.
  - **Env:** copiar a do app de produção pela API, sem imprimir valores, e ajustar:
    - `SITE_URL=https://next.ranimontagna.com`;
    - `SITE_NOINDEX=1`;
    - prefixo próprio de rate limit do chat;
    - sem a variável do Google Analytics.
  - **Webhook:** push do repo para `/api/deploy/<refreshToken>` do app novo. Ele só dispara para a branch configurada.
- [ ] **Step 6: Verificar no ar.**
  - `curl -sI https://next.ranimontagna.com/` → 200 e `x-robots-tag: noindex, nofollow`; o HTML tem `<meta name="robots" content="noindex, nofollow">`.
  - `curl -sI https://ranimontagna.com/` → sem `x-robots-tag` (produção intocada).
  - Capturas headless (Playwright, Chrome sem janela) em 1440×900 e 390×844 da abertura, do retrato revelado e dos quatro capítulos, também com `reducedMotion: 'reduce'`.
  - `npx pnpm@10.28.0 exec lhci collect --url=https://next.ranimontagna.com/ -n 1` e anotar Performance e Accessibility no PR (o SEO vai acusar o `noindex`, como esperado).
- [ ] **Step 7: Ponto de aprovação 1.** Mandar ao Ranielli o link e o que olhar: abertura e ciclo, no computador e no celular. A Fase 2 só começa depois do retorno.

---

## Roteiro das fases seguintes (cada uma ganha o próprio plano na vez dela)

| Fase | Entrega | Ponto de aprovação |
|---|---|---|
| **2** (até ~30/11/2026) | Fotos reais dele pela página; "No ar" com rolagem horizontal; páginas de case do **Klick** e do **Grimory**; trajetória com logos e detalhes (com a logo da Atto); seção **Atto** com os cases públicos e o botão de WhatsApp; trecho do blog com imagem que segue o cursor; fechamento com as redes sociais. Textos só em pt. | **2:** textos em pt de todas as seções, antes de traduzir |
| **3** (até ~18/12/2026) | **Altair**: API em fluxo com filtro por trecho, ferramentas de lista fechada validadas no servidor, histórico assinado (HMAC), fatos aprovados; estrela persistente + painel + Cmd+K; ações (rolar, abrir case ou post, idioma, tema, WhatsApp com resumo editável); `pnpm chat:eval` reescrito. Substitui o widget atual ouvindo o mesmo `altair:open`. | — |
| **4** (até ~28/12/2026) | Traduções en/es revisadas; temas e cores de destaque em todas as seções novas; desempenho e acessibilidade; decisão sobre fundo WebGL e modo retrô; `/projetos` × cases sem quebrar links. | **3:** versão completa na prévia |
| **Virada** (01/01/2027) | Merge de `redesign-2026` na `main`, deploy de produção, desligar o app `site-next` e o DNS `next`, atualizar a nota de hospedagem. Snapshots 2025 e 2026 intactos. | — |
