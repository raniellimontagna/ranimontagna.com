# Versões de época: Natal

Conversa de 17/11/2026. O dono escolheu a direção A (o site de verdade vestido de
Natal, ligando sozinho) e a abordagem 1 (a época é decidida no navegador).

## Intenção

O site muda de cara nas épocas do ano, com a mesma ousadia dos mundos retrô:
animado, interativo e caprichado. O objetivo é mostrar capricho e qualidade. O
dono acha que recrutador e cliente também gostam, porque mostra
comprometimento. O portfólio continua inteiro e legível, só que vestido para a
época.

O Natal vem primeiro porque é a próxima data. O motor tem que servir para as
próximas (Réveillon, Carnaval, Páscoa, Festa Junina, Halloween), cada uma
numa rodada própria.

## Metas

- Quem visita de 25/11 a 26/12 (data local do navegador) vê o site de Natal sem
  clicar em nada, em todas as páginas e nos 3 idiomas.
- Conteúdo, links, navegação e leitura iguais ao site normal.
- Interação: neve que reage ao ponteiro, caça aos presentes com surpresa no
  fim, contagem regressiva, retrato de Natal, nome com pisca-pisca e Vega no
  clima.
- Prévia em produção antes de 25/11 por link (`?epoca=natal`), para o dono
  conferir e mostrar.
- Visitante desliga o Natal quando quiser.

## Fora desta rodada

- Outras datas. O Réveillon é a próxima rodada e precisa estar no ar antes de
  27/12.
- Um mundo de Natal separado, no estilo retrô (opção B). Pode vir depois.
- Mudar o prompt ou o backend da Vega (`src/app/api/chat`).
- Trocar imagens no blog e em projetos.

## Antimetas (falhou, mesmo funcionando)

- O site fica mais lento: qualquer piora fora da época; no Natal, LCP pior no
  celular ou neve engasgando em celular médio.
- A leitura piora: neve ou luzes em cima do texto tirando contraste; foco e
  teclado quebrados.
- A página pisca: aparece normal e vira Natal depois (ou o contrário).
- Cara de template de Natal genérico (clip-art, emoji, fonte "natalina"). Tem
  que parecer deste site, feito à mão, como os mundos retrô.
- Não dá para desligar.

## Restrições

- Next 16 App Router com páginas estáticas (`generateStaticParams`): o
  servidor não sabe a data da visita. A época se decide no navegador.
- `src/app/[locale]/theme-init-script.ts` já roda antes da pintura e aplica
  tema e retrô. Ele passa a decidir a época e grava `data-season` no
  `<html>`, no mesmo esquema de `data-color-theme` e `data-retro-mode`.
- Fora da época, o custo extra é só o calendário dentro do script inicial: o
  pacote de efeitos não baixa e a foto de Natal não baixa.
- O retrato é a imagem LCP da home (`portrait-image.ts`: cópias pré-cortadas
  numa pasta versionada, cache de 1 ano, regra de cabeçalho no next.config).
  A foto de Natal segue o mesmo esquema, numa pasta própria.
- `prefers-reduced-motion`: neve parada ou sem queda, luzes acesas sem piscar.
  A caça continua possível.
- Com um mundo retrô ativo, a camada de época fica desligada.
- CI: cobertura mínima (statements 86, branches 78, functions 86, lines 87),
  Biome com regras de acessibilidade, `tsc --noEmit`.
- Imagens geradas pelo conector da ElevenLabs (Nano Banana Pro, uma por
  chamada, ~US$ 0,12 cada), a partir do kit
  `~/Projetos/pessoal/fotos/2026-11-perfil/`, mantendo o personagem. O dono
  aprova a foto.
- Só uma imagem nova: o retrato com gorro, até 5 tentativas (~US$ 0,60). O
  globo de neve usa essa mesma foto. As fotos do sofá e do café na home
  (`/images/ranielli-sofa.webp`, `/images/ranielli-cafe.webp`) ficam como
  estão.
- A foto vem antes de tudo, porque o ponto de conferência visual depende dela.

## Abordagens

1. **Época decidida no navegador (escolhida).** O script inicial confere a data
   e marca `data-season`; as cores entram como tokens CSS sob esse atributo; os
   efeitos pesados ficam num pacote carregado sob demanda só na época (mesmo
   padrão dos mundos retrô em `retro-mode.tsx`); componentes atuais ganham
   pontos de encaixe pequenos. Liga sozinho, tem prévia em produção e cada data
   nova vira uma pasta e uma linha no calendário. Custo: alguns componentes
   passam a saber da época.
2. **Época ligada na publicação.** Variável na Vercel e publicação em 1º/12 e
   27/12. O HTML já sai pronto do servidor, mas depende de alguém lembrar de
   publicar, não tem prévia em produção e ignora o fuso de quem visita.
3. **Só CSS.** Descartada: sem neve que reage ao ponteiro e sem caça aos
   presentes, contra o "ir longe" que o dono pediu.

## Decidido com o dono

- Direção A: o site de verdade vestido de Natal, ligando sozinho, com botão de
  desligar.
- Abordagem 1.
- Nível de ousadia dos mundos retrô.

## Decisões minhas (o dono pode corrigir)

### Calendário e controle

- Natal vai de 25/11 00:00 a 26/12 23:59, pela data local do visitante.
- Um arquivo só de calendário (id, início e fim por mês e dia), usado pelo
  script inicial e pelo código, como `RETRO_MODES` já é hoje.
- Prévia: `?epoca=natal` liga para a sessão da aba; `?epoca=off` desliga.
- O botão de desligar fica no menu de preferências (`preferences-menu.tsx`),
  junto de tema e cor. A escolha fica no localStorage, por época e ano (ex.:
  Natal de 2026), para que em 2027 volte a ligar.
- Cor de destaque: se o visitante está na cor padrão, o Natal troca o destaque
  pela paleta dele. Se o visitante escolheu outra cor, a cor dele continua no
  destaque e o Natal fica só na decoração (neve, luzes, presentes, globo). Assim
  o seletor de cor sempre faz efeito, mesmo em dezembro.

### Em todas as páginas

- Paleta de Natal no claro e no escuro: vermelho, verde-pinheiro e dourado,
  com contraste AA.
- Neve: camada fixa por cima do conteúdo que não bloqueia clique, com flocos
  pequenos e translúcidos que desviam do ponteiro (no celular, do dedo). Em
  cima do texto, a densidade é baixa. Pausa com a aba escondida. No celular,
  menos flocos.
- Contagem regressiva para 25/12 no rodapé. No dia 25 vira "Feliz Natal" e no
  dia 26 "Boas festas".
- Vega: o lançador ganha um detalhe de Natal; ao abrir no Natal, uma saudação
  e uma sugestão de pergunta da época (ex.: "O que o Ranielli entregou em
  2026?"), respondida com o contexto que ela já tem.
- Som desligado por padrão, com controle próprio: um botão de som ao lado do
  contador de presentes e no globo, guardado numa chave própria da época. Não
  usa a chave `retro-sound`, porque `isSoundOn()` trata chave ausente como
  ligado e os mundos retrô nem aparecem durante o Natal. Os tons de sininho
  podem reaproveitar o gerador de `worlds/world-sound.ts`, desde que a
  checagem de som ligado seja a da época.

### Na home

- Retrato: foto com gorro de Papai Noel, gerada mantendo o personagem. No
  retrato de código (`code-portrait.tsx`), os caracteres perto do ponteiro
  viram flocos e estrelas e acendem em vermelho, verde e dourado.
- Nome no topo: um fio de pisca-pisca acompanha as letras e acende em
  sequência. Clicar ou tocar no nome troca o padrão das luzes.
- Caça aos presentes: 5 presentes pequenos, escondidos em 5 seções da home
  (nenhum no topo). São discretos, mas quem explora acha. Cada um é um botão
  de verdade (teclado, foco visível, nome para leitor de tela). Um contador
  discreto mostra quantos já achou, e abrir um presente tem animação e
  sininho, se o som estiver ligado. O progresso fica no localStorage.
- A surpresa, ao achar os 5: tela cheia com um globo de neve com o retrato
  dele. Arrastar ou sacudir faz nevar dentro do globo. No celular dá para
  sacudir o aparelho quando o navegador permite; se não permitir, há um botão.
  Junto vem um cartão de boas festas nos 3 idiomas e um botão de compartilhar
  o link.

### Medição

- Eventos no Umami (já instalado): presente achado (com o número), caça
  completa e Natal desligado.

## Ponto de conferência visual

Antes de construir o resto, entregar o topo da home já de Natal: a época
ligando pelo script, paleta, neve, retrato de Natal e nome com luzes. Mostrar
capturas a 390 e 1280 px, no claro e no escuro. O dono aprova e só então
seguem caça, globo, contagem, Vega e som.

## Prazo

Em 17/11/2026 o dono pediu para ligar uns dias antes: o Natal começa em 25/11,
um mês antes do dia 25/12.


Prévia por link antes de 25/11/2026. Natal no ar em 25/11 sem nenhuma ação
manual.

## Fica para quem construir

- Como servir a foto certa sem piscar e sem baixar a outra (ex.: uma segunda
  `<img loading="lazy">` escondida por CSS fora da época, ou o script inicial
  pré-carregando a foto de Natal).
- Desenho exato da neve, das luzes, dos presentes e do globo, seguindo o
  visual do site.
- Onde cada presente fica e a estrutura de pastas (sugestão: espelhar
  `retro-mode/worlds`).
- Textos finais nos 3 idiomas.
