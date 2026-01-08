# 🧪 TESTING.md - Unit Testing Plan

## Configuration

The project uses **Vitest** for unit testing with the following features:

- ✅ **Globals enabled** - `describe`, `it`, `expect` available without imports
- ✅ **jsdom** - DOM simulation for component testing
- ✅ **@testing-library/react** - Utilities for testing React components
- ✅ **@vitest/coverage-v8** - Code coverage with V8

### Available Scripts

```bash
# Run all tests
pnpm test

# Run in watch mode (development)
pnpm test:watch

# Run with coverage report
pnpm test:coverage
```

---

## 📊 Coverage Progress

| Date | Coverage | Tests | Files Tested |
|------|----------|-------|--------------|
| 2026-01-08 | **11.64%** | 86 passing | 9 test files |

### Coverage by Module

| Module | Coverage | Status |
|--------|----------|--------|
| `src/lib/utils.ts` | 100% | ✅ |
| `src/lib/constants.ts` | 100% | ✅ |
| `src/lib/seo.ts` | 100% | ✅ |
| `src/lib/jsonld.ts` | 100% | ✅ |
| `src/i18n/routing.ts` | 100% | ✅ |
| `src/constants/socialLinks.tsx` | 87.5% | ✅ |
| `src/store/useCommandMenu` | 100% | ✅ |
| `src/store/useTheme` | 100% | ✅ |
| `src/services/formly-email-service.ts` | 43.47% | ✅ |

---

## 📁 File Structure

Tests are organized in `__tests__` folders next to the source files:

```
src/
├── tests/                              # Global test setup
│   ├── setup.ts                        # Global setup (mocks, jest-dom)
│   ├── test-utils.tsx                  # Custom render with providers
│   ├── vitest.d.ts                     # Vitest type references
│   └── mocks/
│       └── index.ts                    # Reusable mocks
├── lib/
│   ├── __tests__/                      # ✅ Tests organized in folder
│   │   ├── utils.test.ts
│   │   ├── constants.test.ts
│   │   ├── seo.test.ts
│   │   └── jsonld.test.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── ...
├── i18n/
│   ├── __tests__/
│   │   └── routing.test.ts             # ✅ Complete
│   └── routing.ts
├── store/
│   ├── useCommandMenu/
│   │   ├── __tests__/
│   │   │   └── useCommandMenu.test.ts  # ✅ Complete
│   │   └── useCommandMenu.ts
│   └── useTheme/
│       ├── __tests__/
│       │   └── useTheme.test.ts        # ✅ Complete
│       └── useTheme.ts
├── constants/
│   ├── __tests__/
│   │   └── socialLinks.test.ts         # ✅ Complete
│   └── socialLinks.tsx
└── services/
    ├── __tests__/
    │   └── formly-email-service.test.ts # ✅ Complete
    └── formly-email-service.ts
```

**Legend:** ✅ Complete | 🔄 In progress | ⬜ Pending

---

## 🎯 Coverage Goals

- **Phase 1 (Setup)**: 0% ✅
- **Phase 2 (Utils)**: ~15-20% ✅ Achieved 11.64%
- **Phase 3 (Stores)**: ~25-30% ✅ Included in Phase 2
- **Phase 4 (Services)**: ~35-40% ✅ Included in Phase 2
- **Final Goal**: 50%+

---

## 📋 Principles

1. **Globals enabled** - No imports for `describe`, `it`, `expect`
2. **Reusable mocks** - Centralized in `src/tests/mocks/`
3. **No overmocking** - Only mock necessary external dependencies
4. **Simple tests first** - Start with pure functions without side effects
5. **Zero duplication** - Each scenario tested only once
6. **Tests in `__tests__` folders** - Tests live next to source files

---

## 🔧 Available Mocks

### localStorage
```typescript
import { createLocalStorageMock } from '@/tests/mocks'

const localStorageMock = createLocalStorageMock()
// localStorage.getItem, setItem, removeItem, clear are mocked
```

### matchMedia
```typescript
import { createMatchMediaMock } from '@/tests/mocks'

window.matchMedia = createMatchMediaMock(true) // matches: true
```

### ResizeObserver / IntersectionObserver
Automatically configured in `setup.ts`.

---

## 🚀 Test Utils

### Custom Render
```typescript
import { render, screen } from '@/tests/test-utils'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### Reset Zustand Store
```typescript
import { resetZustandStore } from '@/tests/test-utils'
import { useMyStore } from '@/store/useMyStore'

beforeEach(() => {
  resetZustandStore(useMyStore, { value: 'initial' })
})
```

### Mock Fetch
```typescript
import { createFetchMock } from '@/tests/test-utils'

beforeEach(() => {
  global.fetch = createFetchMock({ success: true })
})
```

---

## 🚧 Next Steps (to increase coverage)

To increase coverage beyond the current 11.64%, consider testing:

1. **Components** - Start with simple, stateless UI components
2. **`src/lib/blog.ts`** - Mock Octokit for blog fetching
3. **`src/lib/github.ts`** - Mock GitHub API calls
4. **Container components** - Test business logic in containers

> **Note**: Components with heavy UI dependencies (framer-motion, icons) may require additional mocks.
