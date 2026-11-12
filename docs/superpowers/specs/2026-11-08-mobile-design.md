# Redesign 2026: rodada mobile

Data: 08/11/2026. Complementa as specs `2026-11-07-redesign-2026-design.md` e `2026-11-07-redesign-rodada-2-design.md`.

## Por quê

O Ranielli pediu uma análise completa da versão mobile, com estudos e artigos, e mais animação no celular ("na abertura do menu etc., precisa ser mais criativo").

A auditoria foi feita num celular simulado de 390×844 em todas as páginas, com checagem automática de alvos de toque, texto e transbordo. A pesquisa usou NN/g, WCAG 2.5.8, web.dev, Material 3, Apple HIG, GSAP e Lenis.

Ele escolheu a **abertura A do menu** (círculo que nasce do botão), no protótipo `menu-mobile.html` do companion.

## Metas

### 1. Menu com abertura A
- **Abertura:**
  - o fundo se revela num círculo a partir do centro do botão Menu: `clip-path: circle()`, 620 ms, `cubic-bezier(.83,0,.17,1)`;
  - a página por trás recua com `scale(.94) translateY(-2%)` e opacidade de 0,35, na mesma duração;
  - os links sobem de dentro de uma máscara (`translateY(110%)` → 0, 520 ms, `cubic-bezier(.16,1,.3,1)`), um a cada 55 ms, começando em 240 ms;
  - os números contam de 01 até o seu, com a opacidade junto;
  - as redes sobem por último, a partir de 560 ms, uma a cada 40 ms.
- **Fechar:** a mesma coreografia ao contrário, com duração × 0,6. O overlay só sai do DOM no fim da animação de fechar.
- **Botão:**
  - ícone de hambúrguer com duas barras, que viram um X (300 ms);
  - o texto alterna entre "Menu" e "Fechar";
  - fica nítido e por cima do overlay.
- **Layout no celular:**
  - os links ficam ancorados na parte de baixo da tela, na zona do polegar;
  - as redes viram uma grade 2×2 de botões com pelo menos 46 px de altura.
  - No desktop o layout continua o mesmo, com a mesma animação.
- **Movimento reduzido:** só opacidade, em 150 ms.
- Foco preso, Esc e `aria-expanded` continuam como estão.

### 2. Botão da Vega
- Some ao rolar para baixo depois de 120 px e volta ao rolar para cima. Usa o mesmo critério do header (delta ≥ 4 px).
- Fica escondido enquanto o botão "Pergunte à Vega" da abertura estiver visível na tela (IntersectionObserver no elemento marcado com `data-vega-cta`).
- Some com `translateY` + opacidade, em 250 ms.
- Respeita `env(safe-area-inset-*)`, como já faz.

### 3. Ciclo no celular sem fixar
- **Fixado só no desktop:** abaixo de lg, a seção não é fixada nem tem timeline com scrub.
- **Cenas:** cada uma tem pelo menos 100 svh de altura e corre na rolagem normal, com todas as linhas do terminal visíveis.
- **Animação no celular**, via CSS com `animation-timeline: view()`, dentro de `@supports (animation-timeline: view())` e `prefers-reduced-motion: no-preference`:
  - o fundo da cena aproxima de `scale(1.12)` para 1;
  - o texto e o artefato sobem 32 px com fade, entre `entry 0%` e `cover 35%`.
- **Sem sobreposição:** no layout estático do celular, o artefato e o texto não podem se sobrepor.

### 4. Alvos de toque ≥ 44 px
Valem no celular:
- `ActionLink` na variante `quiet`;
- links do rodapé;
- link do nome no header;
- botões e sugestões da Vega;
- filtros de linguagem em Projetos;
- "Voltar ao blog" no post;
- botão "copy" do bloco de código;
- redes no menu.

A área tocável cresce com padding e altura mínima, sem mudar o visual do texto.

### 5. Texto
- **Mínimo de 12 px no celular:** etiquetas mono do ciclo e rótulo "Vega".
- **Caixa de pergunta da Vega:**
  - 16 px no celular, para o iOS não dar zoom no foco;
  - sem o anel de foco interno: usar a classe `interactive-field-input`, porque a regra global `:focus-visible` fica fora de camada e vence os utilitários do Tailwind.

### 6. Seção de IA no celular
- **Passos:** abaixo de lg, viram carrossel horizontal com `scroll-snap`, cards de ~80 vw e contador "02 / 06" que acompanha a rolagem.
- **Grade de modelos:** compacta, com 3 colunas, ícone de 32 px e menos padding.

### 7. "No ar" no celular
- Abaixo de lg, a lista vira carrossel horizontal com `scroll-snap`, cards de ~84 vw e contador "01 / 05".
- O terminal do agent-toolkit quebra linha no celular, em vez de cortar.

### 8. Barra de progresso
- Linha de 2 px na cor de destaque, fixa no topo, com `scaleX` ligado à rolagem do documento via `animation-timeline: scroll()` (só onde houver suporte).
- Fica acima do conteúdo e abaixo do header e dos overlays.

### 9. Toque
- **Classe utilitária `press`:** no `:active`, `scale(0.97)` em 100 ms. Aplicar em `ActionLink`, sugestões, cards de projeto, links do menu e botões flutuantes.
- **Vibração:** `navigator.vibrate?.(10)` ao abrir o menu e a Vega. Só funciona no Android; no iOS a função não existe e nada acontece.

## Não-metas
- Trocar o Lenis no toque. O site já não liga o Lenis com `syncTouch`.
- Mudar o layout do desktop. As mudanças são abaixo de lg, menos o menu e o botão da Vega.

## Restrições
- As das specs anteriores: sem `backdrop-filter`, tokens, pt/en/es e movimento reduzido.
- Animar só `transform` e `opacity`. O único `clip-path` é o do círculo do menu, que é curto e roda só ao abrir e fechar.
- Testes com Vitest e Testing Library, mais tsc, biome e knip limpos.
