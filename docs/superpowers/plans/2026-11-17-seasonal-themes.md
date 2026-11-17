# Versões de época: Natal — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** de 25/11 a 26/12 o ranimontagna.com vira a versão de Natal sozinho, com neve interativa, retrato com gorro, nome com pisca-pisca, caça aos presentes que termina num globo de neve, contagem regressiva e Vega no clima.

**Architecture:** o script inicial (`theme-init-script.ts`) decide a época pela data local e grava `data-season` no `<html>` antes da pintura. O CSS global ganha só os tokens da paleta e as regras de mostrar e esconder. Todo o resto mora em `src/shared/components/seasons/natal/`, num pacote carregado sob demanda pelo `SeasonLayer`, como os mundos retrô. As partes da página recebem o Natal por pontos de encaixe vazios (`data-season-slot`, `data-season-gift`), onde a camada desenha por portal.

**Tech Stack:** Next 16 App Router (ler `node_modules/next/dist/docs/` antes de mexer em API do Next), React 19, zustand, Tailwind 4, canvas 2D, WebAudio, Vitest + jsdom, Biome.

**Spec:** `docs/superpowers/specs/2026-11-17-seasonal-themes-design.md`

## Global Constraints

- Natal vai de 25/11 00:00 a 26/12 23:59, pela data local do visitante.
- Prévia: `?epoca=natal` liga para a sessão da aba e `?epoca=off` desliga (sessionStorage `season-preview`).
- Desligar pelo menu grava `season-off:natal-<ano>` = `'1'` no localStorage, então em 2027 volta a ligar.
- Cor de destaque: o Natal só troca o destaque quando o visitante está na cor padrão (sem `data-color-theme`). A decoração usa sempre `--season-red`, `--season-green` e `--season-gold`.
- Com mundo retrô ativo (`data-retro`), nada do Natal aparece: as regras CSS usam `:not([data-retro])` e o `SeasonLayer` não renderiza.
- Fora da época: o pacote `natal/` não baixa e a foto de Natal não baixa. O CSS global ganha só tokens e regras de mostrar e esconder (menos de 2 KB); o resto do CSS vai junto do pacote.
- `prefers-reduced-motion`: neve parada, luzes acesas sem piscar e globo sem animação. A caça continua possível.
- Som desligado por padrão, com a chave própria `season-sound` no localStorage (`'on'` liga). Nunca usar `retro-sound`.
- Textos nos 3 idiomas (pt, en, es) e sem emoji na interface. Ícones são SVG desenhados no estilo do site.
- Armazenamento bloqueado (`localStorage` ou `sessionStorage` lançando erro) nunca quebra a página: a época vale pela data e o resto segue em memória.
- CI: cobertura mínima de statements 86, branches 78, functions 86 e lines 87; `./node_modules/.bin/biome check`; `pnpm exec tsc --noEmit`.
- Uma única imagem nova: o retrato com gorro aprovado pelo dono, que vem de `~/Projetos/pessoal/fotos/2026-11-perfil/geradas/v3/natal-topo-vN.png`.

## Review Focus

1. Navegação no cliente (home, depois blog, depois home): os encaixes somem e voltam. Os portais precisam se reencaixar, e os presentes voltam com o estado de achados. Teste na Task 8.
2. Armazenamento bloqueado: o script inicial e a store não podem lançar erro, e a época continua pela data. Testes nas Tasks 1 e 2.
3. Mundo retrô aberto em dezembro: a camada sai, a paleta some e o som para; ao sair do retrô, o Natal volta. Teste na Task 2.
4. Movimento reduzido: neve desenhada uma vez, parada; luzes sem piscar; caça e globo funcionando. Testes nas Tasks 3, 5 e 9.
5. Troca de tema claro e escuro com o Natal ligado: neve, retrato e luzes leem as cores de novo. Testes nas Tasks 3 e 4.

---

## Fase 1 — até o ponto de conferência visual

### Task 1: Calendário e script inicial

**Files:**
- Create: `src/shared/lib/seasons/seasons.ts`
- Modify: `src/app/[locale]/theme-init-script.ts`
- Test: `src/shared/lib/seasons/__tests__/seasons.test.ts`, `src/app/[locale]/__tests__/head.test.ts`

**Interfaces:**
- Produces:
  - `SEASONS = [{ id: 'natal', from: { month: 11, day: 25 }, to: { month: 12, day: 26 } }] as const`
  - `type SeasonId = (typeof SEASONS)[number]['id']`
  - `SEASON_PARAM = 'epoca'` e `SEASON_PREVIEW_KEY = 'season-preview'`
  - `seasonOn(date: Date): SeasonId | null`
  - `parseSeason(value: string | null): SeasonId | null`
  - `seasonOffKey(id: SeasonId, year: number): string`, que devolve `` `season-off:${id}-${year}` ``
  - `SEASON_HOME_PATHS = ['/', '/en', '/es']`
  - o atributo `data-season="<id>"` no `<html>`

- [ ] **Step 1: Testes do calendário** em `seasons.test.ts`
  - `seasonOn`, com `new Date(ano, mês, dia, hora)` local: 24/11 23:59 → `null`; 25/11 00:00 → `'natal'`; 30/11 23:59 → `'natal'`; 26/12 23:59 → `'natal'`; 27/12 00:00 → `null`; 15/07 → `null`.
  - `parseSeason('natal')` → `'natal'`; `parseSeason('off')` → `null`; `parseSeason(null)` → `null`.
  - `seasonOffKey('natal', 2026)` → `'season-off:natal-2026'`.
- [ ] **Step 2: Rodar e ver falhar.** `pnpm vitest run src/shared/lib/seasons` dá FAIL (módulo não existe).
- [ ] **Step 3: Implementar `seasons.ts`** com as assinaturas acima.
- [ ] **Step 4: Testes do script inicial** em `head.test.ts`. Usar `vi.setSystemTime` e `history.replaceState` para a URL; limpar `data-season`, o localStorage e o sessionStorage no `beforeEach`.
  - Em 10/12, sem nada salvo: `data-season="natal"`.
  - Em 10/12, com `season-off:natal-2026` = `'1'`: sem `data-season`.
  - Em 10/12, com `?epoca=off`: sem `data-season`, e o sessionStorage `season-preview` fica `'off'`.
  - Em 15/11, com `?epoca=natal`: `data-season="natal"`. Recarregar sem o parâmetro mantém o Natal, porque a prévia fica na sessão.
  - Em 15/11, com `?epoca=natal` e o off salvo: `data-season="natal"`, porque a prévia ganha do off.
  - Em 10/12, com sessionStorage `retro-mode` = `'xp'`: tem `data-retro` e não tem `data-season`.
  - Em 10/12, com `localStorage.getItem` e `sessionStorage.getItem` lançando erro: `data-season="natal"`, sem exceção.
  - Para cada data do Step 1, o script dá o mesmo resultado que `seasonOn`, para garantir que a cópia em string não diverge.
- [ ] **Step 5: Rodar e ver falhar.** `pnpm vitest run src/app/\[locale\]/__tests__/head.test.ts` dá FAIL.
- [ ] **Step 6: Estender o `THEME_INIT_SCRIPT`.**
  - Interpolar `SEASONS`, `SEASON_PARAM`, `SEASON_PREVIEW_KEY` e o prefixo da chave de off com `JSON.stringify`, como `RETRO_MODES` já é.
  - Ordem: retrô (já existe), depois o parâmetro da URL, depois a prévia, depois a data, depois o off, depois o atributo.
  - Cada acesso a storage fica no seu próprio `try`.
  - A injeção do preload da foto entra na Task 4.
- [ ] **Step 7: Rodar os dois testes.** Esperado: PASS.
- [ ] **Step 8: Commit** `feat(seasons): season calendar decided before paint`

### Task 2: Store, paleta e camada da época

**Files:**
- Create:
  - `src/shared/store/use-season/use-season.ts`
  - `src/shared/components/seasons/seasons.css`
  - `src/shared/components/seasons/season-layer.tsx`
  - `src/shared/components/seasons/natal/natal-layer.tsx`
  - `src/shared/components/seasons/natal/natal-copy.ts`
- Modify:
  - `src/app/layout.tsx`, para importar `seasons.css` junto dos CSS do retrô;
  - `src/app/[locale]/layout.tsx`, para pôr `<SeasonLayer locale={locale} />` logo depois de `<RetroExperience />`.
- Test:
  - `src/shared/store/use-season/__tests__/use-season.test.ts`
  - `src/shared/components/seasons/__tests__/season-layer.test.tsx`

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - `useSeason`: estado `{ active: SeasonId | null; current: SeasonId | null }` e ações `{ init(): void; setEnabled(enabled: boolean): void }`.
    - `current` é a época que valeria agora (prévia ou data, ignorando o off). Não muda depois do `init`.
    - `active` reflete o atributo `data-season`.
    - `setEnabled` grava ou apaga a chave de off e põe ou tira o atributo. Se havia prévia ligada, desligar troca a prévia para `'off'`.
  - `getNatalCopy(locale: string): NatalCopy`, um objeto com textos pt, en e es que as Tasks 5 a 10 vão estendendo.
  - `NatalLayer({ locale }: { locale: string })`, a composição que as tasks seguintes vão preenchendo.
- Tokens CSS (valores fixos; conferir contraste AA com o fundo do tema):

  | Token | Claro | Escuro |
  |---|---|---|
  | `--season-red` | `#b3261e` | `#ff6b6b` |
  | `--season-green` | `#1f6b45` | `#4ade80` |
  | `--season-gold` | `#a8781a` | `#f5c84c` |

  - Destaque, só sob `:root[data-season="natal"]:not([data-retro]):not([data-color-theme])`, no mesmo formato do bloco `rose` em `src/app/[locale]/globals.css`:
    - claro: `--accent: #b3261e`, `--accent-strong: #8f1d17`, `--accent-ice: #a8781a`, `--on-accent: #ffffff`, `--focus-ring: #8f1d17`;
    - escuro: `--accent: #ff6b6b`, `--accent-strong: #ffa3a3`, `--accent-ice: #f5c84c`, `--on-accent: #091113`, `--focus-ring: #ffa3a3`;
    - `--ring` e `--ambient-*` derivados das mesmas cores.
  - Regras de mostrar e esconder:
    - `:root:not([data-season="natal"]) [data-season-only="natal"] { display: none }`;
    - `:root[data-season="natal"]:not([data-retro]) [data-season-hide="natal"] { display: none }`;
    - como `[data-retro]` também precisa esconder o que é só do Natal, usar `:root[data-retro] [data-season-only] { display: none }`.

- [ ] **Step 1: Testes da store.**
  - `init()` com `data-season="natal"` dá `{ active: 'natal', current: 'natal' }`.
  - `setEnabled(false)` remove o atributo, grava `season-off:natal-<ano>` = `'1'` e mantém `current: 'natal'`.
  - `setEnabled(true)` volta o atributo e apaga a chave.
  - Com o localStorage lançando erro, `setEnabled(false)` ainda remove o atributo.
  - Em 15/07, sem prévia, dá `current: null`.
- [ ] **Step 2: Testes da camada.**
  - Com `active: 'natal'`, o `NatalLayer` (mockado) é carregado e renderizado.
  - Com `active: null`, nada é renderizado e o módulo `natal-layer` nunca é importado (conferir pelo `vi.mock` de import dinâmico).
  - Com o retrô ativo (`useRetroMode` active), nada é renderizado. Ao desligar o retrô, volta.
- [ ] **Step 3: Rodar e ver falhar.**
- [ ] **Step 4: Implementar.**
  - `SeasonLayer` faz `lazy(() => import('./natal/natal-layer'))`, como os mundos em `retro-mode.tsx`, e chama `useSeason.getState().init()` num efeito.
  - `NatalLayer` começa vazio e é preenchido nas tasks seguintes.
- [ ] **Step 5: Rodar e ver passar.** `pnpm vitest run src/shared/store/use-season src/shared/components/seasons`
- [ ] **Step 6: Commit** `feat(seasons): season store, palette tokens and lazy season layer`

### Task 3: Neve

**Files:**
- Create: `src/shared/components/seasons/natal/snowfall.ts`, `src/shared/components/seasons/natal/snow-canvas.tsx`
- Modify: `natal-layer.tsx`, que passa a renderizar `<SnowCanvas />`
- Test: `natal/__tests__/snowfall.test.ts`, `natal/__tests__/snow-canvas.test.tsx`

**Interfaces:**
- Produces:
  - `type Flake = { x: number; y: number; r: number; vy: number; drift: number; phase: number; alpha: number }`
  - `flakeCount(width: number, height: number, coarse: boolean): number`
    - área / 14000, limitado a 24..140;
    - com `coarse` (toque), multiplica por 0,6 e limita a 70.
  - `createFlakes(count: number, width: number, height: number, random?: () => number): Flake[]`
    - `r` entre 0,8 e 2,6 px, `alpha` entre 0,35 e 0,8, `vy` entre 18 e 55 px/s.
  - `stepFlakes(flakes: Flake[], dtMs: number, width: number, height: number, pointer: { x: number; y: number } | null, random?: () => number): void`
    - repele floco a menos de 90 px do ponteiro;
    - floco que passa do fundo volta ao topo com `x` novo.
  - `SnowCanvas()`: `<canvas aria-hidden>` fixo em tela cheia com `pointer-events-none`, acima do conteúdo e abaixo do cabeçalho e do lançador da Vega (`z-40`). Usar `z-30` e conferir na captura.

- [ ] **Step 1: Testes de `snowfall.ts`.**
  - `flakeCount(1280, 800, false)` = 73.
  - `flakeCount(390, 844, true)` = 24, porque bate no mínimo.
  - `flakeCount(4000, 3000, false)` = 140.
  - Um passo de 1000 ms aumenta `y` em `vy`, com tolerância para o `drift`.
  - Floco em (100, 100) com ponteiro em (110, 100) termina com `x < 100`.
  - Floco com `y > height + r` volta com `y <= 0`.
- [ ] **Step 2: Testes do componente**, usando os dublês de `src/tests/mocks/canvas.ts`.
  - Com movimento (`mockMatchMedia({})`), agenda quadros.
  - Com `document.hidden` verdadeiro, para de agendar e volta ao `visibilitychange`.
  - Com movimento reduzido (o padrão do mock global), desenha uma vez e não agenda quadro.
  - Ao desmontar, cancela o quadro e remove os ouvintes.
  - Uma troca da classe `dark` no `<html>` faz o desenho seguinte ler as cores de novo.
- [ ] **Step 3: Rodar e ver falhar.**
- [ ] **Step 4: Implementar.**
  - DPR limitado a 2.
  - Ponteiro por `pointermove` na `window`, já que o canvas não recebe eventos.
  - A cor dos flocos vem de `--foreground`, com o `alpha` de cada floco.
- [ ] **Step 5: Rodar e ver passar.**
- [ ] **Step 6: Commit** `feat(seasons): interactive snowfall`

### Task 4: Retrato de Natal

**Files:**
- Create: `public/redesign/portrait/natal-v1/photo-{384,640,750,828,1080}.webp`, a partir da foto aprovada, pelo comando do sharp em `docs/redesign/assets.md`, linha 122, com `webp({ quality: 72, effort: 6 })`.
- Modify:
  - `src/features/home/components/portrait/portrait-image.ts`
  - `next.config.ts`, com uma segunda regra de cache igual à de `PORTRAIT_CACHE_SOURCE` para `NATAL_PORTRAIT_CACHE_SOURCE`
  - `src/features/home/components/portrait/glyph-grid.ts`
  - `src/features/home/components/portrait/code-portrait.tsx`
  - `src/features/home/components/hero/hero-2026.tsx`
  - `src/app/[locale]/theme-init-script.ts`
  - `docs/redesign/assets.md`, com um parágrafo sobre a pasta `natal-v1`
- Test:
  - `portrait/__tests__/portrait-image.test.ts`
  - `portrait/__tests__/code-portrait.test.tsx`
  - `portrait/__tests__/glyph-grid.test.ts`
  - `src/app/[locale]/__tests__/head.test.ts`

**Interfaces:**
- Consumes: `SeasonId`, `SEASON_HOME_PATHS` e `useSeason` (Tasks 1 e 2).
- Produces:
  - `NATAL_PORTRAIT_IMAGE: PortraitImage`, com pasta `/redesign/portrait/natal-v1`, as mesmas larguras e o mesmo `sizes`.
  - `SEASON_PORTRAITS: Partial<Record<SeasonId, PortraitImage>> = { natal: NATAL_PORTRAIT_IMAGE }`
  - `NATAL_PORTRAIT_CACHE_SOURCE`
  - `glyphSetFor(season: SeasonId | null): string`
    - `null` → `CODE_GLYPHS`;
    - `'natal'` → `'*+·✦✧❄'`.
  - `CodePortrait` ganha a prop `seasonImages?: Partial<Record<SeasonId, PortraitImage>>`.
    - Para cada época, renderiza uma `<img data-season-only="<id>" loading="lazy" decoding="async">` com o mesmo `alt` e as mesmas classes.
    - A `<img>` normal ganha `data-season-hide` com os ids.
    - O efeito usa a imagem da época ativa e roda de novo quando `useSeason.active` muda.
    - Perto do ponteiro, as células usam `glyphSetFor` e alternam `--season-red`, `--season-green` e `--season-gold`. Sem época, ficam como hoje.
  - O script inicial, com o Natal ativo e `location.pathname` (sem barra no fim) em `SEASON_HOME_PATHS`, injeta `<link rel="preload" as="image" imagesrcset=… imagesizes=… fetchpriority="high">` da foto de Natal. Baixar também a foto normal em dezembro é aceitável; fora da época, nada extra.

- [ ] **Step 1: Confirmar a foto aprovada** e gerar as 5 cópias. Esperado: `ls public/redesign/portrait/natal-v1` lista as 5 larguras.
- [ ] **Step 2: Escrever os testes.**
  - A regra de cache de `NATAL_PORTRAIT_CACHE_SOURCE` existe no next.config, no mesmo formato do teste atual.
  - `glyphSetFor`: `null` dá `CODE_GLYPHS` e `'natal'` dá `'*+·✦✧❄'`.
  - `CodePortrait` com `seasonImages`:
    - renderiza 2 imagens;
    - a de Natal tem `loading="lazy"` e `data-season-only="natal"`;
    - a normal tem `data-season-hide="natal"`.
  - Com `data-season="natal"`, o efeito escuta o `load` da imagem de Natal.
  - Uma troca de `class` (claro ou escuro) com o Natal ativo marca as cores para serem relidas, como já acontece com `data-color-theme`.
  - No script inicial: o preload aparece com `pathname` `/` e `/en` e o Natal ativo; não aparece em `/blog`; não aparece fora da época.
- [ ] **Step 3: Rodar e ver falhar.**
- [ ] **Step 4: Implementar.**
  - `Hero2026` passa `seasonImages={SEASON_PORTRAITS}` pelo `HeroPortrait`.
  - O `MutationObserver` do `CodePortrait` passa a observar também `data-season`.
- [ ] **Step 5: Rodar e ver passar.** `pnpm vitest run src/features/home/components/portrait src/app`
- [ ] **Step 6: Commit** `feat(seasons): Christmas portrait and festive glyphs`

### Task 5: Nome com pisca-pisca

**Files:**
- Create: `src/shared/components/seasons/natal/name-lights.tsx`, `src/shared/components/seasons/natal/use-slots.ts`
- Modify:
  - `hero-2026.tsx`: um `<div data-season-slot="hero-lights" aria-hidden="true">`, posicionado em relação ao bloco do título;
  - `natal-layer.tsx`.
- Test: `natal/__tests__/name-lights.test.tsx`, `natal/__tests__/use-slots.test.tsx`

**Interfaces:**
- Produces:
  - `useSlots(selector: string): Element[]`
    - consulta o DOM no mount, de novo a cada mudança de `usePathname()` e por um `MutationObserver` em `document.body` com `childList` e `subtree`;
    - devolve uma lista estável e é usado por todos os portais seguintes.
  - `NameLights()`
    - faz portal em `[data-season-slot="hero-lights"]`;
    - desenha um fio de lâmpadas em SVG seguindo as duas linhas do nome, nas cores da época;
    - padrões `'chase' | 'twinkle' | 'steady'`;
    - clique em `[data-hero-title]` avança o padrão;
    - com movimento reduzido, fica sempre `'steady'`.

- [ ] **Step 1: Testes.**
  - `useSlots` encontra o encaixe que aparece depois do mount.
  - `useSlots` esquece o encaixe removido.
  - `NameLights` renderiza dentro do encaixe.
  - Um clique no título troca `data-pattern` de `chase` para `twinkle`.
  - Com movimento reduzido, `data-pattern` fica `steady` mesmo depois do clique.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar.** A animação é em CSS (keyframes no CSS do pacote `natal/`, com `animation-delay` por lâmpada).
- [ ] **Step 4: Rodar e ver passar.**
- [ ] **Step 5: Commit** `feat(seasons): string lights on the hero name`

### Task 6: Ponto de conferência visual (para tudo até o dono aprovar)

- [ ] **Step 1:** `pnpm dev` no worktree. Capturar `http://localhost:<porta>/?epoca=natal` com `~/.claude/skills/design-taste-frontend/scripts/lib/cdp.mjs`:
  - 390 × 844 e 1280 × 800;
  - tema claro e escuro;
  - topo da página e um trecho rolado, para mostrar a neve sobre as seções.
- [ ] **Step 2:** Conferir as capturas:
  - contraste;
  - a neve não cobre o texto de forma densa;
  - as luzes estão alinhadas ao nome;
  - a foto aparece sem piscar (recarregar com o cache limpo).
- [ ] **Step 3:** Montar uma folha HTML local com as 8 capturas e abrir no Chrome dele (`open -a "Google Chrome" <arquivo>`, fora do sandbox). Esperar a aprovação. Ajustes pedidos voltam às Tasks 2 a 5 antes de seguir.

---

## Fase 2 — depois da aprovação

### Task 7: Desligar no menu, eventos e som

**Files:**
- Create: `src/shared/lib/analytics/track.ts`, `src/shared/components/seasons/natal/season-sound.ts`
- Modify:
  - `src/shared/shell/preferences-menu.tsx`
  - `src/shared/shell/site-header.tsx`, para passar os novos rótulos
  - `messages/{pt,en,es}.json`
  - `src/shared/components/retro-mode/worlds/world-sound.ts`
- Test:
  - `src/shared/lib/analytics/__tests__/track.test.ts`
  - `src/shared/shell/__tests__/preferences-menu.test.tsx`
  - `natal/__tests__/season-sound.test.ts`
  - `retro-mode/__tests__/world-sound.test.ts`

**Interfaces:**
- Produces:
  - `track(event: string, data?: Record<string, string | number>): void`, que chama `window.umami?.track(event, data)` dentro de `try`.
  - Eventos:
    - `'season-gift'` com `{ season, gift, found }`;
    - `'season-hunt-complete'` com `{ season }`;
    - `'season-off'` com `{ season }`.
  - Em `world-sound.ts`: `playToneSequence(tones)` sem checagem. `playTones` passa a ser a checagem de `isSoundOn()` mais `playToneSequence`, sem mudar comportamento.
  - Em `season-sound.ts`:
    - `SEASON_SOUND_KEY = 'season-sound'`;
    - `isSeasonSoundOn(): boolean`, verdadeiro só com `'on'`;
    - `setSeasonSound(on: boolean): void`;
    - `playBell(): () => void` e `playJingle(): () => void`, que não tocam nada com o som desligado.
  - Mensagens:
    - `shell.prefs.season`: "Época" / "Season" / "Temporada";
    - `shell.prefs.seasons.natal`: "Natal" / "Christmas" / "Navidad".
  - `PreferencesMenu`, com `useSeason.current` não nulo, mostra um `fieldset` com um botão `aria-pressed={active === current}`. O clique chama `setEnabled`; desligar chama `track('season-off', { season })`.

- [ ] **Step 1: Testes.**
  - `track` sem `window.umami` não lança erro; com ele, repassa os argumentos.
  - `isSeasonSoundOn()` é falso com a chave ausente e com `retro-sound` = `'on'`.
  - `playBell` com o som desligado não cria `AudioContext`.
  - `playTones` continua respeitando `retro-sound`.
  - O menu mostra o botão "Natal" só com `current`; o clique desliga e registra `season-off`.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar.**
- [ ] **Step 4: Rodar e ver passar.**
- [ ] **Step 5: Commit** `feat(seasons): turn-off switch, season sound and analytics events`

### Task 8: Caça aos presentes

**Files:**
- Create:
  - `natal/gift-hunt.ts`
  - `natal/gift-button.tsx`
  - `natal/hunt-bar.tsx`
- Modify:
  - um `<span data-season-gift="<id>" />` em cada seção (o lugar exato dentro dela fica com quem constrói, nunca no topo):
    - `ai-method.tsx` (`ia`)
    - `live-work.tsx` (`no-ar`)
    - `trajectory.tsx` (`trajetoria`)
    - `atto-section.tsx` (`atto`)
    - `writing.tsx` (`escrita`)
  - `natal-layer.tsx`
  - `natal-copy.ts`
- Test: `natal/__tests__/gift-hunt.test.ts`, `natal/__tests__/gifts.test.tsx`

**Interfaces:**
- Consumes: `useSlots` (Task 5), `track`, `playBell` e `isSeasonSoundOn`/`setSeasonSound` (Task 7).
- Produces:
  - `GIFT_IDS = ['ia', 'no-ar', 'trajetoria', 'atto', 'escrita'] as const` e `type GiftId`
  - `giftsKey(year: number): string`, que devolve `` `season-gifts:natal-${year}` ``
  - `loadFound(year: number): GiftId[]`, que devolve `[]` com storage bloqueado ou JSON inválido
  - `saveFound(year: number, found: GiftId[]): void`
  - `addFound(found: GiftId[], id: GiftId): GiftId[]`, sem repetir e na ordem de `GIFT_IDS`
  - `isComplete(found: GiftId[]): boolean`
  - `GiftButton({ id, found, onOpen })`: `<button>` com rótulo acessível vindo de `copy.giftLabel(n)` e `data-opened` quando achado.
  - `HuntBar({ found, onReopenGlobe })`
    - fixa no canto inferior esquerdo, só na home;
    - ícone de presente em SVG, `found.length/5` e botão de som com `aria-pressed`;
    - depois de completa, mostra o botão para abrir o globo.
  - O estado da caça mora no `NatalLayer`: `found`, `setFound` e `globeOpen`.

- [ ] **Step 1: Testes de `gift-hunt.ts`.**
  - `addFound(['atto'], 'ia')` → `['ia', 'atto']`.
  - `addFound(['ia'], 'ia')` → `['ia']`.
  - `isComplete` só é verdadeiro com os 5.
  - `loadFound` com JSON inválido → `[]`.
  - `loadFound` com o `getItem` lançando erro → `[]`.
- [ ] **Step 2: Testes dos componentes.**
  - Clicar no presente `ia` marca `data-opened`, salva `['ia']`, chama `track('season-gift', { season: 'natal', gift: 'ia', found: 1 })` e só toca o sino com o som ligado.
  - O quinto presente abre o globo (`role="dialog"`).
  - Navegação: desmontar e remontar a seção (os encaixes somem e voltam) mantém `data-opened` no `ia`.
- [ ] **Step 3: Rodar e ver falhar.**
- [ ] **Step 4: Implementar.** Animação da tampa e brilho em CSS do pacote, com o movimento reduzido mostrando só o estado aberto.
- [ ] **Step 5: Rodar e ver passar.**
- [ ] **Step 6: Commit** `feat(seasons): gift hunt across the home sections`

### Task 9: Globo de neve e cartão

**Files:**
- Create: `natal/snow-globe.tsx`, `natal/globe-physics.ts`
- Modify: `natal-layer.tsx`, `natal-copy.ts`
- Test: `natal/__tests__/globe-physics.test.ts`, `natal/__tests__/snow-globe.test.tsx`

**Interfaces:**
- Consumes:
  - `NATAL_PORTRAIT_IMAGE` (Task 4), usando a cópia de 384 px;
  - `createFlakes`/`Flake` (Task 3);
  - `playJingle` e `track` (Task 7).
- Produces:
  - `shakeEnergy(prev: number, impulse: number, dtMs: number): number`
    - soma o impulso e decai pela metade a cada 600 ms;
    - limitado a 0..1.
  - `stepGlobeFlakes(flakes: Flake[], energy: number, dtMs: number, radius: number): void`
    - flocos presos dentro do círculo;
    - com energia, rodopiam;
    - sem energia, assentam no fundo.
  - `SnowGlobe({ open, onClose, locale })`: `role="dialog"`, `aria-modal`, foco preso, `Esc` fecha e o foco volta ao gatilho. O conteúdo:
    - canvas do globo com o retrato recortado em círculo;
    - arrastar dentro do globo gera impulso pela velocidade do ponteiro;
    - botão "Sacudir", que dá impulso 1;
    - quando `DeviceMotionEvent` existe, botão "Sacudir o celular", que pede a permissão quando há `requestPermission` e escuta `devicemotion`;
    - cartão com `copy.cardTitle` e `copy.cardBody`;
    - botão de compartilhar, com `navigator.share({ url })` e cópia para a área de transferência como alternativa, mostrando `copy.linkCopied`.
  - `track('season-hunt-complete', { season: 'natal' })` uma vez por ano (chave `season-gifts-done:natal-<ano>`).

- [ ] **Step 1: Testes da física.**
  - `shakeEnergy(0, 1, 0)` = 1.
  - `shakeEnergy(1, 0, 600)` ≈ 0,5.
  - Um floco fora do raio volta para dentro.
  - Com energia 0, depois de 5 s, todos os flocos ficam na metade de baixo.
- [ ] **Step 2: Testes do diálogo.**
  - Abre com o foco no primeiro controle; `Esc` fecha e devolve o foco.
  - "Sacudir" agenda quadros com movimento ligado.
  - Com movimento reduzido, desenha parado e o botão continua funcionando.
  - Compartilhar sem `navigator.share` copia o link e mostra o aviso.
  - `season-hunt-complete` é registrado uma vez, mesmo reabrindo.
- [ ] **Step 3: Rodar e ver falhar.**
- [ ] **Step 4: Implementar.**
- [ ] **Step 5: Rodar e ver passar.**
- [ ] **Step 6: Commit** `feat(seasons): snow globe reward and holiday card`

### Task 10: Contagem no rodapé e Vega

**Files:**
- Create: `natal/countdown.ts`, `natal/footer-countdown.tsx`
- Modify:
  - `src/shared/shell/site-footer.tsx`: `<span data-season-slot="footer" />` ao lado do `©`;
  - `src/shared/vega/vega-screen.tsx`
  - `src/shared/shell/vega-launcher.tsx`: o atributo `data-vega-launcher`;
  - `seasons.css`: o detalhe do lançador sob `:root[data-season="natal"]:not([data-retro]) [data-vega-launcher]`, só CSS;
  - `messages/{pt,en,es}.json`
  - `natal-copy.ts`
- Test:
  - `natal/__tests__/countdown.test.ts`
  - `natal/__tests__/footer-countdown.test.tsx`
  - `src/shared/vega/__tests__/vega-screen.test.tsx` (o existente)

**Interfaces:**
- Produces:
  - `christmasCountdown(date: Date): { kind: 'days'; days: number } | { kind: 'christmas' } | { kind: 'after' }`
    - do início da época (25/11) a 24/12 conta os dias até 25, pelo calendário;
    - no dia 25 devolve `christmas`;
    - no dia 26 devolve `after`.
  - Textos em `natal-copy.ts`, para pt, en e es:
    - pt: "Faltam N dias para o Natal", "Falta 1 dia para o Natal", "Feliz Natal" e "Boas festas";
    - en e es: o equivalente.
  - `FooterCountdown()`: portal em `[data-season-slot="footer"]`.
  - Mensagens `vega.season.natal.greeting` e `vega.season.natal.suggestion`:
    - pt: "Oi, eu sou a Vega. Boas festas!" e "O que o Ranielli entregou em 2026?";
    - en e es: o equivalente.
  - `VegaScreen`, com `useSeason.active === 'natal'`, troca o `greeting` e põe a sugestão da época em primeiro, ficando com 4 sugestões no total.

- [ ] **Step 1: Testes.**
  - `christmasCountdown`: 01/12 → `days` 24; 24/12 23:59 → `days` 1; 25/12 → `christmas`; 26/12 → `after`.
  - O rodapé renderiza "Faltam 9 dias para o Natal" em 16/12.
  - A Vega mostra a saudação e a sugestão da época com o Natal ativo, e as de sempre sem ele.
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar.**
- [ ] **Step 4: Rodar e ver passar.**
- [ ] **Step 5: Commit** `feat(seasons): Christmas countdown and festive Vega`

### Task 11: Fechamento

- [ ] **Step 1:** `pnpm vitest run --coverage`. Esperado: tudo verde e os pisos atendidos. Se algum cair, cobrir os ramos que faltam nos testes da task dona.
- [ ] **Step 2:** `./node_modules/.bin/biome check .` direto, sem o rtk, e `pnpm exec tsc --noEmit`. Esperado: 0 erros.
- [ ] **Step 3:** `pnpm build`. Conferir:
  - nenhum chunk com `natal-layer` aparece entre os scripts iniciais da home;
  - num servidor de produção local, em data fora da época e sem `?epoca`, a aba de rede não mostra o pacote `natal/` nem `natal-v1/`.
- [ ] **Step 4:** Repetir as capturas da Task 6 com o site completo:
  - presentes abertos;
  - o globo em 390 e em 1280;
  - o rodapé;
  - a Vega aberta;
  - o menu com o botão "Natal".
  - Mostrar ao dono numa folha local.
- [ ] **Step 5:** PR para a `main` com as capturas. Só fazer push e merge com o "pode" do dono.
- [ ] **Step 6:** Depois do merge, conferir no ar pelo HTML vivo (nunca sondar URL de chunk adivinhada, por causa do cache 404 da Cloudflare): `https://ranimontagna.com/?epoca=natal` mostra o Natal e a home sem o parâmetro não mostra.
