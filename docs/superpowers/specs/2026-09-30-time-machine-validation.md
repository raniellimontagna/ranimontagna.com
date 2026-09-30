# Validação das versões secretas — 30/09/2026

## Estado da entrega

Implementação local das seis versões adicionais: Windows XP, DOS, Game Boy,
Gazeta Montagna, IDE e Macintosh. O disquete mantém o modo 1998 e cada nova
versão tem seu próprio ícone escondido, nos pontos definidos na
[especificação](2026-09-30-time-machine-design.md).

Implementação e validação concluídas. Após conferir a prévia em
[localhost:3001](http://localhost:3001), o usuário autorizou a publicação das
seis versões em 30/09/2026. A entrega será integrada à `main` e verificada
no domínio público após o deploy.

## Evidências confirmadas

- O build final de produção terminou com exit 0 após o marcador do chat e
  os ajustes CSS. TypeScript foi aprovado pelo agente responsável e pela
  etapa TypeScript do build final.
- Os testes focados do estado final passaram: 134 testes em 10 arquivos,
  com exit 0. Biome passou nos 38 arquivos do escopo e `git diff --check`
  também foi aprovado.
- A suíte completa foi reexecutada antes da publicação, incluindo a correção
  GSAP e a marcação do painel de chat: 1.305 testes em 123 arquivos passaram.
  Cobertura: 88,27% statements,
  81,79% branches, 87,6% functions e 89,87% lines.
- A rodada anterior teve 84 testes focados em 6 arquivos aprovados.
  A correção GSAP acrescentou quatro regressões verificadas em red/green;
  os 24 testes do arquivo de animações e o TypeScript passaram.
- React Doctor dos arquivos alterados: 97/100, sem findings. No projeto
  completo: 51/100, com diagnósticos majoritariamente preexistentes e dois
  avisos baixos sobre handlers DOS que apenas atualizam estado; o integrador
  não confirmou regressão funcional associada a eles.
- A revisão estática independente foi aprovada após a releitura das
  correções: visibilidade dos containers DOS/Game Boy, restauração de foco
  na segunda entrada de um módulo já carregado, Enter e teclas A/B no
  Game Boy, Escape e saída de foco no menu Iniciar, copy de Mac/Gazeta,
  especificidade dos estados pressionados, proteção de foco na retomada
  GSAP e posicionamento do launcher/painel do chat.
- Código e casos de teste cobrem persistência na sessão, migração de
  `retro-mode=true` para 1998, rejeição de modos desconhecidos, storage
  bloqueado, preservação da preferência moderna e restauração de foco.
- Há casos para o menu Iniciar, comandos e histórico DOS, controles Game Boy,
  destinos internos e isolamento das teclas em relação a formulários externos.
- O integrador confirmou os seis universos no desktop e em 320px. Gazeta
  apresentou papel e Georgia; IDE, painel escuro, Consolas, color scheme
  escuro e logo branca; Mac, borda preta e Monaco.
- Todos os seis universos apresentaram largura e
  `document.documentElement.scrollWidth` de 320px, sem recorte horizontal
  nas telas inspecionadas. A revisão incluiu menu XP, comandos DOS, contato,
  logo do rodapé, controles Game Boy e skills.
- No navegador, A do Game Boy abriu `/projects`, o comando `blog` do DOS
  abriu `/blog` e a recarga preservou o modo Game Boy. Na IDE,
  `projects.json` abriu `/projects` com `aria-current="page"` e README voltou
  à home.
- A segunda entrada XP e a saída por teclado restauraram o foco no
  `button[data-retro-secret="xp"]`, mantendo a classe moderna `dark`.
- O dropdown de idioma funcionou no desktop ao trocar entre en, es e pt;
  o modo DOS persistiu durante essas trocas.
- A pasta Blog do Macintosh abriu `/blog` mantendo o modo. O disquete
  original, acionado a partir do Mac, abriu 1998; o ícone escondido XP abriu
  Windows XP em seguida.
- Os seis universos foram capturados no desktop: largura e scrollWidth de
  1280px em todos. Logos e fundos foram confirmados: XP, logo preta em
  fundo marfim; DOS, branca sobre `#172019`; Game Boy, preta sobre `#9bbc0f`;
  Gazeta, preta sobre `#ede6d5`; IDE, branca sobre `#252526`; Mac, preta sobre
  branco. O integrador também leu as métricas de logo e inputs do build servido.

As evidências de execução, cobertura, React Doctor e navegador acima foram
informadas pelo integrador. A revisão estática inspecionou os arquivos e fez
apenas reproduções inline direcionadas; não reexecutou as suítes.

## Revisão das correções finais

- Os CSS de Gazeta, IDE e Macintosh foram ajustados para que paletas,
  controles, foco, logo IDE e safe areas superem o reset compartilhado de
  1998. A revisão adicional confirmou o isolamento por modo desses ajustes.
- A regra que escondia elementos absolutos com blur agora exclui classes
  `backdrop-blur`, preservando o dropdown de idioma. A revisão estática
  confirmou que a alteração permanece restrita ao modo retrô.
- O detalhe de prioridade baixa em `:active` foi corrigido nos três CSS.
  A revisão adicional confirmou que o estado pressionado agora supera o
  estilo normal dos controles.
- `observeElements` preserva o elemento focado e seus ancestrais ao retomar
  GSAP, evitando ocultá-los durante a preparação. Os quatro casos novos
  cobrem reveal, text, stagger e ancestrais aninhados, preservando a preparação
  de grupos sem foco. A correção foi aprovada na revisão e no navegador.
- `data-chat-panel` identifica o painel fixo real do chat. Launcher e painel
  recebem afastamento de 88px mais safe area inferior, e o painel tem altura
  máxima adaptada à viewport. Avatar e indicador do launcher seguem a paleta
  nos modos DOS, Game Boy, Gazeta e Mac. A revisão estática foi aprovada;
  a inspeção no build atualizado também foi aprovada. No Game Boy em 320px,
  o painel terminou em y=643,9, acima da barra com início em y=676; o input
  manteve foco visível, root/scrollWidth permaneceram em 320px e o launcher
  ficou acima da barra com a paleta correspondente.

## Encerramento

| Verificação | Estado |
| --- | --- |
| Build de produção, TypeScript e testes focados após a última marcação/CSS do chat | Aprovados |
| Biome do escopo e diff check | Aprovados |
| Launcher/painel do chat no build atualizado, acima das barras fixas | Aprovado no browser, incluindo Game Boy em 320px |
| Revisão estática e fluxos dos seis universos em desktop/mobile | Aprovados |

A suíte completa de 1.305 testes, build, TypeScript e lint foram reexecutados
e aprovados antes da publicação. Os testes focados e o browser acima também
verificaram o estado final. Não há pendências de implementação desta entrega no
[plano](../plans/2026-09-30-time-machine.md).

## Diagnósticos preservados

Lint global passou com dois avisos de symlink na `.pnpm-store`. Os
diagnósticos preexistentes do React Doctor completo e os dois avisos baixos
DOS foram preservados, conforme descrito acima.

O build final recebeu resposta GitHub 429, tratada pelo fallback existente;
o build não falhou. A integração externa não foi alterada neste trabalho.

## Capturas do desktop

| Universo | Captura |
| --- | --- |
| XP | [world-xp.jpg](/Users/raniellimontagna/.codex/visualizations/2026/09/30/01a0f36a-0f0b-7ec1-bf73-44a39c08b2f9/world-xp.jpg) |
| DOS | [world-dos.jpg](/Users/raniellimontagna/.codex/visualizations/2026/09/30/01a0f36a-0f0b-7ec1-bf73-44a39c08b2f9/world-dos.jpg) |
| Game Boy | [world-gameboy.jpg](/Users/raniellimontagna/.codex/visualizations/2026/09/30/01a0f36a-0f0b-7ec1-bf73-44a39c08b2f9/world-gameboy.jpg) |
| Gazeta | [world-newspaper.jpg](/Users/raniellimontagna/.codex/visualizations/2026/09/30/01a0f36a-0f0b-7ec1-bf73-44a39c08b2f9/world-newspaper.jpg) |
| IDE | [world-ide.jpg](/Users/raniellimontagna/.codex/visualizations/2026/09/30/01a0f36a-0f0b-7ec1-bf73-44a39c08b2f9/world-ide.jpg) |
| Mac | [world-mac.jpg](/Users/raniellimontagna/.codex/visualizations/2026/09/30/01a0f36a-0f0b-7ec1-bf73-44a39c08b2f9/world-mac.jpg) |
