# Folder Structure Guide

This guide details the organization of the codebase and where to place new files.

## Root Directory

| Folder | Description |
|--------|-------------|
| `src/` | Source code for the application. |
| `public/` | Static assets served directly (images, fonts, favicon). |
| `messages/` | Translation JSON files for i18n (`en.json`, `pt.json`, etc.). |
| `docs/` | Project documentation. |

## Source Directory (`src/`)

### `src/app/`
Contains the Next.js App Router file-system based routing.
- `[locale]/`: Dynamic segment for internationalization.
- `layout.tsx`: Root layout.
- `page.tsx`: Home page entry point.

### `src/features/`
Contains business logic and localized components.

#### Structure of a Feature (e.g., `src/features/blog/`)
```
blog/
├── components/       # UI components specific to this feature
│   ├── post-card.tsx
│   └── ...
├── lib/              # Logic/Utils specific to this feature (e.g., API calls)
│   └── blog.ts
├── types/            # TypeScript definitions specific to this feature
├── data/             # Static data specific to this feature
└── index.ts          # Public API (barrel file)
```

### `src/shared/`
Code shared across the application.

- **`components/`**:
  - `ui/`: Generic UI elements (Button, Input, Card).
  - `layout/`: Global layout components (Header, Footer).
  - `animations/`: Reusable animations (FadeIn).
- **`lib/`**:
  - `utils.ts`: Helper functions (e.g., `cn`).
  - `constants.ts`: Global constants.
  - `seo.ts`: SEO helpers.
- **`config/`**:
  - `i18n/`: Internationalization configuration (`routing.ts`, `request.ts`).
- **`store/`**: Global state management (Zustand stores).
- **`services/`**: Shared services (e.g., external API integrations).

## Component Folder Pattern

We prefer a **folder-per-component** pattern for complex components or when a component has related files (styles, tests, sub-components). However, for simple components, a single file is acceptable, though placing it in a folder is the *user preference* for this project.

**Preferred:**
```
components/
└── my-component/
    └── my-component.tsx
```

**Testing:**
Tests should be placed in a `__tests__` folder alongside the code they test.

```
my-feature/
├── components/
│   ├── my-component.tsx
│   └── __tests__/
│       └── my-component.test.tsx
```
