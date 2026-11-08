# Redesign 2026 — decisões da Fase 2

Registro das decisões que tomei durante a execução da Fase 2 (07/11/2026), tiradas do ledger da execução. Cada uma diz o que decidi, por quê e quanto custa se estiver errada.

## Decisões

- Pré-voo: T13 MermaidDiagram ↔ T15 apaga features/blog/components antigo · conflito · Ruling: mover mermaid-diagram.tsx (lógica) para components-2026 na T13 antes da T15 apagar a pasta — custo se errado: nenhum
- Pré-voo: T3 hero-ranielli.webp ↔ T5 foto da etapa 2026 · mesma foto em duas seções · Ruling: decidir na T5 (preferir photo.webp ou outra) para não repetir — custo se errado: repetição visual
- Task 1: Ruling: es.json tinha a chave órfã header.navigation.start (sem uso no código), que quebrava o teste de paridade; removida — custo se errado: nenhum (o namespace header sai na T15).
- Task 1: Ruling: SectionHeading dá ao h2 o id `<id>-title` (o id da seção fica na <section>, para a nav) — custo se errado: nenhum.
- Task 2: Ruling: 9 cores de destaque (o tipo ColorTheme tem sunset e mono além das 7 da spec); paleta movida para src/shared/store/use-theme/color-themes.ts (dado, fora das pastas guardadas contra hex) — custo se errado: duas cores a mais no seletor.
- Task 2: Ruling: ChatWidget antigo ganhou a prop hideLauncher (só esconde a bolinha dele) e a estrela tem data-chat-launcher para receber o foco de volta — temporário até a Fase 3 — custo se errado: nenhum.
- Task 2: Ruling: PreferencesMenu visível em todos os tamanhos (no celular o idioma e o tema precisam estar acessíveis) e chama initTheme no mount (antes era o ThemeProvider dos controles antigos) — custo se errado: nenhum.
- Task 2: Ruling: o teste layout.spectral-background virou layout.shell (mesmos casos de JSON-LD e skip link, mais a ordem do shell); os testes de layout mockam '@/shared/shell' porque renderToStaticMarkup não renderiza componente async — custo se errado: nenhum.
- Task 2: Ruling: ProgressiveGsapAnimations e o CommandMenu antigos deixam de ser montados (só existiam no HomeClientWidgets); a T15 apaga — custo se errado: as seções antigas perdem a animação de entrada até a T9 substituí-las.
- Task 3: Ruling: interlúdio em duas colunas (foto 3:4 com máscara + frase) em vez de foto em tela quase cheia — hero-ranielli.webp é vertical e o corte em tela cheia cortaria o rosto; local de moradia não entra (não é público no site) — custo se errado: troca de layout.
- Task 4: Ruling: LiveWorkItem.href aceita null — Argus e Atto Read são repositórios privados sem página pública, então ficam sem link (o plano tipava href: string) — custo se errado: nenhum.
- Task 4: Ruling: imagens — Grimory e Klick com captura real; agent-toolkit com cartão de terminal (comando real do README); Argus com a imagem de ambiente server.webp, com alt dizendo que não é captura; Atto Read com cartão tipográfico. Grimory sem URL pública (repo privado), então linka só o case — custo se errado: trocar arte quando houver captura.
- Task 4: Ruling: a faixa horizontal também chama ScrollTrigger.sort()/refresh() depois de montar (mesmo motivo do ciclo: pins fora de ordem) — custo se errado: nenhum.
- Task 5: Ruling: fotos das etapas — pc-avatar (2021), about-ranielli (2022), photo.webp (2023) e hero-ranielli (2026). avatar.webp é ilustração e ficou de fora; com 4 fotos reais para 5 lugares, photo.webp e hero-ranielli repetem (abertura/interlúdio) até a sessão de fotos nova — custo se errado: trocar o src quando chegarem fotos.
- Task 5: Ruling: logo da Atto como componente inline (AttoLogo, gerado do SVG do site da Atto com currentColor); os logos ficam numa placa branca fixa (bg-white) nos dois temas, porque logo de marca precisa de fundo previsível; Lemon usa lemon-logo-green.png (o símbolo branco some no tema claro); StageLogo vira união image|atto — custo se errado: troca de classe.
- Task 5: Ruling: textos das etapas 2021–2023 reaproveitam cargo, período, descrição e 3 destaques de experience.jobs (já revisados e com números reais); a etapa 2026 junta Lemon e Atto com texto novo tirado de about.journey — custo se errado: texto, revisado na aprovação 2.
- Task 6: Ruling: os cases expandem com <details>/<summary> nativo (teclado e leitor de tela sem JS) em vez do atto-cases.tsx client do plano — custo se errado: nenhum.
- Task 6: Ruling: attoWhatsappHref(message) exige a mensagem (traduzida em messages: "Vim pelo site do Ranielli…"), em vez de default fixo do site da Atto ("Vim pelo site da Atto") — quem chega daqui não veio do site da Atto — custo se errado: texto da mensagem.
- Task 6: Ruling: textos dos cases e dos serviços copiados do site da Atto no ar (conferido em attodev.com.br em 07/11/2026: os 4 cases, Marketing, Vega e o WhatsApp aparecem), apesar do TODO(juliano) no site.ts sobre validar marketing — custo se errado: tirar "Marketing" se o Juliano retirar do site da Atto.
- Task 7: Ruling: Writing devolve null também com lista vazia (além de erro), e o follower do cursor só liga com ponteiro fino (hover: hover) — custo se errado: nenhum.
- Task 8: Ruling: client-messages home: [] fica para a T9 (o formulário antigo, que usa o namespace contact, continua montado até a home nova substituir as seções) — custo se errado: nenhum.
- Task 8: Ruling: Closing lê o locale com getLocale() para escolher o currículo (o plano dava Closing() sem parâmetros) — custo se errado: nenhum.
- Task 8: Ruling: WordReveal e o nome do fechamento trocaram aria-label por cópia sr-only (Biome: aria-label não suportado em <p>; leitores ignoram) — testes atualizados RED→GREEN; o commit 3220e36 tinha saído com esse erro do Biome — custo se errado: nenhum.
- Task 9: Ruling: HomeIntro (Fase 1) foi substituído por HomeBody, que resolve todas as seções no servidor em paralelo e entrega elementos prontos (testável sem renderizar componente async); Home recebe bodyContent; home-intro.tsx e o teste dele saem — custo se errado: nenhum.
- Task 9: Ruling: o link "Ver o que está no ar" fica no copy do último capítulo do ciclo (cycle.casesLink), dentro da cena fixada — custo se errado: posição do link.
- Task 9: Ruling: client-messages home: [] e o teste de namespace ausente passou a usar o escopo projects — custo se errado: nenhum.
- Task 10: Ruling: Grimory linka https://grimory.com.br (a landing pública está no ar, conferida com curl), sem repositório (privado); Klick linka o site e o repo público — custo se errado: nenhum.
- Task 10: Ruling: números reais tirados do git e datados no texto — Klick 428 de 429 commits com coautoria de IA (até 06/11/2026), Grimory 2328 de 2495 (até 07/11/2026) — custo se errado: atualizar o número com o tempo.
- Task 10: Ruling: capítulos em tela cheia com revelação de imagem para os dois cases (não reaproveitei buildCycleTimeline no Klick: exigiria mudar a interface); galeria com 3 capturas reais por case (novas: klick-stats, grimory-mesa, grimory-inventory, origem em docs/redesign/assets.md) — custo se errado: o Klick ganharia a cena fixada depois.
- Task 10: Ruling: CaseImage ganhou width/height/phone e os alts vivem em messages (cases.<slug>.gallery), em vez de Img {src, alt} no dado — custo se errado: nenhum.
- Task 8: Ruling: verificação visual na prévia (após a T9) achou o nome do fechamento estourando no celular (espaços inquebráveis) e o 'g' cortado pela entrelinha 0.82; corrigido com palavras agrupadas que quebram entre si (teste RED→GREEN), leading 0.9 e o botão de e-mail empilhado no celular.
- Task 11: Ruling: textos da página em namespace novo projectsIndex (servidor; o client recebe labels por props); a metadata usa projectsIndex.metaTitle/lead; a página chama ProjectsIndex() direto (componente async aninhado não renderiza em teste) — custo se errado: nenhum.
- Task 11: Ruling: o teste antigo features/projects/__tests__/projects-page.test.tsx foi reescrito para a página nova — custo se errado: nenhum.
- Task 12: Ruling: o índice não mostra tempo de leitura (PostSummary não traz o conteúdo; calcular exigiria baixar todos os posts) — custo se errado: adicionar quando o repositório de posts expuser o dado.
- Task 12: Ruling: getAllPosts com erro vira lista vazia na página (estado vazio em vez de quebrar, Review Focus 2); a metadata do /blog continua no namespace blog — custo se errado: nenhum.
- Task 13: Ruling: mermaid-diagram.tsx e safe-image.tsx copiados para components-2026 (lógica igual; a T15 apaga os originais) em vez de mover — o index antigo ainda os reexporta até a T15 — custo se errado: nenhum.
- Task 13: Ruling: tipografia do artigo em .article-2026 (CSS com tokens no globals.css) em vez do plugin prose; o MDX mantém só os componentes que precisam de comportamento (pre/mermaid/código, a, img, table) — custo se errado: ajuste de estilo.
- Task 13: Ruling: a imagem ampliada no <dialog> tem alt vazio e o dialog leva aria-label com o alt (evita alt duplicado) — custo se errado: nenhum.
- Task 14: Ruling: StatusView é client (embaralhamento + botão de tentar de novo) e ganhou StatusDocument (html/body) para o 404 raiz e o erro global, que rodam fora do layout de idioma; ações aceitam href ou onClick (Altair e reset) — custo se errado: nenhum.
- Task 14: Ruling: o teste root-not-found passou a verificar o markup real (html lang pt-BR, texto, link para /) em vez de mockar o ErrorLayout antigo; já passava antes da troca, então funciona como teste de caracterização — custo se errado: nenhum.
- Task 15: Ruling: âncoras-alias (#about e #experience na Trajetória, #projects no No ar, #contact no Fechamento) para links antigos, mundos retrô e posts que apontam para ids da home antiga (Review Focus 4); o teste "no longer renders the old sections" virou "keeps the old anchors working" — custo se errado: nenhum.
- Task 15: Ruling: também saíram as dependências sem uso que o knip apontou (three, @react-three/fiber, cmdk, motion, dayjs, yet-another-react-lightbox, @radix-ui/react-visually-hidden, @types/three), 3 arquivos órfãos de projects (data/projects.static, lib/project-images, types/projects.types) e exports sem uso (GLYPH_RAMP, CELL_ASPECT, getPathname, SECTION_Y) — custo se errado: reinstalar um pacote.
- Task 15: Ruling: public/projects/atto-*.webp (ilustrações geradas dos cases da Atto, usadas pelo site antigo) ficam para uma possível arte na seção Atto; os demais órfãos de public/ saíram — custo se errado: 4 imagens sem uso no repo.
- Task 15: Ruling: mensagens removidas (header, hero, about, experience, projects, contact, footer, services, commandMenu, projectsPage); client-messages projects: [] — custo se errado: nenhum (nenhum código as lia).
- Final: Ruling: item 7 (evidência da Task 16) não é defeito de código — é o passo de verificação no ar, feito em seguida e registrado na linha da Task 16 — custo se errado: nenhum.
- Final: Ruling: 9 cores de destaque em vez de 7 — mantido (ledger T2), decisão visual do dono — custo: duas cores a mais.
- Final: Ruling: interlúdio em duas colunas — mantido (ledger T3), a foto é vertical — custo: troca de layout.
- Final: Ruling: Klick em capítulos, sem cena fixada — permitido pelo plano — custo: o Klick ganharia a cena depois.
- Final: Ruling: sem tempo de leitura no /blog — mantido (ledger T12) — custo: adicionar quando a fonte expuser.
- Final: Ruling: fotos repetidas — mantido até a sessão de fotos (ledger T5) — custo: troca de src.
- Final: Ruling: "Marketing" nos serviços da Atto — mantido, conferido no site no ar em 07/11/2026 — custo: tirar se o Juliano tirar.
- Final: Ruling: redação e números do pt.json — revisão do dono na aprovação 2 — custo: texto.
- Final: Ruling: qualidade do en/es — rascunho até a aprovação 2 — custo: nenhum agora.
- Final: Ruling: global-error fora do layout de idioma e post sem setRequestLocale — estrutura pré-existente — custo: nenhum nesta fase.
- Final: Ruling: <a> simples no 404 raiz — correto (sem contexto de idioma lá) — custo: nenhum.
- Final: Ruling: internos da Fase 1 além das pendências listadas — fora do escopo — custo: nenhum.
- Task 16: Ruling: a verificação no ar achou React #418 (hidratação) em todo post com imagem — o MDX põe a imagem num <p> e o ArticleImage desenha <figure>/<dialog>; corrigido desembrulhando parágrafos só de imagem (teste RED→GREEN, suite 1085/1085) — custo se errado: nenhum.
- Task 16: Ruling: as capturas no ar mostraram o gradiente ambiente antigo atrás de todas as páginas (body background-image); removido, com teste-guarda flat-page-background RED→GREEN (suite 1086/1086) — custo se errado: nenhum.

## Correções da revisão final

- Final: fixed currículo 404 em /en e /es — closing "serves the résumé as a plain download link" + primitives "renders a plain anchor with download" RED→GREEN, suite 1083/1083
- Final: fixed faixa No ar fixando e encolhendo cards no tablet (761–1023) — live-work "keeps the vertical list on tablets…" RED→GREEN (LG_QUERY), suite 1083/1083
- Final: fixed links abaixo da dobra fora do Tab (Reveal com autoAlpha) — reveal "keeps hidden-below-the-fold links focusable…" RED→GREEN, suite 1083/1083
- Final: fixed menu preso no header que se move e estrela por cima — site-menu "renders the open menu at the document body…" RED→GREEN (portal, z-60), suite 1083/1083
- Final: fixed 404 localizado mandando para a home em pt — not-found "keeps the visitor in their language…" RED→GREEN, suite 1083/1083
- Final: fixed cases fora do sitemap — sitemap "lists the Klick and Grimory case pages…" RED→GREEN, suite 1083/1083

## Pendências menores adiadas

- transition-[transform] não anima translate-* do Tailwind v4 (header e hover do botão "pulam")
- botão de copiar do bloco de código com "copy"/"copied" fixos em inglês
- foco por teclado na Escrita ativa a capa no canto superior esquerdo (follower sem posição)
- troca de foto da Trajetória esconde a anterior antes da cortina; PhotoReveal mobile registra triggers no desktop
- NextIntlClientProvider vazio na home (home: [])
- espaço de ~176 px sob o header nas páginas de case (pt-16 + pt-28/36)
- No ar com lg:h-svh corta texto em desktop baixo (1280×620)
- lista mobile do No ar usa StaticImage sem PhotoReveal (plano pedia scale) — sem Ruling na T4
- chunk do chat que falha uma vez fica em cache rejeitado; clipboard sem tratamento de erro
- troca de idioma descarta a query string
- CSS retrô ainda estiliza [data-chat-launcher] img e #contact (código morto)
- capas remotas com <img> sem fallback de erro (SafeImage tinha)
- supressão noArrayIndexKey sem efeito em word-reveal.tsx
- globals.css ainda tem CSS morto do visual antigo (spectral-*, glow-gradient-*, surface-panel*, --ambient-*); limpar com cuidado por causa dos estilos do modo retrô.

## Rodada 2 (07/11/2026)

Spec: `docs/superpowers/specs/2026-11-07-redesign-rodada-2-design.md`. Plano: `docs/superpowers/plans/2026-11-07-redesign-rodada-2.md`.

- **Ícones de AWS:** os serviços (Fargate, Aurora, EventBridge, SQS, API Gateway) usam a marca da AWS, não os ícones de arquitetura. Aqueles são ladrilhos coloridos e virariam quadrados chapados como máscara monocromática.
- **`#ia` não entrou no menu do header,** que já tem seis itens.
- **Cartões da Vega com caminho sem idioma** (`/projects/klick`, `/#trajetoria`): o `Link` do next-intl põe o prefixo. O texto dos cartões fica em `chat.cards.ts`, como o resto do texto localizado do chat. Cartão de post vai sem imagem, porque a capa pode ser remota. "Lemon" leva ao cartão da trajetória.
- **Persona:** as linhas de experiência do perfil continuam em primeira pessoa, porque os validadores leem os verbos delas. A persona, as regras, a disponibilidade e o fallback estão em terceira pessoa.
- **Fatos aprovados:** seis produtos e três meses na Lemon, e os commits dos cases (2328/2495 e 428/429). Entrou também a unidade `commits` e a expansão de "N de M <unidade>", com um "vs" neutro.
- **Saíram:**
  - o widget de chat antigo, o formulário de contato do chat, `/api/contact`, o serviço Formly e o `contact-form`;
  - a entrada Formly do CSP e do `.env.example`, e o namespace `chat`;
  - as dependências `@radix-ui/react-dialog`, `@solar-icons/react` e `framer-motion`.
- **O `chat:eval` ao vivo não foi rodado** (sem chave do provedor nesta sessão). Fica para o Ranielli: `pnpm chat:eval`.
