# Emerald Default Theme Design

## Goal

Make Emerald the initial color theme for new visitors so the portfolio aligns
more closely with Lemon's visual identity, while preserving every color choice
already saved by returning visitors.

## Behavior

- Visitors without a saved color preference start with the existing `emerald`
  theme in both light and dark modes.
- Visitors with a valid saved color theme continue to see that theme.
- The color theme picker shows Emerald as active for a new visitor.
- The existing `default` palette remains available as a selectable option.
- Invalid or unreadable stored theme data falls back to Emerald.
- The light/dark mode default and persistence behavior do not change.

## Implementation

- Change the Zustand theme store's default color theme from `default` to
  `emerald`.
- Align the pre-hydration theme initialization script with the same Emerald
  fallback to avoid a flash of the old color palette.
- Update the web app manifest theme color from blue to the dark Emerald accent
  used by the site.
- Reuse the committed Emerald CSS tokens without modifying the palette.

## Compatibility

No migration is required. A saved `default`, `ocean`, `rose`, `emerald`,
`amber`, `violet`, `mono`, `sunset`, or `cherry` value remains valid and wins
over the new fallback.

## Verification

- Store tests assert that missing, invalid, and malformed storage use Emerald.
- Store tests assert that each valid saved color theme remains unchanged.
- Initialization-script tests assert Emerald is applied before hydration when
  storage is absent or invalid and that a valid saved choice is preserved.
- Manifest checks assert the Emerald browser/PWA theme color.
- Focused tests, type-checking, and formatting checks pass.

## Non-goals

- Do not redesign the Emerald palette.
- Do not remove or rename any color theme.
- Do not overwrite valid preferences in local storage.
- Do not change the default light/dark mode.
