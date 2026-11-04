# Overlays and theme scope

How a theme styles portaled parts and how theme scope, modes and direction reach them. The overlay invariants (portaled, works inside modal dialogs and shadow roots, follows the trigger's theme scope, mode and `dir`) are in [architecture.md](../../architecture.md).

## Styling rules

- Overlay parts (dialog, popover, menu content, tooltip and similar) are rendered in an overlay container, not inside the trigger's block. Style them by their own class and attributes: `.cck-popover__content[data-side='top']`, `.cck-select__content[data-state='open']` (illustrative).
- Do not reach them through the trigger's block, a sibling combinator or an app ancestor; those selectors never match.
- Do not set `position`, `inset` or `transform` for placement. The positioning module writes coordinates as inline styles; read the resolved placement from `data-side` / `data-align` and use logical sides.
- The positioning module also writes three unprefixed measured variables on the content, which a theme may read: `--anchor-width` (the anchor's width), `--available-height` and `--available-width` (the room to the viewport edge), for example `min-width: var(--anchor-width)` or `max-height: var(--available-height)`.
- The gap between an overlay and its anchor is the theme's `--side-offset` (any length, set on the content part, for example `--side-offset: calc(0.5rem + 2px)`; the theme registers it as `<length>`, so `calc()` works and a unitless value other than `0` is invalid); the positioning module reads it once when the overlay opens and uses `0` when it is unset. A React or Vue content that is given `sideOffset` uses that number instead and does not read the variable. It is the one unprefixed variable the theme sets: the base needs the number, the theme owns the look.
- Open/close motion keys off `data-state` under `prefers-reduced-motion: no-preference` ([css-conventions](./css-conventions.md)).

## Theme scope, modes and direction

- Portaled content takes the nearest theme scope, mode and `dir` of its trigger's ancestors. Component CSS does nothing for this; it only reads tokens.
- The theme layer does not re-scope overlays: no scope wrapper, no extra provider, no mode class on the content.
- A consumer token override must be written against the theme scope or `:root`; a variable set on an arbitrary ancestor is not inherited across the portal.
- A theme that switches light and dark with `color-scheme` on a subtree (framesx uses `color-scheme` and `light-dark()`) is not mirrored to the host: the host follows the document's `color-scheme`. Mode attributes are copied; `color-scheme` is not.
- Dark-mode rules that assume the overlay sits inside a themed subtree are a bug.

Focus, dismissal and keyboard behaviour of overlays belong to the base: [accessibility/focus-and-overlays](../accessibility/focus-and-overlays.md).
