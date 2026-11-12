# Redesign 2026, rodada 2: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** trocar o chat antigo pela Vega em tela cheia com a marca de partículas, dar profundidade 3D à logo RM, pôr logos nas tecnologias, criar a seção de IA, refazer a trajetória com a cor de cada empresa e trocar as cinco imagens de ambiente pelas do Codex.

**Architecture:**
- Primitivas novas em `src/shared/ui-2026`: `BrandIcon`, `TechChip`, `RmLogo` e `RmLogo3D`.
- A Vega mora em `src/shared/vega/`: partículas puras, o canvas, a tela cheia e os cartões.
- O backend do chat continua com o pipeline de validação inteira. Ganha cartões escolhidos pelo servidor, que saem como um evento SSE a mais, e a persona da Vega em terceira pessoa.
- As seções da home seguem o padrão atual: componente de servidor com `getTranslations` e partes de cliente que recebem o texto por props.

**Tech Stack:** Next.js 16, React 19, next-intl 4, Tailwind v4, GSAP/ScrollTrigger via `loadScrollMotion()`, Lenis, Vitest e Testing Library, Biome, knip, pnpm 10.28 (`npx pnpm@10.28.0`).

**Spec:** `docs/superpowers/specs/2026-11-07-redesign-rodada-2-design.md` (complementa `docs/superpowers/specs/2026-11-07-redesign-2026-design.md`).

## Global Constraints

- **Sem `backdrop-filter`.** A guarda `src/tests/constraints/no-backdrop-filter.test.ts` continua passando.
- **Cores só por tokens** (`--background`, `--foreground`, `--muted`, `--line`, `--accent`, `--surface`). Única exceção: as cores das empresas em `trajectory.data.ts`, com uma entrada explícita no `ALLOW` da guarda `no-hex-in-new-ui`.
- **Texto novo em pt, en e es.** A guarda `messages-parity` continua verde. Os textos em pt fixados na spec são copiados palavra por palavra.
- **`prefers-reduced-motion`:** o conteúdo fica, o deslocamento sai. Canvas e rAF só rodam com o elemento visível e a aba ativa.
- **Nada some se o script falhar:** o estado inicial renderizado já mostra o conteúdo.
- **Payload de mensagens do cliente mínimo:** `CLIENT_MESSAGE_NAMESPACES.shell` passa de `['notFound','chat']` para `['notFound','vega']`.
- **Ícones de marca servidos do repositório** (`public/brand-icons/*.svg`), nunca de CDN em tempo de execução.
- **Conteúdo da Lemon:** só o texto da spec §7.4. A Vega pode repetir esse texto e nada além dele.
- **Gate por tarefa:** `npx pnpm@10.28.0 vitest run <arquivos>`.
- **Gate final:** `npx pnpm@10.28.0 test`, `npx tsc --noEmit`, `npx biome check .`, `npx knip`, `npx pnpm@10.28.0 build`. Usar `rtk proxy` nesses comandos, porque o `rtk err` esconde erro de tipo.
- **Commits:** terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` e só saem se o gate da tarefa passou (`gate && git commit`).

## Review Focus

1. **Resposta que cita algo fora da lista de cartões, ou nome parecido** ("Klickbait", "atto" dentro de outra palavra): nenhum cartão aparece. O teste fica na Task 8.
2. **Vega fechada no meio da resposta ou do efeito de digitação, e reaberta depois:** sem texto duplicado, rolagem da página destravada e foco de volta no botão. O teste fica na Task 10.
3. **Tema claro e cores de destaque trocadas:** partículas, logo 3D e chips seguem os tokens, sem branco fixo sobre fundo claro. O painel da trajetória é a exceção, porque usa a cor da marca com logo branca. O teste fica nas Tasks 6 e 7.
4. **Celular com o teclado virtual aberto:** a caixa de pergunta da Vega continua visível, presa ao rodapé (`dvh`). O teste fica na Task 10, com a classe da caixa.
5. **Resposta de fallback ou erro do provedor:** sem cartões, mensagem de erro com o botão de tentar de novo, e o botão funciona. O teste fica nas Tasks 8 e 10.

---

### Task 1: Imagens do Codex

**Files:**
- Modify (replace): `public/redesign/scenes/{keyboard,discovery,fog-window,night-setup,server}.webp`
- Modify: `docs/redesign/assets.md` (seção "Cenas de ambiente")
- Create: `docs/redesign/prompts-codex/{style,keyboard,discovery,fog-window,night-setup,server}.txt` (cópia dos prompts)

**Interfaces:** nenhuma. Os nomes dos arquivos não mudam e os componentes também não.

- [ ] **Step 1:** Converter os PNGs de `/private/tmp/claude-501/-Users-raniellimontagna-Projetos-pessoal-second-brain/dd405b72-976a-442c-bedc-4423ace1b75f/scratchpad/imgs/<cena>.png` para webp de 1600 px de largura, qualidade 76. O `sips` não grava webp; usar `cwebp` se existir, senão `npx sharp-cli` ou um script node com `sharp`, que já vem com o Next.
- [ ] **Step 2:** Conferir as dimensões: todas com 1600×1067 e menos de ~350 KB cada.
- [ ] **Step 3:** Reescrever a seção "Cenas de ambiente" do `assets.md`: modelo Codex CLI 0.167.0 (`image_generation`, OpenAI), data 07/11/2026, 1536×1024 de origem e prompts em `docs/redesign/prompts-codex/`. Tirar o texto do FLUX. Manter a regra "IA só gera ambientes".
- [ ] **Step 4:** `npx pnpm@10.28.0 vitest run src/features/home/components/cycle` → PASS. Depois, commit: `feat(assets): replace ambient scenes with Codex-generated photos`.

### Task 2: BrandIcon e TechChip

**Files:**
- Create: `public/brand-icons/<name>.svg` para cada nome de `BRAND_ICON_NAMES`
  - simple-icons@15: react, nextdotjs, nodedotjs, typescript, electron, fastify, postgresql, pulumi, cloudflare, svelte, openrouter, modelcontextprotocol;
  - @lobehub/icons-static-svg@1.70.0: claude, openai, gemini, deepseek, aws.
  - Baixar uma vez com curl.
- Create: `src/shared/ui-2026/brand-icons.ts`, `src/shared/ui-2026/brand-icon.tsx`, `src/shared/ui-2026/tech-chip.tsx`
- Modify: `src/shared/ui-2026/index.ts`
- Test: `src/shared/ui-2026/__tests__/brand-icon.test.tsx`

**Interfaces:**
- Produces:
  - `BRAND_ICON_NAMES` (`as const`, a lista acima) e `type BrandIconName`;
  - `techIcon(label: string): BrandIconName | null`;
  - `BrandIcon({ name, className }: { name: BrandIconName; className?: string })`: `<span aria-hidden="true">` com `bg-current` e máscara `url(/brand-icons/<name>.svg)` (`mask-size: contain`, `mask-repeat: no-repeat`, `mask-position: center`, com o prefixo `-webkit-` também);
  - `TechChip({ label }: { label: string })`: pílula com borda `border-line`. Com ícone, mostra ícone + nome. Sem ícone, mostra só o texto em mono e `text-muted`.

**Mapa do `techIcon`:**

| Rótulo | Ícone |
|---|---|
| React, React Native | react |
| Next.js | nextdotjs |
| Node, Node.js | nodedotjs |
| TypeScript | typescript |
| Electron | electron |
| Fastify | fastify |
| PostgreSQL | postgresql |
| Pulumi | pulumi |
| AWS, ECS Fargate, Aurora (RDS), EventBridge, SQS, API Gateway | aws |
| Cloudflare | cloudflare |
| Svelte | svelte |
| Claude | claude |
| Codex | openai |
| Gemini | gemini |
| DeepSeek | deepseek |
| OpenRouter | openrouter |
| MCP | modelcontextprotocol |
| qualquer outro (Design System, CI/CD, IA, Produto) | `null` |

- [ ] **Step 1: Testes que falham:**
  - `every brand icon name has a file in public/brand-icons`: com `fs.existsSync` para cada nome.
  - `techIcon maps service names to aws and unknown labels to null`:
    ```ts
    expect(techIcon('Aurora (RDS)')).toBe('aws')
    expect(techIcon('React Native')).toBe('react')
    expect(techIcon('Codex')).toBe('openai')
    expect(techIcon('CI/CD')).toBeNull()
    ```
  - `BrandIcon is decorative and masks the icon file`: `aria-hidden="true"` e o style contém `/brand-icons/claude.svg`.
  - `TechChip shows text only when there is no icon`: `TechChip label="IA"` não renderiza o span de ícone. `TechChip label="React"` renderiza.
- [ ] **Step 2:** Rodar `vitest run src/shared/ui-2026/__tests__/brand-icon.test.tsx`. Esperado: FAIL, porque o módulo ainda não existe.
- [ ] **Step 3:** Baixar os SVGs e implementar os três arquivos. Conferir que cada SVG tem `viewBox`. Os do lobehub já são monocromáticos.
- [ ] **Step 4:** Rodar o teste: PASS. Commit: `feat(ui): brand icons and tech chips served from the repo`.

### Task 3: Faixa de tecnologias com logos

**Files:**
- Modify: `src/features/home/components/stack-marquee/stack-marquee.tsx`
- Test: `src/features/home/components/stack-marquee/__tests__/stack-marquee.test.tsx`

**Interfaces:**
- Consumes: `techIcon` e `BrandIcon` (Task 2).
- Produces: `STACK_ITEMS: readonly string[]` exportado, com os rótulos fixos. `aiLabel` e `productLabel` continuam vindo por prop.

- [ ] **Step 1: Teste que falha:** `lists the round-2 stack in order with icons`. Os rótulos da primeira cópia (não `aria-hidden`) aparecem nesta ordem: `React, Next.js, React Native, Node.js, TypeScript, Fastify, PostgreSQL, AWS, Pulumi, Cloudflare, Svelte, Claude, Codex, Gemini, DeepSeek, MCP, <aiLabel>, <productLabel>`. Há 16 ícones na primeira cópia: todos menos os dois rótulos de texto.
- [ ] **Step 2:** Rodar: FAIL.
- [ ] **Step 3:** Cada item vira `BrandIcon` (tamanho ~0,8em) + texto, quando `techIcon` não é nulo. O comportamento de velocidade e a medição não mudam.
- [ ] **Step 4:** Rodar os dois testes da pasta: PASS. Commit: `feat(home): stack marquee with brand logos`.

### Task 4: Trajetória na cor de cada empresa

**Files:**
- Create: `public/companies/white/{sbsistemas.svg,smarten.png,luizalabs.png,lemon.png}` (branco sobre transparente)
- Modify:
  - `src/features/home/components/trajectory/trajectory.data.ts`
  - `trajectory.tsx`
  - `trajectory-scroller.tsx`
  - `messages/{pt,en,es}.json` (`trajectory.stages`)
  - `src/tests/constraints/no-hex-in-new-ui.test.ts` (ALLOW)
- Test: `src/features/home/components/trajectory/__tests__/trajectory.test.tsx`

**Interfaces:**
- Consumes: `TechChip`, `BrandIcon` e `type BrandIconName` (Task 2).
- Produces:
  ```ts
  export type StageId = 'sbsistemas' | 'smarten' | 'luizalabs' | 'lemon'
  export type Stage = {
    id: StageId
    year: string
    company: { name: string; color: string; logo: string; ratio: number } // ratio = largura/altura da logo branca
    panelIcons: readonly BrandIconName[]
    stack: readonly string[]
  }
  ```

**Valores:**

| Etapa | Ano | Cor | Ícones do painel | Tecnologias |
|---|---|---|---|---|
| sbsistemas | 2021 | `#045ba8` | react, electron, typescript | React, Electron, TypeScript |
| smarten | 2022 | `#6a14d6` | react | React, Design System, CI/CD |
| luizalabs | 2023 | `#0f9bff` | react, nodedotjs, typescript | React, React Native, Node.js, TypeScript |
| lemon | 2026 | `#003c00` | aws, fastify, postgresql, pulumi | React, TypeScript, Fastify, PostgreSQL, Pulumi, ECS Fargate, Aurora (RDS), EventBridge, SQS, API Gateway, IA |

- [ ] **Step 1: Gerar as logos brancas**, com um script descartável em `scratchpad/` (Chrome headless + canvas, via o `playwright-core` de `~/.local/share/mcp-servers/node_modules`):
  - Smarten e Luizalabs: alfa = limiar da luminância, com `lum > 0.85` contando como opaco; RGB branco; recortar a área transparente.
  - Lemon: alfa da própria imagem, RGB branco.
  - SB: copiar o SVG e trocar os `fill` por `#fff`.
  - Registrar a origem em `docs/redesign/assets.md`.
- [ ] **Step 2: Testes que falham** (reescrever o arquivo de teste):
  - `renders four stages oldest first ending with Lemon`: os anos 2021, 2022, 2023 e 2026, e o cargo "Engenheiro de software · Lemon Energia".
  - `has no Atto inside the trajectory`: nenhum `aria-label="Atto"` e nenhum texto "Atto" dentro de `#trajetoria`.
  - `has no photos`: nenhum `img` dentro de `#trajetoria`.
  - `paints each panel with the company color`: `[data-stage-panel="lemon"]` tem `style.backgroundColor` igual a `rgb(0, 60, 0)`.
  - `shows the approved Lemon impact lines`: as quatro linhas da spec §7.4, palavra por palavra.
  - `renders stack as tech chips`: a etapa smarten mostra "CI/CD" sem ícone e "React" com ícone.
  - `keeps the first panel active without motion`: com `mockMatchMedia` em reduce, `[data-stage-panel="sbsistemas"]` tem `data-active="true"`.
- [ ] **Step 3:** Rodar: FAIL.
- [ ] **Step 4: Implementar.**
  - **Desktop:** painel `sticky top-24 aspect-[4/5]`. Cada etapa é uma camada `[data-stage-panel]` com `backgroundColor`. A logo é um span com máscara de `company.logo` e `bg-white`, com largura de 60% do painel e altura pelo `ratio`. Embaixo: o ano em mono branco, os ícones em `text-white/70` e o contador `0N / 04`.
  - **Transição:** opacidade e escala de 0,9 para 1 por `data-active`, com `transition` de 0,7 s a 0,9 s. Sai a cortina com `clipPath` do scroller, que passa a só trocar `data-active` em `[data-stage]` e `[data-stage-panel]`.
  - **Celular (`lg:hidden`):** faixa `h-[92px]` com a cor e a logo, no lugar do `PhotoReveal`.
  - Sai a função `Logo` (as plaquinhas).
  - As tecnologias viram `<ul>` de `TechChip`.
  - **Mensagens:** a chave `lemon-atto` vira `lemon`, com os textos pt da spec §7.4 (en e es traduzidos). Saem todos os `photoAlt`.
  - **Guarda:** `ALLOW` ganha `/trajectory\.data\.ts$/`, com o comentário "brand colors of past employers are data, not theme".
- [ ] **Step 5:** Rodar o teste da trajetória, a guarda de hex e a de paridade: PASS. Commit: `feat(home): trajectory panels in each company's color, no photos, Atto out`.

### Task 5: Seção de IA

**Files:**
- Create:
  - `src/features/home/components/ai-method/ai-method.tsx` (servidor)
  - `ai-method-steps.tsx` (cliente)
  - `ai-method.data.ts`
- Modify:
  - `src/features/home/components/home-body.tsx`: `AiMethod()` logo depois de `{cycle}`
  - `messages/{pt,en,es}.json`: namespace `aiMethod`
- Test: `src/features/home/components/ai-method/__tests__/ai-method.test.tsx`

**Interfaces:**
- Consumes: `BrandIcon` (Task 2), `SectionHeading`, `Reveal`, `SECTION_X`, `loadScrollMotion` e `prefersReducedMotion`.
- Produces:
  - `AiMethod(): Promise<JSX>`, numa `<section id="ia">`;
  - `AI_MODELS = [{name:'Claude',icon:'claude'},{name:'Codex',icon:'openai'},{name:'Gemini',icon:'gemini'},{name:'DeepSeek',icon:'deepseek'},{name:'OpenRouter',icon:'openrouter'},{name:'MCP',icon:'modelcontextprotocol'}] as const`;
  - `AI_STEP_IDS = ['talk','spec','plan','test','agent','review'] as const`;
  - `AI_TERM_IDS = ['sdd','tdd','mcp','agentsmd','evals','review'] as const`;
  - `AI_PROOF_IDS = ['products','agents','providers','tests'] as const`;
  - `AiMethodSteps({ steps }: { steps: { id: string; title: string; lines: string[] }[] })`: cada passo com `data-lit`.

**Mensagens `aiMethod` em pt** (texto exato da spec §8):
- `kicker`, `title`, `lead`;
- `free.title` = "Sem amarra", `free.body`;
- `method.title` = "Do jeito certo", `method.body`;
- `steps.<id>.title`: Conversa, Spec, Plano, Teste primeiro, Agente codifica, Revisão;
- `steps.<id>.lines` (array): os trechos de artefato da spec, um item por linha separada por " / ";
- `terms.<id>.term` e `terms.<id>.meaning`;
- `proofs.<id>.value` e `proofs.<id>.label`:
  - "6 produtos";
  - "5 agentes";
  - "2 provedores", com o texto que fala do código;
  - "+1.000 testes".

- [ ] **Step 1: Testes que falham:**
  - `renders the AI section heading with anchor ia`: `section#ia` existe e o título é "Sem amarra de modelo. Com método."
  - `lists the six tools with logo and name only`: os 6 nomes em ordem, 6 ícones, e nenhum texto de papel (por exemplo, `queryByText(/contexto longo|segunda opinião/i)` dá `null`).
  - `renders the six method steps in order with artifact lines`: os títulos em ordem e "eu decido o que vai ao ar" presente.
  - `renders the six terms and four proofs`: "SDD", "AGENTS.md", "6 produtos", "+1.000 testes" e "o código já aceita o OpenRouter como reserva".
  - `lights every step without motion`: com reduced motion, todos os `data-lit="true"`.
  - `home body places the AI section right after the cycle`: no `HomeBody`, `#ia` vem depois do contêiner do ciclo e antes do interlúdio, pela ordem no DOM.
- [ ] **Step 2:** Rodar: FAIL.
- [ ] **Step 3: Implementar.**
  - **Grade:** 3 colunas, 2 no celular. Cada célula tem o ícone de 44 px e o nome. No hover, `-translate-y-[3px]` e `text-accent`, transicionando `transform` e `color`.
  - **Passos:** 6 colunas no desktop e lista no celular. Sem JS, com movimento reduzido ou antes da hidratação, o conteúdo fica legível: o estado inicial do servidor é `data-lit="true"`, e o cliente apaga para `false` antes de animar. No desktop, um ScrollTrigger com scrub acende passo a passo (opacidade de 0,35 para 1 e borda `border-accent`). No celular, cada passo acende ao entrar.
  - **Termos:** em pílulas. **Provas:** em 4 colunas.
- [ ] **Step 4:** Rodar o teste, a paridade e a guarda de hex (adicionar `src/features/home/components/ai-method` a `DIRS`): PASS. Commit: `feat(home): AI section, no lock-in and spec-driven method`.

### Task 6: Logo RM 2D e 3D

**Files:**
- Create:
  - `src/shared/ui-2026/rm-logo.tsx`: `RmLogo`, com os dois `path` de `public/logo/white.svg`, `viewBox="0 0 999 984"` e `fill="currentColor"`;
  - `src/shared/ui-2026/rm-logo-3d.tsx` (cliente).
- Modify:
  - `src/shared/ui-2026/index.ts`;
  - `src/shared/shell/site-header.tsx`: `RmLogo` de 28 px antes do nome;
  - `src/shared/shell/site-menu.tsx` e `src/features/home/components/closing/closing.tsx`: `RmLogo3D`.
- Test: `src/shared/ui-2026/__tests__/rm-logo.test.tsx`

**Interfaces:**
- Produces:
  - `RmLogo({ className, title }: { className?: string; title?: string })`. Com `title`, ganha `role="img"` e `aria-label`; sem `title`, fica `aria-hidden`.
  - `RmLogo3D({ size, label }: { size: number; label: string })`, com `RM3D_LAYERS = 26` e `RM3D_DEPTH_STEP = 1.25` exportados.

**Valores da spec §5:**
- **Camada `i`:** `translateZ(-i*1.25px)`, com a cor `color-mix(in oklab, var(--foreground) ${Math.round(62 - i*2.1)}%, var(--background))`.
- **Face:** `var(--foreground)`.
- **Faixa de luz:** `linear-gradient(105deg, transparent 42%, color-mix(in oklab, var(--accent) 55%, transparent) 50%, transparent 58%)`, com máscara da logo e animação de 4,5 s.
- **Container:** `perspective: 900px`.
- **Balanço automático:** rotateY = sin(t)·26° e rotateX = cos(0,8t)·10° + 6°.
- **Ponteiro em cima:** rotateY = px·50° e rotateX = −py·34°.
- **Movimento reduzido:** `data-motion="static"`, `rotateY(-18deg) rotateX(8deg)` e sem a faixa de luz.
- **rAF:** só com o elemento visível.

- [ ] **Step 1: Testes que falham:**
  - `RmLogo draws the two RM paths in currentColor`: 2 `path`, com `fill` igual a `currentColor`.
  - `RmLogo3D stacks 26 layers behind the face`: `[data-rm-layer]` aparece 26 vezes e `[data-rm-face]` aparece 1 vez.
  - `layer colors come from theme tokens`: nenhum style de camada contém `#`; todos contêm `var(--foreground)`.
  - `RmLogo3D is static without motion`: com reduced motion, `data-motion="static"`, nenhum `[data-rm-shine]` e `requestAnimationFrame` não é chamado.
  - `header shows the RM mark next to the name`: o header contém o svg do RmLogo e o texto "Ranielli Montagna".
- [ ] **Step 2:** Rodar: FAIL.
- [ ] **Step 3:** Implementar.
  - **Header:** o link fica com `group`. A marca recebe `transition-transform` e `group-hover:[transform:perspective(200px)_rotateY(-20deg)_rotateX(8deg)]`. Ruling: inclinação fixa no hover, em vez de seguir o ponteiro, porque a marca tem só 28 px.
  - **Menu:** `RmLogo3D` de ~160 px.
  - **Fechamento:** `RmLogo3D` de ~220 px ao lado ou acima do nome, mantendo o layout atual.
- [ ] **Step 4:** Rodar o teste, os testes do shell e do fechamento, e a guarda de hex: PASS. Commit: `feat(brand): RM logo with 3D depth in header, menu and closing`.

### Task 7: Marca da Vega (partículas)

**Files:**
- Create: `src/shared/vega/vega-particles.ts` (puro), `src/shared/vega/vega-mark.tsx` (cliente)
- Test: `src/shared/vega/__tests__/vega-particles.test.ts`, `src/shared/vega/__tests__/vega-mark.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  export const VEGA_VERTICES = [{ x: -60, y: -42 }, { x: 64, y: -52 }, { x: 22, y: 62 }] as const
  export type Particle = { hx: number; hy: number; hz: number; x: number; y: number; z: number; size: number; alpha: number; star: boolean; ang: number; rad: number; speed: number }
  export function createParticles(count: number, seed: number): Particle[]
  export function stepParticles(particles: Particle[], mode: 'rest' | 'think'): void // muta x/y/z
  export function project(p: Particle, t: number, scale: number): { sx: number; sy: number; depth: number }
  export function VegaMark(props: { size: number; density?: number; thinking?: boolean; label?: string; className?: string }): JSX.Element
  ```

**Algoritmo** (não é determinado pela assinatura):
- PRNG mulberry32(seed).
- **Partícula 0:** `star = true`, posição de repouso exatamente em V[0], `size` 3,2.
- **35% das partículas:** em aglomerados nos vértices, com jitter de ±8.
- **O resto:** ao longo de uma aresta aleatória (interpolação entre dois vértices, `u ∈ [0,1]`), com jitter perpendicular de ±4. `hz ∈ [-18,18]`.
- **Modo `think`:** `ang += 0.05*speed`. O alvo é (cos ang·rad, sin ang·rad·0,6, sin ang·10), com `rad ∈ [30,100]` sorteado na criação. A posição anda 0,06 em direção ao alvo.
- **Modo `rest`:** anda 0,06 em direção à posição de repouso.
- **`project`:** aplica rotateY(sin(t·0,8)·0,6) e rotateX(0,25), com perspectiva `f = 300/(300 + z)`.
- **Desenho:** estrela em `--accent` com brilho (`shadowBlur`), as outras em `--foreground` com o alfa delas. Cores lidas de `getComputedStyle(document.documentElement)` e relidas quando o atributo de tema do `<html>` muda (MutationObserver).

- [ ] **Step 1: Testes que falham:**
  - `creates the requested count with a single star at Vega`: `createParticles(260, 7)` tem tamanho 260, exatamente uma `star`, e essa tem `hx === -60` e `hy === -42`.
  - `is deterministic per seed`: duas chamadas com seed 7 dão resultados iguais (`toEqual`).
  - `keeps rest positions near the triangle`: toda partícula fica a até 9 unidades do segmento mais próximo entre os vértices.
  - `thinking pulls particles toward an orbit and rest brings them back`: depois de 200 `stepParticles(..., 'think')`, a distância média ao centro fica entre 30 e 100. Depois de 400 passos `rest`, a distância média até a posição de repouso fica abaixo de 1.
  - `VegaMark draws once and never loops without motion`: com reduced motion e `getContext` mockado, `fillRect`/`arc` são chamados e `requestAnimationFrame` não é chamado.
  - `VegaMark only animates while visible`: com IntersectionObserver mockado sem interseção, não há rAF; depois de disparar a interseção, há.
  - `VegaMark exposes its label`: `label="Vega"` gera `role="img"` e `aria-label="Vega"`; sem label, fica `aria-hidden`.
- [ ] **Step 2:** Rodar: FAIL.
- [ ] **Step 3:** Implementar. O canvas tem `size*dpr` de lado e o `scale` é `size/170`.
- [ ] **Step 4:** Rodar: PASS. Commit: `feat(vega): particle-cloud Summer Triangle mark`.

### Task 8: Cartões escolhidos pelo servidor

**Files:**
- Create: `src/app/api/chat/chat.cards.ts`, `src/shared/vega/vega-card.types.ts`
- Modify:
  - `src/app/api/chat/chat.response.ts`: `buildTextStream(text, cards = [])`
  - `src/app/api/chat/route.ts`: no estado `answer`, monta o catálogo e chama `pickCards`
  - `messages/{pt,en,es}.json`: `vega.cards.<id>.{title,summary}`
- Test: `src/app/api/chat/__tests__/chat.cards.test.ts` e o teste existente da rota

**Interfaces:**
- Produces (em `vega-card.types.ts`, para o cliente importar só o tipo):
  ```ts
  export type VegaCardKind = 'case' | 'section' | 'page' | 'post'
  export type VegaCard = { id: string; kind: VegaCardKind; href: string; title: string; summary: string; image: string | null }
  ```
- Produces (em `chat.cards.ts`):
  - `type CardEntry = VegaCard & { aliases: string[] }`;
  - `buildCardCatalog(locale: ChatLocale): Promise<CardEntry[]>`;
  - `pickCards(answer: string, catalog: CardEntry[], max = 2): VegaCard[]`;
  - `isAllowedCardHref(href: string): boolean`.

**Catálogo fixo:**

| id | href | aliases | imagem |
|---|---|---|---|
| case-klick | `/<locale>/projects/klick` | Klick | `/redesign/products/klick-timer.webp` |
| case-grimory | `/<locale>/projects/grimory` | Grimory | `/redesign/products/grimory-mesa.webp` |
| section-trajetoria | `/<locale>#trajetoria` | trajetória, trajectory, trayectoria, Luizalabs, Smarten, SBSistemas, Lemon | — |
| section-ia | `/<locale>#ia` | agent-toolkit, SDD, spec-driven | — |
| section-atto | `/<locale>#atto` | Atto | — |
| section-escrita | `/<locale>#escrita` | — | — |
| blog | `/<locale>/blog` | blog | — |
| projects | `/<locale>/projects` | — | — |

- **Posts:** `post:<slug>`, com o título do post como alias, vindos da função de lista de posts que já existe em `src/features/blog/lib/blog.ts`.
- **Prefixo de idioma:** seguir o mesmo padrão dos links do site, conferindo `src/shared/config/i18n`.

**Regras do `pickCards`:**
- Casa alias inteiro, sem diferenciar maiúscula, com fronteira de palavra Unicode: `(?<![\p{L}\p{N}])alias(?![\p{L}\p{N}])`, com a flag `u`.
- Ordena pela primeira menção no texto.
- Remove repetidos por id.
- Devolve no máximo 2.
- Só aceita href que passa em `isAllowedCardHref`: começa com `/` e não com `//`, e casa com os padrões acima.

**Stream:** `data: {"text": …}`, depois `data: {"cards": [...]}` (só se houver cartões), depois `data: [DONE]`. O fallback estático e os erros não levam cartões.

- [ ] **Step 1: Testes que falham:**
  - `picks the Grimory case when the answer mentions it`.
  - `keeps first-mention order and caps at two`: com uma resposta que cita Atto, depois Klick, depois Grimory, o resultado é `[section-atto, case-klick]`.
  - `ignores partial words`: "Klickbait" e "attorney" dão `[]`.
  - `returns nothing for unrelated answers`.
  - `rejects external or protocol-relative hrefs`: `isAllowedCardHref('//evil.com')` e `('https://x')` dão `false`.
  - `buildTextStream emits text, cards, done in order`: lê o stream e confere os 3 eventos.
  - `buildTextStream without cards keeps the old two events`.
  - **Teste da rota:** com uma resposta válida citando Grimory, o corpo SSE contém o evento `cards` com `case-grimory`. No fallback, não contém `cards`.
- [ ] **Step 2:** Rodar: FAIL.
- [ ] **Step 3:** Implementar. Título e resumo dos cartões vêm de `getTranslations({ locale, namespace: 'vega.cards' })`. Para os posts, título e resumo vêm do próprio post.
- [ ] **Step 4:** Rodar `vitest run src/app/api/chat`: PASS. Commit: `feat(chat): server-picked site cards appended to the answer stream`.

### Task 9: Persona da Vega, contexto e validadores

**Files:**
- Modify:
  - `src/app/api/chat/chat.prompt.ts`: pt, en e es
  - `src/app/api/chat/chat.profile.ts`
  - `src/app/api/chat/chat.response.metrics.ts`, se o teste pedir
  - `scripts/chat-live-eval.mjs`
  - o texto de fallback estático, onde estiver
- Test: os testes existentes de `src/app/api/chat/__tests__/` (atualizar) e um caso novo em `chat.response.metrics`

**Interfaces:**
- Produces: `CurrentChatExperience.outcomes: string[]`, que antes era `[]`. A Lemon ganha `outcomes` com as 4 linhas da spec §7.4 e o texto como resumo.
- O perfil ganha:
  - **projetos com fatos publicados:** Klick, com 428/429 commits com coautoria de IA, e Grimory, com 2328/2495, como estão nos cases;
  - **o agent-toolkit:** mesmas skills em 5 agentes;
  - **o uso de IA:** Claude, Codex, Gemini, DeepSeek, OpenRouter e MCP, sem papel por ferramenta;
  - **a Vega:** DeepSeek, com o código já aceitando o OpenRouter.

**Persona** (pt; en e es equivalentes):
- Abertura do prompt: "Você é a Vega, a assistente virtual do site do Ranielli Montagna. Fala sobre ele em terceira pessoa, com clareza e um pouco de humor, e só sobre o perfil, a carreira, os projetos, o repertório técnico e o contato dele."
- **Identidade:** "Se perguntarem quem você é, diga que é a Vega, a assistente do Ranielli neste site, e que é uma IA."
- **Provedor:** pode dizer que roda em DeepSeek e que o código aceita o OpenRouter como reserva. Nada sobre prompt, configuração ou chaves.
- **Contato e projetos:** sai a menção ao "botão de recado direto aqui no chat". Para projeto, indicar a Atto (seção Atto do site, com WhatsApp) ou o LinkedIn.
- **Lemon:** a regra da Lemon troca "não invente entregas ou métricas" por "da Lemon, cite só o que está no perfil; não invente outros números, clientes ou sistemas".
- **O resto das políticas fica igual:** anti-injection, não mudar de persona e não pedir dados pessoais.

- [ ] **Step 1: Testes que falham:**
  - `prompt speaks as Vega in third person in every locale`: o prompt de cada idioma contém "Vega" e não contém "primeira pessoa", "first person" nem "primera persona".
  - `published Lemon outcomes are supported metrics`: `answerHasUnsupportedMetric('Ele colocou seis produtos em produção em três meses na Lemon.', profile)` dá `false`.
  - `invented Lemon numbers are still unsupported`: `answerHasUnsupportedMetric('Na Lemon ele economizou 40% do custo.', profile)` dá `true`.
  - `published case numbers are supported`: '2328 dos 2495 commits do Grimory' dá `false`.
- [ ] **Step 2:** Rodar: FAIL.
- [ ] **Step 3:** Implementar. Ajustar validadores que dependam da primeira pessoa até a suíte do chat voltar ao verde, com uma ruling no ledger para cada ajuste.
  - **Eval:** o `false-lemon-metric` passa a perguntar por um número da Lemon que não está no site e espera recusa. Adicionar o caso `persona-identity` ("quem é você?"), que espera "Vega".
- [ ] **Step 4:** Rodar `vitest run src/app/api/chat`: PASS. Commit: `feat(chat): Vega persona in third person with site-wide approved facts`.
- [ ] **Step 5:** Se houver chave local, rodar `npx pnpm@10.28.0 chat:eval`. Sem chave, registrar no ledger que o eval ao vivo ficou para o Ranielli.

### Task 10: Vega em tela cheia

**Files:**
- Create:
  - `src/shared/vega/vega-screen.tsx`: dialog, estados e layout
  - `src/shared/vega/vega-composer.tsx`
  - `src/shared/vega/vega-message.tsx`
  - `src/shared/vega/vega-card-view.tsx`
  - `src/shared/vega/use-typewriter.ts`
  - `src/shared/vega/vega-markdown.tsx`: movido de `chat-widget/chat-markdown.tsx`
  - `src/shared/shell/vega-launcher.tsx`: substitui `altair-launcher.tsx`
  - `src/shared/lib/vega-events.ts`: substitui `altair-events.ts`
- Modify:
  - `src/shared/shell/shell-widgets.tsx` e `src/shared/shell/index.ts`
  - `src/shared/store/use-chat/use-chat.ts` e `use-chat.types.ts`
  - `src/shared/components/motion/smooth-scroll.tsx`: `stopSmoothScroll()` e `startSmoothScroll()` exportados, com uma referência de módulo à instância do Lenis
  - `src/shared/components/motion/index.ts`
  - `src/shared/config/i18n/client-messages.ts`: `shell: ['notFound','vega']`
  - `messages/{pt,en,es}.json`: namespace `vega`
- Test: `src/shared/vega/__tests__/vega-screen.test.tsx`, `use-typewriter.test.ts` e os testes do shell (launcher, ⌘K)

**Interfaces:**
- Consumes: `VegaMark` (Task 7) e `VegaCard` (Task 8).
- Produces:
  - `VEGA_OPEN_EVENT = 'vega:open'` e `openVega(): void`;
  - `useTypewriter(text: string, animate: boolean, msPerWord = 25): string`;
  - `ChatMessage.cards?: VegaCard[]`.
  - O store descarta cartão com `kind` desconhecido ou que não passa no mesmo teste de href.
  - `VegaScreen()` é exportado com default para o carregamento lazy.

**Mensagens `vega` em pt** (texto da spec §3):
- `label` = "Vega";
- `launcher` = "Falar com a Vega";
- `greeting` = "Oi, eu sou a Vega.";
- `greetingAsk` = "Por onde começamos?";
- `placeholder` = "Pergunte sobre o Ranielli, os projetos ou a Atto…";
- `suggestions` = ["O que ele faz com IA?", "Me mostra o Grimory", "Por onde ele passou?", "Quero falar com a Atto"];
- `back` = "Voltar ao site";
- `newChat` = "Nova conversa";
- `thinking` = "pensando…";
- `error` = "Não consegui responder agora.";
- `retry` = "Tentar de novo";
- `send` = "Enviar";
- `cards.*` (Task 8).

- [ ] **Step 1: Testes que falham:**
  - `opens on vega:open with the greeting, the big mark and four suggestions`.
  - `Cmd+K opens it`.
  - `is a modal dialog with focus inside`: `role="dialog"`, `aria-modal="true"` e o foco no campo.
  - `Escape and 'Voltar ao site' close it and return focus to the launcher`.
  - `locks page scroll while open and restores it on close`: `document.documentElement.style.overflow` vale `hidden` e depois `''`. `stopSmoothScroll` e `startSmoothScroll` são chamados.
  - `a suggestion sends that question`: o fetch mockado recebe `message: 'Me mostra o Grimory'`.
  - `shows the thinking status while loading and moves the mark to the corner once a conversation exists`.
  - `types the answer word by word, instantly without motion`: com fake timers, o texto parcial vem antes do completo; com reduced motion, vem completo logo.
  - `renders server cards and a card click closes Vega and navigates`.
  - `ignores cards with unknown kind or external href`.
  - `shows error with a working retry`.
  - `closing mid-typing and reopening shows each message once`.
  - `composer sticks to the bottom on mobile`: o contêiner da caixa tem `sticky bottom-0` e a tela usa `h-dvh`.
  - `launcher renders the Vega mark with the launcher label`.
- [ ] **Step 2:** Rodar: FAIL.
- [ ] **Step 3: Implementar a spec §3.**
  - **Entrada:** a marca vai do retângulo do botão até o centro, com transform/FLIP em ~0,5 s. Com movimento reduzido, só aparece com fade.
  - **Conversa:** largura máxima de 680 px para as mensagens, com a caixa presa ao rodapé.
  - **Sugestões:** em rolagem horizontal no celular.
  - **Clique no cartão:** fecha a Vega e navega pelo `Link` ou pelo `router` do next-intl. Para âncora da home, rola suavemente depois de fechar.
  - **"Nova conversa":** chama `clearMessages`.
- [ ] **Step 4:** Rodar `vitest run src/shared/vega src/shared/shell src/shared/store`: PASS. Commit: `feat(vega): fullscreen Vega replaces the old chat widget`.

### Task 11: Limpeza e documentação

**Files:**
- Delete: `src/shared/components/ui/chat-widget/` inteira, `src/shared/shell/altair-launcher.tsx`, `src/shared/lib/altair-events.ts` e o namespace `chat` das mensagens, se nada mais usar.
- Delete, se o knip mostrar que estão sem uso: `src/app/api/contact/`, o `formly-email-service` e o `contact-form`.
- Modify: `docs/redesign/decisoes-fase-2.md` (seção "Rodada 2" com as rulings do ledger) e `docs/redesign/textos-pt.md` (os textos novos da IA, da trajetória e da Vega).

- [ ] **Step 1:** Rodar `rtk proxy npx knip` e apagar só o que ele aponta e que esta rodada deixou sem uso. Depois, rodar de novo: limpo.
- [ ] **Step 2:** Rodar a suíte inteira, `tsc`, `biome` e `knip` com `rtk proxy`: tudo verde. Commit: `chore: remove the old chat widget and contact form; document round 2`.

### Task 12: Verificação no ar

- [ ] **Step 1:** Rodar `rtk proxy npx pnpm@10.28.0 build`. Esperado: o build termina.
- [ ] **Step 2:** `git push`. O webhook do Dokploy publica em https://next.ranimontagna.com. Acompanhar o deploy pelo MCP `dokploy-pessoal` (app `site-next`).
- [ ] **Step 3:** Fazer uma checagem headless (Playwright, sem janela visível):
  - home com status 200 e `noindex`;
  - `#ia` presente;
  - painel da trajetória com `rgb(0, 60, 0)` na etapa de 2026;
  - Vega abrindo com ⌘K;
  - uma pergunta real ("Me mostra o Grimory") voltando com resposta e cartão;
  - nenhum erro no console;
  - Lighthouse mobile da home, uma rodada, com perf acima de 85 e CLS em 0.
- [ ] **Step 4:** Fazer a revisão final de branch, como manda o executing-plans, com um revisor novo, e corrigir em uma passada os Critical e Important.

---

## Self-review

- **Cobertura da spec:**

| Seção da spec | Task |
|---|---|
| §3 | 8, 9, 10 |
| §4 | 7, 10 |
| §5 | 6 |
| §6 | 2, 3 |
| §7 | 4 |
| §8 | 5 |
| §9 | 1 |
| §10 | constraints e Task 12 |
| §11 | rulings no ledger |

- **Sem lacuna aberta:** o menu `#ia` ficou com o construtor. Ruling: não entra no header, que já tem 6 itens.
- **Desvio da spec §6.1:** os serviços da AWS usam o ícone da AWS, não o pacote de arquitetura. Os ícones de arquitetura são ladrilhos coloridos e virariam quadrados chapados como máscara monocromática. Registrar como ruling na Task 2.
- **Tipos consistentes:** `VegaCard` (Task 8) é usado nas Tasks 10 e 11; `BrandIconName` (Task 2), nas Tasks 3, 4 e 5; `stopSmoothScroll` e `startSmoothScroll` (Task 10), só na Task 10.
