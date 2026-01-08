# Testing Guide

This project follows a strict testing strategy to ensure reliability and maintainability.

## Technology Stack

- **Runner**: [Vitest](https://vitest.dev/)
- **Environment**: jsdom
- **React Testing**: @testing-library/react
- **Coverage**: V8

## Coverage Status (Updated: 2026-01-08)

| Category | Coverage | Status |
|----------|----------|--------|
| **Total** | **~70-75%** | 📈 Increasing |
| **Shared Utils** | ~90% | ✅ Excellent |
| **Shared UI Components** | > 95% | ✅ Excellent |
| **Shared Layout (Header/Footer)** | > 80% | ✅ Excellent |
| **I18n** | 100% | ✅ Excellent |
| **Features: Home** | > 90% | ✅ Excellent |
| **Features: Blog** | > 90% | ✅ Excellent |
| **Features: Projects** | > 80% | ✅ Excellent |

## Key Principles

1. **Globals Enabled**: `describe`, `it`, `expect` are available globally.
2. **Co-location**: Tests live in `__tests__` folders next to the source files within component folders (e.g., `button/__tests__/button.test.tsx`).
3. **No Overmocking**: Mock only external boundaries (API calls, browser APIs).
4. **Behavior Driven**: Test user interactions and outcomes, not implementation details.

## Directory Structure for Tests

```
src/
├── features/
│   └── feature-name/
│       └── components/
│           ├── my-component/
│           │   ├── my-component.tsx
│           │   └── __tests__/
│           │       └── my-component.test.tsx
├── shared/
│   └── components/
│       └── ui/
│           └── button/
│               ├── button.tsx
│               └── __tests__/
│                   └── button.test.tsx
└── tests/                  # Global setup
    ├── setup.ts            # Global mocks (Next.js, browser APIs)
    ├── test-utils.tsx      # Custom render wrapper
    └── mocks/              # Reusable mock factories
```

## How to Write Tests

### 1. Component Tests
Use the custom `render` from `@/tests/test-utils` which includes necessary providers (Intl, Theme, etc.).

```tsx
import { render, screen } from '@/tests/test-utils'
import { MyComponent } from '../my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### 2. Hook/Store Tests
Test Zustand stores or custom hooks in isolation.

```tsx
import { renderHook, act } from '@testing-library/react'
import { useMyStore } from '../useMyStore'

it('toggles value', () => {
  const { result } = renderHook(() => useMyStore())
  
  act(() => {
    result.current.toggle()
  })
  
  expect(result.current.isOpen).toBe(true)
})
```

## Running Tests

```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:coverage # Generate coverage report
```
