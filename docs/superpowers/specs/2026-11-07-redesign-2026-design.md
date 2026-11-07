# Redesign 2026 do ranimontagna.com — design

Data: 07/11/2026. Autor da visão: Ranielli Montagna. Redigido a partir da conversa de brainstorming e de cinco prévias navegáveis (a última, a "v5", está em `.superpowers/brainstorm/48220-1794065355/content/previa-v5.html`, fora do git).

## 1. Intenção e o porquê

O papel do dev mudou. Com agentes de IA escrevendo boa parte do código, o valor passa a estar em quem cobre o **ciclo inteiro**: entender a dor de alguém, propor a solução, desenhar o produto e construir com IA, sob o próprio julgamento. O Ranielli trabalha assim (PJ na Lemon Energia, sócio-fundador da Atto) e o site precisa comunicar isso.

Duas forças guiam tudo:

- **"Meu nome é tudo."** Quem ouvir "Ranielli" deve lembrar dele. O site é a casa do nome.
- **A Atto é a marca que escala.** Ela é o próximo passo natural para quem tem um problema e quer o Ranielli resolvendo.

### Objetivo de quem visita
1. **Principal:** sair lembrando do nome e passar a seguir (blog, LinkedIn, GitHub, Instagram, X).
2. **Secundário:** chamar a Atto quando houver uma necessidade real (o que, na prática, é contratar o Ranielli).
Contratação PJ direta não é o foco; acontece por consequência.

### Público
- Fundadores e gestores com um problema de produto (potenciais clientes da Atto).
- Gente de tecnologia interessada em como ele trabalha com IA (quem segue e espalha o nome).
- Recrutadores, em segundo plano.

### Referências que sustentam a tese
- Gergely Orosz, "When AI writes almost all code, what happens to software engineering?" (The Pragmatic Engineer, atualizado em 25/09/2026) e "The Product-Minded Software Engineer".
- OpenAI, "Harness engineering": o engenheiro passa a desenhar o sistema, dar contexto aos agentes e impor gosto.
- product.engineer, "The Future of Software Engineering Is Plan and Review".
- David Perell, "Build a Personal Monopoly": ser conhecido por uma interseção única; o que se publica é prova de trabalho.

## 2. Metas, não-metas e anti-metas

### Metas
- Comunicar em segundos que ele faz o ciclo inteiro, com IA como alavanca, e que **parece alguém de tecnologia** (não um blog de viagem).
- Experiência **clean e imersiva**, com muita animação e estilos de animação variados, funcionando **igualmente bem no celular e no desktop**.
- Foco nele: retrato, trajetória com credibilidade, o que ele escreve, o que ele colocou no ar.
- Presença real da Atto.
- O Altair: um assistente no estilo "Jarvis" que opera o site junto com o visitante.
- Manter os três idiomas (pt, en, es) e temas trocáveis.

### Não-metas (por enquanto)
- Voz no Altair (microfone e fala). Decidido: "por enquanto deixamos sem voz".
- Mostrar trabalho interno da Lemon Energia (confidencial).
- Expor detalhes ou o repositório do Brasa (o recurso central faz rodízio de contas do Claude e pode conflitar com os termos da Anthropic; o README tem IP de servidor). No máximo uma captura sem dados pessoais, ou nada.
- Mostrar projetos de clientes da Atto além do que o site da Atto já publica.

### Anti-metas (falha mesmo que funcione)
- Cara de "AI slop": centro-com-título-e-três-cards, gradiente com orbe, rótulos de templates, efeitos decorativos sem motivo.
- A home virar o case de um sistema só. Detalhe de projeto mora na página do projeto.
- Scroll que prende o visitante (seção fixada longa demais) ou animação que faz esperar para ler.
- Piscadas no Chrome do macOS: **proibido `backdrop-filter`** (ver §7).

## 3. Mapa do site

- `/` Home (seções em §4).
- `/projetos/<slug>` Página de case por projeto. Começa com **Klick** e **Grimory**; as outras entram depois.
- `/blog` e `/blog/<slug>` Blog completo (já existe; mantém fonte e funcionalidades).
- `/projetos` Página atual de projetos via API do GitHub: manter ou fundir com a lista de cases é decisão do construtor, desde que nenhum link público quebre.
- Rotas por idioma conforme o next-intl atual (`/`, `/en`, `/es`).
- Os redirecionamentos atuais em `next.config.ts` continuam valendo.

## 4. A home, seção por seção

Ordem e intenção decididas na conversa; coreografia exata fica com o construtor dentro das regras de §6.

1. **Abertura: o retrato em código.** Nome enorme (letras subindo uma a uma), uma frase de tese, dois botões ("Pergunte ao Altair", "Ver o que está no ar"). O retrato real (`public/photo.webp`) é desenhado ao vivo como caracteres; perto do cursor ou do dedo os caracteres viram símbolos de código na cor de destaque; ao rolar, os caracteres se dissolvem e a foto real aparece. **O Ranielli aprovou isso como o ponto alto ("ficou FODA").** No celular: retrato em cima, nome e texto embaixo, densidade de caracteres menor, toque funciona.
2. **Faixa de tecnologias** que reage à velocidade do scroll.
3. **Como ele trabalha (o ciclo).** Cena fixada com quatro capítulos — a dor, a solução, o produto, o código — cada um com uma transição diferente (card que abre, cortina, círculo, abertura do centro), fundo com imagem e barra de progresso. **Muda em relação à v5:** não conta a história de um sistema; mostra o *jeito de trabalhar* dele com artefatos variados (uma conversa com usuário, uma especificação, uma tela de produto, um agente no terminal), podendo misturar projetos. Termina com um convite para os cases.
4. **Mais dele.** As outras fotos reais (`hero-ranielli.webp`, `about-ranielli.webp`, `pc-avatar.webp` e as que vierem de uma sessão de fotos) aparecem ao longo da página em momentos com animação de imagem (máscara, escala, parallax), não só na abertura.
5. **No ar (projetos em destaque).** Rolagem horizontal fixada no desktop, lista vertical no celular; imagem cresce ao entrar. Cada item leva à página do case. **Grimory pode ser o destaque principal**, Klick logo em seguida; depois agent-toolkit, Argus e Atto Read. Texto curto por projeto, sem virar documentação.
6. **Trajetória com credibilidade.** Linha do tempo com foto fixa que troca a cada etapa e ano aceso. Para cada empresa: **logo**, cargo, período, o que fez e o impacto (números reais quando existirem) e tecnologias. Etapas: SBSistemas (2021, front-end) → Smarten (2022, Tech Lead, design system) → Luizalabs (2023, apps das lojas Magalu, 1.000+ lojas) → Lemon Energia (desde 07/2026) e Atto (sócio-fundador). Logos já existem em `public/companies/` (a da Atto precisa ser adicionada).
7. **Atto.** Seção própria: o que a Atto faz (sites, sistemas, apps, integrações com IA, marketing), os cases que o site da Atto já publica (Fronteira Sul Drones, TALA Drone Partners, Quadralize, NaN Solutions, Atto Read) e o caminho para falar com ela (e com a Vega, a assistente da Atto). Usar somente o que o site da Atto já diz publicamente.
8. **Escrita.** Os posts recentes do blog, com imagem que segue o cursor no desktop; link para o blog completo.
9. **Fechamento.** Chamada para a Atto, o nome em tela cheia e as **redes sociais** (LinkedIn, Instagram, X, GitHub, e-mail, WhatsApp se ele quiser manter). As redes também ficam acessíveis no topo ou num menu.

## 5. O Altair (assistente "Jarvis")

Decidido: personagem próprio chamado **Altair**, par da **Vega** (assistente da Atto; os bots da Atto têm nomes de estrelas). Fala **sobre** o Ranielli, em terceira pessoa, com personalidade e um pouco de humor. **Sem voz** nesta versão.

### Comportamento
- **Presença contínua.** Uma estrela pequena acompanha a navegação em qualquer página e se expande num painel quando chamada (clique, Cmd/Ctrl+K, ou o botão "Pergunte ao Altair"). O menu de comando atual (Cmd+K) passa a ser a porta de entrada dele.
- **Age no site, não só responde.** O modelo chama ferramentas que operam a interface:
  - rolar até uma seção e destacá-la (trajetória, projetos, Atto, blog);
  - abrir a página de um case ou de um post;
  - trocar idioma e tema;
  - abrir o contato da Atto com a mensagem pré-preenchida;
  - mostrar um cartão rico dentro da conversa (projeto com imagem, trecho da trajetória, post).
- **Estados visíveis:** ouvindo, pensando, respondendo, agindo. Ao agir, mostra uma linha de status no estilo HUD ("abrindo o case do Grimory…").
- **Respostas reais**, não roteirizadas: modelo com o perfil completo, a trajetória, os projetos e os posts como contexto.
- **Encaminha para a Atto** quando a conversa vira projeto.

### Base técnica existente
O chat atual (`src/app/api/chat/`, DeepSeek com OpenRouter de reserva, rate limit no Upstash, checagem de origem via `SITE_URL`) é a base. A mudança é de produto: persona Altair, saída com chamadas de ferramenta que o cliente executa, e a nova interface. As proteções atuais (rate limit, filtro de vazamento de segredo, origem confiável) continuam.

### Segurança do Altair (decisão do agente, não do Ranielli)
O pipeline atual espera a resposta inteira, valida e só então envia; rejeita qualquer tool call; e aceita do navegador só as últimas perguntas do visitante, nunca as respostas anteriores (defesa contra prompt injection). Isso impede o "Jarvis". O desenho escolhido:
- **Resposta em fluxo** com o filtro de segredos e de prompt aplicado por trecho (buffer por frase) no servidor, antes de cada trecho sair.
- **Ações como lista fechada:** o modelo só pode chamar ferramentas de uma lista fixa, com argumentos enumerados (ids de seção, slugs de projeto e post existentes, idiomas e temas válidos). O servidor valida cada chamada antes de repassar; o cliente executa só o que reconhece.
- **Histórico assinado:** o servidor devolve cada turno do Altair (texto e ações) com uma assinatura HMAC; o cliente reenvia o histórico recente e o servidor descarta qualquer turno sem assinatura válida. Assim "abre esse aí" funciona sem permitir que o visitante forje falas do Altair.
- **Fatos aprovados:** a checagem de números inventados passa a usar uma lista de fatos vinda dos dados de projetos, trajetória e posts (downloads, commits, datas), em vez de rejeitar todo número desconhecido.
- O conjunto de testes ao vivo (`pnpm chat:eval`) é reescrito para o novo contrato.

### Encaminhamento para a Atto (decidido)
O destino é o **WhatsApp da Atto**, com a mensagem pré-preenchida (o site da Atto já monta esses links em `apps/web/src/content/site.ts`, no repositório `atto`). O Altair propõe um resumo curto do que o visitante quer, **mostra o texto para o visitante editar** e só então abre o link `wa.me`; nada é enviado sem o clique do visitante, e o resumo não inclui dados pessoais que ele não tenha escrito. O botão da seção Atto usa o mesmo link, com uma mensagem padrão.

### Em aberto para o construtor
- Formato das chamadas de ferramenta (tool calling nativo do provedor ou protocolo próprio sobre o stream).
- Visual exato da estrela e do painel, dentro da identidade (§6).
- Sugestões contextuais conforme a seção visível ("quer ver como o Klick foi feito?"): o Ranielli não confirmou nem cortou; implementar só se for barato e discreto.

## 6. Direção visual e de movimento

Lições das prévias, confirmadas pelo Ranielli:

- **Tem que parecer tecnologia:** artefatos reais (telas, terminal, especificação), retrato em código, imagens de ambiente de trabalho. Paisagem não é imagem principal; a Serra Gaúcha aparece como detalhe de origem.
- **Muita animação, com estilos diferentes por seção** (o que funcionou na v5): letras do nome subindo, retrato em código que reage e se resolve com o scroll, faixa que reage à velocidade, cena fixada com transições variadas, rolagem horizontal, troca de foto por cortina, títulos palavra por palavra, imagem que segue o cursor, rolagem suave.
- **Base visual:** fundo escuro, uma cor de destaque (o verde-limão atual), tipografia grande e firme, cores chapadas. Sem gradiente decorativo, sem sombra em repouso, sem `backdrop-filter`.
- **Imagens:** fotos reais dele sempre que possível. Imagens de ambiente podem ser geradas no FLUX 3 local (ComfyUI do PC Windows, regra de geração de imagem do dono; ElevenLabs primeiro quando houver crédito, nunca fal.ai). O FLUX inventa rostos e produtos reais: **não gerar imagens do Ranielli nem de telas de produto**. Telas de produto são capturas reais. Vídeos curtos dos projetos (gravações de tela; Remotion se útil) entram nos cases e onde houver espaço.
- **Movimento com responsabilidade:** animar só `transform` e `opacity` sempre que possível; GSAP + ScrollTrigger para cenas fixadas; Lenis para rolagem suave; `gsap.matchMedia` para versões de celular; nada pode esconder conteúdo se o script falhar; `prefers-reduced-motion` mantém o conteúdo e tira o deslocamento. Seções fixadas curtas o bastante para não prender (na v5, o ciclo usa ~4 telas de rolagem no desktop e ~3 no celular).

## 7. Restrições

- **Stack:** evoluir o repositório atual (Next.js 16, React 19, next-intl, Tailwind v4, pnpm 10), não começar outro projeto. Deploy segue no Dokploy pessoal com Dockerfile no repo e webhook de push; snapshots 2025 e 2026 já publicados em `2025.` e `2026.ranimontagna.com` (branches `release/2025` e `release/2026`) ficam intactos.
- **Proibido `backdrop-filter`** em qualquer elemento (bug de composição do Chrome no macOS com camadas de blur, agravado por canvas WebGL: crbug.com/414525204). Ver PR #80.
- **Idiomas:** pt, en e es para todo texto novo, incluindo o Altair.
- **Temas:** claro e escuro e as cores de destaque trocáveis (hoje: default, ocean, emerald, violet, rose, cherry, amber). Todas as cores novas via tokens que respondem ao tema.
- **Celular é primeira classe:** cada seção tem composição própria no celular; toque substitui hover.
- **Desempenho:** a home precisa continuar rápida no celular (o site hoje tem Lighthouse no CI; manter as metas existentes ou justificar a mudança). Canvas e WebGL só desenham quando visíveis.
- **Conteúdo honesto:** nada de depoimentos, números ou logos de cliente inventados. Mensagens de usuário usadas como exemplo de "dor" precisam ser paráfrase identificada de pesquisa real (ex.: `docs/research/2026-10-07-cenario-de-timers.md` do Klick) ou removidas.
- **Admin e blog:** o admin (`admin.ranimontagna.com`) publica posts no repositório de conteúdo; o formato dos posts e a fonte do blog não podem quebrar.

## 8. Entrega e aprovação (decidido)

- **Data-alvo: 01/01/2027**, sem pressa.
- **Branch longa** `redesign-2026`, publicada num **subdomínio de prévia** (`next.ranimontagna.com`, app separado no Dokploy, DNS na Cloudflare, sem indexação por buscadores) e **virada única** para a `main` no fim. A `main` segue publicando o site atual até lá; correções urgentes no site atual continuam possíveis.
- **Pontos de aprovação do Ranielli:**
  1. a abertura (retrato em código) e a cena do ciclo, já no subdomínio de prévia;
  2. os textos em português de todas as seções, antes de traduzir para en e es;
  3. a versão completa no subdomínio, antes da virada.
- Se o tempo apertar, o corte segue esta ordem (o último sai primeiro): sugestões contextuais do Altair → páginas de case além de Klick e Grimory → vídeos dos projetos.

## 9. O que fica com o construtor

- Textos finais (a partir dos atuais em `messages/*.json`, que já descrevem trajetória e projetos).
- Coreografia exata de cada animação e as transições do ciclo.
- Layout das páginas de case (o Klick pode seguir o formato do ciclo da v5, que o Ranielli aprovou).
- Destino do fundo WebGL atual (spectral), do modo retrô e dos "mundos" escondidos: manter como easter egg é bem-vindo, desde que não pese na home.
- Gravação dos vídeos dos projetos e quais imagens gerar.
