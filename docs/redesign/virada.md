# Virada do redesign 2026 (01/01/2027)

Checklist para trocar o site no ar pela branch `redesign-2026`. Preparado em 09/11/2026. A virada não foi executada.

## Onde está cada coisa (Dokploy pessoal, projeto `ranimontagna`)

| App | Branch | Endereço | Observação |
|---|---|---|---|
| `site` | `main` | ranimontagna.com | Deploy automático a cada push. É o app que recebe a virada. |
| `site-next` | `redesign-2026` | next.ranimontagna.com | Prévia com `SITE_NOINDEX=1` (variável e build arg). |
| `site-2025` / `site-2026` | `release/2025` / `release/2026` | 2025. / 2026.ranimontagna.com | Snapshots. Não mexer (os dois respondiam em 09/11/2026). |
| `admin` | | admin.ranimontagna.com | Publica posts no repositório de conteúdo; não depende do visual do site. |

## Antes da virada (até 31/12/2026)
- [ ] O Ranielli testa a prévia no celular dele (até agora só houve teste em Chrome headless).
- [ ] Aprovação dos textos em português (`docs/redesign/textos-pt.md`), ponto 2 da spec.
- [ ] Revisão do inglês e do espanhol depois dessa aprovação. Os dois passaram por uma revisão de redação em 09/11/2026, feita a partir do português daquele dia.
- [ ] Aprovação da versão completa na prévia, ponto 3 da spec.
- [ ] Pendências que dependem dele: `GITHUB_TOKEN` (também falta em produção), `pnpm chat:eval` com chave e as redes em blocos no menu do desktop.
- [ ] **Textos de SEO:** `src/shared/lib/seo.ts` ainda diz "Engenheiro de Software · Sócio-fundador da Atto", e a abertura diz "Engenheiro de produto". Decidir se o título e a descrição acompanham a abertura.

## Conferência local do CI (09/11/2026)
O PR para a `main` roda `.github/workflows/lint-ant-test.yml`. Rodado localmente sobre a `redesign-2026`:
- `pnpm audit --prod --audit-level=high`: passa (2 moderadas).
- **`pnpm lint`:** passa, com só avisos e infos, que já existiam antes da rodada:
  - `article-body.tsx`;
  - `article-image.tsx`;
  - `sbsistemas.svg`;
  - fragments em `writing.test.tsx`.
- `pnpm typecheck` e `pnpm knip`: passam.
- **`pnpm test:coverage`:**
  - resultado: 88,29 statements, 78,78 branches, 88,07 functions e 90,28 lines;
  - limites: 86, 78, 86 e 87;
  - **branches tem só 0,78 de folga:** cada código novo precisa vir com teste.
- `pnpm build`: passa.
- **Lighthouse CI** (`lighthouserc.ci.json`, build local):
  - home: desempenho 95 a 96, LCP de 2,17 a 2,26 s, TBT de até 39 ms;
  - `/en/projects`: desempenho 100, LCP de 1,5 s (era 3,7 s, o que teria reprovado);
  - `/en/blog`: passa;
  - o post `um-novo-capitulo-na-lemon` dá 404 localmente sem `GITHUB_TOKEN` (limite da API do GitHub). No CI o workflow passa o token.

## No dia
1. Abrir o PR `redesign-2026` → `main` e esperar o CI verde. Se o Lighthouse do post falhar por limite da API, rodar de novo.
2. Fazer o merge (merge commit, para o histórico do redesign ficar legível). O app `site` faz o deploy sozinho.
3. **Variáveis do app `site`:**
   - não adicionar `SITE_NOINDEX` (variável nem build arg);
   - manter as outras;
   - `FORMLY_FORM_ID` e `NEXT_PUBLIC_FORMLY_FORM_ID` ficam sem uso, porque o formulário de contato saiu, e podem ser removidas depois;
   - `CHAT_RATE_LIMIT_PREFIX` existe só na prévia e é opcional (padrão `chat:rate-limit`).
4. **Depois do deploy, conferir:**
   - **Páginas:** `/`, `/en`, `/es`, `/blog`, um post, `/projects`, `/projects/klick` e `/projects/grimory` respondem 200, sem o header `X-Robots-Tag`.
   - **Indexação:** `/robots.txt` e `/sitemap.xml` estão acessíveis, e o HTML tem `<meta name="robots" content="index, follow">`.
   - **Imagem de compartilhamento:** `/og/og-pt.jpg`. Testar no LinkedIn Post Inspector, no Sharing Debugger do Facebook e com um link de teste no X.
   - **Vega:** responde, e o ⌘K abre e fecha.
   - **Revalidação do blog:** publicar ou editar um post pelo admin e ver o webhook `POST /api/revalidate` atualizar.
   - **Âncoras antigas:** `/#about`, `/#experience`, `/#projects`, `/#contact`, `/#services` e `/#skills` caem nas seções novas.
5. **Cloudflare:** "Purge Everything". Os arquivos de `public/` mantêm o nome e ficam um dia no cache da borda.
6. **Search Console:** reenviar `https://ranimontagna.com/sitemap.xml`.
7. **Prévia:** decidir entre desligar o app `site-next` ou mantê-lo com noindex para as próximas rodadas.

## Se der errado
- No Dokploy, voltar o app `site` para o deploy anterior (Rollback), ou fazer revert do merge na `main`. O deploy automático republica.
- O site antigo continua em 2026.ranimontagna.com como referência.

## Desempenho que não depende de código
- **Origem lenta:** o TTFB da origem é de uns 450 ms, mesmo com o cache do Next acertando (`x-nextjs-cache: HIT`). A Cloudflare não guarda HTML (`cf-cache-status: DYNAMIC`). Guardar HTML na borda exige cuidado: a Cloudflare ignora o `Vary` dos cabeçalhos `rsc` e pode misturar HTML com payload RSC. Se for testar, use uma regra só para `GET` sem os cabeçalhos `RSC` e `Next-Router-*`, com TTL curto.
- **Sentry:** carrega cerca de 150 KB, incluindo o Replay, depois de 2 s ociosos. Com o Turbopack, as opções de tree-shaking do plugin de webpack não valem. Para reduzir, use o loader do Sentry ou desative o Replay de vez.
