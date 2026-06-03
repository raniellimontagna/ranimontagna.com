# Links Ranimontagna Astro Design

Date: 2026-06-03
Project: `links.ranimontagna.com`
Scope: independent Astro repository for a personal links page

## Goal

Create an independent, static Astro project that replaces the current Linktree profile at `https://linktr.ee/raniellimontagna` with a first-party page served from `https://links.ranimontagna.com`.

The first version should keep the familiar Linktree-style behavior while making the experience owned, faster, branded, and easy to maintain in code.

## Current State

- The portfolio site lives in `/home/ranni/www/personal/ranimontagna.com`.
- The public profile links currently point users to Linktree.
- The Linktree page shows a centered profile card with the RM brand mark, `@raniellimontagna`, a short professional subtitle, and links for Site, GitHub, LinkedIn, Instagram, and Twitter.
- The portfolio repository already contains reusable visual assets in `public/logo`, including `white.svg` and `black.svg`.
- The portfolio repository centralizes social URLs in `src/shared/lib/social-links.tsx`.

## Requirements

- Create a new local repository at `/home/ranni/www/personal/links.ranimontagna.com`.
- Use Astro so this becomes a small static site and a practical introduction to Astro.
- Keep the new project independent from `ranimontagna.com` at runtime.
- Copy only the needed visual assets from `ranimontagna.com` into the new repository.
- Use the existing RM logo identity rather than creating a new mark.
- Design the page in the first visual direction chosen during brainstorming: familiar Linktree-style layout with better ownership and polish.
- Optimize for mobile-first use from social profile bios while keeping desktop presentation elegant.
- Keep content editable through source files, not an admin panel.
- Prepare the app for deployment at `links.ranimontagna.com`.

## Non-Goals

- Do not build a dashboard or link-management admin.
- Do not add analytics in the first version unless the deploy platform provides it without code complexity.
- Do not integrate with the LinkedIn API or scrape profile data at runtime.
- Do not depend on the main portfolio app at runtime.
- Do not recreate Linktree's UI exactly or include Linktree platform chrome.

## Recommended Architecture

### Repository

Create a standalone Astro repository:

- `/home/ranni/www/personal/links.ranimontagna.com`
- Package manager: `pnpm`
- Framework: Astro
- Rendering mode: static output
- Primary page: `src/pages/index.astro`
- Shared data: `src/data/profile.ts`
- Global styles: `src/styles/global.css`
- Public assets copied into `public/logo`

The repository should have its own `package.json`, `.gitignore`, README, and build scripts.

### Content Model

Represent the visible content as typed data:

```ts
export const profile = {
  name: 'Ranielli Montagna',
  handle: '@raniellimontagna',
  title: 'Engenheiro de Software Full Stack',
  subtitle: 'React, React Native, Node.js e TypeScript | Web/Mobile em escala',
  links: [
    { label: 'Site', href: 'https://ranimontagna.com', icon: 'terminal' },
    { label: 'GitHub', href: 'https://github.com/RanielliMontagna', icon: 'github' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/rannimontagna', icon: 'linkedin' },
    { label: 'Instagram', href: 'https://www.instagram.com/raniellimontagna/', icon: 'instagram' },
    { label: 'X / Twitter', href: 'https://twitter.com/rannimontagna', icon: 'x' },
  ],
}
```

The professional copy should be technical and compact. It should use the LinkedIn profile data as source context, especially:

- Full-stack software engineering
- React, React Native, Node.js, TypeScript, and Next.js
- Web/mobile products at scale
- APIs, micro frontends, design systems, performance, accessibility, and code quality
- Interest in AI, automation, LLM integration, and MCP

The public page should not display private or workplace email addresses from the extracted profile data.

## Visual Design

Use the chosen "Linktree proprio" direction:

- Dark page background with subtle branded gradient or texture.
- A centered mobile-width panel on desktop.
- Circular RM logo mark near the top.
- Handle and professional subtitle below the logo.
- Large stacked link buttons.
- Dark buttons with white text and icon at the left.
- Button text stays visually centered even with an icon.
- Rounded corners should be restrained and consistent.
- The layout should keep the first viewport focused on the links.
- Footer should be discreet and first-party, such as `links.ranimontagna.com` or a compact copyright.

The page should feel familiar to visitors coming from social bios, but more intentional than a generic Linktree clone.

## Accessibility

- Use semantic anchors for links.
- Each link must have visible text and an accessible label when useful.
- External links should use `target="_blank"` plus `rel="noopener noreferrer"`.
- Preserve keyboard focus outlines.
- Maintain strong color contrast on dark backgrounds.
- Respect reduced-motion preferences if any animation is added.
- Ensure text does not overflow buttons or the profile panel on small screens.

## SEO And Metadata

Add metadata for a shareable personal links page:

- Title: `Ranielli Montagna | Links`
- Description: concise technical summary based on the final subtitle.
- Canonical URL: `https://links.ranimontagna.com`
- Open Graph title, description, URL, and image.
- Twitter card metadata.
- Favicon and theme color.

If `public/og-image.png` from the portfolio is copied, use it as the first Open Graph image. A custom OG image can be added later.

## Assets

Copy the needed assets from the portfolio repository:

- `public/logo/white.svg`
- `public/logo/black.svg`
- optional `public/og-image.png`

Do not import files from the main portfolio repository at build time. The copied assets make the new project deployable independently.

## Styling Strategy

Use plain CSS in Astro for the first version:

- Global CSS with design tokens as CSS custom properties.
- No Tailwind dependency unless a later iteration needs it.
- No animation library.
- No client-side JavaScript unless required for a specific interaction.

This keeps the Astro project small and makes the generated output easy to inspect.

## Deployment Shape

The output should be a static site suitable for Vercel, Cloudflare Pages, Netlify, or any static host.

Recommended initial scripts:

- `pnpm dev`
- `pnpm build`
- `pnpm preview`
- `pnpm check` if Astro TypeScript checking is configured

The README should document the intended domain:

- Production URL: `https://links.ranimontagna.com`
- Local URL: `http://localhost:4321`

DNS and hosting connection can happen after the first verified build.

## Testing And Verification

Initial verification should cover:

- `pnpm build` succeeds.
- Local preview renders the page.
- Desktop and mobile screenshots show the panel correctly centered and not overflowing.
- All links point to the expected destinations.
- Logo assets load.
- Metadata exists in the rendered document.
- Lighthouse or manual checks confirm basic accessibility and SEO.

Automated tests are optional for the first version because the site is static and small. A smoke test can be added later if the link list grows or analytics behavior is introduced.

## Implementation Plan Summary

1. Create `/home/ranni/www/personal/links.ranimontagna.com`.
2. Initialize an Astro static project with TypeScript and pnpm.
3. Copy RM logo assets from `ranimontagna.com`.
4. Add typed profile/link data.
5. Build the Astro page, global CSS, metadata, and favicon wiring.
6. Add README and deployment notes.
7. Run build and local preview.
8. Verify visual rendering in browser across desktop and mobile.
9. Initialize git and commit the new repository.

## Decision Summary

The new personal links page will be a standalone Astro repository, visually aligned with the existing Linktree page but branded as a first-party Ranielli Montagna property. It will use copied RM assets, a compact technical headline derived from LinkedIn profile context, static source-controlled link data, and a mobile-first dark panel layout ready for `links.ranimontagna.com`.
