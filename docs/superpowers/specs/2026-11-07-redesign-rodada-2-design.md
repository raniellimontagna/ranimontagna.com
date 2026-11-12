# Redesign 2026, rodada 2: Vega em tela cheia, logo, IA, trajetória e imagens

Data: 07/11/2026. Complementa a spec `2026-11-07-redesign-2026-design.md` (a "spec base"). Onde as duas discordam, vale esta.

Branch `redesign-2026` (head e577442 quando esta spec foi escrita). Prévia em https://next.ranimontagna.com.

Mockups aprovados, fora do git: `ranimontagna.com/.superpowers/brainstorm/14729-1794092178/content/`. Os valores de animação e de layout citados aqui saíram deles:
- `vega-3d.html`, opção C;
- `logo-rm-refinadas.html`, opção B;
- `secao-ia.html`;
- `trajetoria-logos.html`;
- `imagens-codex.html`;
- `altair-tela-cheia.html`, só a estrutura.

## 1. Intenção e o porquê

Depois de ver a Fase 2 no ar, o Ranielli pediu cinco mudanças. Todas servem à tese da spec base: o dev da era da IA faz o ciclo inteiro, e o site precisa provar isso sem parecer genérico.

1. **O chat antigo não combina com o site novo.** Ao clicar no botão, o chat deve abrir em tela cheia, centralizado como Gemini e Claude ("Por onde começamos?"), com animação.
   - O assistente passa a se chamar **Vega**, a mesma da Atto.
   - Responde ali mesmo, no contexto do site. Quem quiser pode continuar perguntando, e há sempre um caminho direto de volta ao site.
2. **Uma logo própria**, única e que remeta a ele. Ele quer manter a RM atual (hexágono/cubo), refinada.
3. **Logos no lugar de texto onde aparecem tecnologias**, e um lugar que mostre o uso de IA. Mensagem dele: "não estou preso a um modelo ou empresa, e além de usar IA uso da forma correta".
4. **Na trajetória, as logos no lugar das fotos.** Segundo ele, "não faz sentido ser a minha foto grande ali". A Atto sai da trajetória, porque é a empresa dele e não uma por onde passou. A etapa de 2026 mostra mais experiência de produto e de AWS.
5. **As imagens geradas no FLUX estão ruins** ("teclado e tal"). Ele pediu para refazê-las com o Codex, com mais qualidade.

## 2. Metas, não-metas e anti-metas

### Metas
- Vega em tela cheia substitui o chat antigo em todas as páginas, com a marca de partículas.
- Logo RM com profundidade 3D, usada no header, no menu e no fechamento.
- Faixa de tecnologias com logos.
- Seção nova de IA logo depois do ciclo.
- Trajetória com painel na cor de cada empresa, sem fotos e sem a Atto.
- Cinco imagens de ambiente novas, geradas pelo Codex.

### Não-metas (ficam para a Fase 3, como na spec base §5)
- A Vega agir no site: rolar até seção, trocar tema e idioma, abrir página sozinha.
- Resposta em fluxo de verdade, com filtro por trecho.
- Histórico assinado por HMAC.
- Encaminhamento para o WhatsApp da Atto com resumo editável.
- Voz.

### Anti-metas (falha mesmo que funcione)
- **Chat com cara de widget genérico** (balão no canto, painel lateral). Tem que ser tela cheia e com identidade.
- **Seção de IA com papel inventado para cada modelo.** O Ranielli pediu explicitamente: "não fale que é pra algo específico, só deixe que é usado". Sem frases como "Gemini para contexto longo".
- **Qualquer conteúdo interno da Lemon além do texto aprovado em §7.4.** Sem número de commits, cliente, valor, nome de sistema interno ou URL.
- **Imagem gerada mostrando o rosto dele ou tela de produto.** A regra da spec base continua valendo.
- Logos de marca distorcidas, recoloridas de forma estranha ou baixadas de CDN em tempo de execução.

## 3. Vega em tela cheia

### 3.1 Como abre e fecha
- Abre pelo botão fixo do canto (hoje a estrela do Altair), por ⌘K/Ctrl+K e pelo evento que o shell já usa (`altair:open`; o nome no código pode virar `vega:open`, a critério do construtor).
- **Entrada:** a marca da Vega cresce a partir da posição do botão até o centro, e o fundo escurece até o `--background` chapado.
- **Fechar:** Esc, o botão "Voltar ao site" (sempre visível no topo) ou o mesmo atalho. O foco volta ao botão que abriu.
- **Rolagem:** enquanto está aberta, a página por trás não rola (Lenis parado e `overflow: hidden`). Ao fechar, a rolagem volta para onde estava.
- **Acessibilidade:** a tela cheia é um `dialog` modal com rótulo, foco preso dentro e `aria-live="polite"` na área de respostas.

### 3.2 Estados
- **Vazio:**
  - a marca da Vega grande no centro;
  - saudação: "Oi, eu sou a Vega. Por onde começamos?";
  - a caixa de pergunta centralizada;
  - 4 sugestões em pílulas: "O que ele faz com IA?", "Me mostra o Grimory", "Por onde ele passou?" e "Quero falar com a Atto".
- **Pensando:**
  - as partículas saem do triângulo e entram no redemoinho (§4);
  - uma linha de status curta na cor de destaque ("pensando…"), no lugar de spinner.
- **Conversando:**
  - a marca encolhe para o canto superior esquerdo, ao lado do nome "Vega";
  - as mensagens ocupam a coluna central, com largura de leitura de cerca de 680 px;
  - a caixa de pergunta desce para o rodapé;
  - no topo: "Nova conversa" e "Voltar ao site".
- **Respondendo:**
  - a resposta já validada pelo servidor aparece palavra por palavra no cliente, em ~25 ms por palavra;
  - com `prefers-reduced-motion`, aparece inteira de uma vez;
  - Markdown simples: negrito, listas e links aprovados.
- **Erro e limite:** mensagem curta na voz da Vega, com um botão para tentar de novo. Os limites atuais continuam valendo (rate limit, tamanho e origem).

### 3.3 Cartões que levam ao site
Quando a resposta fala de algo que existe no site, aparece abaixo dela até **2 cartões**. Cada cartão tem imagem, título, uma linha e um link.
- O link fecha a Vega e leva ao destino, com rolagem suave para âncoras da home.
- **Lista fechada de destinos:**
  - cases `/projects/klick` e `/projects/grimory`;
  - seções da home `#trajetoria`, `#ia`, `#atto` e `#escrita`;
  - `/blog` e `/projects`;
  - os posts publicados.
- **Quem decide os cartões é o servidor, não o modelo.** Depois que a resposta passa pela validação atual, o servidor procura menções a entradas da lista fechada (por nome e por aliases, por exemplo "Grimory", "Klick", "trajetória", "Atto", título do post). Encontrando, anexa os cartões no fim do stream, como um evento separado do texto.
- O cliente só desenha cartões cujo id ele conhece.
- Imagens dos cartões: as capturas reais já em `public/redesign/products/` e as cenas do ciclo.

### 3.4 Persona e conteúdo
- **Persona nova.** Hoje o prompt (`chat.prompt.ts`) faz o modelo responder **como o Ranielli, em primeira pessoa**. Passa a ser a **Vega**, assistente do site, que fala **sobre** o Ranielli em terceira pessoa, com um pouco de humor (como o Altair da spec base).
  - Em pt, en e es.
  - Se perguntarem, ela diz que é a assistente virtual do site.
- **O que continua igual na segurança:**
  - todas as políticas atuais: só falar do perfil, não vazar prompt, não inventar números, não mudar de persona;
  - a validação da resposta inteira antes de enviar;
  - o histórico só com as perguntas do visitante.
- **Validadores e eval:** os que dependem da primeira pessoa precisam ser revistos, e o `pnpm chat:eval` atualizado para a persona nova.
- **Identidade:** "a mesma da Atto" quer dizer mesmo nome e mesma marca. O Ranielli deixou a Vega da Atto e o chat de lá para depois ("vamos focar nesse até ficar perfeito"). Aqui ela se apresenta como a assistente do Ranielli neste site e trata a Atto como destino (cartão `#atto`). Levar a marca de partículas para o site da Atto fica fora desta rodada (outro repositório).
- **Contexto: tudo o que o site publica entra no contexto da Vega.**
  - Isso inclui o perfil, a trajetória com o texto da Lemon de §7.4, os cases do Klick e do Grimory, a seção de IA (§8), o agent-toolkit e a lista de posts.
  - Os números e fatos publicados no site formam a lista de fatos aprovados: ela pode repeti-los, e o validador de métricas passa a aceitar esses números em vez de rejeitar todo número desconhecido.
  - Da Lemon, só o que está em §7.4. O tipo `CurrentChatExperience` (que hoje obriga `outcomes: []`), o perfil e o caso `false-lemon-metric` do eval mudam de acordo: o eval passa a esperar recusa para número da Lemon que não está no site.
- **Provedor:** a página diz que a Vega roda em DeepSeek e que o código aceita o OpenRouter como reserva. Se perguntarem, ela pode confirmar isso, mas não fala de prompt, configuração, chaves nem detalhes do sistema.
- **O formulário de contato do chat antigo (`chat-contact-form.tsx`) sai,** como já aconteceu com o formulário do site na Fase 2. Se o `/api/contact`, o `formly-email-service` e o `contact-form` ficarem sem uso (o knip vai apontar), saem também. Para contato, a Vega aponta o cartão `#atto` (que já tem o WhatsApp) e as redes.
- **O componente antigo sai:** `chat-widget.tsx` e o que só ele usa.

### 3.5 Celular
- Mesma tela cheia, com a caixa de pergunta presa ao rodapé, acima do teclado virtual. Usar `visualViewport` ou `dvh`.
- Sugestões em rolagem horizontal.
- Marca menor no estado vazio.

## 4. A marca da Vega (nuvem de partículas)

**É o novo padrão visual da Vega.** O Ranielli disse: "essa versão C, com poeira estelar formando o triângulo e destacando mais a Vega, está linda; quero que essa seja o novo padrão".

### Desenho (do mockup `vega-3d.html` C)
- Canvas 2D com cerca de **260 partículas**.
- **Triângulo de Verão:** vértices V = [{x:-60,y:-42}, {x:64,y:-52}, {x:22,y:62}], em unidades de um quadro de ~170 px.
- **Posição de repouso de cada partícula:** ao longo das arestas, com dispersão pequena, e com aglomerados mais densos nos três vértices.
- **A Vega é o vértice 0:** maior, na cor de destaque (`--accent`), com brilho suave. As outras partículas ficam no tom do texto, com alfa variando.
- **Projeção 3D simples:** rotateY = sin(t·0,8)·0,6 e rotateX = 0,25, com perspectiva. A nuvem gira devagar e mostra volume.
- **Pensando:**
  - cada partícula vai para uma órbita em redemoinho em torno do centro: ângulo += 0,05·velocidade, raio entre 30 e 100;
  - ao terminar, volta à posição de repouso por interpolação com fator 0,06 por quadro.
- **Movimento reduzido:** com `prefers-reduced-motion`, a nuvem fica parada no triângulo, sem rotação nem redemoinho.
- **Desempenho:** só desenha quando visível (IntersectionObserver e aba visível) e respeita `devicePixelRatio`.
- **Cor:** vem dos tokens (`--accent` e `--foreground`), lidos do CSS em tempo de execução, para acompanhar os 9 temas de cor e o claro/escuro.

### Onde aparece
- **No botão fixo do canto**, no lugar da estrela de quatro pontas: versão pequena, com cerca de 60 partículas e sem redemoinho. O "pensando" fica só na tela cheia.
- **Na tela cheia:** grande no estado vazio, pequena no canto durante a conversa.
- **Um único componente** com tamanho e densidade como parâmetros.

## 5. Logo RM com profundidade (opção B)

**Base:** a logo atual `public/logo/white.svg` (os dois paths do hexágono/cubo), sem mudar o desenho. O que muda é a apresentação.

### Versão 3D
- **Extrusão:** 26 camadas da logo empilhadas com `translateZ(-i·1,25px)`.
- **Cores:** a face fica no tom do texto (`--foreground`). A cor das camadas vai do tom da face, escurecido, até quase o fundo. Derivar de tokens com `color-mix`, não de hex fixo; no mockup era #9aa39c → #161b19 sobre face #f4f3ee.
- **Faixa de luz:** uma faixa na cor de destaque, `linear-gradient(105deg, transparent 42%, accent 55% de alfa em 50%, transparent 58%)`, recortada pela máscara da logo. Atravessa a face num ciclo de 4,5 s. É a única exceção ao "sem gradiente", porque fica dentro da logo.
- **Container:** `perspective: 900px`.
  - Balanço automático: rotateY = sin(t)·26° e rotateX = cos(0,8t)·10° + 6°.
  - Com ponteiro em cima, a inclinação segue o ponteiro: rotateY = px·50° e rotateX = −py·34°, com px e py em [−0,5, 0,5].
- **Movimento reduzido:** logo parada, levemente inclinada, sem faixa de luz.

### Onde aparece
- **Header:** marca pequena, de 28 px, ao lado do nome "Ranielli Montagna". Plana em repouso; inclina com o ponteiro só no hover. Abaixo de ~40 px a extrusão some, então só a inclinação basta.
- **Menu em tela cheia e fechamento da home:** versão 3D grande, com balanço automático.
- **Favicon e ícones** continuam com o `white.svg` atual.

## 6. Logos de tecnologia (faixa e chips)

### 6.1 Ícones
- **Ficam no repositório**, nunca baixados de CDN em tempo de execução. Ficam como SVG monocromático e são pintados com `currentColor` ou máscara, para seguir o tema.
- **Fontes:**
  - simple-icons v15 (licença CC0);
  - @lobehub/icons-static-svg 1.70.0 (MIT), para Claude, OpenAI/Codex, Gemini e DeepSeek;
  - para os serviços da AWS, o pacote oficial **AWS Architecture Icons**, que a AWS libera para esse uso;
  - Codex usa o ícone da OpenAI.
- **Sem logo oficial, fica em texto:** "Design System", "CI/CD", "IA" e "Produto".

### 6.2 Faixa de tecnologias (stack-marquee, abaixo da abertura)
- Cada item passa a ser logo + nome. A faixa continua reagindo à velocidade do scroll como hoje.
- **Itens, nesta ordem:** React, Next.js, React Native (com o ícone do React), Node.js, TypeScript, Fastify, PostgreSQL, AWS, Pulumi, Cloudflare, Svelte, Claude, Codex, Gemini, DeepSeek, MCP, "Agentes de IA" (texto) e "Produto" (texto).

## 7. Trajetória com logos

Mockup aprovado: `trajetoria-logos.html`.

### 7.1 Desktop (a partir de lg)
- **O painel fixo da esquerda, que hoje troca de foto, passa a trocar de cor.** Cada etapa pinta o painel com a cor da empresa e mostra:
  - a logo em branco, grande e centralizada;
  - embaixo, o ano em fonte mono grande, em branco;
  - os ícones das tecnologias daquela etapa, em branco a 70%;
  - o contador "01 / 04".
- **Troca de etapa:** a cor do fundo anima em ~0,7 s. A logo entra com opacidade e uma escala de 0,9 para 1 em ~0,9 s.
- **Cores das empresas:**
  - SBSistemas `#045ba8`;
  - Smarten `#6a14d6`;
  - Luizalabs `#0f9bff`;
  - Lemon `#003c00`.
  - Todas saíram das próprias logos. Se aparecer a cor oficial, troca.
  - São dados das marcas, não tokens do tema. Ficam em `trajectory.data.ts`. A guarda "no-hex-in-new-ui" precisa de uma exceção explícita e documentada para esse arquivo.
- **As plaquinhas brancas de logo ao lado do ano somem**, porque a logo já está no painel.

### 7.2 Celular
- A foto 16:10 que abre cada etapa vira uma **faixa baixa (~92 px) na cor da empresa, com a logo em branco**.

### 7.3 Logos das empresas
- **É preciso ter cada logo em branco sobre transparente:**
  - SBSistemas já é SVG;
  - Lemon é PNG com alfa;
  - Luizalabs e Smarten são marcas brancas sobre fundo colorido. É preciso extrair só o branco, como SVG ou PNG transparente, e versionar o arquivo novo.
- O mockup fez isso com um filtro SVG de limiar de luminância. Serve de referência, não como solução final.

### 7.4 Conteúdo
- **A Atto sai da trajetória:** some da etapa de 2026, dos dados e das mensagens. A seção própria da Atto continua igual.
- **As tecnologias de cada etapa viram chips com logo** (§6).
- **Etapa de 2026 em pt, texto aprovado pelo Ranielli:**
  - Cargo: "Engenheiro de software · Lemon Energia"
  - Período: "Julho 2026 - hoje · time de IA, dentro de Finanças"
  - Texto: "No time de IA da Lemon, trabalho de dentro de uma área de negócio: vivo a operação de Finanças, encontro o trabalho manual e decido o que vira produto. Desde agosto, coloquei seis produtos internos em produção, da tela ao banco e à infraestrutura na AWS."
  - Impacto:
    - "Seis produtos de finanças em três meses: conciliação bancária, lotes de pagamento, fornecedores, notas fiscais e notas de débito"
    - "Cada um de ponta a ponta: front em React, API em Fastify com PostgreSQL e a infraestrutura escrita em código com Pulumi"
    - "Na AWS: containers no ECS Fargate, banco no Aurora (RDS), eventos com EventBridge e SQS, segredos no Secrets Manager, entrega por API Gateway e CloudFront"
    - "Ritmo alto de entrega, com agentes de IA no fluxo e revisão crítica antes de ir ao ar"
  - Tecnologias: React, TypeScript, Fastify, PostgreSQL, Pulumi, ECS Fargate, Aurora (RDS), EventBridge, SQS, API Gateway e IA.
  - Ícones no painel: AWS, Fastify, PostgreSQL e Pulumi.
- **As outras etapas** mantêm o texto atual e trocam só as tecnologias para chips com logo.
- **As chaves `photoAlt`** e as referências a fotos na trajetória saem.
- **O lead "Cinco anos, quatro etapas"** continua certo.

## 8. Seção de IA (nova, logo depois do ciclo)

- Mockup: `secao-ia.html`.
- Âncora `#ia`. Entra no menu do site? Fica com o construtor, que deve seguir o padrão das outras seções.

### Texto em pt
- Kicker: "ia"
- Título: "Sem amarra de modelo. Com método."
- Texto de apoio: "Escolho o modelo pela tarefa, não pela marca. E nenhum deles escreve código sem uma especificação antes e uma revisão minha depois."

### Parte 1, "Sem amarra"
- **Texto lateral:** "Modelos e ferramentas de empresas diferentes, todos no dia a dia. Se um muda de preço ou sai do ar, troco sem reescrever nada."
- **Grade de 3 colunas (2 no celular), só logo e nome, sem descrição:** Claude, Codex, Gemini, DeepSeek, OpenRouter e MCP.
- **Hover:** a logo sobe 3 px e fica na cor de destaque.

### Parte 2, "Do jeito certo"
- **Texto lateral:** "Spec-driven development: a ideia vira especificação, a especificação vira plano, o plano vira teste e só então código."
- **Seis passos em sequência, cada um com um trecho de artefato em fonte mono:**
  1. **Conversa:** "o que dói? / para quem? / o que seria um fracasso?"
  2. **Spec:** "## Metas / ## Anti-metas / - cara de IA genérica"
  3. **Plano:** "- [ ] Task 1 / - [ ] Task 2 / cada uma com seu teste"
  4. **Teste primeiro:** "✗ falha / ✓ passa"
  5. **Agente codifica:** "+ código / + testes / commit a commit"
  6. **Revisão:** "revisor novo / lê tudo / eu decido o que vai ao ar"
- **Animação:**
  - no desktop, os passos acendem um depois do outro (borda na cor de destaque e opacidade de 0,35 para 1), guiados pelo scroll e não por relógio;
  - no celular, viram lista vertical e acendem ao entrar na tela;
  - com movimento reduzido, todos acesos.
- **Termos em pílulas:**
  - **SDD:** spec antes de código;
  - **TDD:** o teste falha primeiro;
  - **MCP:** agentes com ferramentas;
  - **AGENTS.md:** contexto escrito, não lembrado;
  - **evals:** medir a resposta do modelo;
  - **revisão humana:** a última palavra é minha.

### Provas (4 colunas, 2 no celular)
- **6 produtos:** "em produção em três meses no time de IA da Lemon, com agentes no fluxo e revisão antes de ir ao ar"
- **5 agentes:** "o agent-toolkit instala as mesmas skills em Claude Code, Codex, OpenCode, Gemini CLI e Antigravity"
- **2 provedores:** "a Vega roda em DeepSeek, e o código já aceita o OpenRouter como reserva". O texto fala do código, não da produção, para continuar verdadeiro com a reserva desligada (`CHAT_ENABLE_OPENROUTER_FALLBACK` começa em `false`). Ligar a reserva em produção fica fora desta rodada.
- **+1.000 testes:** "neste site, escritos antes do código". Usar o arredondamento, para não envelhecer.

As traduções para en e es ficam com o construtor e passam na revisão de en/es que já está prevista.

## 9. Imagens novas (Codex)

### Geração
- Já feita em 07/11/2026 com o Codex CLI 0.167.0 (ferramenta `image_generation`), uma imagem por cena, em 1536×1024.
- Os PNGs aprovados estão em `/private/tmp/claude-501/-Users-raniellimontagna-Projetos-pessoal-second-brain/dd405b72-976a-442c-bedc-4423ace1b75f/scratchpad/imgs/`: `keyboard`, `discovery`, `fog-window`, `night-setup` e `server`.
- Os prompts estão lá também: `style.txt` + `<cena>.txt`.

### Troca
- Os cinco arquivos de `public/redesign/scenes/` são substituídos, com os mesmos nomes. Conversão para webp de 1600 px, qualidade 76, como as atuais.
- Nenhum componente muda.
- `docs/redesign/assets.md` passa a registrar o modelo novo (Codex CLI, image_generation da OpenAI), a data e os prompts. O texto do FLUX sai.
- A spec base §6 cita o FLUX como gerador de ambiente. Para estas cinco, vale o Codex.

## 10. Restrições (as da spec base §7 continuam)

- **Sem `backdrop-filter`.**
- **pt, en e es para todo texto novo**, com a guarda de paridade de mensagens.
- **Cores por tokens.** A única exceção são as cores das empresas (§7.1).
- **Animação:** só `transform` e `opacity` sempre que possível. Canvas só desenha quando visível. Nada esconde conteúdo se o script falhar. `prefers-reduced-motion` respeitado em tudo.
- **Desempenho:**
  - a home não pode piorar de forma visível no Lighthouse mobile; a Fase 2 mediu perf 87–94 e CLS 0;
  - a Vega continua carregada sob demanda (só ao abrir), e o botão do canto é leve.
- **Testes:** o padrão do repositório (Vitest e Testing Library, TDD), com a suíte, o tsc, o biome e o knip limpos.
- **Mensagens do cliente:** o payload continua mínimo (`client-messages`). A Vega pode precisar de um namespace próprio no lugar de `chat`.
- **Conteúdo honesto:** a etapa da Lemon só com o texto de §7.4.

## 11. O que fica com o construtor

- Nome do evento e dos componentes (Altair → Vega no código).
- Formato do evento de cartões no stream.
- Aliases de cada destino de cartão.
- Escolha das imagens dos cartões.
- Se `#ia` entra no menu.
- Como extrair as logos brancas da Luizalabs e da Smarten.
- Detalhes de easing.
- Traduções en/es.
- Ajuste fino dos validadores do chat para a terceira pessoa.

## 12. Decisões que tomei pelo Ranielli (conferir)

- **Cartões decididos pelo servidor, a partir da resposta validada,** em vez de o modelo chamar ferramentas. Assim o pipeline de segurança atual fica intacto. As ferramentas que agem no site ficam para a Fase 3.
- **Texto que aparece palavra por palavra no cliente**, sobre a resposta já validada inteira, em vez de fluxo real.
- **A Vega fala em terceira pessoa.** Hoje o chat fala como se fosse o Ranielli. Segui a spec base e o nome Vega.
- **O contexto da Vega é tudo o que o site publica,** e ela pode repetir os números publicados, inclusive o texto da Lemon de §7.4.
- **A Vega pode confirmar o provedor que a página cita.**
- **A prova "2 provedores" fala do que o código suporta,** não da produção.
- **O formulário de contato do chat sai;** contato pelo cartão da Atto e pelas redes.
- **Lugares da logo:** header pequena, e menu e fechamento em 3D. O favicon não muda.
- **Lista exata da faixa de tecnologias** e a inclusão de Fastify, PostgreSQL, AWS e Pulumi.
- **"+1.000 testes"** em vez do número exato.
- **Cores das empresas tiradas das logos.**
