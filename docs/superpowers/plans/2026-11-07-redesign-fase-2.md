# Redesign 2026 — Fase 2 (tudo do zero) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refazer no estilo novo, do zero, todas as partes que ainda são do site antigo: shell (header, rodapé, fundo, botão do assistente), o resto da home (Mais dele, No ar, Trajetória, Atto, Escrita, Fechamento), as páginas de case, `/projects`, `/blog`, `/blog/<slug>` e 404. Ao final, apagar todos os componentes visuais antigos e mandar os textos em pt para o ponto de aprovação 2.

**Architecture:** Na branch `redesign-2026`, depois da Fase 1. Só a UI é nova. Dados e lógica que não são visuais continuam: stores (`use-theme`, `use-chat`, `use-retro-mode`), `features/blog/lib`, `features/projects/lib`, rotas e i18n do next-intl, API do chat, SEO/JSON-LD. O shell sobe para `src/app/[locale]/layout.tsx`, então header, rodapé e a estrela do Altair aparecem em todas as páginas. Componentes de cliente recebem texto por props de wrappers de servidor, que é o padrão da Fase 1. O chat atual continua atrás de `altair:open` até a Fase 3.

**Tech Stack:** Next.js 16, React 19, next-intl 4, Tailwind v4, GSAP 3.15 + ScrollTrigger, Lenis, next-mdx-remote, Vitest 5 + Testing Library, pnpm 10.28.

**Spec:** `docs/superpowers/specs/2026-11-07-redesign-2026-design.md`. A prévia v5, que o Ranielli viu, é a referência visual de Trajetória, No ar, Escrita e Fechamento: `~/Projetos/pessoal/ranimontagna.com/.superpowers/brainstorm/48220-1794065355/content/previa-v5.html`.

## Global Constraints

- Tudo da Fase 1 continua valendo:
  - sem `backdrop-filter`;
  - animar só `transform`/`opacity` (`clip-path` permitido em transições de imagem e cena);
  - nada depende de JS para aparecer;
  - GSAP e Lenis só via `loadScrollMotion()`;
  - movimento reduzido mantém o conteúdo e tira o deslocamento;
  - `(max-width: 760px)` é celular e tem composição própria;
  - canvas só desenha quando visível;
  - nada de imagem gerada do Ranielli nem de tela de produto;
  - conteúdo honesto;
  - comandos com `npx pnpm@10.28.0`;
  - gates (vitest da task, `typecheck`, `biome check`) antes de cada commit;
  - commits convencionais com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Nenhum componente visual antigo pode ser importado por código novo.** Isso inclui `shared/components/animations/*`, `ui/breadcrumbs`, `ui/service-card`, `ui/terminal-window`, `ui/infinite-marquee`, `layout/header`, `layout/footer`, `spectral-background`, `language-switcher`, `theme-toggle`, `color-theme-picker`, `user-preference-controls` e os componentes de `features/{home,blog,projects}/components` anteriores à Fase 1. A Task 15 apaga todos.
- Cores só por tokens (`--background`, `--foreground`, `--muted`, `--accent`, `--on-accent`, `--line`, `--surface*`). Hex só em artefato de terminal (allowlist no teste da Task 1).
- Sem sombra em repouso, sem gradiente decorativo, sem cards em grade de 3 com ícone ("AI slop"). Cada seção tem composição e movimento próprios (spec §6).
- Texto novo em pt, en e es (en/es são rascunho até a aprovação 2). Nome próprio e marca ficam no código.
- Ids de seção da home, fixos (nav, Altair e links dependem deles): `como-trabalho`, `no-ar`, `trajetoria`, `atto`, `escrita`, `contato`.
- Atto: só o que o site da Atto publica, copiado de `~/Projetos/empresa/atto/atto/apps/web/src/content/site.ts` (`CONTACT`, `whatsappHref`, os serviços Web/Mobile/APIs/IA & Automação/Marketing e `CASES` com ids `fronteira-sul-drones`, `tala`, `quadralize` e `nan`). O Atto Read não está nos cases do site da Atto, então não entra na seção Atto; aparece só em "No ar".
- Rota de case: `/projects/<slug>`, seguindo o segmento `/projects` que já existe e os redirects de `next.config.ts`. A spec diz `/projetos`, mas o site inteiro usa `/projects`; nenhum link público pode quebrar.

## Review Focus

1. **Troca de idioma ou tema em qualquer página:** fica na mesma página (e no mesmo `#hash` na home), e as seções novas continuam legíveis no claro e nas cores de destaque. Testes nas Tasks 1 (hex fora da allowlist) e 2 (troca de idioma preserva o caminho).
2. **Blog fora do ar (limite do GitHub, lista vazia):** a home esconde a seção Escrita sem quebrar, e `/blog` mostra um estado vazio. Testes nas Tasks 7 e 12.
3. **Só teclado e leitor de tela:** o menu do site prende o foco, fecha com Esc e devolve o foco; o skip link funciona; o cursor-imagem da Escrita não esconde informação. Testes nas Tasks 2 e 7.
4. **Slug de case desconhecido e links antigos:** `/projects/xyz` dá 404; `/projects`, `/pt/projects`, `/blog/<slug>` e os `#ids` antigos que a nav usava continuam respondendo. Testes nas Tasks 10 e 11.
5. **Fotos não carregam ou JS falha nas seções com imagem (Mais dele, Trajetória, No ar):** o texto e o `alt` continuam presentes, e nenhuma imagem fica com `opacity: 0` sem script. Testes nas Tasks 3, 4 e 5.

---

### Task 1: Base visual 2026 (primitivas e guardas)

**Files:**
- Create: `src/shared/ui-2026/word-reveal.tsx`, `reveal.tsx`, `action-link.tsx`, `photo-reveal.tsx`, `section-heading.tsx`, `index.ts`
- Test: `src/shared/ui-2026/__tests__/*.test.tsx`, `src/tests/constraints/no-hex-in-new-ui.test.ts`, `src/tests/constraints/messages-parity.test.ts`

**Interfaces:**
- Produces:
  - `WordReveal({ text, as = 'h2', className }: { text: string; as?: 'h1'|'h2'|'h3'|'p'; className?: string })` (server): `aria-label={text}` no elemento, cada palavra num `<span data-reveal-word aria-hidden>`.
  - `Reveal({ children, className, stagger = 0.07 }: { children: ReactNode; className?: string; stagger?: number })` (client): depois de montar, e sem movimento reduzido, usa `loadScrollMotion()` + `ScrollTrigger.batch` em `[data-reveal], [data-reveal-word]` dentro dele. Elementos abaixo da dobra sobem `y: 24 → 0` e `autoAlpha: 0 → 1`, uma vez só. Os que já estão na tela não são escondidos.
  - `ActionLink({ href, variant = 'solid', external, children, className }: { href: string; variant?: 'solid'|'outline'|'quiet'; external?: boolean; ... })` (server): `<a>`, ou `Link` do next-intl quando `href` começa com `/`. `external` acrescenta `target="_blank" rel="noopener noreferrer"`.
  - `PhotoReveal({ src, alt, effect, sizes, priority, className }: { src: string; alt: string; effect: 'mask'|'scale'|'parallax'; sizes: string; priority?: boolean; className?: string })` (client): `<img>` via `getImageProps`. Com movimento, `mask` vai de `clip-path inset(12% 18% 12% 18%)` até `inset(0)`, `scale` vai de `1.2` a `1`, `parallax` usa `yPercent -12…12`, tudo em scrub. Sem movimento ou sem JS, a imagem fica inteira e visível.
  - `SectionHeading({ id, kicker, title, lead }: { id?: string; kicker: string; title: string; lead?: string })` (server): kicker mono em `--accent`, título com `WordReveal as="h2"`, lead em `--foreground`.
  - `SECTION_X = 'px-4 sm:px-8 lg:px-12'` e `SECTION_Y = 'py-24 sm:py-32'` em `index.ts`.

- [ ] **Step 1: Testes que falham**

```tsx
it('WordReveal keeps the sentence accessible and splits words', () => {
  render(<WordReveal text="Coloca no ar." />)
  expect(screen.getByRole('heading', { level: 2, name: 'Coloca no ar.' })).toBeInTheDocument()
  expect(document.querySelectorAll('[data-reveal-word]')).toHaveLength(3)
})
it('Reveal loads no motion under reduced motion and hides nothing', async () => { /* mockMatchMedia reduced; render Reveal with a [data-reveal] child; loadScrollMotion not called; child visible */ })
it('ActionLink opens external links in a new tab safely', () => { /* external → target _blank, rel noopener noreferrer */ })
it('PhotoReveal renders a visible img with alt before motion loads', () => { /* img alt present, style.opacity !== '0', no clip-path inline */ })
```

```ts
// no-hex-in-new-ui.test.ts — scans src/shared/ui-2026, src/shared/shell, src/features/home/components/{interlude,live-work,trajectory,atto,writing,closing}, src/features/cases, src/features/blog/components, src/features/projects/components
it('new UI uses theme tokens, not hex colors (except terminal artifacts)', () => {
  expect(findHexOutsideAllowlist(DIRS, ALLOW /* terminal-artifact.tsx, *-terminal*.tsx */)).toEqual([])
})
// messages-parity.test.ts
it('pt, en and es expose exactly the same message keys', () => {
  expect(flatKeys(en)).toEqual(flatKeys(pt)); expect(flatKeys(es)).toEqual(flatKeys(pt))
})
```

- [ ] **Step 2:** FAIL. **Step 3:** implementar (`Reveal` com cleanup via `gsap.context().revert()`). **Step 4:** PASS. A paridade precisa passar já na base; se falhar, corrigir as chaves que faltam.
- [ ] **Step 5: Commit** `feat(ui): 2026 design primitives and guards`.

### Task 2: Shell novo (header, menus, rodapé, estrela do Altair)

**Files:**
- Create: `src/shared/shell/site-nav.ts`, `site-header.tsx` (server), `header-behavior.tsx` (client), `site-menu.tsx` (client), `preferences-menu.tsx` (client), `site-footer.tsx` (server), `altair-launcher.tsx` (client), `shell-widgets.tsx` (client)
- Modify: `src/app/[locale]/layout.tsx` (tirar `SpectralBackground`; renderizar header, `{children}`, rodapé e widgets), `src/shared/config/i18n/client-messages.ts` (`shell: ['notFound', 'chat']`; `home: ['contact']` até a Task 8; `projects: ['projectsPage']`; `blog: ['blog']`), `src/app/[locale]/page.tsx`, `src/features/home/home.tsx` (sair `headerContent` e `HomeClientWidgets`), `src/app/[locale]/blog/layout.tsx` e `projects/layout.tsx` (sair os headers antigos), `messages/*.json` (namespace `shell`)
- Test: `src/shared/shell/__tests__/*.test.tsx`; atualizar `client-messages.test.ts`

**Interfaces:**
- Consumes: `openAltair`, `ALTAIR_OPEN_EVENT` (Fase 1), `useTheme`, `useChat`, `Link`/`usePathname`/`useRouter` de `@/shared/config/i18n/navigation`, `socialLinks` de `@/shared/lib/social-links`, `RetroSecret`.
- Produces:
  - `SITE_NAV: readonly { id: 'no-ar'|'trajetoria'|'atto'|'escrita'|'blog'|'projetos'; labelKey: string; href: string }[]`. Os itens da home usam `/#<id>`; `blog` usa `/blog`; `projetos` usa `/projects`.
  - `SiteHeader()` (async server).
  - `PreferencesMenu({ labels })`: idioma pt/en/es (`router.replace(pathname + hash, { locale })`), tema claro/escuro e cor de destaque (`setColorTheme`) com as 7 cores de `COLOR_THEMES`.
  - `SiteMenu({ items, socials, labels })`: botão "Menu" em todos os tamanhos (no celular é a navegação; no desktop é onde ficam as redes, spec §4.9). Abre em tela cheia com a nav grande e as redes; prende o foco, fecha com Esc e devolve o foco ao botão.
  - `AltairLauncher({ label })`: estrela fixa no canto inferior direito, com `aria-label`, que chama `openAltair()`.
  - `ShellWidgets()`: carrega o chat atual de forma preguiçosa ao ouvir `altair:open`; `⌘K`/`Ctrl+K` disparam `openAltair()`. O `CommandMenu` antigo deixa de ser montado.
  - `SiteFooter()`: linha final com © ano, links Blog e Projetos, idioma e os 6 `RetroSecret` (`dos`, `mac`, `gameboy`, `xp`, `newspaper`, `ide`) discretos.
- Comportamento do header: transparente no topo; ao rolar, `bg-background` sólido (sem blur); esconde ao descer e volta ao subir (`translateY`). No desktop: nome, nav, preferências e Menu. No celular: nome + Menu (a estrela fica no canto).

- [ ] **Step 1: Testes que falham**

```tsx
it('header links every home section and the blog', async () => { /* render(await SiteHeader()); links with hrefs '/#no-ar','/#trajetoria','/#atto','/#escrita','/blog','/projects' */ })
it('changing language keeps the path and the hash', () => { /* pathname '/blog/x', location.hash '#a' → router.replace('/blog/x#a', { locale: 'en' }) */ })
it('site menu traps focus, closes on Escape, returns focus and lists the socials', async () => { /* open → focus inside; Tab cycles; Escape closes; button focused; LinkedIn/Instagram/X/GitHub links */ })
it('the star and ⌘K both dispatch altair:open', () => { /* click launcher → spy; keydown meta+k → spy */ })
it('footer keeps all six retro secrets', async () => { /* querySelectorAll('[data-retro-secret]').length === 6 (add the attribute if RetroSecret lacks one) */ })
it('layout no longer renders the spectral background', () => { /* read layout.tsx source: not contains 'SpectralBackground' */ })
```

- [ ] **Step 2:** FAIL. **Step 3:** implementar e ajustar `client-messages` e o teste dele. **Step 4:** PASS + `npx pnpm@10.28.0 test` verde.
- [ ] **Step 5: Commit** `feat(shell): new header, menus, footer and Altair star on every page`.

### Task 3: "Mais dele" (interlúdio com foto)

**Files:**
- Create: `src/features/home/components/interlude/interlude.tsx` (server)
- Modify: `messages/*.json` (`interlude`)
- Test: `.../interlude/__tests__/interlude.test.tsx`

**Interfaces:**
- Consumes: `PhotoReveal`, `WordReveal`, `Reveal`.
- Produces: `Interlude()` (async server). Foto `hero-ranielli.webp` com `effect="mask"` em tela quase cheia, mais uma frase grande palavra por palavra. A frase é um fato curto sobre ele (ex.: origem no interior do RS + o que constrói). O texto pt sai do `about` atual em `messages/pt.json`, sem inventar.
- No celular: foto 70svh, frase embaixo.

- [ ] **Step 1: Teste** — renderiza a frase como texto e a foto com `alt`; a foto fica visível sem movimento (sem `opacity: 0` inline).
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(home): photo interlude`.

### Task 4: "No ar" (projetos em destaque)

**Files:**
- Create: `src/features/home/components/live-work/live-work.data.ts`, `live-work.tsx` (server), `live-work-track.tsx` (client)
- Modify: `messages/*.json` (`liveWork`), `public/redesign/products/*` (capturas que faltarem, com origem em `docs/redesign/assets.md`)
- Test: `.../live-work/__tests__/*.test.tsx`

**Interfaces:**
- Consumes: `SectionHeading`, `ActionLink`, `loadScrollMotion`, `MOBILE_QUERY`.
- Produces:
  - `type LiveWorkItem = { slug: 'grimory'|'klick'|'agent-toolkit'|'argus'|'atto-read'; image: { src: string; alt: string } | null; terminal?: string[]; href: string; external: boolean }`.
  - `LIVE_WORK`, nesta ordem: Grimory (`/projects/grimory`), Klick (`/projects/klick`), agent-toolkit (repo/npm do README), Argus (link só se o repo for público; se não, sem link) e Atto Read (URL pública se houver).
  - `LiveWork()` (async server, `id="no-ar"`) e `LiveWorkTrack({ children })` (client).
- Visual: no desktop, faixa horizontal fixada (`containerAnimation`, `end` igual à largura da faixa, no máximo ~3 telas de rolagem); a imagem de cada card cresce de `scale 0.86` a `1` ao entrar. No celular, lista vertical com `PhotoReveal effect="scale"`.
- Imagens: capturas reais (Grimory: `grimory-compendium.webp`; Klick: `klick-timer.webp`). Projeto sem captura pública usa um cartão tipográfico ou um terminal com o comando real (agent-toolkit: `npx` do README). Nunca imagem gerada de tela.
- Texto: 1 linha de título + 1 frase por projeto, tirada do README/PRODUCT de cada repo; números só se forem verificáveis na hora.

- [ ] **Step 1: Testes**

```tsx
it('lists the five projects in order with links to the cases', async () => { /* titles order; grimory → '/projects/grimory'; klick → '/projects/klick' */ })
it('never renders an empty image slot', () => { /* items with image null render the typographic/terminal card */ })
it('does not pin under reduced motion or on phones', async () => { /* mockMatchMedia reduced → loadScrollMotion not called; MOBILE_QUERY true → no containerAnimation */ })
```

- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(home): live work section`.

### Task 5: Trajetória

**Files:**
- Create: `src/features/home/components/trajectory/trajectory.data.ts`, `trajectory.tsx` (server), `trajectory-scroller.tsx` (client)
- Create: `public/companies/atto.svg` (copiado de `atto/apps/web/public/attodev-logo.svg`; se as cores forem fixas, renderizar inline com `currentColor`)
- Modify: `messages/*.json` (`trajectory`; pode reaproveitar o texto de `experience.jobs.*`, revisado)
- Test: `.../trajectory/__tests__/*.test.tsx`

**Interfaces:**
- Produces:
  - `type Stage = { id: 'sbsistemas'|'smarten'|'luizalabs'|'lemon-atto'; year: string; logos: { src: string; alt: string }[]; photo: { src: string; alt: string } }`.
  - `STAGES` em ordem crescente, de 2021 a 2026. Logos: `sbsistemas.svg`, `smarten.webp`, `luizalabs.webp`, `lemon-symbol-white.png` + `atto.svg` na etapa 2026. Fotos: `about-ranielli.webp`, `pc-avatar.webp`, `avatar.webp`, `hero-ranielli.webp`.
  - Texto por etapa: cargo, período, o que fez, impacto (só números já presentes em `messages`, como "1.000+ lojas") e tecnologias.
  - `Trajectory()` (async server, `id="trajetoria"`).
- Visual: no desktop, duas colunas. A foto fica fixa à esquerda e troca por cortina (`clip-path inset(100% 0 0 0) → inset(0)`) quando a etapa ativa muda. O ano da etapa ativa acende em `--accent`. No celular, cada etapa traz a sua foto em faixa (16:9) com `PhotoReveal effect="mask"`.

- [ ] **Step 1: Testes**

```tsx
it('renders every stage in order with logo, role, period and stack', async () => { /* 4 articles; years 2021,2022,2023,2026; logos have alt */ })
it('all stage text is server-rendered and visible without motion', async () => { /* each role visible */ })
it('marks the active stage from the scroll position', () => { /* trajectory-scroller with mocked ScrollTrigger onToggle → data-active on the right stage */ })
```

- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(home): trajectory with company logos`.

### Task 6: Atto

**Files:**
- Create: `src/features/home/components/atto/atto.data.ts`, `atto-section.tsx` (server), `atto-cases.tsx` (client, só para abrir e fechar detalhes)
- Modify: `messages/*.json` (`atto`)
- Test: `.../atto/__tests__/*.test.tsx`

**Interfaces:**
- Produces:
  - `ATTO_CONTACT = { whatsappNumber: '5554999906417', defaultMessage: string, site: 'https://attodev.com.br' }`.
  - `attoWhatsappHref(message?: string): string` (mesma regra do site da Atto: `https://wa.me/<n>?text=<encodeURIComponent>`).
  - `ATTO_CASES` com os 4 cases, copiando `name`, `tagline`, `description` e `url` do site da Atto, em pt. Em en/es, só tagline e descrição traduzidas.
  - `ATTO_SERVICES`: `['web', 'mobile', 'apis', 'ai', 'marketing']`.
  - `AttoSection()` (async server, `id="atto"`).
- Visual: logo da Atto, título forte e uma frase sobre o que a Atto faz. Serviços numa linha só (lista em texto, não cards). Cases como lista indexada (`01`–`04`) com linhas que expandem (descrição + link do site quando `url` existe). CTA sólido "Falar com a Atto no WhatsApp", mais o link do site, onde vive a Vega.

- [ ] **Step 1: Testes**

```ts
it('builds the WhatsApp link like the Atto site', () => {
  expect(attoWhatsappHref('Oi, quero um app')).toBe('https://wa.me/5554999906417?text=Oi%2C%20quero%20um%20app')
})
it('shows only the cases the Atto site publishes', () => {
  expect(ATTO_CASES.map((c) => c.id)).toEqual(['fronteira-sul-drones', 'tala', 'quadralize', 'nan'])
})
```

```tsx
it('renders the Atto CTA as an external WhatsApp link', async () => { /* role link name ctaWhatsapp href starts 'https://wa.me/5554999906417' target _blank */ })
it('case details are reachable by keyboard', () => { /* <details>/<summary> or button aria-expanded toggles */ })
```

- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(home): Atto section`.

### Task 7: Escrita

**Files:**
- Create: `src/features/home/components/writing/writing.tsx` (server), `writing-list.tsx` (client)
- Modify: `messages/*.json` (`writing`)
- Test: `.../writing/__tests__/*.test.tsx`

**Interfaces:**
- Consumes: `getAllPosts(locale)` de `@/features/blog/lib/blog`, `resolveBlogImageUrl`, `formatBlogDate`.
- Produces: `Writing({ locale }: { locale: string })` (async server, `id="escrita"`). Mostra os 4 posts mais recentes. Com lista vazia ou erro, devolve `null`, e a nav continua apontando para `/blog`. `WritingList({ posts })` (client).
- Visual (v5): linhas grandes com título e data. No desktop, a imagem de capa segue o cursor (`transform` com lerp, `pointer-events: none`, `aria-hidden`). No celular, miniatura dentro da linha. Link "Ler o blog".

- [ ] **Step 1: Testes**

```tsx
it('lists the four latest posts linking to their pages', async () => { /* mock getAllPosts → 6 posts; 4 links '/blog/<slug>' in date order */ })
it('renders nothing when the blog is unavailable', async () => { /* getAllPosts rejects → container empty, no throw */ })
it('the cursor image is decorative', () => { /* follower has aria-hidden and every title is a real link */ })
```

- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(home): writing section`.

### Task 8: Fechamento

**Files:**
- Create: `src/features/home/components/closing/closing.tsx` (server), `copy-email-button.tsx` (client)
- Modify: `messages/*.json` (`closing`)
- Test: `.../closing/__tests__/*.test.tsx`

**Interfaces:**
- Consumes: `attoWhatsappHref`, `socialLinks` e `getResumeByLocale(locale)` (de `social-links.tsx`), `WordReveal`.
- Modify: `src/shared/config/i18n/client-messages.ts` (`home: []`, o namespace `contact` sai junto com o formulário).
- Produces: `Closing()` (async server, `id="contato"`), com:
  - chamada para a Atto (WhatsApp);
  - e-mail `contato@ranimontagna.com` com botão de copiar;
  - o nome em tela cheia, letra a letra, como na v5;
  - redes LinkedIn, Instagram, X e GitHub com ícones e `aria-label`;
  - links para o currículo em pt/en.
- O formulário de contato antigo (Formly) sai. O contato fica no e-mail e no WhatsApp da Atto (spec §4.9).

- [ ] **Step 1: Testes** — cada rede tem link externo seguro; o botão de copiar escreve o e-mail no clipboard (`navigator.clipboard.writeText` mockado) e anuncia por `aria-live`; o CTA da Atto aponta para `wa.me`.
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(home): closing with socials and Atto call`.

### Task 9: Montar a home nova

**Files:**
- Modify: `src/features/home/home.tsx`, `src/app/[locale]/page.tsx`, `src/features/home/components/home-intro.tsx`, `src/features/home/components/hero/hero-2026.tsx` (CTA `href="#no-ar"`), `src/features/home/components/cycle/work-cycle.tsx` (`id="como-trabalho"` + link final "Ver os cases" → `#no-ar`)
- Test: `src/features/home/__tests__/home.test.tsx`, `hero-2026.test.tsx`

**Interfaces:**
- Produces: a ordem da home é Hero2026 → StackMarquee → WorkCycle → Interlude → LiveWork → Trajectory → AttoSection → Writing → Closing. `HomeSections` e `deferred-home-sections.tsx` saem do caminho (a Task 15 apaga).

- [ ] **Step 1: Testes** — a home renderiza os ids na ordem (`como-trabalho`, `no-ar`, `trajetoria`, `atto`, `escrita`, `contato`); todo `href="/#..."` de `SITE_NAV` aponta para um id que existe na home; o CTA do hero aponta para `#no-ar`.
- [ ] **Step 2–4:** FAIL → implementar → PASS + suíte inteira verde.
- [ ] **Step 5: Commit** `feat(home): assemble the new home`.

### Task 10: Páginas de case (Klick e Grimory)

**Files:**
- Create: `src/features/cases/cases.data.ts`, `src/features/cases/components/{case-hero,case-chapter,case-gallery,case-next}.tsx`, `src/app/[locale]/projects/[slug]/page.tsx`
- Modify: `messages/*.json` (`cases.klick.*`, `cases.grimory.*`), `public/redesign/products/*` (capturas extras com a origem registrada)
- Test: `src/features/cases/__tests__/*.test.tsx`, `src/app/[locale]/projects/[slug]/__tests__/page.test.tsx`

**Interfaces:**
- Produces:
  - `type CaseSlug = 'klick'|'grimory'`.
  - `type CaseStudy = { slug: CaseSlug; liveUrl: string | null; repoUrl: string | null; hero: Img; gallery: Img[]; stack: string[]; next: CaseSlug }`, com `Img = { src: string; alt: string }`.
  - `CASES: Record<CaseSlug, CaseStudy>`; `getCase(slug: string): CaseStudy | null`.
  - A página faz `generateStaticParams` para `{klick, grimory} × {pt, en, es}`, `generateMetadata` (título, descrição, OG com a captura) e `notFound()` para slug desconhecido.
- Estrutura dos capítulos (o texto sai de `klick/README.md` + `klick/docs/research/*` e de `grimory/PRODUCT.md`, honesto):
  1. a dor (paráfrase rotulada da pesquisa);
  2. as decisões (o que entrou e o que ficou de fora);
  3. o produto (galeria de capturas reais com `PhotoReveal`);
  4. como foi feito (IA + revisão, stack);
  5. próximo case.
- O Klick pode usar a cena fixada no formato da v5, reaproveitando `buildCycleTimeline` só se couber sem mudar a interface; senão, capítulos em tela cheia com revelação de imagem.

- [ ] **Step 1: Testes**

```ts
it('getCase returns null for unknown slugs', () => { expect(getCase('xyz')).toBeNull() })
it('static params cover both cases in every locale', async () => { expect(await generateStaticParams()).toHaveLength(6) })
```

```tsx
it('unknown slug triggers notFound', async () => { /* await expect(Page({ params: Promise.resolve({ locale: 'pt', slug: 'xyz' }) })).rejects / notFound called */ })
it('renders every chapter heading and the gallery alts server-side', async () => { /* klick: 4 chapter h2 + gallery img alts */ })
```

- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(cases): Klick and Grimory case pages`.

### Task 11: `/projects` novo

**Files:**
- Modify: `src/app/[locale]/projects/page.tsx`
- Create: `src/features/projects/components-2026/{projects-index,repo-list,language-filter}.tsx` (a Task 15 apaga `features/projects/components` antigo e renomeia a pasta para `components`)
- Test: `src/features/projects/components-2026/__tests__/*.test.tsx`

**Interfaces:**
- Consumes: `getGitHubProjectSnapshot()` (sem mudança), `CASES`.
- Produces: a página tem os cases primeiro (Klick e Grimory como entradas grandes que levam aos cases), depois o GitHub (números do snapshot e lista de repositórios com filtro por linguagem, em client). Sem o CTA antigo; no fim, chamada para a Atto (`attoWhatsappHref`).

- [ ] **Step 1: Testes** — os cases aparecem antes dos repositórios; o filtro por linguagem esconde repositórios de outras linguagens e volta com "todas"; com o snapshot vazio, mostra estado vazio sem quebrar.
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(projects): new projects page`.

### Task 12: `/blog` novo

**Files:**
- Modify: `src/app/[locale]/blog/page.tsx`
- Create: `src/features/blog/components-2026/{blog-index,post-row,featured-post}.tsx`
- Test: `src/features/blog/components-2026/__tests__/*.test.tsx`

**Interfaces:**
- Consumes: `getAllPosts`, `resolveBlogImageUrl`, `formatBlogDate`, `generateBlogJsonLd` (sem mudança).
- Produces: título palavra por palavra; o post mais recente em destaque (capa grande com `PhotoReveal effect="scale"`); os demais em linhas agrupadas por ano (título, resumo, data, tempo de leitura, miniatura). Sem posts, mostra estado vazio.

- [ ] **Step 1: Testes** — agrupa por ano em ordem decrescente; destaque = mais recente; lista vazia mostra a mensagem `blogIndex.empty`; cada linha é um link para `/blog/<slug>`.
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(blog): new blog index`.

### Task 13: Página de post nova

**Files:**
- Modify: `src/app/[locale]/blog/[slug]/page.tsx` (mantém `MDXRemote`, `remarkGfm`, `remarkBlogContentPolicy` e o mapeamento de mídia)
- Create: `src/features/blog/components-2026/{article-header,article-body,reading-progress,post-nav,code-block,article-image}.tsx`; estilos `.article-2026` em `globals.css` (tipografia longa com tokens)
- Test: `src/features/blog/components-2026/__tests__/article*.test.tsx`

**Interfaces:**
- Consumes: `getPostBySlug`, `getAdjacentPosts`, `MermaidDiagram` (lógica de render mantida; só o invólucro novo), `ImageWithLightbox` → substituído por `ArticleImage` (abre num `<dialog>` nativo).
- Produces:
  - cabeçalho com título, data, tempo de leitura e capa;
  - corpo `.article-2026`, com medida de 68ch e blocos de código em `code-block` com botão de copiar;
  - progresso de leitura em `scaleX`;
  - anterior e próximo;
  - voltar ao blog;
  - JSON-LD sem mudança.
- O formato dos posts do admin não muda (spec §7).

- [ ] **Step 1: Testes** — um post com título, imagem, mermaid e código renderiza cabeçalho, imagem com `alt`, diagrama e botão de copiar; a imagem abre e fecha com teclado (Enter/Esc); anterior e próximo apontam para os slugs certos; slug inexistente → `notFound()`.
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(blog): new article page`.

### Task 14: 404 e erros

**Files:**
- Modify: `src/app/[locale]/not-found.tsx`, `src/app/not-found.tsx`, `src/app/[locale]/[...rest]/page.tsx`, `src/app/global-error.tsx`
- Create: `src/shared/ui-2026/status-view.tsx`
- Test: `src/shared/ui-2026/__tests__/status-view.test.tsx`

**Interfaces:**
- Produces: `StatusView({ code, title, body, actions }: { code: '404'|'500'; title: string; body: string; actions: { href: string; label: string }[] })`. O código aparece enorme, com glifos que se embaralham uma vez ao montar (sem movimento reduzido); ações para home, blog e Altair.

- [ ] **Step 1: Testes** — o código, o título e as ações são texto e links reais; com movimento reduzido, nada embaralha.
- [ ] **Step 2–4:** FAIL → implementar → PASS.
- [ ] **Step 5: Commit** `feat(ui): new 404 and error views`.

### Task 15: Pendências da Fase 1 e remoção do antigo

**Files:**
- Modify:
  - `code-portrait.tsx`: o loop só começa com `ready`; o MutationObserver só marca `colorsStale` se `light`/`dark` ou `data-color-theme` mudou; `preload()` da foto;
  - `hero-portrait.tsx`: `gsap.matchMedia` para o celular e a rotação;
  - `work-cycle.tsx`: cachear a NodeList do terminal;
  - `stack-marquee.tsx`: metade da largura medida no resize;
  - `cycle-timeline.ts`: `refreshPriority: 2` e comentário correto.
- Delete: todo componente visual antigo listado nas Global Constraints, com os testes, as mensagens que só eles usavam (`hero`, `about`, `skills`, `experience`, `projects` da home, `services`, `contact`, `footer`, `header`, `commandMenu`) e `public/` sem uso. Renomear `components-2026` para `components`.
- Test: um teste novo para cada pendência (loop parado sem foto; MO ignora `lenis-*`; `matchMedia` na revelação do hero; `refreshPriority: 2`); `npx pnpm@10.28.0 knip` limpo.

- [ ] **Step 1:** testes das pendências → FAIL → corrigir → PASS.
- [ ] **Step 2:** apagar o antigo; `grep -rE "components/(animations|layout|spectral-background|language-switcher|theme-toggle|color-theme-picker|user-preference-controls)|ui/(breadcrumbs|service-card|terminal-window|infinite-marquee)" src` → vazio.
- [ ] **Step 3:** `npx pnpm@10.28.0 test`, `typecheck`, `check`, `knip`, `build` → verdes.
- [ ] **Step 4: Commit(s)** `fix(home): phase 1 follow-ups` e `chore: remove the 2025 UI`.

### Task 16: Textos em pt, prévia e ponto de aprovação 2

**Files:**
- Create: `docs/redesign/textos-pt.md` (todos os textos em pt da home, dos cases, do blog e do shell, por seção, para o Ranielli revisar)

- [ ] **Step 1:** gerar o `textos-pt.md` a partir de `messages/pt.json` (script ou à mão, por seção, com o id da chave).
- [ ] **Step 2:** push → o webhook publica a prévia. Verificar:
  - `curl` em `/`, `/en`, `/es`, `/blog`, um post, `/projects`, `/projects/klick`, `/projects/grimory` e `/projects/xyz` (404), todos com `x-robots-tag: noindex`;
  - a produção intacta;
  - capturas headless em 1440×900, 390×844 e movimento reduzido, nos temas escuro e claro;
  - Lighthouse mobile da home (3 rodadas, mediana), pelo menos 85 em Performance e 100 em Acessibilidade. Abaixo disso, investigar antes de entregar.
- [ ] **Step 3: Ponto de aprovação 2** — mandar ao Ranielli o link da prévia e o `textos-pt.md`. Traduzir en/es só depois do OK.

---

## Depois desta fase

| Fase | Entrega |
|---|---|
| **3** (até ~18/12/2026) | Altair: painel novo substitui o chat atual atrás do mesmo `altair:open`; fluxo com filtro por trecho, ferramentas em lista fechada, histórico com HMAC, fatos aprovados, WhatsApp com resumo editável; `chat:eval` reescrito. |
| **4** (até ~28/12/2026) | en/es revisados, polimento de desempenho e acessibilidade, vídeos dos projetos, ponto de aprovação 3. |
| **Virada** (01/01/2027) | Merge na `main`, desligar `site-next` e o DNS `next`. |
