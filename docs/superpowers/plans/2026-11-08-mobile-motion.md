# Movimento no celular: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** abaixo de lg, as seções da home ganham movimento que segue o dedo, no lugar da fixação que a rodada mobile tirou. O desktop fica igual.

**Architecture:** cada efeito de celular é uma função pura de montagem num arquivo `*-motion.ts` (padrão do `cycle-timeline.ts` e do `live-work-motion.ts`). Ela recebe `ScrollMotion` e o elemento raiz e cria os ScrollTriggers. O componente chama a função dentro de `gsap.matchMedia().add({ mobile: BELOW_LG_QUERY }, …)`, só quando o movimento não está reduzido. O que gruda usa `position: sticky`; não há `pin` no celular. O carrossel do "No ar" usa só eventos de rolagem e rAF, sem GSAP.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, GSAP 3.15 + ScrollTrigger (via `loadScrollMotion()`), Vitest + Testing Library, Biome, knip. Comandos via `npx pnpm@10.28.0`.

**Spec:** `docs/superpowers/specs/2026-11-08-mobile-motion-design.md`

## Global Constraints
- **Escopo:** tudo vale só abaixo de lg, com `BELOW_LG_QUERY = '(max-width: 1023px)'`. Nenhuma classe sem prefixo `max-lg:` pode mudar o visual de lg para cima.
- **Desktop:** ciclo fixado, trilho horizontal fixado, grade da IA que acende e capa que segue o mouse ficam iguais. Os testes de desktop que já existem continuam passando sem alteração.
- **Sem `pin` no celular** e sem `ScrollTrigger.normalizeScroll`. Alturas de tela em `svh`, nunca `dvh` nem `vh`.
- **Propriedades animadas:** só `transform` e `opacity`. Exceções: `border-radius` dos quatro capítulos e o `clip-path` da foto do "Quem é", que já existe.
- **Sem script, tudo aparece:** o HTML do servidor mostra o estado final. O cliente esconde um elemento só logo antes de animar, e só se o topo dele estiver abaixo da tela (`getBoundingClientRect().top > innerHeight`) na montagem.
- **Movimento reduzido:** nenhuma função de montagem roda, e tudo fica no estado final. Fades de até 150 ms são permitidos. A faixa da trajetória troca de empresa sem animação.
- **Desfazer:** ao sair da faixa de largura (`media.revert()`), cada função de montagem limpa os estilos inline que pôs. O retorno da função passada a `media.add` faz essa limpeza.
- **Contraste:** pisos de opacidade em tokens.
  - `--dim-large` (texto grande, pelo menos 3:1): 0.5 no tema claro e 0.4 no escuro.
  - `--dim-body` (texto normal, pelo menos 4.5:1): 0.62 no claro e 0.52 no escuro.
  - Texto em `muted` nunca muda de opacidade.
- **Já valia antes:** sem `backdrop-filter`, cores só por tokens (as cores de empresa são dados), pt/en/es.
- **Gate de cada tarefa:** `npx pnpm@10.28.0 vitest run <arquivos da tarefa>`.
- **Gate final:** suíte completa, `tsc --noEmit`, `biome check`, `knip`, sempre via `rtk proxy`.
- **Commits:** a mensagem termina com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus
1. **Girar o celular ou passar de 1024 px:** depois de um `revert`, nada fica preso no estado do celular (escala, opacidade, `hidden` no terminal, a faixa da trajetória).
2. **Pular a seção:** um link de âncora (o "Ver o que está no ar" do ciclo, o `#contato`), ou voltar para a página já rolada, não pode deixar peça, palavra ou card escondido para sempre.
3. **Barra de endereço do iPhone:** quando ela aparece ou some, os capítulos `h-svh` não pulam e a faixa da trajetória e as barrinhas não ficam atrás do header.
4. **Tema claro:** tudo que apaga respeita os pisos de contraste.
5. **Empurrãozinho do carrossel:** não briga com um arraste que a pessoa começou durante o empurrão.

---

### Task 1: Base: query, pisos de contraste e faixa que acompanha o header

**Files:**
- Modify: `src/shared/components/motion/load-scroll-motion.ts`, `src/shared/components/motion/index.ts` (exportar `BELOW_LG_QUERY`)
- Modify: `src/app/[locale]/globals.css`: tokens `--dim-large` e `--dim-body` em `:root` e `.dark`; bloco `/* follow header */ … /* end follow header */`
- Modify: `src/shared/shell/header-behavior.tsx`: adicionar `data-site-header` no `<header>`
- Test: `src/tests/constraints/mobile-motion.test.ts` (novo), `src/shared/shell/__tests__/site-header.test.tsx`

**Interfaces:**
- Produces:
  - `BELOW_LG_QUERY: '(max-width: 1023px)'`;
  - atributo `data-follow-header`: abaixo de lg, o elemento fica com `translate: 0 4rem`, e com `translate: 0 0` quando `[data-site-header][data-hidden='true']` existe; transição de 300 ms, desligada com movimento reduzido;
  - variáveis CSS `--dim-large` e `--dim-body`.

- [ ] **Step 1: testes.** Em `mobile-motion.test.ts`, ler `globals.css` como texto (mesmo padrão do `scroll-scenes.test.ts`):
  - `it('declares contrast floors per theme')`: o bloco `:root` tem `--dim-large: 0.5` e `--dim-body: 0.62`; o bloco `.dark` tem `--dim-large: 0.4` e `--dim-body: 0.52`.
  - `it('slides [data-follow-header] with the header, below lg only')`: o bloco entre `/* follow header */` e `/* end follow header */` contém `@media (max-width: 1023px)`, `translate: 0 4rem`, `:root:has([data-site-header][data-hidden='true']) [data-follow-header]` e `prefers-reduced-motion: reduce` com `transition: none`.
  - Em `site-header.test.tsx`: `it('marks the header for followers')`, com `container.querySelector('header[data-site-header]')` não nulo.
- [ ] **Step 2:** rodar os testes. Esperado: FALHA.
- [ ] **Step 3:** implementar.
- [ ] **Step 4:** rodar os testes. Esperado: PASSA.
- [ ] **Step 5:** commit `feat(motion): below-lg query, contrast floors and header followers`.

### Task 2: Ciclo com capítulos empilhados

**Files:**
- Create: `src/features/home/components/cycle/cycle-stack-motion.ts`, `src/features/home/components/cycle/cycle-artifact-play.ts`
- Modify:
  - `work-cycle.tsx`;
  - `artifacts/spec-artifact.tsx`: `data-spec-box` no quadradinho, que fica vazado com `data-checked="false"`;
  - `artifacts/terminal-artifact.tsx`: abaixo de lg, o `pre` vira `flex flex-col justify-end max-h-[38svh] overflow-hidden`;
  - `globals.css`: apagar o bloco `scroll scenes` e os keyframes `scene-zoom` e `scene-in`.
- Delete: `src/tests/constraints/scroll-scenes.test.ts`
- Test: `cycle/__tests__/cycle-stack-motion.test.ts` (novo), `cycle/__tests__/cycle-artifact-play.test.ts` (novo), `cycle/__tests__/work-cycle.test.tsx`

**Interfaces:**
- Consumes: `BELOW_LG_QUERY`, `data-follow-header` (Task 1).
- Produces:
  - `buildCycleStack(motion: ScrollMotion, root: HTMLElement): () => void`. Cria os triggers e devolve uma limpeza que tira estilos inline e `data-stacked`.
  - `prepareArtifact(kind: ChapterId, art: HTMLElement, gsap: ScrollMotion['gsap']): void` e `playArtifact(kind: ChapterId, art: HTMLElement, gsap: ScrollMotion['gsap']): void`.

**Marcação em `work-cycle.tsx`:**
- **Cada `article[data-scene]`:** classes `max-lg:sticky max-lg:top-0 max-lg:h-svh lg:min-h-[100svh]`, no lugar de `min-h-[100svh]`. Ganha um filho `[data-scene-dim]` (`absolute inset-0 z-20 bg-background opacity-0 pointer-events-none lg:hidden`).
- **Classes antigas:** sem `scroll-scene` nem `scroll-scene-copy`.
- **Barrinhas:** depois do `h2`, um wrapper `[data-stack-bars]` com `data-follow-header`, classes `sticky top-0 z-30 h-0 hidden lg:hidden group-data-[stacked=true]/cycle:max-lg:block`. Dentro, quatro segmentos com `[data-stack-bar]`, de 2 px, em `top-2 inset-x-4`.
- **Espaço de leitura:** depois do último capítulo, `<div aria-hidden className="h-[50svh] lg:hidden" />`. Fica dentro do conteúdo da seção, porque o sticky não usa o padding do pai.

**Comportamento de `buildCycleStack`:**
- Põe `root.dataset.stacked = 'true'`.
- Para cada capítulo `i` com um próximo:
  - cria um trigger com `{ trigger: next, start: 'top bottom', end: 'top top', scrub: true }`;
  - no `onUpdate`, com `q = progress`: o `article[i]` recebe `scale(1 − 0.1q)` com origem `50% 0` e `border-radius: 18q px`; o `[data-scene-dim]` recebe opacidade `0.6q`; o `[data-stack-bar]` de índice `i` recebe `scaleX(q)`.
- O último segmento usa `{ trigger: lastArticle, start: 'top top', endTrigger: spacer, end: 'bottom bottom', scrub: true }`.
- O fundo `[data-scene-bg]` de cada capítulo recebe `gsap.fromTo(bg, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: article, start: 'top bottom', end: 'top top', scrub: true } })`.
- As peças: para cada capítulo cuja peça `[data-scene-art]` está abaixo da tela na montagem, chama `prepareArtifact` e cria `{ trigger: article, start: 'top top', once: true, onEnter: () => playArtifact(...) }`.

**Peças (`cycle-artifact-play.ts`):** cada `prepare` esconde e cada `play` mostra.
- **`pain`:** mensagens `p[data-reveal]` vão de `y: 10, opacity: 0` ao normal, com atrasos de 0, 0.35 e 0.9 s, duração 0.45 e `expo.out`.
- **`solution`:** `[data-spec-box]` muda `data-checked` de `false` para `true`, um a cada 320 ms, começando em 300 ms.
- **`product`:** o primeiro `[data-reveal]` vai de `scale: 0.94` com opacidade 0 ao normal. O segundo vai de `y: 40, rotation: -4` com opacidade 0 ao normal, 0.15 s depois. Duração 0.7.
- **`code`:** todas as linhas `[data-terminal-line]` começam com `hidden = true`. Elas são mostradas uma a uma, a cada 230 ms, começando em 200 ms.

**Steps:**
- [ ] **Step 1: testes de `cycle-stack-motion.test.ts`.** Usar um `gsap`/`ScrollTrigger` falso que guarda as configurações de `ScrollTrigger.create` e de `gsap.fromTo`, e uma raiz com quatro `article[data-scene]`, cada um com `img[data-scene-bg]`, `[data-scene-art]` e `[data-scene-dim]`, mais quatro barrinhas e o espaçador.
  - `it('never pins')`: nenhuma configuração tem `pin`.
  - `it('scales and dims the chapter being covered')`: o `onUpdate({ progress: 0.5 })` do trigger do capítulo 2 dá ao `article[0]` um `style.transform` com `scale(0.95)`, `borderRadius` igual a `9px`, opacidade `'0.3'` no `[data-scene-dim]` e `scaleX(0.5)` na barrinha 0.
  - `it('fills the last bar over the reading spacer')`: o último trigger tem `endTrigger` igual ao espaçador e `end` igual a `'bottom bottom'`.
  - `it('zooms each background from 1.12')`.
  - `it('prepares only artifacts below the fold')`: com o `getBoundingClientRect` do `art[0]` acima da tela, ele não é preparado, e os outros três são.
  - `it('cleanup removes inline styles and data-stacked')`.
- [ ] **Step 2: testes de `cycle-artifact-play.test.ts`.**
  - `it('code: hides every line, then shows them one by one')`, com fake timers: depois de 200 + 230×2 ms, três linhas visíveis.
  - `it('solution: checks boxes in order')`.
  - `it('pain: plays the messages with 0, 0.35 and 0.9 s delays')`, conferindo as chamadas de `gsap.to`.
- [ ] **Step 3: testes de `work-cycle.test.tsx`.**
  - `it('below lg it builds the stack, not the pinned timeline')`: com `BELOW_LG_QUERY` verdadeiro e `LG_QUERY` falso, `buildCycleStack` é chamado e `buildCycleTimeline` não.
  - `it('from lg it pins as before')`.
  - `it('ships every chapter sticky with svh and no scroll-scene class')`.
  - `it('renders a reading spacer after the last chapter')`.
  - `it('reduced motion builds nothing and shows every terminal line')`.
- [ ] **Step 4:** rodar os testes. Esperado: FALHA.
- [ ] **Step 5:** implementar e apagar o CSS antigo e o `scroll-scenes.test.ts`.
- [ ] **Step 6:** rodar os testes. Esperado: PASSA.
- [ ] **Step 7:** commit `feat(cycle): chapters stack on phones, each artifact plays as it settles`.

### Task 3: IA: cartas e trilho

**Files:**
- Create: `ai-method/ai-rail-motion.ts`, `ai-method/ai-model-deal.tsx` (cliente)
- Modify: `ai-method/ai-method-steps.tsx`, `ai-method/ai-method.tsx` (envolver o `ul[data-ai-models]` em `<ModelDeal>`)
- Test: `ai-method/__tests__/ai-rail-motion.test.ts` (novo), `ai-method/__tests__/ai-method.test.tsx`

**Interfaces:**
- Consumes: `BELOW_LG_QUERY`, `--dim-body`.
- Produces:
  - `buildAiRail(motion: ScrollMotion, list: HTMLOListElement): () => void`;
  - `ModelDeal({ children }: { children: ReactNode })`.

**Marcação:**
- O `ol[data-ai-steps]` perde todas as classes `max-lg:` de carrossel e vira `relative flex flex-col gap-3 max-lg:pl-8 lg:grid lg:grid-cols-6`.
- O trilho não pode ser um `li`, porque a lista é lida por leitor de tela. Ele fica como irmão do `ol`, num wrapper `relative`: `[data-ai-rail]` (`absolute left-[7px] top-4 bottom-4 w-0.5 bg-line lg:hidden`) com o filho `[data-ai-rail-fill]` (`bg-accent origin-top scale-y-0`).
- Cada `li` abaixo de lg tem:
  - largura total;
  - um `::before` em forma de ponto de 12 px em `-left-[29px] top-4`, verde quando `data-lit=true`;
  - `max-lg:motion-safe:translate-y-0 max-lg:motion-safe:translate-x-3 max-lg:motion-safe:data-[lit=true]:translate-x-0`;
  - título com `max-lg:group-data-[lit=false]/step:opacity-[var(--dim-body)]`;
  - as linhas do passo numa só linha mono, juntadas com `' · '`.
- O `SnapCounter` sai deste arquivo.

**Comportamento de `buildAiRail`:**
- Cria um trigger com `{ trigger: list, start: 'top 72%', end: 'bottom 72%', scrub: true }`.
- No `onUpdate`, o `[data-ai-rail-fill]` recebe `scaleY(p)`. Cada `li` recebe `data-lit = String(nodeY ≤ p·railHeight)`, sendo `nodeY` = `offsetTop` do `li` + 16. As posições são medidas na montagem e no `onRefresh`.
- A limpeza devolve `data-lit="true"` a todos e tira o transform.

**Comportamento de `ModelDeal`:**
- Abaixo de lg, sem movimento reduzido e com a grade abaixo da tela, os `li` recebem `gsap.set` com `rotationX: -75, y: 16, opacity: 0, transformPerspective: 600, transformOrigin: '50% 100%'`.
- Um trigger `once` em `top 85%` faz o `to` até o normal, com `stagger: 0.07`, duração 0.6 e `expo.out`.

**Steps:**
- [ ] **Step 1: testes.**
  - `it('fills the rail and lights steps whose node it has passed')`, com trigger falso, `onUpdate({ progress: 0.5 })` e `offsetTop` mockados.
  - `it('cleanup relights every step')`.
  - Em `ai-method.test.tsx`:
    - `it('below lg the steps are a vertical list with a rail, no carousel')`: sem `max-lg:snap-x`, com `[data-ai-rail]` e sem `[data-snap-counter]`;
    - `it('below lg it builds the rail')`;
    - `it('from lg the rail is not built and the lighting is unchanged')`, reaproveitando o teste atual;
    - `it('ModelDeal hides tiles only below the fold')`.
- [ ] **Step 2:** rodar os testes. Esperado: FALHA.
- [ ] **Step 3:** implementar.
- [ ] **Step 4:** rodar os testes. Esperado: PASSA.
- [ ] **Step 5:** commit `feat(ai): models deal in and a rail lights the steps on phones`.

### Task 4: "No ar" com profundidade, empurrãozinho e barra no contador

**Files:**
- Create: `live-work/live-work-depth.ts`
- Modify: `live-work/live-work-track.tsx`, `src/shared/ui-2026/snap-counter.tsx`
- Test: `live-work/__tests__/live-work-depth.test.ts` (novo), `live-work/__tests__/live-work.test.tsx`, `src/shared/ui-2026/__tests__/snap-counter.test.tsx`

**Interfaces:**
- Produces:
  - `attachCarouselDepth(track: HTMLElement): () => void`;
  - `nudgeOnce(track: HTMLElement, distance?: number): () => void`, com `distance` padrão de 70.

**Comportamento de `attachCarouselDepth`:**
- Mede uma vez, e de novo no `resize`, o `offsetLeft` e a largura de cada `li[data-live-card]`. A posição de snap é `track.scrollLeft + scroll-padding-left`.
- Em cada `scroll` do track, com rAF, para cada card calcula `d = (centroDoCard − (scrollLeft + paddingLeft + larguraDoCard/2)) / (larguraDoCard + gap)` e `a = min(|d|, 1)`:
  - o card recebe `scale(1 − 0.1a)`;
  - a imagem do card (`img`) recebe `translateX(${-d*9}%) scale(1.2)` e opacidade `1 − 0.5a`;
  - o card de tipo, sem imagem, só escala.
- A limpeza tira os estilos e os ouvintes.

**Comportamento de `nudgeOnce`:**
- Usa um IntersectionObserver com `threshold: 0.6`. Na primeira entrada, se `scrollLeft === 0` e não houve `pointerdown`, `touchstart` nem `wheel` no track:
  1. põe `scroll-snap-type: none` inline;
  2. chama `scrollTo({ left: distance, behavior: 'smooth' })`;
  3. após 420 ms, chama `scrollTo({ left: 0, behavior: 'smooth' })`;
  4. após mais 500 ms, tira o estilo inline.
- Um `pointerdown` ou `touchstart` durante o empurrão cancela os timers e restaura o snap na hora.

**`live-work-track.tsx`:** além do `wide` atual, `media.add({ mobile: BELOW_LG_QUERY }, …)` chama as duas funções e devolve as limpezas.

**`SnapCounter`:** vira `flex items-center gap-3`. Depois do texto vem `[data-snap-bar]` (`relative h-0.5 flex-1 overflow-hidden bg-line`), com um filho `bg-accent origin-left` em `transform: scaleX((index+1)/total)` e transição de 200 ms.

**Steps:**
- [ ] **Step 1: testes.**
  - `it('the snapped card is full size, a neighbour is scaled to 0.9 and its image dimmed to 0.5')`.
  - `it('image counter-slides by -9% per card of distance')`.
  - `it('nudges once and restores snap')`, com fake timers e IO capturado (`captureIntersection`).
  - `it('does not nudge after the user touched the track')`.
  - `it('a touch during the nudge cancels it')`.
  - `it('SnapCounter bar fills to (index+1)/total')`.
  - Em `live-work.test.tsx`: `it('below lg attaches depth and nudge; from lg builds the pinned track only')`.
- [ ] **Step 2:** rodar os testes. Esperado: FALHA.
- [ ] **Step 3:** implementar.
- [ ] **Step 4:** rodar os testes. Esperado: PASSA.
- [ ] **Step 5:** commit `feat(live-work): carousel depth, a one-time nudge and a counter bar on phones`.

### Task 5: Trajetória: faixa da empresa

**Files:**
- Modify: `trajectory/trajectory.tsx`, `trajectory/trajectory-scroller.tsx`, `messages/{pt,en,es}.json` (`trajectory.now`: "hoje" / "now" / "hoy")
- Test: `trajectory/__tests__/trajectory.test.tsx`

**Interfaces:**
- Consumes: `data-follow-header` (Task 1).
- Produces:
  - `TrajectoryScroller` põe `data-strip="on"` no root ao montar, em qualquer largura e também com movimento reduzido.
  - `activate(id)` também marca `data-before="true"` nos painéis de índice menor que o ativo.

**Marcação:**
- O root do `TrajectoryScroller` ganha `group/traj`.
- Antes do `ol`, entra `[data-stage-strip]` com `aria-hidden`, `data-follow-header` e as classes `sticky top-0 z-10 hidden h-16 overflow-hidden rounded-[2px] group-data-[strip=on]/traj:max-lg:block lg:hidden`.
- Dentro da faixa há uma camada por etapa: `span[data-stage-panel={id}]`, com `group/layer absolute inset-0 flex items-center justify-between px-4 opacity-0 transition-opacity duration-500 data-[active=true]:opacity-100 motion-reduce:transition-none`, fundo `company.color` e conteúdo:
  - logo (`CompanyLogo`, altura 26) com `translate-y-[60%] transition-transform duration-500 group-data-[active=true]/layer:translate-y-0 group-data-[before=true]/layer:-translate-y-[60%] motion-reduce:transition-none`;
  - à direita, `{year} – {nextYear ?? t('now')}` em mono semibold de 13 px, com `NN / 04` embaixo em mono de 11 px.
- As faixas de cada etapa (`data-stage-band`) ganham `group-data-[strip=on]/traj:hidden`.
- A primeira camada vem com `data-active="true"`.

**`trajectory-scroller.tsx`:**
- A ativação roda também com movimento reduzido. Hoje ela sai cedo com `prefersReducedMotion()`; essa saída vira só `motion-reduce` nas classes.
- Os painéis do desktop ganham `motion-reduce:transition-none`.
- Decisão: com movimento reduzido, o painel do desktop agora acompanha a etapa sem animação, em vez de ficar preso na primeira. É uma correção, não um movimento novo.

**Steps:**
- [ ] **Step 1: testes.**
  - `it('ships a sticky company strip below lg that follows the header')`: `[data-stage-strip][data-follow-header]` com quatro `[data-stage-panel]`.
  - `it('strip reads year ranges, with "hoje" for the current stage')`: `2021 – 2022`, `2026 – hoje`, `04 / 04`.
  - `it('turns the strip on and hides the per-stage bands once mounted')`: o root fica com `data-strip="on"`.
  - `it('activation marks earlier panels as before')`.
  - `it('activates stages even with reduced motion')`.
- [ ] **Step 2:** rodar os testes. Esperado: FALHA.
- [ ] **Step 3:** implementar.
- [ ] **Step 4:** rodar os testes. Esperado: PASSA.
- [ ] **Step 5:** commit `feat(trajectory): a sticky company strip swaps color, logo and years on phones`.

### Task 6: Texto: títulos com máscara, frase que acende e nome que sobe

**Files:**
- Create: `src/shared/ui-2026/scrub-text.tsx` (cliente; exportar no barrel `ui-2026`)
- Modify:
  - `src/shared/ui-2026/word-reveal.tsx`: cada palavra dentro de `span.inline-block.max-lg:overflow-hidden.max-lg:pb-[0.1em].max-lg:-mb-[0.1em]`;
  - `src/shared/ui-2026/reveal.tsx`;
  - `interlude/interlude.tsx`: a frase dentro de `<ScrubText effect="fill">`;
  - `closing/closing.tsx`: o nome grande dentro de `<ScrubText effect="rise">`, e cada `[data-name-word]` com `max-lg:overflow-hidden max-lg:pb-[0.12em]`.
- Test: `src/shared/ui-2026/__tests__/scrub-text.test.tsx` (novo), `src/shared/ui-2026/__tests__/reveal.test.tsx`

**Interfaces:**
- Consumes: `BELOW_LG_QUERY`, `--dim-large`.
- Produces: `ScrubText({ effect, children, className }: { effect: 'fill' | 'rise'; children: ReactNode; className?: string })`, que renderiza `<div data-scrub-text={effect}>`.

**Comportamento de `ScrubText`:** só abaixo de lg e sem movimento reduzido. Pega os `[data-reveal-word]` internos (n itens) e lê o piso com `getComputedStyle(root).getPropertyValue('--dim-large')` uma vez.
- **`fill`:** trigger `{ trigger: root, start: 'top 85%', end: 'top 50%', scrub: true }`. A palavra `i` recebe opacidade `piso + (1−piso)·clamp(p·n − i)`.
- **`rise`:** trigger `{ trigger: root, start: 'top bottom', end: 'top 25%', scrub: true }`. A letra `i` recebe `translateY(${(1 − clamp(p·1.8 − i·0.05))·100}%)`.
- A limpeza tira os estilos.

**Comportamento de `Reveal`:** passa a usar `gsap.matchMedia()`.
- **Abaixo de lg:**
  - não pega alvos dentro de `[data-scrub-text]`;
  - os `[data-reveal-word]` vão de `yPercent: 110` a 0, sem opacidade, com duração 0.7, `expo.out` e o `stagger` da prop;
  - os `[data-reveal]` ficam como hoje (`y: 24`, opacidade).
- **De lg para cima:** tudo exatamente como hoje.

**Steps:**
- [ ] **Step 1: testes.**
  - `it('fill: word opacity runs from the --dim-large floor to 1 in order')`: com `--dim-large: 0.4` no estilo e `onUpdate({ progress: 0.5 })` para quatro palavras, as palavras 0 e 1 ficam em `'1'` e as 2 e 3 em `'0.4'`.
  - `it('rise: letters climb with the scroll, staggered')`.
  - `it('does nothing from lg or with reduced motion')`.
  - Em `reveal.test.tsx`:
    - `it('below lg words rise from a mask (yPercent 110, no opacity)')`;
    - `it('below lg skips targets inside [data-scrub-text]')`;
    - `it('from lg words keep y 24 + opacity')`, o comportamento atual.
- [ ] **Step 2:** rodar os testes. Esperado: FALHA.
- [ ] **Step 3:** implementar.
- [ ] **Step 4:** rodar os testes, mais os de `interlude`, `closing` e `primitives`. Esperado: PASSA.
- [ ] **Step 5:** commit `feat(motion): masked word rise, a statement that fills and a name that climbs on phones`.

### Task 7: Escrita em foco e faixa que inclina

**Files:**
- Create: `writing/writing-focus.ts`
- Modify: `writing/writing-list.tsx` (`data-post-title` no título, `data-post-thumb` na capa), `stack-marquee/stack-marquee.tsx`
- Test: `writing/__tests__/writing-focus.test.ts` (novo), `writing/__tests__/writing.test.tsx`, `stack-marquee/__tests__/stack-marquee.test.tsx`

**Interfaces:**
- Produces: `buildWritingFocus(motion: ScrollMotion, list: HTMLUListElement): () => void`.

**Comportamento de `buildWritingFocus`:**
- Cada `li` ganha um trigger `{ trigger: li, start: 'top bottom', end: 'bottom top', scrub: true }`.
- No `onUpdate`, com `vh = innerHeight` e `h` = altura do `li`:
  - `centro = vh − p·(vh + h) + h/2` e `f = clamp(1 − |centro − vh/2| / (0.35·vh))`;
  - o `[data-post-title]` recebe opacidade `piso + (1−piso)·f`, com o piso de `--dim-large`;
  - o `[data-post-thumb]` recebe `scale(${0.82 + 0.18f})`, com origem `0 50%`;
  - a data não muda.
- O `writing-list.tsx` chama a função em `media.add({ mobile: BELOW_LG_QUERY })`. A capa que segue o mouse fica como está.

**Marquee:** abaixo de lg (`matchMedia(BELOW_LG_QUERY).matches`, lido no efeito), o `tick` acrescenta `skewX(${−skew}deg)`.
- `skew += (clamp(velocity·0.15, −6, 6) − skew)·0.15`.
- A velocidade do Lenis é sem sinal. Para a direção, use o `scrollY` anterior: `velocity` positiva quando rola para baixo.

**Steps:**
- [ ] **Step 1: testes.**
  - `it('the row at the middle of the screen is fully lit; a row far away rests at the floor')`.
  - `it('thumb scales from 0.82 to 1')`.
  - `it('the date never dims')`.
  - `it('below lg builds the focus; from lg does not')`.
  - Marquee: `it('below lg skews with scroll speed, clamped to 6deg')` e `it('from lg never skews')`.
- [ ] **Step 2:** rodar os testes. Esperado: FALHA.
- [ ] **Step 3:** implementar.
- [ ] **Step 4:** rodar os testes. Esperado: PASSA.
- [ ] **Step 5:** commit `feat(writing): the post at mid-screen comes into focus; the stack band leans with speed`.

### Task 8: Verificação e publicação
- [ ] **Gate completo:** suíte inteira, `tsc --noEmit`, `biome check .` e `knip`, via `rtk proxy`. Esperado: tudo verde.
- [ ] **Publicação:** `git push` da `redesign-2026`, deploy pelo webhook e status no Dokploy.
- [ ] **Contagem na prévia:** rodar de novo `scratchpad/vc/motion-census.mjs`. Esperado: no celular, ciclo com 20 ou mais, IA com 6 ou mais, no ar com 5 ou mais e trajetória com 4 ou mais.
- [ ] **Capturas em 390×844 e 375×667:**
  - home inteira;
  - cada capítulo assentado, conferindo se o retângulo de `[data-scene-art]` e o de `[data-scene-copy]` não se cruzam (se cruzarem, reduzir o padding de cima ou a escala da peça abaixo de 700 px de altura e repetir);
  - transbordo 0;
  - tema claro na IA e na escrita;
  - descendentes ("g" do nome, "ç") sem corte na máscara.
- [ ] **Desktop 1440:** ciclo e "No ar" fixados, grade da IA em seis colunas, capa que segue o mouse.
- [ ] **Lighthouse mobile:** CLS 0, desempenho de 80 ou mais e LCP de no máximo 4,1 s.
- [ ] **Revisão final:** um revisor novo, no modelo mais capaz, com a Review Focus deste plano. Correções com teste RED→GREEN.
