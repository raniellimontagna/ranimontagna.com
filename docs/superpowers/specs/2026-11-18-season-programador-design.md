# Época do Dia do Programador

Conversa de 18/11/2026, depois das épocas de 2027 no ar (#94 a #99). Ideia que sobrou da rodada
anterior; o dono aprovou a proposta inteira e a brincadeira A (code review) com um "sim". Segue
o mesmo motor, as mesmas metas e antimetas de `2026-11-18-seasons-2027-design.md`.

## Por quê

O dono quer que o site mude de cara nas épocas para mostrar capricho e qualidade. O Dia do
Programador é a data do ofício dele: a época tem que falar com quem programa e, de quebra,
mostrar que ele entende de código.

## Metas e antimetas

As das outras épocas: liga sozinha pela data local, em todas as páginas e nos 3 idiomas; dá
para desligar no menu; prévia `?epoca=programador`; nada mais lento fora da época; leitura e
teclado intactos; nada de piscar; nada de cara de clip-art.

Antimeta própria: **não repetir os mundos retrô DOS e IDE.** Eles trocam o site inteiro por
terminal e editor; a época veste o site de sempre, com as cores de destaque de sintaxe.

## Calendário

- O dia é o 256º do ano (`0x100`): 13/09, ou 12/09 em ano bissexto.
- Novo tipo de borda no calendário: `{ yearDay: n }`, o n-ésimo dia do ano local. Entra em
  `seasons.ts`, no script inicial (`theme-init-script.ts`) e no teste que compara os dois de
  2026 a 2040.
- Janela: `yearDay 251` a `yearDay 257` (5 dias antes até o dia seguinte). Em 2027, 08/09 a
  14/09; em 2028, 07/09 a 13/09.
- id: `programador`. Nomes: "Dia do Programador", "Programmer's Day", "Día del Programador".

## Abordagens consideradas para a brincadeira

- **A. Code review (escolhida pelo dono).** Cinco trechos curtos, cada um com uma linha
  errada; a pessoa toca na linha. Boa no celular e no teclado, e mostra domínio de código.
- B. Digitação contra o relógio: ruim no celular.
- C. Bits até 256: curta e rasa.

## O desenho

- **Visual:** cores de destaque de sintaxe. Claro / escuro: palavra-chave violeta
  `#6d28d9` / `#c4b5fd`, texto verde `#15803d` / `#4ade80`, número âmbar `#a16207` /
  `#fbbf24`, função ciano `#0e7490` / `#22d3ee`. Trio = violeta, verde, ciano. Na cor
  padrão, o destaque vira verde (AA no claro e no escuro).
- **Efeito:** símbolos de código (`{}` `=>` `;` `</>` `0x100` `&&` `()` `[]` `//` `++`)
  sobem devagar do pé da tela em fonte mono, apagados, e desviam do ponteiro. Clicar ou tocar
  num espaço vazio (regra `isEmptySpot`) solta um punhado deles dali. Nunca pegam clique,
  pausam com a aba escondida; com movimento reduzido, ficam parados e o clique não solta nada.
- **Nome:** "Ranielli" em violeta (palavra-chave) e "Montagna" em ciano (função), com um
  cursor de texto depois da última letra que pisca suave (opacidade com easing, ~1 s, nunca
  `steps()`). Clicar no nome troca o esquema de cores (3 esquemas), letra a letra, com um
  clique de tecla quando o som está ligado. Movimento reduzido: cursor parado, troca sem
  transição.
- **Foto:** moletom escuro e um patinho de borracha amarelo no ombro (o "rubber duck
  debugging"). Composta de uma geração do Codex sobre a foto de hoje; rosto e mãos originais.
- **Rodapé:** "Faltam N dias para o dia 256" ("Falta 1 dia…"); no dia 256, "Feliz Dia do
  Programador!"; no dia seguinte, `return 0;` (igual nos 3 idiomas).
- **Brincadeira: "Code review".** No fim da home (`data-season-slot="play"`), cinco PRs, um
  de cada vez, cada um com um título e um trecho de 3 a 5 linhas. Cada linha é um botão. A
  linha certa marca "bug achado", mostra a explicação e o botão "Próximo PR"; uma linha certa
  de verdade (sem bug) responde "Essa linha está ok" e deixa tentar de novo. O progresso
  fica guardado por edição. Nos 5, abre o cartão "LGTM: aprovado no code review" com os 5
  bugs e o botão de compartilhar. Os trechos:
  1. Último item: `return items[items.length]` (deveria ser `length - 1`).
  2. Admin: `if (user.role = 'admin')` (atribuição em vez de `===`).
  3. Busca: `const res = fetch(url)` sem `await`.
  4. Maior nota: `[...scores].sort()` ordena como texto (falta `(a, b) => a - b`).
  5. Timers: `for (var i = 0; …)` com `setTimeout` imprime 3, 3, 3 (`let` resolve).
- **Vega:** "Oi, eu sou a Vega. Feliz Dia do Programador!" e "Como o Ranielli começou a
  programar?".
- **Som (desligado por padrão):** clique de tecla mecânica ao tocar numa linha, um sinal curto
  de acerto e um arpejo de "build ok" no cartão.
- **Umami:** `season-gift` a cada bug achado (`gift: pr-<n>`), `season-hunt-complete` uma vez
  por edição, `season-off` como as outras.

## Decisões minhas (o dono pode corrigir)

- A janela de 7 dias e as cores.
- Os 5 trechos e os textos.
- Com movimento reduzido, o clique no espaço vazio não solta símbolos.
- O glifo do retrato em código: `01{};/` (a foto vira binário perto do ponteiro).

## Para quem constrói

- Mesmo padrão de arquivos da Festa Junina (`seasons/junina/`): camada lazy, CSS da camada
  com tudo sob `:root[data-season="programador"]:not([data-retro])` fora dela, palco
  reservado no CSS global na altura real da brincadeira.
- PR em rascunho com capturas a 390 e 1280 px, no claro e no escuro, e a página de revisão
  local. Nada vai para a `main` sem o dono aprovar o visual.
