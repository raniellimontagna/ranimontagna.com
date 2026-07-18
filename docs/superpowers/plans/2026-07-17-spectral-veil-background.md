# Spectral Veil Global Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every square-grid decoration with one theme-aware, progressively enhanced Spectral Veil background that is animated on capable devices and safely static everywhere else.

**Architecture:** A server-renderable CSS fallback and one fixed client orchestrator mount in the locale layout. The orchestrator selects static, mobile, or desktop mode before dynamically importing one React Three Fiber canvas; a browser adapter supplies theme, visibility, pointer, and active-section data to a single shader plane without remounting it.

**Tech Stack:** Next.js 16.2, React 19.2, TypeScript 6, CSS/Tailwind CSS 4, Three.js 0.185, React Three Fiber 9.6, Vitest 4, Testing Library, Biome.

## Global Constraints

- Preserve the approved design in `docs/superpowers/specs/2026-07-17-spectral-veil-background-design.md`.
- Use exactly one fixed canvas for the whole locale tree; never create a canvas per section or route.
- Keep `SpectralFallback` rendered beneath the canvas at all times.
- Derive colors from `--accent` and `--accent-ice`; support default, ocean, rose, emerald, amber, violet, mono, sunset, and cherry themes in light and dark mode.
- Do not initialize WebGL when `prefers-reduced-motion: reduce` is active.
- Desktop: damped pointer response, DPR at most `1.5`, cadence at most `45 FPS`.
- Mobile or coarse pointer: no touch tracking, DPR `1`, simplified shader, cadence at most `30 FPS`.
- Pause rendering while `document.visibilityState !== "visible"` and resume without advancing hidden time.
- The decorative layer must use `aria-hidden="true"`, `pointer-events: none`, and remain outside document flow.
- Permit one WebGL context-restoration attempt per mount; any subsequent loss leaves only the fallback.
- Remove every `atmospheric-grid` reference and the reusable CSS class, while preserving card-local lighting and semantic indicators.
- Do not add a rendering or animation dependency; Three.js and React Three Fiber are already installed.
- Preserve unrelated working-tree changes, especially the in-progress chatbot files and user-owned untracked documents.

---

## File Responsibility Map

### New files

| File | Responsibility |
| --- | --- |
| `src/shared/components/spectral-background/spectral-background.types.ts` | Shared mode, zone, palette, pointer, and canvas-prop contracts. |
| `src/shared/components/spectral-background/spectral-background.utils.ts` | Pure capability, color parsing, palette, and visible-zone selection logic. |
| `src/shared/components/spectral-background/use-spectral-environment.ts` | DOM observers and browser events converted into stable shader inputs. |
| `src/shared/components/spectral-background/spectral-fallback.tsx` | Always-present, SSR-safe decorative CSS layer. |
| `src/shared/components/spectral-background/spectral-background.tsx` | Public progressive-enhancement orchestrator and dynamic import boundary. |
| `src/shared/components/spectral-background/spectral-veil.shaders.ts` | Complete vertex and fragment shader sources. |
| `src/shared/components/spectral-background/spectral-veil-scene.tsx` | One plane/material and damped uniform updates. |
| `src/shared/components/spectral-background/spectral-render-scheduler.tsx` | Explicit 45/30 FPS invalidation loop that pauses when hidden. |
| `src/shared/components/spectral-background/spectral-veil-canvas.tsx` | R3F canvas, DPR policy, error boundary, disposal, and bounded context restoration. |
| `src/shared/components/spectral-background/__tests__/*.test.ts(x)` | GPU-independent behavior tests at utility and component boundaries. |

### Existing files

| File | Change |
| --- | --- |
| `src/app/[locale]/layout.tsx` | Mount one `SpectralBackground` before locale content. |
| `src/app/[locale]/__tests__/layout.spectral-background.test.tsx` | Prove the locale layout owns exactly one global background mount. |
| `src/app/[locale]/globals.css` | Add fallback/canvas styling and delete `.atmospheric-grid`. |
| `src/features/home/components/{hero,about,experience,services,projects,contact}/*.tsx` | Add section zones and remove global grid/duplicate broad glows. |
| `src/features/home/components/hero/hero-visual.tsx` | Remove the panel grid only; preserve portrait/card lighting. |
| `src/app/[locale]/{projects,blog}/page.tsx` | Add route zones and remove grid overlays. |
| `src/app/[locale]/blog/[slug]/page.tsx` | Add quiet route zone and remove grid overlay. |
| `src/shared/components/ui/error-view.tsx` | Add quiet zone and remove grid overlay. |
| Existing section/page tests | Assert the correct `data-spectral-zone` and absence of grid classes. |

---

### Task 1: Runtime contracts and deterministic selection logic

**Files:**
- Create: `src/shared/components/spectral-background/spectral-background.types.ts`
- Create: `src/shared/components/spectral-background/spectral-background.utils.ts`
- Test: `src/shared/components/spectral-background/__tests__/spectral-background.utils.test.ts`

**Interfaces:**
- Consumes: CSS custom properties `--accent` and `--accent-ice` from `Document.documentElement`.
- Produces: `SpectralMode`, `SpectralZone`, `SpectralPalette`, `SpectralPoint`, `SpectralEnvironment`, `SpectralVeilCanvasProps`, `resolveSpectralMode(input)`, `parseCssColor(value)`, `readSpectralPalette(root)`, `selectSpectralZone(candidates)`, and `supportsWebGl(document)`.

- [ ] **Step 1: Write the failing utility tests**

Create `spectral-background.utils.test.ts` with table-driven cases proving: reduced motion always returns `static`; missing WebGL returns `static`; coarse pointer or width below `768` returns `mobile`; capable desktop returns `desktop`; `#rgb`, `#rrggbb`, space-separated `rgb()`, and comma-separated `rgb()` normalize to `[0, 1]`; invalid colors use the supplied fallback; highest intersection wins a zone and center distance breaks ties; an empty candidate list returns `quiet`.

```ts
import { describe, expect, it } from "vitest";
import {
  parseCssColor,
  resolveSpectralMode,
  selectSpectralZone,
} from "../spectral-background.utils";

describe("resolveSpectralMode", () => {
  it.each([
    [{ reducedMotion: true, webgl: true, coarsePointer: false, width: 1440 }, "static"],
    [{ reducedMotion: false, webgl: false, coarsePointer: false, width: 1440 }, "static"],
    [{ reducedMotion: false, webgl: true, coarsePointer: true, width: 1440 }, "mobile"],
    [{ reducedMotion: false, webgl: true, coarsePointer: false, width: 767 }, "mobile"],
    [{ reducedMotion: false, webgl: true, coarsePointer: false, width: 1440 }, "desktop"],
  ] as const)("maps %o to %s", (input, expected) => {
    expect(resolveSpectralMode(input)).toBe(expected);
  });
});

describe("parseCssColor", () => {
  it("normalizes supported CSS colors and rejects invalid input", () => {
    expect(parseCssColor("#0f8")).toEqual([0, 1, 136 / 255]);
    expect(parseCssColor("#336699")).toEqual([0.2, 0.4, 0.6]);
    expect(parseCssColor("rgb(51 102 153)")).toEqual([0.2, 0.4, 0.6]);
    expect(parseCssColor("rgb(51, 102, 153)")).toEqual([0.2, 0.4, 0.6]);
    expect(parseCssColor("not-a-color")).toBeNull();
  });
});

describe("selectSpectralZone", () => {
  it("uses visible area first and viewport-center distance second", () => {
    expect(selectSpectralZone([])).toBe("quiet");
    expect(selectSpectralZone([
      { zone: "hero", intersectionRatio: 0.5, centerDistance: 300 },
      { zone: "balanced", intersectionRatio: 0.7, centerDistance: 500 },
    ])).toBe("balanced");
    expect(selectSpectralZone([
      { zone: "hero", intersectionRatio: 0.7, centerDistance: 300 },
      { zone: "focus", intersectionRatio: 0.7, centerDistance: 100 },
    ])).toBe("focus");
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the red state**

Run: `pnpm test -- src/shared/components/spectral-background/__tests__/spectral-background.utils.test.ts`

Expected: FAIL because `../spectral-background.utils` does not exist.

- [ ] **Step 3: Implement the contracts and pure utilities**

Use these exact public contracts:

```ts
import type { MutableRefObject } from "react";

export type SpectralMode = "static" | "mobile" | "desktop";
export type SpectralZone = "hero" | "balanced" | "quiet" | "focus";
export type SpectralRgb = readonly [number, number, number];
export type SpectralPoint = { x: number; y: number };
export type SpectralPalette = {
  accent: SpectralRgb;
  ice: SpectralRgb;
  dark: boolean;
};
export type SpectralEnvironment = {
  zone: SpectralZone;
  palette: SpectralPalette;
  visible: boolean;
  pointerTarget: MutableRefObject<SpectralPoint>;
};
export type SpectralVeilCanvasProps = {
  mode: Exclude<SpectralMode, "static">;
  onPermanentFailure: () => void;
};
export type ZoneCandidate = {
  zone: SpectralZone;
  intersectionRatio: number;
  centerDistance: number;
};
export const SPECTRAL_ZONE_SETTINGS = {
  hero: { intensity: 0.8, motionScale: 1 },
  balanced: { intensity: 0.32, motionScale: 0.72 },
  quiet: { intensity: 0.16, motionScale: 0.5 },
  focus: { intensity: 0.5, motionScale: 0.82 },
} as const satisfies Record<SpectralZone, { intensity: number; motionScale: number }>;
```

Implement `resolveSpectralMode` with the precedence tested above. Implement `parseCssColor` without creating a canvas: expand three-digit hex, parse six-digit hex, and split `rgb()` contents on `/[\s,]+/`. Clamp each channel to `0..255`, then divide by `255`. `readSpectralPalette` must use `getComputedStyle(root)`, fall back to `#7c5cff` and `#c6f6ff`, and set `dark` from `root.classList.contains("dark")`. `selectSpectralZone` must sort a copied candidate list by descending ratio and ascending distance. `supportsWebGl` must create a temporary canvas and return whether `webgl2` or `webgl` context exists inside `try/catch`.

- [ ] **Step 4: Run the utility test and typecheck**

Run: `pnpm test -- src/shared/components/spectral-background/__tests__/spectral-background.utils.test.ts && pnpm typecheck`

Expected: all utility tests PASS and TypeScript exits `0`.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/shared/components/spectral-background/spectral-background.types.ts src/shared/components/spectral-background/spectral-background.utils.ts src/shared/components/spectral-background/__tests__/spectral-background.utils.test.ts
git commit -m "feat(background): add spectral runtime contracts"
```

### Task 2: Browser environment adapter

**Files:**
- Create: `src/shared/components/spectral-background/use-spectral-environment.ts`
- Test: `src/shared/components/spectral-background/__tests__/use-spectral-environment.test.tsx`

**Interfaces:**
- Consumes: `SpectralEnvironment`, `SpectralMode`, `SpectralZone`, `readSpectralPalette()`, and `selectSpectralZone()` from Task 1.
- Produces: `useSpectralEnvironment(mode: Exclude<SpectralMode, "static">): SpectralEnvironment`.

- [ ] **Step 1: Write failing hook tests**

Build deterministic `MutationObserver` and `IntersectionObserver` fakes in the test file. Render a probe component that serializes `zone`, `palette`, `visible`, and `pointerTarget.current`. Assert all of these behaviors: default zone is `quiet`; the most-visible marker becomes active; a root theme mutation changes palette without remounting the probe; `visibilitychange` updates `visible`; desktop `pointermove` maps the viewport to `[-1, 1]`; mobile mode never registers `pointermove`; unmount disconnects both observers and removes listeners.

```tsx
function Probe({ mode }: { mode: "desktop" | "mobile" }) {
  const environment = useSpectralEnvironment(mode);
  return (
    <output data-testid="environment">
      {JSON.stringify({
        zone: environment.zone,
        palette: environment.palette,
        visible: environment.visible,
        pointer: environment.pointerTarget.current,
      })}
    </output>
  );
}
```

- [ ] **Step 2: Confirm the hook test fails**

Run: `pnpm test -- src/shared/components/spectral-background/__tests__/use-spectral-environment.test.tsx`

Expected: FAIL because `use-spectral-environment.ts` does not exist.

- [ ] **Step 3: Implement one-registration browser adapters**

The hook must initialize `pointerTarget` with `{ x: 0, y: 0 }`, initialize `zone` to `quiet`, initialize visibility from `document.visibilityState`, and read the palette lazily. In one effect:

```ts
const pointerTarget = useRef<SpectralPoint>({ x: 0, y: 0 });

useEffect(() => {
  const updatePalette = () => setPalette(readSpectralPalette());
  const updateVisibility = () => setVisible(document.visibilityState === "visible");
  const updatePointer = (event: PointerEvent) => {
    pointerTarget.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerTarget.current.y = 1 - (event.clientY / window.innerHeight) * 2;
  };
  const mutationObserver = new MutationObserver(updatePalette);
  mutationObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-color-theme", "style"],
  });
  document.addEventListener("visibilitychange", updateVisibility);
  if (mode === "desktop") window.addEventListener("pointermove", updatePointer, { passive: true });
  return () => {
    mutationObserver.disconnect();
    document.removeEventListener("visibilitychange", updateVisibility);
    window.removeEventListener("pointermove", updatePointer);
  };
}, [mode]);
```

In a second effect, observe `[data-spectral-zone]` when `IntersectionObserver` exists. Convert each entry into `{ zone, intersectionRatio, centerDistance }`, retain the latest state for all observed elements in a `Map`, and call `selectSpectralZone`. Ignore invalid marker values and disconnect on cleanup. If the API is absent, retain `quiet`.

- [ ] **Step 4: Verify hook behavior and cleanup**

Run: `pnpm test -- src/shared/components/spectral-background/__tests__/use-spectral-environment.test.tsx && pnpm typecheck`

Expected: hook tests PASS with no listener, observer, or type errors.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/shared/components/spectral-background/use-spectral-environment.ts src/shared/components/spectral-background/__tests__/use-spectral-environment.test.tsx
git commit -m "feat(background): observe spectral environment"
```

### Task 3: SSR fallback and progressive-enhancement orchestrator

**Files:**
- Create: `src/shared/components/spectral-background/spectral-fallback.tsx`
- Create: `src/shared/components/spectral-background/spectral-background.tsx`
- Test: `src/shared/components/spectral-background/__tests__/spectral-background.test.tsx`
- Modify: `src/app/[locale]/globals.css`

**Interfaces:**
- Consumes: `resolveSpectralMode()`, `supportsWebGl()`, and `SpectralVeilCanvasProps` from Task 1.
- Produces: `SpectralFallback`, `SpectralBackground`, and injectable `SpectralCanvasLoader = () => Promise<{ SpectralVeilCanvas: ComponentType<SpectralVeilCanvasProps> }>`.

- [ ] **Step 1: Write failing orchestrator tests**

Mock `matchMedia`, WebGL support, viewport width, and an injectable loader. Assert that the fallback is present in every case; SSR/first render does not invoke the loader; reduced motion never invokes it; unsupported WebGL never invokes it; capable mobile and desktop invoke it once with the correct mode; rejected imports keep the fallback without retrying; `onPermanentFailure` removes the canvas while retaining the fallback.

```tsx
const loader = vi.fn(async () => ({
  SpectralVeilCanvas: ({ mode }: SpectralVeilCanvasProps) => (
    <canvas data-testid="spectral-canvas" data-mode={mode} />
  ),
}));

render(<SpectralBackground canvasLoader={loader} />);
expect(screen.getByTestId("spectral-fallback")).toBeInTheDocument();
expect(loader).not.toHaveBeenCalled();
await waitFor(() => expect(loader).toHaveBeenCalledOnce());
```

- [ ] **Step 2: Confirm the orchestrator test fails**

Run: `pnpm test -- src/shared/components/spectral-background/__tests__/spectral-background.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement fallback markup and CSS**

Use this component markup:

```tsx
export function SpectralFallback() {
  return (
    <div aria-hidden="true" className="spectral-fallback" data-testid="spectral-fallback">
      <div className="spectral-fallback__veil" />
      <div className="spectral-fallback__grain" />
    </div>
  );
}
```

Add fixed, non-interactive CSS using `isolation: isolate`, `overflow: clip`, two oversized conic/radial gradients based on `--accent` and `--accent-ice`, `mix-blend-mode: screen` in dark mode, lower opacity plus `multiply` in light mode, and a tiny inline SVG noise data URI. Add `.spectral-canvas-shell` with identical fixed bounds and a `transition: opacity 300ms ease`. Under `@media (prefers-reduced-motion: reduce)`, disable all transitions. Both layers must use `z-index: -20` and body content must remain above them through the existing stacking context.

- [ ] **Step 4: Implement the orchestrator**

Mark the module `"use client"`. `SpectralBackground` accepts an optional `canvasLoader` defaulting to `() => import("./spectral-veil-canvas")`. Start with mode `static`, then in an effect subscribe to both `(prefers-reduced-motion: reduce)` and `(pointer: coarse)`, plus debounced resize through one `requestAnimationFrame`. Resolve mode from the current media states, width, and `supportsWebGl(document)`. Remove both media listeners, resize listener, and pending frame on cleanup. Only import for mobile/desktop. Store the imported component type, catch rejection once, and set a permanent-failure flag when the canvas callback fires.

```tsx
return (
  <div aria-hidden="true" className="spectral-background" data-testid="spectral-background">
    <SpectralFallback />
    {CanvasComponent && mode !== "static" && !permanentFailure ? (
      <CanvasComponent mode={mode} onPermanentFailure={() => setPermanentFailure(true)} />
    ) : null}
  </div>
);
```

- [ ] **Step 5: Verify progressive enhancement**

Run: `pnpm test -- src/shared/components/spectral-background/__tests__/spectral-background.test.tsx && pnpm typecheck && pnpm check src/shared/components/spectral-background 'src/app/[locale]/globals.css'`

Expected: component tests PASS; typecheck and Biome exit `0`.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/shared/components/spectral-background/spectral-fallback.tsx src/shared/components/spectral-background/spectral-background.tsx src/shared/components/spectral-background/__tests__/spectral-background.test.tsx 'src/app/[locale]/globals.css'
git commit -m "feat(background): add spectral progressive enhancement"
```

### Task 4: Shader scene, scheduler, and resilient canvas

**Files:**
- Create: `src/shared/components/spectral-background/spectral-veil.shaders.ts`
- Create: `src/shared/components/spectral-background/spectral-veil-scene.tsx`
- Create: `src/shared/components/spectral-background/spectral-render-scheduler.tsx`
- Create: `src/shared/components/spectral-background/spectral-veil-canvas.tsx`
- Test: `src/shared/components/spectral-background/__tests__/spectral-veil-runtime.test.tsx`

**Interfaces:**
- Consumes: `SpectralVeilCanvasProps`, `SPECTRAL_ZONE_SETTINGS`, and `useSpectralEnvironment(mode)`.
- Produces: named export `SpectralVeilCanvas`, `SpectralVeilScene`, `SpectralRenderScheduler`, `VERTEX_SHADER`, and `FRAGMENT_SHADER`.

- [ ] **Step 1: Write failing runtime-boundary tests**

Mock `@react-three/fiber` so `Canvas` returns a real `<canvas>` plus children, `useThree` returns a spy for `advance`, and `useFrame` captures its callback. Assert: desktop Canvas receives `dpr={[1, 1.5]}`; mobile receives `dpr={1}`; desktop scheduler advances at most 45 times per simulated second; mobile at most 30; hidden mode makes no calls; `webglcontextlost` calls `preventDefault`; the first `webglcontextrestored` remounts once; a second loss calls `onPermanentFailure`; unmount cancels the scheduled animation frame. Also assert shader strings contain `uTime`, `uPointer`, `uAccent`, `uIce`, `uIntensity`, `uMotionScale`, and `uDetail`.

- [ ] **Step 2: Confirm the runtime test fails**

Run: `pnpm test -- src/shared/components/spectral-background/__tests__/spectral-veil-runtime.test.tsx`

Expected: FAIL because the runtime modules do not exist.

- [ ] **Step 3: Implement the shader sources**

The vertex shader must pass UVs and render a full-screen plane. The fragment shader must implement value noise plus three-octave FBM, use `uDetail` to skip the third octave on mobile, warp two broad fields with time and damped pointer input, mix `uAccent`/`uIce`, preserve a calm center, apply edge softness and subtle hash grain, and output premultiplied-looking translucent color. Use fixed loop bounds so WebGL compilers can unroll safely; do not use texture assets or post-processing.

```glsl
for (int octave = 0; octave < 3; octave++) {
  if (float(octave) >= uDetail) break;
  value += amplitude * noise(position);
  position = position * 2.03 + vec2(17.1, 9.2);
  amplitude *= 0.5;
}
```

- [ ] **Step 4: Implement the scene without per-frame allocations**

Create uniforms once with `useMemo`: time, resolution, pointer `Vector2`, accent `Color`, ice `Color`, intensity, motion scale, detail, and dark-mode scalar. Create target colors once and update them in an effect when the palette changes. In `useFrame`, increment time only by the supplied visible-frame delta; exponentially damp pointer, colors, intensity, and motion scale using `1 - Math.exp(-delta * rate)`; update the existing objects in place. Render one `<mesh>` with `<planeGeometry args={[2, 2]} />` and `<shaderMaterial transparent depthWrite={false} ... />`. Dispose geometry and material on unmount through R3F ownership; do not construct Three objects inside `useFrame`.

- [ ] **Step 5: Implement the explicit scheduler**

Use `frameloop="never"` on Canvas. In `SpectralRenderScheduler`, get `advance` from `useThree`, keep `lastFrame` and `rafId` refs, use `1000 / 45` for desktop and `1000 / 30` for mobile, and request the next frame only while `visible`. Reset `lastFrame` when visibility resumes so hidden time is not accumulated. Cleanup with `cancelAnimationFrame`.

- [ ] **Step 6: Implement canvas lifecycle and bounded restoration**

Wrap the Canvas in a class error boundary whose `componentDidCatch` calls `onPermanentFailure`. Store the created DOM canvas from `onCreated(({ gl }) => gl.domElement)`. Register `webglcontextlost` and `webglcontextrestored`: loss calls `preventDefault`, hides the shell, and pauses the scheduler; the first restoration increments a React `generation` key and resumes; any later loss calls `onPermanentFailure`. Remove both listeners and call `gl.dispose()` during cleanup. Render opacity `0` while lost and `1` while healthy. Pass `gl={{ alpha: true, antialias: mode === "desktop", powerPreference: "low-power" }}`.

- [ ] **Step 7: Verify the GPU-independent runtime contract**

Run: `pnpm test -- src/shared/components/spectral-background/__tests__/spectral-veil-runtime.test.tsx && pnpm typecheck && pnpm check src/shared/components/spectral-background`

Expected: tests PASS without a real WebGL context; typecheck and Biome exit `0`.

- [ ] **Step 8: Commit Task 4**

```bash
git add src/shared/components/spectral-background/spectral-veil.shaders.ts src/shared/components/spectral-background/spectral-veil-scene.tsx src/shared/components/spectral-background/spectral-render-scheduler.tsx src/shared/components/spectral-background/spectral-veil-canvas.tsx src/shared/components/spectral-background/__tests__/spectral-veil-runtime.test.tsx
git commit -m "feat(background): render resilient spectral veil"
```

### Task 5: Global mounting, section zones, and grid removal

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/__tests__/layout.spectral-background.test.tsx`
- Modify: `src/app/[locale]/globals.css`
- Modify: `src/features/home/components/hero/hero.tsx`
- Modify: `src/features/home/components/hero/hero-visual.tsx`
- Modify: `src/features/home/components/about/about.tsx`
- Modify: `src/features/home/components/experience/experience.tsx`
- Modify: `src/features/home/components/services/services.tsx`
- Modify: `src/features/home/components/projects/projects.tsx`
- Modify: `src/features/home/components/contact/contact.tsx`
- Modify: `src/app/[locale]/projects/page.tsx`
- Modify: `src/app/[locale]/blog/page.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`
- Modify: `src/shared/components/ui/error-view.tsx`
- Modify: corresponding existing `*.test.tsx` files for these components/pages.

**Interfaces:**
- Consumes: `<SpectralBackground />` and zone values `hero | balanced | quiet | focus`.
- Produces: one global mount and DOM markers consumed by `useSpectralEnvironment`.

- [ ] **Step 1: Add failing integration assertions**

Update existing tests to assert these exact assignments:

```ts
expect(screen.getByTestId("hero")).toHaveAttribute("data-spectral-zone", "hero");
expect(screen.getByTestId("about")).toHaveAttribute("data-spectral-zone", "balanced");
expect(container.querySelector("#experience")).toHaveAttribute("data-spectral-zone", "balanced");
expect(container.querySelector("#services")).toHaveAttribute("data-spectral-zone", "balanced");
expect(container.querySelector("#projects")).toHaveAttribute("data-spectral-zone", "balanced");
expect(container.querySelector("#contact")).toHaveAttribute("data-spectral-zone", "focus");
expect(container.querySelector(".atmospheric-grid")).not.toBeInTheDocument();
```

Add route-level assertions that projects index is `balanced`, blog index/article are `quiet`, and `ErrorView` is `quiet`. Add a layout test with the background mocked to assert exactly one `spectral-background` mount.

- [ ] **Step 2: Confirm the integration assertions fail**

Run: `pnpm test -- src/features/home/components/hero/__tests__/hero.test.tsx src/features/home/components/about/__tests__/about.test.tsx src/features/home/components/experience/__tests__/experience.test.tsx src/features/home/components/services/__tests__/services.test.tsx src/features/home/components/projects/__tests__/projects.test.tsx src/features/home/components/contact/__tests__/contact.test.tsx src/features/projects/__tests__/projects-page.test.tsx src/features/blog/__tests__/blog-page.test.tsx src/shared/components/ui/__tests__/error-view.test.tsx 'src/app/[locale]/__tests__/layout.spectral-background.test.tsx'`

Expected: FAIL on missing `data-spectral-zone` and existing `.atmospheric-grid` nodes.

- [ ] **Step 3: Mount the global background exactly once**

In `src/app/[locale]/layout.tsx`, import `SpectralBackground` and render it as the first child of `<body>`, before `NextIntlClientProvider`. Do not mount it in the root layout, home page, or individual routes.

```tsx
<body>
  <SpectralBackground />
  <NextIntlClientProvider>{children}</NextIntlClientProvider>
</body>
```

- [ ] **Step 4: Apply section and route zones**

Set `data-spectral-zone="hero"` on the hero; `balanced` on about, experience, services, projects section, and projects index shell; `focus` on contact; `quiet` on blog index, article shell, and ErrorView main element. Keep every existing id and test id unchanged.

- [ ] **Step 5: Remove obsolete visual layers**

Delete every JSX node whose class includes `atmospheric-grid`, including the hero visual panel. Delete the `.atmospheric-grid` rule from globals. Remove only broad section-level blur or glow nodes that duplicate the veil; preserve card-local highlights, portrait lighting, terminal/status glows, and focus styles. Do not alter layout, content, typography, spacing, or interaction code.

- [ ] **Step 6: Prove the old grid is gone and integrations pass**

Run: `rg -n "atmospheric-grid" src`

Expected: no output and exit code `1`.

Run: `pnpm test -- src/features/home/components/hero/__tests__/hero.test.tsx src/features/home/components/about/__tests__/about.test.tsx src/features/home/components/experience/__tests__/experience.test.tsx src/features/home/components/services/__tests__/services.test.tsx src/features/home/components/projects/__tests__/projects.test.tsx src/features/home/components/contact/__tests__/contact.test.tsx src/features/projects/__tests__/projects-page.test.tsx src/features/blog/__tests__/blog-page.test.tsx src/shared/components/ui/__tests__/error-view.test.tsx 'src/app/[locale]/__tests__/layout.spectral-background.test.tsx' && pnpm typecheck && pnpm check`

Expected: all selected tests PASS; typecheck and Biome exit `0`.

- [ ] **Step 7: Commit Task 5**

Stage only the layout, global CSS, listed section/page files, and their tests. Inspect `git diff --cached --stat` before committing; no `src/app/api/chat/*`, `PRODUCT.md`, or 2026-07-12 planning documents may be staged.

```bash
git commit -m "feat(background): integrate spectral veil globally"
```

### Task 6: Full quality, resilience, and visual acceptance gate

**Files:**
- Modify only if a gate exposes a defect: files created or modified in Tasks 1–5.
- Do not modify: `src/app/api/chat/*`, `PRODUCT.md`, or unrelated planning documents.

**Interfaces:**
- Consumes: the completed global Spectral Veil system.
- Produces: verified production build and acceptance evidence for all modes/themes/zones.

- [ ] **Step 1: Run the complete automated gate**

Run: `pnpm test && pnpm check && pnpm typecheck && pnpm build`

Expected: Vitest reports all tests passing; Biome and TypeScript exit `0`; Next.js production build completes successfully.

- [ ] **Step 2: Run React-specific diagnostics**

Run: `npx --yes react-doctor@latest --verbose --scope changed`

Expected: no actionable error in changed Spectral Background components. Fix any correctness, effect-cleanup, or render-loop issue it identifies, then rerun Task 6 Steps 1 and 2.

- [ ] **Step 3: Inspect dynamic splitting and single-canvas behavior**

Start production locally with `pnpm start` after the build. Open `/en`, `/en/projects`, `/en/blog`, and one article through client navigation. In DevTools verify: initial HTML contains `spectral-fallback`; the canvas module loads after hydration/capability selection; `document.querySelectorAll("canvas").length` gains only the Spectral canvas relative to page-local canvases and does not increase after navigation; there is exactly one `[data-testid="spectral-background"]`.

- [ ] **Step 4: Verify the approved visual matrix**

At desktop `1440x900` and mobile `390x844`, inspect dark and light mode for default, ocean, rose, emerald, amber, violet, mono, sunset, and cherry. Visit hero, balanced, quiet, and focus zones. Confirm readable text, smooth zone interpolation, subtle desktop cursor inertia, autonomous-only mobile behavior, no square grids, no gradient banding, and no layout shift. Capture one desktop hero, one reading route, one focus section, and one mobile screenshot for review.

- [ ] **Step 5: Exercise accessibility and failure paths**

Enable reduced motion and reload: assert no canvas is created and fallback remains. Force `HTMLCanvasElement.prototype.getContext` to return `null`: assert fallback remains with no visitor-facing error. Dispatch `webglcontextlost`, then `webglcontextrestored`, then a second loss: assert one restoration only and permanent fallback afterward. Hide/show the tab while recording performance: assert animation frames stop while hidden and resume without a time jump. Keyboard-tab through navigation, controls, form, and footer to confirm the decorative layer never captures focus or pointer input.

- [ ] **Step 6: Review performance and cleanup**

In Performance/Rendering tools confirm desktop cadence does not exceed 45 FPS, mobile does not exceed 30 FPS, desktop device pixel ratio is capped at 1.5, mobile at 1, and there are no continuing animation frames or listeners after unmount. Confirm the scene has one plane/material and no shadows, post-processing, or per-frame object allocations.

- [ ] **Step 7: Commit only verified fixes, if any**

If verification required changes, stage only Spectral Veil files and commit:

```bash
git commit -m "fix(background): harden spectral veil runtime"
```

If no files changed, do not create an empty commit. Finish with `git status --short --branch` and report the exact remaining unrelated user changes separately.

---

## Definition of Done

- All nine acceptance criteria in the approved design spec are satisfied.
- `rg -n "atmospheric-grid" src` returns no matches.
- Reduced motion and every failure path retain a complete CSS fallback.
- Only one dynamically loaded canvas serves the entire locale tree.
- Desktop/mobile FPS, DPR, pointer, visibility, and cleanup contracts are verified.
- Dark/light plus all nine color themes have been visually reviewed.
- `pnpm test`, `pnpm check`, `pnpm typecheck`, and `pnpm build` pass.
- Unrelated working-tree changes remain untouched and unstaged.
