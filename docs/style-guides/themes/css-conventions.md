# Theme CSS conventions

The selectors, values and media rules a theme stylesheet follows. The styling contract itself (fixed `cck-` classes, `data-*`, CSS isolation, `@layer cocokits`) is stated in [architecture.md](../../architecture.md); this file turns it into authoring rules.

## Selectors

| Hook | Example (illustrative) |
|---|---|
| Block or part class | `.cck-tabs`, `.cck-tabs__trigger` |
| Base state attribute | `.cck-tabs__trigger[data-selected]`, `[data-disabled]`, `[data-orientation='vertical']` |
| Theme option attribute | `.cck-switch[data-size='lg']`, `.cck-icon-button[data-rounded]` |

- Put an option on the part through `partNames` in the `ThemeConfig` instead of reaching a part from the root.
- Do not depend on DOM structure beyond the anatomy: no tag selectors, no `:nth-child`.
- Do not name the theme scope or a mode in component CSS; modes are handled by tokens.
- Presence booleans are selected with `[data-x]`, never `[data-x='true']`; "off" is `:not([data-x])`. No modifier classes and no ARIA selectors for styling.
- Overlay parts: [overlays-and-theme-scope](./overlays-and-theme-scope.md).

## Documented custom properties

A theme may let the author set a visual value (a corner offset, a radius) through a custom property.

- The name is `--<prefix>-<component>-<property>`, where `<prefix>` is the theme's own variable prefix, its `$meta.globalPrefix` (the cocokits theme's is named in its [token naming](../../../packages/themes/cocokits/core/docs/tokens.md#naming)). The theme reads it with a fallback, `var(--<prefix>-<component>-<property>, <fallback>)`, and never defines it; the base never writes it.
- Each property is listed in the theme's `core/docs/css.md` (name, set on, default, effect) and on the component's Styling page, which the site renders from that file; the shape it needs (the `Applies to:` line, the table, the `html`, `tsx` and `vue` fences) is in the `<CustomProperties />` row of [component-pages.md](../docs/component-pages.md#docs-components). It is not a token.

## Specificity and layering

- All theme CSS is inside `@layer cocokits`, so unlayered consumer CSS wins. Partials hold no layer; each built entry stylesheet opens it once.
- Keep state rules at low specificity; wrap with `:where()` instead of adding selectors.
- No `!important`. No margin on a component root. The base ships no CSS: hiding is the native `hidden` attribute. A theme that sets `display` on a part also styles that part's `[hidden]` (`.cck-<component>[hidden] { display: none; }`), because an author rule beats the user-agent `[hidden]` rule; the theme owns that rule.

## Values

- Colours, sizes, radii, spacing, fonts and motion values come from tokens (`var(--brand)`; names come from the theme's docs), not literals. Literals such as `0`, `1px` hairlines and `100%` are fine. A literal colour (hex, `rgb()`, `hsl()`, `oklch()`, a named colour) appears only in the generated token files (`styles/generated/`); system colours appear only inside `@media (forced-colors: active)`. The docs app has the same rule: [site architecture, colours](../docs/site-architecture.md#colours).
- Component CSS never branches on the mode; the mode swaps token values. Mapping `prefers-color-scheme` to a mode is a provider option, not a media query in theme CSS.

## RTL

- Use logical properties: `margin-inline-start`, `padding-block`, `inset-inline-end`, `inline-size`, `text-align: start`.
- A physical transform (`translate`, a chevron `rotate`) gets an RTL counterpart on the part itself with `:dir(rtl)`, not an ancestor `[dir='rtl']` selector.
- Floating parts use the logical sides reported by the base in `data-side`.

## Motion

- The base ships no animations; a theme adds them. Put all motion inside `@media (prefers-reduced-motion: no-preference)` and make sure the end state is correct without it.
- A theme may leave a part without any exit animation; themes never add JavaScript or timeouts for motion.
- Transition named properties, never `all`.

## Forced colors

- Do not express a state by background colour or shadow alone.
- Give every colour-coded state a `@media (forced-colors: active)` rule using borders or outlines and system colours (`Highlight`, `GrayText`, `CanvasText`, `ButtonText`).
- Avoid `forced-color-adjust: none` except on decorative SVG that uses `currentColor`.

## Focus and target size

- Style focus on `:focus-visible` (or `[data-focus-visible]` if the base renders it), never bare `:focus`. Never remove the outline without a replacement.
- Interactive targets are at least 24 by 24 CSS px; no hover-only affordances. See [accessibility](../accessibility/index.md).

## Example

A small illustration of the rules above (not a spec of any component; variable names are placeholders):

```scss
@mixin switch {
  .cck-switch {
    min-block-size: 24px;
    background-color: var(--switch-track);
    &[data-checked] { background-color: var(--brand); }
    &[data-size='lg'] { inline-size: var(--switch-width-lg); }
    &:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
  }
  .cck-switch__thumb[data-checked]:dir(rtl) { translate: calc(-1 * var(--switch-travel)); }
  @media (prefers-reduced-motion: no-preference) {
    .cck-switch__thumb { transition: translate var(--motion-short) ease; }
  }
  @media (forced-colors: active) {
    .cck-switch[data-checked] { background-color: Highlight; }
  }
}
```
