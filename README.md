# ranimontagna.com

<div align="center">
  <img src="public/logo/white.svg" alt="Ranielli Montagna Logo" width="120" height="120" class="dark-mode-only">
  
  <h1>Ranielli Montagna Portfolio</h1>
  
  <p>
    <strong>Um site moderno, performático e acessível desenvolvido com a stack mais recente do ecossistema React.</strong>
  </p>

  <p>
    <a href="https://ranimontagna.com">Visitar Site</a> • 
    <a href="./docs/architecture.md">Arquitetura</a> • 
    <a href="#-começando">Começando</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/version-1.11.0-blue.svg?style=flat-square" alt="Version">
    <img src="https://img.shields.io/badge/Next.js-16.0.10-black.svg?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19.2.3-blue.svg?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Biome-2.3.10-60A5FA.svg?style=flat-square" alt="Biome">
  </p>
</div>

---

## 🚀 Sobre o Projeto

Este repositório contém o código-fonte do portfólio pessoal de **Ranielli Montagna**. Mais do que apenas uma vitrine de projetos, este site serve como um playground para experimentar e implementar as tecnologias mais recentes e melhores práticas de desenvolvimento web moderno.

O projeto foi recentemente refatorado para utilizar uma **Feature-Based Architecture**, garantindo escalabilidade e manutenibilidade.

## ✨ Destaques

- 📚 **Arquitetura Escalável**: Organização baseada em Features para fácil manutenção.
- 🌍 **Internacionalização (i18n)**: Suporte nativo para **Português (BR)**, **Inglês (US)** e **Espanhol (ES)**.
- ⚡ **Alta Performance**:
  - Renderização otimizada com **Next.js 16** e **React Server Components**.
  - Builds ultra-rápidos com **Turbopack**.
  - Fontes otimizadas com `next/font`.
- 🎨 **UI/UX Premium**:
  - Design system consistente com **Tailwind CSS v4**.
  - Modo Escuro/Claro (Dark Mode) automático.
  - Animações fluidas com **Motion**.
- 📝 **Blog Integrado**:
  - Posts escritos em MDX com **GitHub Flavored Markdown**.
  - Syntax highlighting para blocos de código.
- 🧪 **Qualidade de Código**:
  - Testes unitários com **Vitest** e **Testing Library**.
  - Linting e formatação instantânea com **Biome**.
  - Husky para git hooks.

## 🛠️ Tech Stack

| Categoria | Tecnologias |
|-----------|-------------|
| **Core** | Next.js 16 (App Router), React 19, TypeScript |
| **Estilização** | Tailwind CSS 4, CSS Modules |
| **Animação** | Motion (`framer-motion` fork) |
| **Estado** | Zustand (Client), React Server Components (Server) |
| **i18n** | next-intl |
| **Conteúdo** | MDX, next-mdx-remote, remark-gfm |
| **Qualidade** | Biome, Vitest, Testing Library |
| **Pacotes** | pnpm |

## 📚 Documentação

Documentação técnica detalhada (em inglês) está disponível na pasta [`/docs`](./docs):

- 🏠 **[Architecture](./docs/architecture.md)**: Entenda a arquitetura baseada em features.
- 📂 **[Folder Structure](./docs/folder-structure.md)**: Guia completo sobre onde encontrar e colocar arquivos.
- 📏 **[Coding Standards](./docs/coding-standards.md)**: Padrões de código e boas práticas adotadas.
- 🧪 **[Testing Guide](./docs/testing.md)**: Estratégias de testes e exemplos.
- 🌍 **[Internationalization](./docs/i18n.md)**: Como adicionar novos idiomas e traduções.

## 🚀 Começando

### Pré-requisitos

- **Node.js** 20.9.0+
- **pnpm** 10.x (recomendado)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/RanielliMontagna/ranimontagna.com.git

# 2. Entre na pasta
cd ranimontagna.com

# 3. Instale as dependências
pnpm install

# 4. Inicie o servidor de desenvolvimento
pnpm dev
```

O site estará disponível em `http://localhost:3000`.

## 🧪 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento com Turbopack |
| `pnpm build` | Gera o build de produção |
| `pnpm start` | Inicia o servidor de produção |
| `pnpm test` | Executa a suíte de testes |
| `pnpm check` | Executa verificação de tipos, lint e format (Biome) |
| `pnpm lighthouse:local` | Executa auditoria de performance localmente |

## 📄 Licença

Este projeto é open source sob a licença [MIT](LICENSE), mas o conteúdo (textos, imagens pessoais) e design são de propriedade de Ranielli Montagna.

---

<div align="center">
  Desenvolvido com 💙 por <a href="https://github.com/raniellimontagna">Ranielli Montagna</a>
</div>
