# Redesign 2026: movimento no celular

Data: 08/11/2026. Continua a `2026-11-08-mobile-design.md` (rodada mobile) e as specs do redesign.

## Por quê

O Ranielli achou que o celular "não tá com as animações como no web" e pediu ideias de animação que funcionem bem no celular, com criatividade.

**Medição.** Rolei o site no ar do topo ao fim e contei quantos elementos se mexem em cada seção (transform, opacidade, clip-path).

| Seção | Desktop | Celular |
|---|---|---|
| Ciclo | 29 | 1 |
| IA | 6 | 0 |
| No ar | 6 | 0 |
| Trajetória | 8 | 0 |

- **O resto é igual:** nas outras seções, desktop e celular têm o mesmo fade de subida.
- **Por que ficou parado:** a rodada mobile tirou a fixação dessas seções no celular, porque travava no iPhone, e não pôs outro movimento no lugar.
- **iOS antigo:** as cenas do ciclo no celular usam `animation-timeline: view()`, que o Safari só tem a partir do iOS 26. Num iPhone com iOS mais antigo elas não animam nada.

**Escolha dele.** Ele viu o protótipo `mobile-motion.html` no companion (celular rolável com a home inteira) e respondeu "adorei a proposta". A proposta escolhida é a do celular da esquerda, não a alternativa B (ciclo em stories).

**Referências da pesquisa:**
- padrões: stacking cards, word fill, cover-flow em carrossel com snap, trilho que se desenha, títulos com máscara;
- regras de movimento: NN/g (100–500 ms; acima disso parece arrasto), Apple HIG (movimento segue o gesto), web.dev (reduzir movimento tira o que não é essencial);
- suporte: o Safari ganhou scroll-driven animations no 26.0;
- GSAP: fixação curta é aceitável, mas `position: sticky` com scrub sem `pin` é o mais estável no iPhone.

## Princípios

1. **O dedo é o relógio.** O que acompanha a rolagem é scrub, sem duração. Isso vale para os capítulos empilhados, o trilho da IA, a frase que se acende, o foco da escrita, as letras do nome e a profundidade do carrossel. O que acontece uma vez (peças do ciclo, cartas da IA, títulos, empurrãozinho do carrossel) dura de 200 a 900 ms, com ease-out.
2. **Nada trava a rolagem.** Sem `pin` do GSAP no celular. O que gruda usa `position: sticky` do CSS.
3. **Funciona em qualquer iPhone.** O motor é o GSAP + ScrollTrigger que o site já carrega, não `animation-timeline`. O bloco CSS `scroll scenes` de `globals.css` sai, e a classe `scroll-scene` e o teste de restrição dela vão junto ou são trocados.
4. **Só abaixo de lg.** Tudo desta spec vale abaixo de 1024 px: nova constante `BELOW_LG_QUERY = '(max-width: 1023px)'` junto das outras em `load-scroll-motion.ts`, usada com `gsap.matchMedia()`. O desktop não muda em nada: o ciclo fixado, o trilho horizontal fixado, a grade da IA que acende e a capa que segue o mouse continuam iguais.
5. **Sem script, tudo aparece.** O HTML do servidor mostra cada estado final. Um elemento só é escondido pelo cliente logo antes de animar, e só se ainda estiver fora da tela, como o `Reveal` já faz.
6. **Movimento reduzido.** Nada se desloca nem escala. Tudo aparece no estado final. Fades curtos (até 150 ms) são aceitos. A faixa da trajetória troca de empresa sem animação.
7. **Desempenho.**
   - Anima só `transform` e `opacity`. Exceções aceitas: o `border-radius` dos quatro capítulos do ciclo e o `clip-path` da foto do "Quem é", que já existe.
   - Nenhuma leitura de layout por frame dentro de laços. Use o `progress` do ScrollTrigger ou posições medidas uma vez e de novo no refresh.
   - Os elementos que se mexem por scrub ganham `will-change: transform` só enquanto a seção está na tela, ou não ganham.
8. **Contraste.** O que fica "apagado" respeita a WCAG nos dois temas, claro e escuro.
   - **Texto normal:** pelo menos 4,5:1.
   - **Texto grande:** pelo menos 3:1. Conta como grande a partir de 24 px, ou 18,66 px em negrito.
   - Só o texto grande em `foreground` (títulos dos cards, a frase do "Quem é") pode apagar. Texto em `muted` (datas, números, linhas mono, metadados) nunca muda de opacidade, porque já está perto do mínimo.
   - **Piso de opacidade:** calculado por tema a partir dos tokens. Se o piso deixar o apagado quase invisível, o "aceso" se apoia nos outros sinais (cor de destaque, borda, ponto, deslocamento), não em mais transparência.
   - Os valores de opacidade citados abaixo são a intenção visual; o piso calculado prevalece.

## Seção por seção

### 1. Abertura
Fica como está. O nome já sobe letra por letra (`letter-rise`) em todas as larguras, e o retrato continua resolvendo do código para a foto. No protótipo isso aparecia, mas não é mudança.

### 2. Faixa de tecnologias
- A velocidade já acelera com a rolagem; isso fica.
- Entra uma inclinação (`skewX`) proporcional à velocidade, de no máximo ±6°, que volta a 0 suavemente quando a rolagem para.

### 3. Ciclo: capítulos empilhados
- **Capítulo que gruda:** cada capítulo vira `position: sticky; top: 0; height: 100svh`.
  - O próximo capítulo sobe por cima do anterior.
  - Enquanto é coberto, o capítulo de trás vai de `scale(1)` a `scale(0.9)` (origem no topo), o escurecimento sobre ele de 0 a 0,6 e o `border-radius` de 0 a 18 px.
- **Fundo:** a imagem de cada capítulo aproxima de `scale(1.12)` para 1 enquanto o capítulo entra.
- **Barrinhas:** quatro segmentos de 2 px grudam logo abaixo do header, iguais às do desktop. Quando o header some, elas sobem junto, como a faixa da trajetória.
  - Cada segmento enche conforme o capítulo correspondente assenta.
  - Depois do último capítulo há um trecho extra de rolagem (cerca de 50 svh) para o último segmento encher e o capítulo ser lido antes de a seção sair.
- **Peças animadas:** cada peça toca uma vez quando o capítulo assenta no topo.
  - *A dor (conversa):* as mensagens chegam uma a uma (0, 350 e 900 ms), subindo 10 px com fade. A mensagem dele é a última.
  - *A solução (spec):* os itens se marcam um a um, a cada 320 ms. O quadradinho verde que existe hoje começa vazado e se preenche.
  - *O produto:* a tela do Grimory assenta (`scale(0.94)` → 1) e o celular do Klick sobe por cima (40 px e −4° → 0).
    - Não entra número inventado. O timer que aparece é o da captura real.
  - *O código (terminal):* as linhas aparecem uma a uma, a cada 230 ms. A última é "✓ ready for the PR".
- **Encaixe na tela:** em 390×844 e em 375×667, a peça e o texto do capítulo cabem em `100svh` sem se sobrepor.
  - Se o terminal não couber no celular baixo, ele mostra as últimas linhas.
  - Se outra peça não couber, ela é reduzida por escala.
- **Desktop:** a timeline fixada continua igual.

### 4. IA
- **Grade de modelos:** os ladrilhos entram como cartas sendo dadas.
  - De `rotateX(-75deg) translateY(16px)` e opacidade 0 até o estado normal.
  - 70 ms entre ladrilhos, uma vez, quando a grade entra na tela.
- **Passos:** o carrossel de passos da rodada mobile sai. Os passos voltam a ser uma lista vertical com um trilho à esquerda.
  - A linha do trilho enche por scrub (`scaleY` de 0 a 1), do momento em que o topo da lista passa por 72% da tela até o fundo da lista passar por 72%.
  - Cada passo acende quando a linha chega no ponto dele:
    - o ponto fica verde;
    - o número fica verde;
    - a borda fica verde;
    - o card desliza de 12 px para 0;
    - o título vai do piso de contraste (princípio 8) para 1.
  - **Linhas compactas:** cada card tem o número em mono, o título em 16 px e as linhas do passo numa só linha mono, separadas por " · ". Assim a lista não fica mais alta que o necessário.
  - O `SnapCounter` sai da IA.
- **Desktop:** a grade de seis colunas que acende continua igual.

### 5. Quem é
- **Frase grande:** se acende palavra por palavra acompanhando a rolagem, com a opacidade de cada palavra indo do piso de texto grande (princípio 8) a 1, em ordem.
  - Começa quando o topo da frase passa por 85% da tela e termina antes de a frase chegar à metade da tela.
- **Foto:** a abertura que já existe continua.

### 6. No ar: carrossel com profundidade
- **Profundidade:** o carrossel com snap fica, e o movimento dele acompanha o arraste lateral.
  - Pela distância do card até a posição de snap, o card vai de `scale` 1 a 0,9.
  - Nos cards do lado, só a imagem apaga (até cerca de 0,5). O texto dos cards não muda de opacidade (princípio 8).
  - A imagem dentro do card desliza ±9% no sentido contrário. Para não mostrar borda, a imagem fica maior que a moldura.
  - O card de tipo, sem imagem, só escala.
  - Escuta a rolagem do próprio carrossel com rAF e usa posições medidas uma vez e de novo no resize.
- **Empurrãozinho:** na primeira vez que o carrossel entra na tela, ele anda cerca de 70 px e volta, para mostrar que arrasta.
  - O snap fica desligado durante o empurrão.
  - Não acontece se a pessoa já tiver arrastado, nem com movimento reduzido.
- **Contador:** o `SnapCounter` ganha uma barra de 2 px à direita do texto "01 / 05", ocupando o resto da largura e enchendo com a posição.

### 7. Trajetória: faixa da empresa
- **Faixa:** o painel colorido do desktop vira uma faixa de 64 px que gruda no topo da seção, abaixo do header.
  - Quando o header some (`data-hidden="true"`), a faixa sobe para o topo da tela. Ela usa `translate`, no mesmo ritmo de 300 ms do header.
- **Conteúdo da faixa:** fundo na cor da empresa, logo branco à esquerda (cerca de 26 px de altura), anos à direita em mono semibold de 13 px e, embaixo dos anos, "02 / 04" em mono de 11 px.
  - A cor troca por crossfade de camadas, por opacidade.
  - O logo que sai sobe e some; o novo sobe de baixo.
- **Etapa atual:** a etapa ativa é a que o `TrajectoryScroller` já marca. O número grande dessa etapa fica verde.
- **Sem script:** continuam as faixas coloridas que existem hoje em cada etapa. Com o script, a faixa grudada aparece e as faixas de cada etapa somem.

### 8. Escrita: post em foco
- O post mais perto do meio da tela fica aceso. Nos outros, só o título apaga, até o piso de texto grande (princípio 8); a data não muda.
- A capa do post em foco vai a escala 1; as outras ficam em 0,82.
- É contínuo, por scrub.
- A opacidade do foco vai num elemento interno, para não brigar com o fade de subida do `Reveal`, que mexe no `li`.

### 9. Títulos e contato
- **Títulos:** os títulos de seção (`WordReveal`) sobem de dentro de uma máscara, cada palavra no seu recorte. Escalonados, uma vez, como os links do menu.
- **Nome no contato:** as letras do nome grande sobem acompanhando a rolagem, em scrub com escalonamento, em vez de subirem uma vez.

## Fora do escopo
- Mudar qualquer coisa no desktop (lg e acima).
- A alternativa B do protótipo (ciclo em stories).
- Fixação com `pin` do GSAP no celular e `ScrollTrigger.normalizeScroll`.
- Inclinação do aparelho (giroscópio), arrastar e arremessar, e transições entre páginas (View Transitions). Ficam para outra rodada, se ele pedir.
- Mudar textos.

## Restrições
- As das specs anteriores continuam valendo:
  - sem `backdrop-filter`;
  - cores só por tokens (as cores das empresas são dados);
  - pt/en/es;
  - testes com Vitest e Testing Library;
  - tsc, biome e knip limpos.
- Os testes jsdom cobrem:
  - o ramo do celular de cada componente, com `matchMedia` mockado;
  - o estado final com movimento reduzido;
  - o HTML do servidor com tudo visível.
- **Verificação na prévia:**
  - a mesma contagem de elementos que se mexem, com o celular perto do desktop nas quatro seções;
  - capturas em 390×844 e 375×667;
  - transbordo 0;
  - Lighthouse mobile sem piorar: CLS 0, desempenho de 80 ou mais e LCP não maior que os 4,1 s atuais.

## Referência visual
O protótipo aprovado é o `mobile-motion.html`. Ele fica no companion, fora do repositório, em `ranimontagna.com/.superpowers/brainstorm/35625-1794173309/content/`. Onde ele e esta spec divergem, vale a spec. O protótipo tinha um número inventado no timer do Klick ("média de 5") e apagava texto abaixo do contraste; a spec corrige os dois.

## Fica com quem constrói
- A estrutura dos componentes e quais efeitos viram componentes compartilhados.
- Os valores finos dentro das faixas desta spec.
- O mecanismo exato da faixa da trajetória acompanhando o header.
