# Imagens do redesign 2026

Origem de cada imagem em `public/redesign/`. Regra do projeto: IA só gera ambientes, nunca o rosto do Ranielli nem telas de produto; telas são capturas reais.

## Cenas de ambiente (geradas)

Geradas em 07/11/2026 pelo **Codex CLI 0.167.0**, com a ferramenta `image_generation` (OpenAI), uma imagem por cena, em 1536×1024. Convertidas para webp de 1600 px, qualidade 76, com `cwebp`. Substituíram as versões do FLUX local, que o Ranielli achou de baixa qualidade (rodada 2 do redesign).

Os prompts ficam em `docs/redesign/prompts-codex/`: cada cena usa `style.txt` seguido do arquivo da cena.

| Arquivo | Prompt | Onde aparece |
|---|---|---|
| `scenes/discovery.webp` | `discovery.txt` (parede de fichas com fios) | ciclo, etapa "dor" |
| `scenes/fog-window.webp` | `fog-window.txt` (cozinha na serra, neblina e araucárias) | ciclo, etapa "solução" |
| `scenes/night-setup.webp` | `night-setup.txt` (escritório à noite) | ciclo, etapa "produto" |
| `scenes/keyboard.webp` | `keyboard.txt` (mãos no teclado) | ciclo, etapa "código" |
| `scenes/server.webp` | `server.txt` (traseira do rack) | capa do Argus no "No ar" |

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
