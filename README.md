# ranimontagna.com

<div align="center">
  <img src="public/logo/white.svg" alt="Ranielli Montagna Logo" width="120" height="120"></img>
</div>

🌟 **Portfólio pessoal de Ranielli Montagna** - Um site moderno e responsivo desenvolvido com Next.js 16, apresentando projetos, experiências e habilidades como Full Stack Developer.

![Version](https://img.shields.io/badge/version-1.11.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black.svg)
![React](https://img.shields.io/badge/React-19.2.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg)
![Biome](https://img.shields.io/badge/Biome-2.3.10-60A5FA.svg)
![pnpm](https://img.shields.io/badge/pnpm-10.x-F69220.svg)

## ✨ Características

- 🌍 **Multilíngue**: Suporte completo para Português, Inglês e Espanhol
- 🎨 **Design Moderno**: Interface clean e responsiva com Tailwind CSS
- ⚡ **Performance**: Otimizado com Turbopack e Next.js 16
- 🎭 **Animações**: Transições suaves com Motion (anteriormente Framer Motion)
- 📱 **Mobile First**: Totalmente responsivo para todos os dispositivos
- 🔍 **SEO Otimizado**: Meta tags e estrutura otimizada para motores de busca
- ♿ **Acessibilidade**: Desenvolvido seguindo padrões de acessibilidade
- 🧪 **Testado**: Cobertura de testes com Vitest e Testing Library
- 📝 **Blog**: Sistema de blog com suporte a MDX e GitHub Flavored Markdown
- 🎯 **Biome**: Linter e formatter moderno e extremamente rápido

## 🛠️ Tecnologias

### Core

- **Next.js 16.0.10** - Framework React com App Router e Turbopack
- **React 19.2.3** - Biblioteca para interfaces de usuário
- **TypeScript 5.x** - Superset tipado do JavaScript
- **Tailwind CSS 4.x** - Framework CSS utilitário

### Bibliotecas

- **next-intl 4.6.1** - Internacionalização
- **Motion 12.23.26** - Animações e transições
- **Lucide React 0.561.0** - Ícones modernos
- **next-mdx-remote 5.0.0** - Renderização de MDX
- **remark-gfm 4.0.1** - Suporte a GitHub Flavored Markdown

### Ferramentas de Desenvolvimento

- **pnpm 10.x** - Package manager rápido e eficiente
- **Biome 2.3.10** - Linter e formatter moderno e rápido
- **Vitest 4.0.16** - Framework de testes
- **Testing Library** - Testes de componentes React

## 🚀 Começando

### Pré-requisitos

- **Node.js** 20.9.0 ou superior (requerido pelo Next.js 16)
- **pnpm** 10.x ou superior (recomendado)

### Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/RanielliMontagna/ranimontagna.com.git
   cd ranimontagna.com
   ```

2. **Instale as dependências**

   ```bash
   pnpm install
   ```

3. **Execute o servidor de desenvolvimento**

   ```bash
   pnpm dev
   ```

4. **Abra no navegador**

   Acesse [http://localhost:3000](http://localhost:3000) para ver o resultado.

### Scripts Disponíveis

```bash
# Desenvolvimento com Turbopack
pnpm dev

# Build para produção
pnpm build

# Executar versão de produção
pnpm start

# Linting com Biome
pnpm lint

# Formatação de código com Biome
pnpm format

# Lint e format ao mesmo tempo (recomendado)
pnpm check

# Executar testes
pnpm test

# Testes com cobertura
pnpm test:coverage

# Lighthouse CI (performance)
pnpm lighthouse:local
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── [locale]/          # Rotas internacionalizadas
│   │   ├── blog/         # Sistema de blog
│   │   │   └── [slug]/   # Páginas de posts
│   │   └── page.tsx      # Página inicial
│   └── sitemap.ts        # Sitemap XML
├── components/            # Componentes reutilizáveis
│   ├── animations/        # Componentes de animação
│   ├── blog/             # Componentes do blog
│   ├── footer/           # Footer do site
│   ├── header/           # Header com navegação
│   ├── ui/               # Componentes de UI
│   └── languageSwitcher/ # Seletor de idioma
├── containers/           # Containers de páginas
│   └── home/            # Container da página inicial
│       └── sections/    # Seções da home
├── contexts/            # Context providers
├── i18n/               # Configuração de internacionalização
├── lib/                # Utilities e helpers
│   ├── blog.ts        # Funções para gerenciar blog
│   └── seo.ts         # Utilities de SEO
└── tests/             # Configuração de testes

messages/              # Traduções
├── en.json           # Inglês
├── es.json           # Espanhol
└── pt.json           # Português

public/               # Arquivos estáticos
├── cv/              # Currículos em PDF
├── companies/       # Logos das empresas
└── logo/           # Logo do site
```

## 🌍 Internacionalização

O site suporta três idiomas:

- 🇧🇷 **Português (BR)** - Idioma padrão
- 🇺🇸 **Inglês (US)**
- 🇪🇸 **Espanhol (ES)**

As traduções estão localizadas na pasta `messages/` e são gerenciadas pelo `next-intl`.

## 🎨 Seções do Site

### Portfólio
- **Hero**: Apresentação inicial com call-to-actions
- **Sobre**: Informações pessoais e profissionais
- **Experiência**: Histórico profissional e habilidades
- **Projetos**: Showcase dos principais projetos
- **Contato**: Formulário e informações de contato

### Blog
- **Sistema de Blog**: Posts em MDX com suporte a múltiplos idiomas
- **GitHub Flavored Markdown**: Autolinks, tabelas, task lists e mais
- **Navegação entre posts**: Links para posts anteriores e seguintes
- **Reading progress**: Barra de progresso de leitura
- **SEO otimizado**: Meta tags, JSON-LD e sitemap automático

## 🧪 Testes

O projeto utiliza Vitest para testes unitários e de componentes:

```bash
# Executar todos os testes
pnpm test

# Executar testes com cobertura
pnpm test:coverage

# Executar testes em modo watch (durante desenvolvimento)
vitest
```

## 📄 Licença

Este projeto é destinado ao portfólio pessoal de Ranielli Montagna.

Desenvolvido com ❤️ por [Ranielli Montagna](https://github.com/RanielliMontagna)
