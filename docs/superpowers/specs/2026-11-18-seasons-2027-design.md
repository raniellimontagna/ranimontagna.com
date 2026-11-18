# Épocas de 2027: motor, Réveillon, Carnaval, Páscoa, Festa Junina e Halloween

Conversa de 17/11/2026, depois do Natal no ar (#92, #93). O dono aprovou a proposta do
Réveillon (camiseta branca e "Pule as 7 ondas") e pediu, antes de dormir, que eu seguisse
sozinho com as próximas épocas do ano, planejando e executando uma por uma, sem parar para
perguntar. Este documento é o escopo de todas; cada época tem seu plano em
`docs/superpowers/plans/`.

## Como esta rodada anda sem o dono

- Decido pelo recomendado e anoto aqui, em "Decisões minhas", o que ele pode corrigir.
- Cada época vira um PR em rascunho, empilhado sobre o anterior, com a prévia da Vercel
  e capturas a 390 e 1280 px no claro e no escuro. Nenhum vai para a `main` sem ele
  aprovar o visual (regra do Natal: conferência visual antes de publicar). As datas
  ficam longe (a primeira, o Réveillon, liga em 27/12), então há folga.
- As fotos saem do Codex (sem custo), coladas sobre a foto de hoje: só a peça da época
  vem da geração; rosto e mãos são os originais.
- Ponto pequeno de revisão se corrige na hora, com teste.

## Metas (valem para todas)

- Cada época liga sozinha pela data local, em todas as páginas e nos 3 idiomas, e tem
  botão de desligar no menu de preferências.
- O nível de ousadia do Natal: efeito no site inteiro, retrato da época, nome do topo
  vestido, contagem no rodapé, uma brincadeira com surpresa no fim, Vega no clima e som
  opcional.
- Prévia por link: `?epoca=<id>`.

## Antimetas

As mesmas do Natal (`2026-11-17-seasonal-themes-design.md`): nada mais lento fora da época,
leitura e teclado intactos, nada de piscar na carga, nada de cara de clip-art e sempre dá
para desligar. Mais uma: duas épocas nunca se sobrepõem.

## Motor

### Calendário

| Época | id | Janela | Por quê |
|---|---|---|---|
| Réveillon | `reveillon` | 27/12 a 06/01 | emenda no fim do Natal e vai até o Dia de Reis |
| Carnaval | `carnaval` | Páscoa − 57 a Páscoa − 46 | do sábado de pré-Carnaval (blocos) à Quarta-feira de Cinzas |
| Páscoa | `pascoa` | Páscoa − 7 a Páscoa + 1 | do Domingo de Ramos à segunda depois da Páscoa |
| Festa Junina | `junina` | 01/06 a 30/06 | o mês dos arraiás, com São João (24) e São Pedro (29) |
| Halloween | `halloween` | 24/10 a 01/11 | a semana do Dia das Bruxas e do Saci (31/10) |
| Natal | `natal` | 25/11 a 26/12 | já no ar |

- **Datas móveis:** o Domingo de Páscoa sai do algoritmo de Meeus/Jones/Butcher (calendário
  gregoriano). Em 2027 é 28/03, então o Carnaval vai de 30/01 a 10/02 e a Páscoa, de 21/03
  a 29/03.
- **Virada de ano:** uma janela cujo fim vem antes do início no ano termina no ano seguinte.
- **Edição:** cada janela pertence ao ano em que começa (o Réveillon de 01/01/2027 é a
  edição 2026). Desligar e o progresso das brincadeiras valem por edição, para voltar no
  ano seguinte.
- **Prévia fora da data:** usa a edição em curso ou, se não houver, a próxima.
- O script inicial repete o cálculo em JavaScript simples, e um teste compara o script com
  o código para cada dia de 2026 a 2040.

### Peças comuns

Saem de `natal/` para `seasons/shared/`, sem mudar o comportamento do Natal: busca dos
pontos de encaixe, som da época, botão de som, preenchimento de textos, virada da
meia-noite, diálogo modal (`showModal`, rolagem pausada), compartilhar link, a caça a
itens escondidos (os 5 pontos de presente da home servem a qualquer época) e a contagem
do rodapé.

Novas:

- Laço de animação comum para as camadas de partículas: DPR até 2, pausa com a aba
  escondida, ponteiro e toque, movimento reduzido, e o laço para quando não há nada
  animando.
- Ponto de encaixe `data-season-slot="play"` no fim da home (antes do rodapé) para as
  brincadeiras que precisam de palco. A altura fica reservada pelo CSS global de cada
  época, antes da pintura, para nada pular.
- Tokens comuns `--season-1`, `--season-2` e `--season-3` (o trio que o retrato em código
  usa perto do ponteiro) definidos por toda época.
- Vega: saudação e sugestão de cada época em `vega.season.<id>`.

## Réveillon

- **Visual:** noite em dourado, champanhe e prata. Na cor padrão, o destaque vira dourado
  (AA no claro e no escuro).
- **Fogos:** de vez em quando um fogo sobe e estoura, sempre longe do texto (nas bordas e
  no alto). Clicar ou tocar num espaço vazio (fora de link, botão, campo e texto
  selecionado) solta um fogo naquele ponto. Até 6 fogos ao mesmo tempo. Com movimento
  reduzido, sem fogos automáticos; o clique mostra um estouro parado que some.
- **Nome:** um brilho dourado passa pelas letras de tempos em tempos. Ao lado, um contador
  pequeno "2026", cujo último dígito rola para "2027" na virada. Clicar no nome solta um
  fogo dele.
- **Foto:** camiseta branca (tradição de passar o ano de branco).
- **Contagem no rodapé:** "Faltam N dias para 2027"; no dia 31, "Faltam 5 h 12 min para
  2027"; de 01 a 06/01, "Feliz 2027".
- **Virada:** quem estiver no site à meia-noite vê os últimos 10 segundos num marcador
  fixo, depois uma chuva de fogos de uns 8 segundos e "Feliz 2027" no centro, sem
  bloquear a página e anunciado ao leitor de tela. Prévia: `?epoca=reveillon&virada=15`
  simula a meia-noite 15 segundos depois de abrir.
- **Brincadeira: "Pule as 7 ondas".** Uma faixa de mar no fim da home. As ondas vêm da
  direita; um botão "Pular" (também espaço ou seta para cima, com o foco na faixa) faz a
  pessoa pular. Cada onda pulada acende um pedido (saúde, paz, amor, viagens, aprender,
  deploy sem susto, tempo com quem importa). A janela do pulo é generosa e, depois de
  duas ondas perdidas, as próximas vêm mais devagar. Com movimento reduzido, cada toque
  em "Pular" vence uma onda. O progresso fica guardado por edição. Nas 7, abre um cartão
  de Feliz Ano Novo com os 7 pedidos e um botão de compartilhar.
- **Vega:** "Oi, eu sou a Vega. Feliz Ano Novo!" e a sugestão "Qual foi a maior entrega do
  Ranielli em {ano}?".
- **Som (desligado por padrão):** estouro suave no fogo clicado, respingo no pulo e um
  trecho de "Auld Lang Syne" (tradicional) no cartão e na virada.

## Carnaval

- **Visual:** cores de bloco: magenta, amarelo, ciano e verde. O destaque padrão vira
  magenta.
- **Confete:** papel redondo e retangular caindo e girando, que o ponteiro sopra para
  longe. Clicar num espaço vazio estoura um punhado de confete dali.
- **Nome:** as letras sambam em onda, uma após a outra, em cores de bloco. Clicar troca o
  ritmo (samba, frevo, marchinha).
- **Foto:** serpentinas nos ombros e confete no fundo e no cabelo.
- **Contagem:** "Faltam N dias para o Carnaval"; de sábado a terça, "É Carnaval!"; na
  quarta, "Quarta-feira de Cinzas: de volta ao código".
- **Brincadeira: "Batize seu bloco".** Na faixa do fim da home, um gerador de nome de bloco
  com humor de programador ("Unidos do Merge Conflict", "Bloco Deploy na Sexta"), nos 3
  idiomas. Cada clique sorteia um nome e um estandarte desenhado na hora. Dá para
  compartilhar o nome sorteado.
- **Vega:** "Oi, eu sou a Vega. Bom Carnaval!" e "Se o Ranielli tivesse um bloco, que
  projeto iria no abre-alas?".
- **Som:** apito e um compasso de marchinha ao sortear.

## Páscoa

- **Visual:** chocolate e tons pastel (lilás, menta, amarelo-claro). O destaque padrão vira
  chocolate no claro e lilás no escuro.
- **Efeito:** de vez em quando um coelhinho atravessa a borda de baixo da tela aos pulos,
  deixando pegadas que somem. Passa por alguns segundos, pequeno e sem pegar clique (pode
  cruzar o texto da borda de baixo nesse tempo); não aparece com movimento reduzido nem com
  a aba escondida.
- **Nome:** as letras ganham pintura de ovo (listras, bolinhas, zigue-zague) em pastel,
  num degradê que mantém o contraste. Clicar troca a pintura.
- **Foto:** camiseta lilás e ovos pintados em tons pastel no fundo (escolha do dono em
  18/11/2026; a tiara de orelhas de coelho foi recusada).
- **Contagem:** "Faltam N dias para a Páscoa"; no domingo, "Feliz Páscoa".
- **Brincadeira: caça aos ovos.** 5 ovos pintados escondidos nos mesmos 5 pontos dos
  presentes do Natal. Achados os 5, um ovo de chocolate grande abre com o cartão de Feliz
  Páscoa e o botão de compartilhar.
- **Vega:** "Oi, eu sou a Vega. Feliz Páscoa!" e "Qual foi a novidade mais recente do
  Ranielli?".
- **Som:** "ploc" ao achar um ovo e uma frase curta de sinos no cartão.

## Festa Junina

- **Visual:** bandeirinhas (vermelho, amarelo, azul, verde) e o laranja da fogueira. O
  destaque padrão vira laranja.
- **Efeito:** fagulhas de fogueira subindo devagar do pé da tela, que desviam do ponteiro.
- **Nome:** um varal de bandeirinhas sobre o nome (o mesmo desenho do pisca-pisca do
  Natal), balançando ao vento; clicar faz ventar mais forte.
- **Foto:** chapéu de palha e camisa xadrez.
- **Contagem:** "Faltam N dias para o São João"; no dia 24, "Viva São João!"; depois,
  "Arraiá até o fim do mês".
- **Brincadeira: pescaria.** Um laguinho na faixa do fim da home com peixinhos de papel
  nadando. Clicar ou tocar num peixe (ou escolher pelo teclado) fisga; cada peixe traz uma
  prenda (um fato ou projeto do Ranielli). Fisgados 5, aparece o cartão "Arraiá do
  Ranielli" com as prendas e o botão de compartilhar.
- **Vega:** "Arraiá! Eu sou a Vega." e "Quais tecnologias o Ranielli mais usa?".
- **Som:** sanfona curta (acorde) na fisgada.

## Halloween

- **Visual:** laranja-abóbora, roxo e verde-limo. O destaque padrão vira laranja.
- **Efeito:** morcegos cruzam a tela de tempos em tempos e fogem do ponteiro; teias finas
  nos cantos.
- **Nome:** as letras tremulam como vela, com um brilho de abóbora; clicar solta um
  morcego do nome.
- **Foto:** capa de vampiro de gola alta (nada no rosto).
- **Contagem:** "Faltam N dias para o Halloween"; no dia 31, "Feliz Halloween"; no dia
  1º, "Até o ano que vem".
- **Brincadeira: caça aos bugs.** 5 aranhinhas ("bugs") andando escondidas nos 5 pontos da
  home. Clicar esmaga e marca "corrigido". Achados os 5, o cartão "Zero bugs em produção.
  Feliz Halloween" com o botão de compartilhar.
- **Vega:** "Buu! Eu sou a Vega." e "Como o Ranielli evita bugs em produção?".
- **Som:** risada curta de bruxa sintetizada e um "crec" no bug.

## Decisões minhas (o dono pode corrigir)

- As janelas da tabela.
- A brincadeira de cada época e os textos.
- Fotos: compostas de uma geração do Codex por época (v1), rosto e mãos originais.
- Medição no Umami como no Natal: item achado, brincadeira completa e época desligada,
  sempre com a época no evento.

## Prazos

Réveillon pronto para aprovar bem antes de 27/12. As outras, antes da data de cada uma,
começando pelo Carnaval (30/01/2027).
