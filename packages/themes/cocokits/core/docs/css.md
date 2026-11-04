# CSS rules of the cocokits theme

How this theme's CSS uses its tokens. Names and tiers: [tokens.md](./tokens.md).

## Build and layers

- A component's rules are the mixin `rules` in the partial `src/styles/components/_<name>.scss`; its entries, `styles.scss` (the whole theme, tokens included) and `components/<name>.scss`, each wrap `@include <name>.rules` in `@layer cocokits`. Load the partial as `@use '_<name>' as <name>` in the entry that shares its name.
- A single-component file needs `tokens.css` loaded next to it; its rules only read `--cck-<block>-*`.

## Tokens a component reads

- A component's CSS reads only its own Component-tier tokens (`--cck-<block>-*`). Those tokens alias Theme tokens; the CSS never names a Theme or Core token directly.
- Core tokens are read only through Theme or Component tokens.

## Color slots and their on- pairs

Every color family (`brand`, `neutral`, `info`, `success`, `warning`, `danger`, `contrast`) has two slots, each with an `on-` token (four tokens), and an `edge` for the border of a filled control:

| Slot        | Paint it with                 | Text and icons on it |
| ----------- | ----------------------------- | -------------------- |
| `color`     | solid fill (filled button)    | `on-color`           |
| `container` | soft fill (tonal button, tag) | `on-container`       |

- `edge` is not a slot: it is the border of a filled control (`--cck-edge`, backed by `--cck-<family>-edge`). Which families get the fill and which `on-container`: [Checkbox, Switch and Radio](#checkbox-switch-and-radio).
- Neutral surfaces are `surface/1..5` with `on-surface/1..5`. Text is `text/1..5`. Borders are `border/1..3`. Disabled uses the `disabled/*` set.
- A component takes its family through the Active Color tokens (`color`, `on-color`, `container`, `on-container`, `edge`), so its CSS is written once for every family. How the marker is set: [tokens.md](./tokens.md).

## Defaults

- Border: `border/2`. Focus ring: `focus/2`. Pick another step only when the design says so.
- Solid colors. Translucency (`contrast/alpha-*`, `black-alpha/*`) is for scrims and overlays only.

## Size, Spacing and Radius

- Size (`size-*`, Core): fixed dimensions such as control height and icon size.
- Spacing (`spacing-*`): margin, padding and gaps, so a spacing mode can change them.
- Radius (`radius-*`): corners only.

## Typography

- Use one group for one text style: `text-md/font-family`, `/font-size`, `/line-height`, `/letter-spacing`, plus a weight from `--cck-font-weight-*`.
- `code/*` groups carry their own weight.

## Custom properties

Rule: [css-conventions](../../../../../docs/style-guides/themes/css-conventions.md#documented-custom-properties).

Applies to: `badge`, `badge-container`. Consumers such as a docs site list these properties for each component named here.

| Property                       | Set on                   | Default | Effect                                                                                   |
| ------------------------------ | ------------------------ | ------- | ---------------------------------------------------------------------------------------- |
| `--cck-badge-container-radius` | the BadgeContainer       | `0px`   | Moves the badges in by `0.2929 * radius`, onto the visible corner of a rounded host.     |
| `--cck-badge-offset-x`         | a Badge or its container | `0px`   | Shifts the badge from its corner along the inline axis; mirrored in RTL like the corner. |
| `--cck-badge-offset-y`         | a Badge or its container | `0px`   | Shifts the badge from its corner along the block axis.                                   |

Set them inline on the container. Angular (`html`), React (`tsx`) and Vue (`vue`):

```html
<div cckBadgeContainer style="--cck-badge-container-radius: 8px; --cck-badge-offset-x: 4px">
  <button cckButton aria-label="Notifications, 2 new">…</button>
  <span cckBadge [content]="2"></span>
</div>
```

```tsx
<BadgeContainer style={{ '--cck-badge-container-radius': '8px', '--cck-badge-offset-x': '4px' } as CSSProperties}>
  <Button aria-label="Notifications, 2 new">…</Button>
  <Badge content={2} />
</BadgeContainer>
```

```vue
<BadgeContainer style="--cck-badge-container-radius: 8px; --cck-badge-offset-x: 4px">
  <Button aria-label="Notifications, 2 new">…</Button>
  <Badge :content="2" />
</BadgeContainer>
```

The container's `position` (`data-position`) places the badge: `.cck-badge-container[data-position='top-right'] > .cck-badge`. The badge must be a direct child of the container.

## Form field and Input

- A standalone `.cck-input` draws its own `md` box from `--cck-input-*`. Inside a field, `.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea)` draws the box from `--cck-form-field-*` and `.cck-form-field__input-wrapper > .cck-input` is borderless, transparent and fills the wrapper. The box takes its size from the field root's `data-size` (`sm`, `md`, `lg`, default `md`), inherited through the `--cck-form-field-*` size tokens; the wrapper's `data-size` is a hook only.
- The states of the field box come from the facts the root renders, through child combinators only (`.cck-form-field:where([data-disabled]) > .cck-form-field__wrapper > …`). The invalid look needs `data-invalid` and (`data-touched` or `data-submitted`), as `aria-invalid` does; it adds an inset line next to the border (a thicker border in forced colors), so it is not color alone. Read-only has a dashed border.
- The focus ring is on the wrapper (`:focus-within`); the Input keeps its own `:focus-visible` ring only when it stands alone.
- The Input sets no `display`, so the native `hidden` attribute hides it. The Label's required marker takes its color and gap from `--cck-label-required-marker-*`.
- Forced colors: `CanvasText` border, a thicker invalid border, `GrayText` when disabled and a `Highlight` ring.

## Textarea, zones and FieldError

- A standalone `.cck-textarea` draws its own `md` box from `--cck-textarea-*` and has a vertical resize handle. Inside a field, `.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea)` draws the box as for the Input; the wrapper aligns a Textarea box to the start so it grows with the textarea, and the Textarea is borderless and transparent. It keeps the padding-block of the field size (`--cck-form-field-padding-block`), so its scroll area and its resize handle stay inside the border. The Textarea sets no `display`, so the native `hidden` attribute hides it.
- Prefix and Suffix are flex items inside the box and Leading and Trailing are flex items outside it. All four are as high as the first line of the box, so an icon or a button is centred on it, with `--cck-form-field-zone-gap` between neighbours; the gap is on the two wrappers, so a zone that is not rendered leaves none. Prefix and Suffix use the secondary text color (`--cck-form-field-affix-text-color`), the disabled text color (`--cck-form-field-affix-disabled-text-color`) when the field is disabled, and `GrayText` in forced colors. Leading and Trailing sit outside the box and keep the field text color when disabled. The zones set `display`, so the theme restates their `[hidden]`.
- A FieldError is `text-sm` in `--cck-field-error-text-color` (`danger/text`, at least 4.5:1 on `surface/1` in Light and Dark). Its text is the cue besides the color. It sets no `display`: the live region stays in the accessibility tree and the native `hidden` works. The feedback wrapper has no `gap`. A message after another visible one gets `padding-block-start` (padding, because a component root takes no margin), and an empty FieldError matches `:empty` and takes no space, which needs no whitespace text inside it. When nothing in the wrapper is visible the wrapper undoes the field's gap.
- Forced colors: the Textarea follows the Input rules (`CanvasText` border, a thicker invalid border, `GrayText` when disabled, a `Highlight` ring) and the FieldError is `CanvasText`.

### Textarea custom properties

Rule: [css-conventions](../../../../../docs/style-guides/themes/css-conventions.md#documented-custom-properties). They have no token.

Applies to: `textarea`. They apply to a Textarea with the theme option `autoResize`.

| Property                  | Set on                     | Default | Effect                                                              |
| ------------------------- | -------------------------- | ------- | ------------------------------------------------------------------- |
| `--cck-textarea-min-rows` | a Textarea with autoResize | `2`     | The least number of lines it shows, plus its padding and border.    |
| `--cck-textarea-max-rows` | a Textarea with autoResize | `5`     | The most lines it shows before it scrolls, plus padding and border. |

`autoResize` uses `field-sizing: content`, which is Baseline 2026. Where it is unsupported the textarea keeps the height of its `rows` and scrolls; nothing is hidden. Set the properties inline or on a parent:

```html
<textarea cckTextarea autoResize style="--cck-textarea-min-rows: 3; --cck-textarea-max-rows: 8"></textarea>
```

```tsx
<Textarea autoResize style={{ '--cck-textarea-min-rows': 3, '--cck-textarea-max-rows': 8 } as CSSProperties} />
```

```vue
<Textarea auto-resize style="--cck-textarea-min-rows: 3; --cck-textarea-max-rows: 8" />
```

## Checkbox, Switch and Radio

- Each control draws from its own `--cck-<block>-*` tokens and the options on its root: `data-size` (`sm`, `md`, `lg`), `data-cck-color` (the checked color) and `data-label-position` (`after` or `before`; the row is reversed with `flex-direction`, so it follows the writing direction). The root sets `display`, so the theme restates `[hidden]`.
- The native input lies transparent over the hit area (`hit-size`, at least 24 by 24 CSS px), so focus, the target and `:focus-visible` stay native. The Checkbox and Radio draw the box on `background`, and the tick, dash and dot on its `::after`, with CSS only (no text on a decorative part). The Switch track is the hit area and draws its pill on `::before`; the thumb moves with `inset-inline-start`, so RTL needs no counterpart.
- Selectors are `.cck-<block>:where([data-…]) > … > .cck-<block>__background` chains inside one block, plus `:has(> … > .cck-<block>__input:focus-visible)` for the ring on the box (the Switch pill). The state part is in `:where()`, so every state rule has the same specificity and source order decides: read-only, checked and mixed, invalid, disabled.
- Checked, mixed and invalid are not color alone: a tick, a dash (it wins over the tick), the thumb position, a second line inside the border for invalid (the mark color on a filled box, so it reads against the fill) and a dashed border for read-only (the fill stops at the border, so the gaps show the surface). The invalid look needs `data-invalid` and (`data-touched` or `data-submitted`). The Radio renders only the checked, disabled and required facts, so it has no invalid, read-only or mixed look.
- Contrast (WCAG 1.4.11, 3:1): the unchecked border (`border/3`) and the hover border (`text/2`) against `surface/1` and `surface/2`. The checked box has a border of the Active Color `edge`, at least 3:1 against the surface for every family in Light and Dark: the `edge` Active Color token is the fill itself where the fill passes 3:1, and the family `on-container` only for `neutral` (both modes) and `warning` (Light), whose fill fails. The tick, dash, dot and thumb (`on-color`) reach 3:1 against the fill for every family. Label text is `text/1` (4.5:1). The disabled look is exempt. The tests are in `contrast.test.ts`. `border/2` is not used.
- The hover halo stays inside the gap to the label (a Checkbox or Radio halo is at most 4px beyond the hit area; the Switch halo is painted behind the track), and it is transparent in forced colors.
- Disabled wins over invalid, also for `fieldset[disabled]` (`:has(… input:disabled)`) and in forced colors.
- Motion (colors, the tick opacity, the thumb) runs only inside `prefers-reduced-motion: no-preference`; the end state is correct without it.
- Forced colors: `CanvasText` box, `Highlight` fill when checked or mixed with a `HighlightText` mark and a `CanvasText` border (so a dashed read-only or a thicker invalid edge shows on the fill), `GrayText` when disabled, a thicker border for invalid (`CanvasText` on a filled box, so it differs from the `Highlight` fill) and a `Highlight` ring. The Switch thumb is `CanvasText` (off) or `HighlightText` on `Highlight` (on), and its position still tells the state.

## Radio group

- Layout only, on `.cck-radio-group` and its own `data-orientation`: a column with `--cck-radio-group-gap` between the radios; `[data-orientation=horizontal]` is a row that wraps (WCAG 1.4.10) with `--cck-radio-group-inline-gap` between neighbours. The radios keep their own look, size and 24 by 24 target; the group has no options.

## Tabs

- The options sit on the root (`data-variant`, `data-cck-color`, `data-size`, `data-header-align`), and every rule reaches the list, a trigger, the indicator or a panel through child combinators from the root, so a Tabs inside a panel keeps its own options. The list is a direct child of the root and the triggers are direct children of the list.
- `Tabs / Size` holds the trigger height (32, 36 and 40px, never under 24), its inline padding and the label text style. `Tabs / Structure` holds the list chrome (`list-*`, `line-*`), the indicator (`indicator-*`) and the label colors.
- `variant`: `border` (a bordered list, the default), `fill` (a filled list), `line` (a line under the list, or at its inline end when vertical) and `basic` (the indicator alone). In `border`, `fill` and `basic` the indicator is a block of the Active Color (`color`) behind the selected trigger and the selected label takes `on-color`; in `line` the indicator is a `indicator-line-width` line of the Active Color that covers the list line. `color` defaults to `neutral`.
- `headerAlign` places the list across the tabs with `align-self` (`start`, `center`, `end`, `stretch`); `stretch` also lets the triggers share the width. The values are logical, so RTL needs no counterpart.
- The indicator reads the four variables the base writes on it (`--active-tab-left`, `--active-tab-top`, `--active-tab-width`, `--active-tab-height`), each with an empty fallback: until the base has measured (on the server and before mount) its box is empty and it shows nothing. It is positioned from the physical left edge, because the base measures from there in both directions.
- The indicator slides (`translate`, `inline-size`, `block-size` over `motion-duration`) only under `prefers-reduced-motion: no-preference` and only while the pointer or focus is inside the list, so the first placement after mount never slides in from the corner. A change that comes from outside the list (a Button that selects a tab) jumps. There is no hover color.
- Forced colors: the indicator and the line are `Highlight`, the selected label `HighlightText`, a disabled label `GrayText` and the focus ring `Highlight`.

## TabNav

- The same look as Tabs, from the same partial (`_tabs.scss`) and the same `--cck-tabs-*` tokens, on `.cck-tab-nav`: the options (`data-variant`, `data-cck-color`, `data-size`, `data-header-align`) sit on the `nav` root, and the list (`.cck-tab-nav__list`), the links (`.cck-tab-nav__link`) and the indicator (`.cck-tab-nav__indicator`) are reached through child combinators, so the list is a direct child of the root and the links and the indicator are direct children of the list. The panel (`.cck-tab-nav__panel`) is the author's content area and gets no style; it may sit anywhere. Read the Tabs section for the variants, `headerAlign`, the indicator variables, the motion and the forced colors; only the differences are listed here.
- The active link is `[data-active]` (Tabs: `[data-selected]`) and takes the same label colors and indicator; a disabled link is `[data-disabled]`. The link is an `<a>`, so it sets `text-decoration: none`.
- There is no panel and no vertical orientation, so the panel and `data-orientation` rules are not emitted for it. No hover or active color, as for Tabs.

## Popover

- The content (`.cck-popover__content`) is portaled into a top-layer host, so the rules are on its own class and never reach it through the trigger. It sets no `position`, `inset` or `transform` (the positioning module writes them) and reads `--available-height` for `max-block-size`. The gap to the trigger is `--side-offset`, set on the content from `--cck-popover-side-offset`; the width is capped by `max-inline-size` (`--cck-popover-max-inline-size`) and by the viewport. The sheet registers `--side-offset` as a `<length>` (`@property`, outside the layer, once per compiled file), so `calc()`, `rem` and `em` work and a unitless value other than `0` is invalid; the positioning module reads it once when the overlay opens.
- The surface is `surface/1` with a `border/3` border, the large radius and the large shadow; the text is `text-sm`. The Close part is a small outlined button of at least 24 by 24 CSS px; the trigger is the author's (usually a Button) and only gets the focus ring.
- Focus shows on `:focus-visible` as an outline of the `focus/2` color; the content has one inside its box for the case that focus lands on it.
- Motion (a short fade and a slide away from the anchor, keyed on `data-state` and `data-side`) runs only inside `prefers-reduced-motion: no-preference`, and the exit animation is what the presence module waits for. The inline slide of `data-side="start"` and `"end"` has an RTL counterpart on the part with `:dir(rtl)`.
- Geometry written by the positioning module on the content: `--anchor-width`, `--available-width`, `--available-height` and `--transform-origin`, the point where the content meets its anchor (the arrow tip with an arrow). The theme sets `transform-origin: var(--transform-origin)` on the Popover, Tooltip and Select contents, so a scale in a theme's motion grows from the anchor; the motion shipped here (fade and slide) does not scale.
- The Arrow (`.cck-popover__arrow`) is placed and turned by the positioning module; the theme sizes the triangle `svg` inside it (`--cck-popover-arrow-width`, `--cck-popover-arrow-height`) and fills it with `--cck-popover-arrow-bg`, the content's surface. It restates `[hidden] { display: none }` because an author `display` rule would beat the user-agent one. A content that holds an arrow has `overflow: visible`, since the arrow sits outside the border box; it therefore does not scroll itself. In forced colors the arrow is `CanvasText`.
- Forced colors: a `CanvasText` border, no shadow, a `ButtonText` Close and a `Highlight` focus ring.

## Tooltip

- The content (`.cck-tooltip__content`) is portaled into a top-layer host, so the rules are on its own class and never reach it through the trigger. Like the Popover it sets no `position`, `inset` or `transform`; the gap to the trigger is `--side-offset`, set on the content from `--cck-tooltip-side-offset`, and the width is capped by `max-inline-size` and the viewport. It is registered as a `<length>`, like the Popover's.
- The bubble is an inverse surface: `text/1` as the fill and `surface/1` as the text, so it reads in light and dark. It has no border, a medium radius and shadow, and the `text-xs` style. It is never focusable and holds no control, so it has no focus ring and no pointer rule; the trigger is the author's and keeps its own look.
- Motion (a short fade and a slide away from the anchor, keyed on `data-state` and `data-side`) runs only inside `prefers-reduced-motion: no-preference`, with an RTL counterpart on the part for `start` and `end`.
- The Arrow (`.cck-tooltip__arrow`) works as the Popover's: `--cck-tooltip-arrow-width`, `--cck-tooltip-arrow-height`, filled with `--cck-tooltip-arrow-bg` (the bubble's fill), `[hidden]` restated. `transform-origin` is `var(--transform-origin)`.
- Forced colors: `Canvas` fill, `CanvasText` text and a `CanvasText` border, no shadow; the arrow is `CanvasText`.

## Dialog

- The content (`.cck-dialog__content`) is a native modal `dialog` in the top layer. The user agent centres it, so the theme sets no `position`, `inset`, `margin` or `transform`; it sets the width (`inline-size` of the viewport minus two `--cck-dialog-viewport-margin`, capped by `--cck-dialog-max-inline-size`), a maximum height and the surface. `display: flex` is set only on `[open]`, so a closed dialog stays hidden by the user agent.
- A dialog opened non-modal (`modal` off in React and Vue) is open but not `:modal`: it is not in the top layer and the user agent does not centre it, so `.cck-dialog__content[open]:not(:modal)` is `position: fixed` with `inset: 0`, auto margins and `block-size: fit-content`, centred in the viewport with the same size rules and no backdrop.
- The backdrop is `.cck-dialog__content::backdrop` with `--cck-dialog-backdrop-bg`. A pseudo-element inherits the tokens of the content, which is where they are emitted.
- The surface is `surface/1` with a `border/3` border, the extra-large radius and the large shadow. The Title is `text-lg` in semibold, the Description `text-sm` in `text/2`. The Close part is a small outlined button of at least 24 by 24 CSS px; the trigger is the author's (usually a Button) and only gets the focus ring.
- Focus shows on `:focus-visible` as an outline of the `focus/2` color; the content has one inside its box for the case that focus lands on it.
- Motion (a short fade and a slide up, with the backdrop fading) is keyed on `data-state` and runs only inside `prefers-reduced-motion: no-preference`; the exit animation is what the presence module waits for.
- Forced colors: a `CanvasText` border, no shadow, a `ButtonText` Close and a `Highlight` focus ring.

## Accordion

- The options sit on the root (`data-variant`, `data-size`, `data-toggle-position`, `data-hide-toggle`), and every rule reaches the item, the header, the trigger or the content through child combinators from the root, so an Accordion inside a content keeps its own options.
- `Accordion / Size` (`sm`, `md`) holds the trigger height (32 and 40px, and the trigger is never under 24px), its inline padding, the space below the content and the text style. `Accordion / Structure` holds the item chrome, the colors, the chevron (`icon-*`), the focus ring and `motion-duration`.
- `variant`: `default` (separate bordered items with a gap), `group` (one bordered box with dividers between the items) and `basic` (no chrome). `togglePosition` puts the chevron after (default) or before the label with `order`; `hideToggle` (`data-hide-toggle`, present when true) removes it.
- The trigger is full width, wraps long text and starts its text at the inline start. The chevron is the trigger's `::after`, two `currentColor` borders turned by `rotate`; it turns on `[data-state='open']`. A disabled trigger is `[data-disabled]` only; the open trigger that cannot be collapsed (`aria-disabled`) looks like any other. No hover or active color.
- The focus ring is drawn on `[data-focus-visible]`, inside the trigger box, so the item never clips it.
- The content animates `block-size` with `@keyframes` over `--accordion-content-height`, which the base writes after mount. While the variable is unset (the first render) both ends of the keyframes are invalid and resolve to `auto`, so an item that starts open does not move. The space below the content is its `::after`, so it is inside the measured height. The animation and `overflow: hidden` exist only inside `prefers-reduced-motion: no-preference`; with reduced motion the base hides the content at once. The content sets no `display`, so the native `hidden` hides it.
- Forced colors: the chevron and the label keep `currentColor`, a disabled label is `GrayText`, the item borders are `CanvasText` and the focus ring `Highlight`.

## Select

- The root (`.cck-select`) holds the trigger and the hidden form inputs; the trigger draws the box from `--cck-select-*` (a standalone Select is an `md` box like a standalone Input) and takes its size from the root's `data-size` (`sm`, `md`, `lg`, default `md`). `Select / Size` holds the height, the inline padding and the text style. Inside a FormField the field sizes the trigger instead: `.cck-form-field__input-wrapper > .cck-select > .cck-select__trigger` reads the `--cck-form-field-*` size tokens of the field root, whatever size the Select has.
- The states come from the facts the root renders (`data-invalid`, `data-readonly`, `data-disabled`, `data-state`), in `:where()`, so source order decides: invalid adds an inset line next to the border (a thicker border in forced colors), read-only has a dashed border, disabled wins over invalid. The focus ring is on the trigger. The chevron, the check of a single list and the box of a multiple list are drawn with borders and `rotate` (no image, no text on a decorative part).
- The list (`.cck-select__content`) is portaled into a top-layer host, so the rules are on its own class and never reach it through the root; its tokens are the `Select__content / Structure` collection, named after the class for the reason the Popover collection is. It sets no `position`, `inset` or `transform` (the positioning module writes them), is at least `--anchor-width` wide, and reads `--available-height`, and sets `transform-origin: var(--transform-origin)`. The gap to the anchor is `--side-offset`, set from `--cck-select-content-side-offset`. It is registered as a `<length>`, like the Popover's.
- The highlighted option (`data-highlighted`) has a `surface/2` fill and the selected one (`data-selected`) a heavier weight and the indicator. A single list puts the check after the text, a multiple list a box before it (`.cck-select__content[data-multiple]`). A disabled option is dimmed and `not-allowed`.
- The separator (`.cck-select__separator`, `aria-hidden`) is a line of `content-border-width` in `content-border-color` with `option-padding-block` above and below; it is a border, so forced colors keep it (`CanvasText`). No token was added for it.
- Motion (a short fade and a slide away from the anchor, keyed on `data-state` and `data-side`) runs only inside `prefers-reduced-motion: no-preference`, with an RTL counterpart on the part for `start` and `end`.
- Forced colors: `CanvasText` border, no shadow, `GrayText` when disabled, a `Highlight` ring, `Highlight` with `HighlightText` for the highlighted option and `CanvasText` for the multiple box and the separator.

### Select custom properties

Rule: [css-conventions](../../../../../docs/style-guides/themes/css-conventions.md#documented-custom-properties). It has no token.

Applies to: `select`. It applies to the list of the Select.

| Property                          | Set on               | Default | Effect                                                                              |
| --------------------------------- | -------------------- | ------- | ----------------------------------------------------------------------------------- |
| `--cck-select-content-max-height` | the page or the list | `220px` | Caps the height of the list, which scrolls beyond it; the viewport caps it as well. |

The list is portaled into a host that sits in the overlay container, outside the Select, so a property set on the Select does not reach it: set it on `:root` or in a rule for `.cck-select__content`. Angular (`html`), React (`tsx`) and Vue (`vue`):

```html
<style>
  .cck-select__content {
    --cck-select-content-max-height: 320px;
  }
</style>
```

```tsx
<style>{`.cck-select__content { --cck-select-content-max-height: 320px; }`}</style>
```

```vue
<style>
.cck-select__content {
  --cck-select-content-max-height: 320px;
}
</style>
```

## Follow

```css
.cck-button {
  background-color: var(--cck-button-solid-bg);
  color: var(--cck-button-solid-label-color);
  border-radius: var(--cck-button-radius);
}
```

- `@use` the generated partial for `$` aliases; never include its `tokens` mixin in a component stylesheet.
- Add the Component tokens first, then write the rule that reads them.
- Pair every fill with its `on-*` token and check contrast in Light and Dark.

## Anti-patterns

```css
/* avoid: raw Theme token and a literal color */
.cck-button {
  background-color: var(--cck-brand-color);
  color: #fff;
}
```

- Reading Theme or Core variables (for example `--cck-brand-color`) from component CSS.
- Pairing a fill with a text color from another slot (`color` with `on-container`).
- `font-size` or `line-height` taken from different typography groups.
- Spacing tokens for a radius or a fixed height.
- Translucent colors for ordinary fills, borders or text.
