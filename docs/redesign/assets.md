# Imagens do redesign 2026

Origem de cada imagem em `public/redesign/`. Regra do projeto: IA só gera ambientes, nunca o rosto do Ranielli nem telas de produto; telas são capturas reais.

## Cenas de ambiente (geradas)

Versão 2, de 08/11/2026. As imagens foram geradas pelo **Codex CLI 0.167.0** (`image_generation`, OpenAI), uma por cena, em 1536×1024, seguindo uma pesquisa de direção de arte para foto atrás de texto:
- metade esquerda vazia e escura para o texto;
- uma única luz vinda da direita;
- profundidade de campo rasa;
- um único detalhe lima por cena;
- nada de "cinematic/8K/neon".

A cena `pain` serviu de referência de estilo (`-i`) para as outras, para formarem uma série. Os prompts ficam em `docs/redesign/prompts-codex/`: `series.txt` mais o arquivo da cena.

A conversão para webp foi feita no tamanho original, sem ampliar, com qualidade 88 e `-sharp_yuv`. O otimizador usa qualidade 90 nos fundos. Ampliar 2× com Real-ESRGAN (Upscayl) foi testado e descartado, porque transformava o desfoque em textura de pintura.

No site, cada cena fica debaixo de um escurecimento em degradê (forte atrás do texto, leve sobre a foto), com vinheta e grão de filme. Os nomes mudam a cada versão, para nenhum cache servir a anterior.

| Arquivo | Prompt | Onde aparece |
|---|---|---|
| `scenes/pain-codex.webp` | `pain.txt` (parede de fichas, um fio lima) | ciclo, etapa "dor" |
| `scenes/solution-codex.webp` | `solution.txt` (janela na serra, araucárias, chimarrão) | ciclo, etapa "solução" |
| `scenes/product-codex.webp` | `product.txt` (monitor ultrawide à noite) | ciclo, etapa "produto" |
| `scenes/code-codex.webp` | `code.txt` (mão no teclado, Enter lima) | ciclo, etapa "código" |
| `scenes/homelab-codex.webp` | `homelab.txt` (rack com LEDs) | capa do Argus no "No ar" |

## Projetos em moldura (capturas reais, 08/11/2026)

Telas reais montadas em código: navegador e celular em leve perspectiva, sobre o fundo escuro. O render é feito no Chrome headless, em 2000×1250, e exportado em webp q84. Nenhuma tela foi gerada por IA.

| Arquivo | Origem |
|---|---|
| `products/frame-klick.webp` | `klick-timer` + `klick-mobile` (capturas do app) |
| `products/frame-grimory.webp` | `grimory-compendium` + `grimory-inventory` |
| `atto/quadralize.webp` | quadralize.com.br, capturado em 08/11/2026 (desktop e celular, 2×) |
| `atto/fronteira.webp` | fronteirasuldrones.com, capturado em 08/11/2026 |
| `atto/nan.webp` | nansolutions.com.br, capturado em 08/11/2026 |

A TALA não tem site público, então fica sem imagem até chegar uma captura real. As antigas `public/projects/atto-*.webp` (aparelhos com tela vazia) saíram.

## Capturas reais

| Arquivo | Origem | Data |
|---|---|---|
| `products/klick-timer.webp` | `klick/docs/screenshots/timer.png` (app Klick, desktop) | 07/11/2026 |
| `products/klick-mobile.webp` | `klick/docs/screenshots/timer-mobile.png` (app Klick, celular) | 07/11/2026 |
| `products/grimory-compendium.webp` | `grimory/.superpowers/reports/arte-equipamento/4-espada-longa-desktop-dark.png` (compêndio do Grimory, mesa de exemplo) | 07/11/2026 |

Conferidas antes de copiar: só dados de exemplo, nenhum dado pessoal.

## Capturas reais (Fase 2, 07/11/2026)

| Arquivo | Origem |
|---|---|
| `products/klick-stats.webp` | `klick/docs/screenshots/stats.png` (aba de estatísticas do Klick) |
| `products/grimory-mesa.webp` | `grimory/.superpowers/reports/criar-mesa/home-desktop-1280-escuro.png` (início com a mesa de exemplo "A Torre de Sal") |
| `products/grimory-inventory.webp` | `grimory/.superpowers/reports/arte-equipamento/2-inventario-desktop-dark.png` (inventário com a Chama-guia) |

Todas com dados de exemplo, conferidas antes de copiar.

## Logos das empresas em branco (rodada 2, 07/11/2026)

`public/companies/white/` guarda cada logo em branco sobre transparente, para o painel da trajetória pintar a cor da empresa por trás.

| Arquivo | Origem | Como |
|---|---|---|
| `sbsistemas.svg` | `companies/sbsistemas.svg` | `fill` trocado por branco |
| `smarten.png` | `companies/smarten.webp` (marca branca sobre roxo) | alfa pelo limiar da luminância, recortado (canvas no Chrome headless) |
| `luizalabs.png` | `companies/luizalabs.webp` (marca branca sobre azul) | igual ao da Smarten |
| `lemon.png` | `companies/lemon-logo-green.png` | alfa original, RGB branco |
