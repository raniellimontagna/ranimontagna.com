# Chat com IA

O widget conversa como uma versão digital de Ranielli, limitada ao perfil público, carreira,
projetos, repertório técnico e canais de contato. A API usa o DeepSeek como provedor primário e
trata toda mensagem do visitante e toda saída do modelo como conteúdo não confiável.

## Arquitetura

```text
ChatWidget -> POST /api/chat -> prompt server-side -> DeepSeek
                                              |-> fallback habilitado explicitamente
                                              |-> resposta completa em buffer
                                              |-> coleta + validação + até 1 correção
                                              `-> SSE com uma resposta aprovada ou fallback estático
```

- `src/app/api/chat/route.ts`: limite de taxa, schema da requisição, execução dos provedores e
  máquina de estados da resposta.
- `src/app/api/chat/chat.prompt.ts`: prompt localizado, fatos canônicos, data da requisição e
  separação entre instruções e conteúdo não confiável.
- `src/app/api/chat/chat.providers.ts`: adapters, modelos, política de geração e prazo total.
- `src/app/api/chat/chat.response*.ts`: coleta estrita do SSE, normalização e validações de
  segurança, datas, métricas e links.
- `src/app/api/chat/chat.telemetry.ts`: eventos operacionais sanitizados, sem conteúdo da conversa.
- `src/shared/components/ui/chat-widget/`: interface, histórico local e renderização segura.
- `scripts/chat-live-eval.mjs`: corpus ao vivo, com DeepSeek como padrão.

## Provedores e modelos

Os identificadores padrão aprovados são:

| Ordem | Provedor | Modelo padrão | Estado inicial |
| --- | --- | --- | --- |
| 1 | DeepSeek | `deepseek-chat` | sempre primário |
| 2 | Gemini | `gemini-2.5-flash-lite` | desabilitado |
| 3 | OpenRouter | `google/gemma-3-4b-it:free` | desabilitado |
| 4 | Groq | `llama-3.1-8b-instant` | desabilitado |

O OpenRouter aceita somente o modelo allowlisted acima. Os demais modelos podem ser definidos
pelas variáveis correspondentes, mas devem passar pelo corpus antes de uso em produção. A política
de geração é compartilhada (`temperature: 0.1`, no máximo 600 tokens de saída).

DeepSeek não possui flag de desativação. Cada fallback é opt-in e só participa da cadeia quando a
flag correspondente for exatamente `true`:

```bash
CHAT_ENABLE_GEMINI_FALLBACK=true
CHAT_ENABLE_OPENROUTER_FALLBACK=true
CHAT_ENABLE_GROQ_FALLBACK=true
```

Nos provedores compatíveis com OpenAI, as instruções são enviadas com role `system`. No Gemini,
elas usam `system_instruction`. O prompt nunca é rebaixado para uma mensagem `user`. O OpenRouter
também exige `data_collection: deny` e `zdr: true`.

## Variáveis de ambiente

```bash
DEEPSEEK_API_KEY=...
DEEPSEEK_MODEL=deepseek-chat

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
CHAT_ENABLE_GEMINI_FALLBACK=false

OPENROUTER_API_KEY=...
OPENROUTER_MODEL_PRIMARY=google/gemma-3-4b-it:free
CHAT_ENABLE_OPENROUTER_FALLBACK=false

GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant
CHAT_ENABLE_GROQ_FALLBACK=false

CHAT_TOTAL_DEADLINE_MS=12000
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

As chaves ficam somente no servidor. Nunca use prefixo `NEXT_PUBLIC_`, não registre valores de
ambiente e não inclua credenciais em fixtures, mensagens de erro ou telemetria.

## Construção do contexto

A API calcula a data de cada requisição no fuso `America/Sao_Paulo` e a injeta como fato
autoritativo. Datas profissionais também são estruturadas (`START_DATE`, `END_DATE`, `CURRENT`) e
não dependem do conhecimento temporal do modelo. Isso evita que perguntas com palavras como
"atualmente" sejam respondidas a partir de uma data presumida pelo provedor.

O corpo público é estrito e contém somente perguntas do visitante:

```json
{
  "locale": "pt",
  "message": "Você tem um emprego fixo?",
  "previousQuestions": ["Em quais tecnologias você trabalha?"]
}
```

`locale` aceita `pt`, `en` ou `es`; `message` é obrigatório; `previousQuestions` contém no máximo
cinco perguntas anteriores. O cliente não pode enviar respostas `assistant`, mensagens `system`
ou roles arbitrárias. No prompt, o payload é serializado como JSON não confiável em uma única
mensagem `user`.

## Defesa contra prompt injection e respostas incorretas

- Instruções, fatos canônicos e contexto temporal existem somente no servidor.
- Texto citado, role-play, Base64 e alegações sobre instruções anteriores continuam sendo dados do
  visitante, nunca novas regras.
- A resposta do provedor é acumulada integralmente; nenhum token parcial chega ao navegador.
- O coletor rejeita SSE malformado, múltiplas escolhas, tool calls, término incompleto, bloqueios de
  segurança, UTF-8 inválido e respostas acima do limite.
- O validador procura canário/prompt interno, segredos inclusive em Base64 recursivo, datas em
  conflito, anos sem suporte, métricas inventadas e URLs fora da allowlist.
- Uma resposta inválida pode receber no máximo uma correção server-owned. Em produção, a correção
  usa DeepSeek; se ela também falhar, a API entrega o fallback estático seguro.
- O navegador recebe exatamente uma resposta aprovada e um marcador `[DONE]`, ou o fallback
  estático; uma resposta rejeitada nunca é interpolada em outra solicitação.

## Links e privacidade

Somente estes destinos exatos podem virar links clicáveis:

```text
https://github.com/RanielliMontagna
https://www.linkedin.com/in/rannimontagna
https://ranimontagna.com
```

O renderer suporta apenas o subconjunto necessário de Markdown, escapa o restante como texto e
abre links aprovados com `target="_blank"` e `rel="noopener noreferrer"`. Protocolos alternativos,
URLs relativas, userinfo, query, fragmento, espaços, lookalikes ou variações dos destinos são
rejeitados. Um rótulo com destino inválido permanece texto visível, sem link.

Antes do primeiro envio, a interface informa em português, inglês ou espanhol que a IA pode errar
e usar provedores de fallback, e orienta a não enviar dados pessoais, confidenciais ou sensíveis.
Essa divulgação é obrigatória porque um fallback habilitado pode encaminhar a pergunta a outro
provedor.

## Telemetria

Cada tentativa registra somente dados operacionais normalizados: `traceId`, provedor/modelo,
resultado, categoria de falha, ativação de fallback, latência até o primeiro byte, duração total,
motivo de término, código de validação e tamanho da resposta. O fallback estático final é um evento
separado e não inventa provedor ou modelo.

O evento usa um scope limpo do Sentry. Prompt, pergunta, histórico, resposta, headers, credenciais,
corpo/erro bruto do provedor e stack não fazem parte do tipo público nem do payload serializado.

## Avaliação ao vivo

O corpus cobre emprego atual e data de início na Lemon, histórico de 2024, falsa métrica, link
malicioso, extração direta/codificada do prompt, role-play, injeção multilíngue, documento citado e
pedido de segredo. Ele usa data fixa `2026-07-16`, a mesma política de geração da produção, coleta a
resposta completa, aplica o validador e permite no máximo uma correção pelo mesmo provedor.

O comando padrão avalia o DeepSeek e carrega os segredos do `.env.local` do diretório atual:

```bash
pnpm chat:eval
```

Quando o arquivo de ambiente está em outro checkout, informe o diretório sem copiar a chave:

```bash
CHAT_EVAL_ENV_DIR=/caminho/para/o/projeto pnpm chat:eval
```

Para certificar um fallback, selecione-o explicitamente:

```bash
CHAT_EVAL_PROVIDER=gemini pnpm chat:eval
CHAT_EVAL_PROVIDER=openrouter pnpm chat:eval
CHAT_EVAL_PROVIDER=groq pnpm chat:eval
```

Essa seleção ignora somente a flag de fallback dentro do script de avaliação; ela não altera e não
é alcançável por `/api/chat`. Um nome desconhecido falha fechado. Um fallback não deve ser
habilitado em produção até o corpus completo dele terminar com exit code zero.

O terminal mostra apenas o ID do caso, `PASS`/`FAIL` e a resposta do modelo. Prompt interno,
payloads, ambiente e credenciais nunca são exibidos; uma resposta com possível vazamento é retida.
Qualquer caso reprovado encerra o comando com código diferente de zero.

## Verificação local

```bash
pnpm test
pnpm check
pnpm typecheck
pnpm build
pnpm chat:eval
```

O último comando faz chamadas reais e deve ser executado conscientemente com a chave local. Os
demais não devem depender da rede nem de credenciais.
