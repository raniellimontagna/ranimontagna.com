# Coding Standards & Guidelines

To maintain consistency and code quality, please adhere to these standards.

## Naming Conventions

- **Files & Folders**: Use `kebab-case.ts` (e.g., `project-card.tsx`, `use-theme.ts`).
  - *Exception*: Special Next.js files like `page.tsx`, `layout.tsx`.
- **Components**: Use `PascalCase` for component names (e.g., `ProjectCard`).
- **Functions & Variables**: Use `camelCase` (e.g., `getFeaturedRepositories`, `isValid`).
- **Constants**: Use `UPPER_SNAKE_CASE` for global constants (e.g., `BASE_URL`).
- **Types & Interfaces**: Use `PascalCase` (e.g., `ProjectProps`, `GitHubStats`).

## React & Components

- **Functional Components**: Use function declarations or arrow functions.
- **Props**: Define props interfaces explicitly. Avoid `any`.
- **Hooks**: Custom hooks should start with `use`.
- **Composition**: Prefer composition over heavy inheritance or monolithic components. Break down UI into smaller, reusable parts.

### Example
```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

## Styling

- **Framework**: We use **Tailwind CSS**.
- **Utility First**: Use utility classes directly in JSX.
- **`cn` Utility**: Use the `cn` helper (merges `clsx` and `tailwind-merge`) for conditional naming.

```tsx
<div className={cn('bg-white p-4', isHighlighted && 'border-blue-500')}>
```

## State Management

1. **Local State**: Use `useState` for component-level state.
2. **Server State**: Use Server Components for fetching data where possible.
3. **Global State**: Use **Zustand** for complex global client state (e.g., Theme, Command Menu).

## TypeScript

- **Strict Mode**: Enabled. No implicit `any`.
- **Types vs Interfaces**: Use `interface` for object definitions that might be extended, `type` for unions/intersections or aliases.
- **Enums**: Avoid Enums. Use string unions (`type Status = 'loading' | 'success'`).

## Linting & Formatting

- The project typically uses Prettier/ESLint. Ensure your editor is configured to format on save.
