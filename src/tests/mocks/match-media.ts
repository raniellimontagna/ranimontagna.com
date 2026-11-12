/**
 * The global matchMedia mock answers `true` to every query, including
 * prefers-reduced-motion. Motion tests call this to state each query explicitly;
 * queries not listed answer false.
 */
export function mockMatchMedia(matches: Record<string, boolean>): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matches[query] ?? false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
