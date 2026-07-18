# Spectral Veil Global Background Design

**Date:** 2026-07-17  
**Status:** Approved for implementation planning

## Context

The portfolio currently uses the reusable `atmospheric-grid` background across the hero, home
sections, projects and blog pages, and error states. The square grid is visually familiar and no
longer gives the site a distinctive signature. The replacement must feel precise, technical, and
human without becoming a generic AI particle field, a hacker aesthetic, or an experiment that
competes with the content.

The approved direction is **Spectral Veil**: an organic, liquid membrane of light that moves slowly
behind the site. It is cinematic in the hero, restrained in reading-heavy sections, responsive to
the existing color themes, and simplified on mobile.

## Goals

- Replace every decorative square-grid background with one coherent visual system.
- Give the portfolio a recognizable animated signature based on flowing light and energy.
- Use one global WebGL surface rather than one animation instance per section.
- Adapt automatically to light/dark mode and every existing color theme.
- Combine autonomous motion with a subtle, damped cursor response on capable desktop devices.
- Preserve readability, input behavior, accessibility, initial rendering, and battery life.
- Fail safely to an attractive static composition whenever animation is inappropriate or
  unavailable.

## Non-goals

- Redesigning the page layouts, cards, typography, navigation, or content.
- Adding particles, node graphs, grids, matrix rain, or terminal-themed decoration.
- Making the background communicate application state or other semantic information.
- Tracking touch input on mobile.
- Requiring WebGL for the site to remain visually complete and usable.

## Approved Visual Direction

The veil is a broad translucent form created from two theme-derived hues. It should resemble a
digital aurora or a membrane folding through space, not a collection of independent blobs. Its
edges remain soft, the center retains large areas of calm, and a subtle grain prevents the gradient
from looking synthetic or banded.

The motion has two layers:

1. A slow autonomous deformation that makes the surface appear alive.
2. A low-amplitude cursor force that bends the field with inertia rather than following the pointer
   directly.

The hero receives the clearest silhouette and strongest color separation. Content sections use a
lower-opacity, larger-scale version that reads as atmosphere. The mobile version preserves the same
shape language with fewer calculations and no touch response. With reduced motion enabled, the
first composed frame remains static.

## Architecture

### Global mounting

A single client-side `SpectralBackground` mounts in the locale layout behind all page content. It
owns a fixed, viewport-sized decorative layer with `pointer-events: none` and `aria-hidden="true"`.
The canvas never participates in document flow, so mounting, resizing, and route transitions cannot
cause layout shift.

The server-rendered output always includes `SpectralFallback`. The WebGL implementation loads
progressively after hydration and replaces only the animated portion; the fallback remains beneath
it so a transparent frame, import failure, or context loss cannot expose an empty background.

### Components

#### `SpectralBackground`

The public orchestrator. It determines capability and motion mode, renders the fallback, lazily loads
the canvas, and owns cleanup. Consumers do not pass colors, viewport information, or animation
state.

#### `SpectralVeilCanvas`

The dynamically imported React Three Fiber boundary. It creates one full-screen plane, caps device
pixel ratio, controls the render cadence, and handles WebGL context lifecycle. It does not inspect
the DOM or know about portfolio sections.

#### `SpectralVeilScene`

The shader-focused unit. It receives normalized uniforms and renders the plane. Shader source and
uniform defaults live beside this component so the visual algorithm can be tested and tuned without
changing layout integration.

#### `useSpectralEnvironment`

The browser adapter. It converts theme colors, viewport size, pointer position, document visibility,
active section zone, and elapsed time into damped values for the canvas. Event listeners,
`MutationObserver`, and `IntersectionObserver` are registered once and removed on unmount.

#### `SpectralFallback`

A CSS-only fixed layer built from theme variables, large radial/conic gradients, and subtle grain.
It is the initial SSR presentation and the permanent presentation for reduced motion, unsupported
WebGL, failed imports, and low-capability modes.

### Section zones

Sections and page shells may declare `data-spectral-zone` without importing animation code. The
environment adapter observes these markers and chooses the most visible zone. Transitions between
zone values are interpolated rather than switched instantly.

| Zone | Intended use | Intensity | Motion scale |
| --- | --- | ---: | ---: |
| `hero` | Homepage hero | High but content-safe | Full |
| `balanced` | About, experience, services, projects | Low | Broad and slow |
| `quiet` | Blog articles and dense reading | Minimal | Nearly static |
| `focus` | Contact and final calls to action | Medium | Slow convergence |

Pages without a marker use `quiet`. Multiple visible markers are resolved by visible area, with the
marker nearest the viewport center breaking ties.

## Data Flow

1. SSR outputs the theme-aware fallback and normal page content.
2. On hydration, `SpectralBackground` checks reduced motion, viewport class, WebGL support, and
   document visibility.
3. Capable devices dynamically import the canvas implementation.
4. `useSpectralEnvironment` reads `--accent` and `--accent-ice` from the root element and converts
   them into shader colors.
5. Theme class or `data-color-theme` mutations update color targets without remounting the canvas.
6. Pointer, scroll-zone, and time inputs are damped and sent to the shader as normalized uniforms.
7. Visibility, motion preference, context, or capability changes pause the loop or leave the CSS
   fallback as the final presentation.

No visitor data leaves the browser, and the visual system has no dependency on application APIs.

## Theme Behavior

The veil uses the existing `--accent` and `--accent-ice` tokens as source colors. Dark mode uses
screen-like blending and stronger luminance separation. Light mode uses lower opacity and
multiply-compatible tinting so the effect remains visible without reducing text contrast.

Theme changes update uniforms through interpolation over a short transition. The canvas is not
destroyed or recreated. The fallback uses the same CSS variables and therefore stays synchronized
before and during the update.

## Responsive and Performance Behavior

### Desktop

- Full shader deformation and damped cursor response.
- Device pixel ratio capped at `1.5`.
- Render cadence capped in the 30–45 FPS range rather than assuming display refresh rate.
- One plane, one material, no shadows, post-processing, geometry churn, or per-frame allocation.

### Mobile and coarse pointers

- Simplified shader path with fewer noise iterations and lower render resolution.
- Device pixel ratio capped at `1`.
- Render cadence capped at approximately 30 FPS.
- Autonomous movement only; touch position is not observed.
- The CSS fallback remains acceptable if the runtime declines to start WebGL on a constrained
  device.

### Runtime controls

- Pause rendering when `document.visibilityState !== 'visible'`.
- Resume without a time jump when visibility returns.
- Recalculate viewport and render targets through a debounced resize path.
- Avoid mounting the heavy canvas bundle before hydration and capability checks complete.
- Keep the fixed fallback and canvas below interactive content and outside hit testing.

## Accessibility

- `prefers-reduced-motion: reduce` prevents canvas initialization and displays a static fallback.
- The background is decorative, hidden from assistive technology, and never conveys meaning.
- Existing focus states, keyboard navigation, and pointer targets remain unchanged.
- Text and controls retain their current surfaces and contrast; the veil never renders above them.
- Animation intensity remains lowest on reading-heavy routes.
- Motion does not flash, pulse rapidly, or create abrupt full-screen luminance changes.

## Failure Handling

- **No WebGL:** keep `SpectralFallback`; do not display an error.
- **Dynamic import failure:** keep the fallback and stop retrying for the current mount.
- **Shader compilation or renderer failure:** dispose partial resources and keep the fallback.
- **WebGL context lost:** call `preventDefault`, pause rendering, and show only the fallback. When a
  restoration event arrives, allow one bounded renderer reinitialization attempt.
- **Restoration failure:** dispose the canvas and keep the fallback for the session.
- **Invalid theme color:** use the root default-theme tokens rather than emitting invalid uniforms.
- **Observer or browser API unavailable:** use the `quiet` zone and autonomous motion defaults.

Failures are intentionally silent to visitors. Development diagnostics may use sanitized console
warnings, but production rendering must not expose stack traces or create repeated retry loops.

## Integration Scope

The implementation removes `atmospheric-grid` overlays from:

- Homepage hero and hero visual panel.
- About, experience, services, and projects sections.
- Projects index and blog index/article pages.
- Shared error and not-found presentations.

The reusable square-grid CSS class is removed after all references are eliminated. Existing ambient
orbs and glow layers that visually duplicate the veil should also be removed or reduced, but card-
specific highlights, portrait lighting, and semantic status indicators remain.

## Testing Strategy

### Unit and component tests

- Capability selection returns static, mobile, or desktop mode correctly.
- Reduced motion prevents the dynamic canvas import.
- Coarse pointer and mobile viewport select the simplified mode.
- Theme mutation updates color targets without remounting the canvas.
- Visibility changes pause and resume the scheduler.
- Section observation selects and interpolates the expected zone.
- Import, renderer, and context-loss failures preserve the fallback.
- Event listeners, observers, animation frames, materials, and renderer resources are cleaned up.

WebGL is mocked at component boundaries; tests do not depend on a real GPU.

### Visual verification

Verify the live page at desktop and mobile widths in:

- Dark and light modes.
- Default, ocean, rose, emerald, amber, violet, mono, sunset, and cherry color themes.
- Hero, balanced, quiet, and focus zones.
- Reduced-motion mode and a forced WebGL failure.

Capture representative screenshots and inspect the animation directly for readability, banding,
cursor damping, section transitions, and mobile simplification.

### Regression and performance checks

- Run the existing test, lint, typecheck, and production-build gates.
- Confirm no cumulative layout shift is introduced by the fixed decorative layer.
- Confirm the initial HTML contains the fallback without waiting for client JavaScript.
- Confirm only one canvas exists across section scrolling and client navigation.
- Confirm hidden-tab rendering stops and no animation listeners survive unmount.
- Compare bundle output to ensure the WebGL path remains dynamically split.

## Acceptance Criteria

1. No square-grid decoration remains on public site surfaces.
2. A single Spectral Veil background spans the site and changes intensity smoothly by section.
3. Desktop motion combines autonomous deformation with subtle damped cursor response.
4. Mobile uses a visibly related, lower-cost mode without touch tracking.
5. Every existing color theme produces a coherent veil in light and dark mode.
6. Reduced motion, unsupported WebGL, import failure, and context failure all produce the static
   fallback without broken UI.
7. Content hierarchy, readability, focus behavior, and input interaction remain intact.
8. The effect is dynamically loaded, uses one canvas, pauses when hidden, and cleans up resources.
9. Existing automated gates pass and visual verification covers the approved matrix.
