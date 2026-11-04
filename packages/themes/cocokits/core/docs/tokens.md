# Token architecture of the cocokits theme

The source is `src/tokens/*.tokens.json`: `base.tokens.json` (Tier 1 and 2) and one file per component. The `tokens` target (`pnpm nx run theme-cocokits:tokens`; `build` runs it) writes `src/styles/generated/_tokens.scss`: a `$` alias of every variable and a `tokens` mixin with the CSS. The folder is ignored by git, Prettier and ESLint. `src/styles/tokens.scss` includes the mixin and `styles.scss` uses `tokens.scss`, so the build writes `dist/tokens.css` and `dist/styles.css` (tokens included, once). The same target writes `src/generated/token-modes.ts` (ignored by git, Prettier and ESLint): the mode lists and the modes index `modeCollections`, which the package root exports. What it holds and how the config uses it: [theme config guide](../../../../../docs/style-guides/themes/theme-config.md#values-from-token-collections). CSS rules for this theme: [css.md](./css.md).

## Tiers and collections

Tier 1 is Core (raw values, `:root`). Tier 2 is Theme (meaning and modes). Tier 3 is Component (`--cck-<block>-*`): a `<Name> / Size` collection when the component has sizes and one `<Name> / Structure` collection per component (see below).

| Collection                                                         | Tier | Modes                                                    |
| ------------------------------------------------------------------ | ---- | -------------------------------------------------------- |
| Core / Color, Core / Size, Core / Typography                       | 1    | Default                                                  |
| Theme / Brand (variable prefix `ramp`)                             | 2    | Dahlia                                                   |
| Theme / Color                                                      | 2    | Light, Dark                                              |
| Theme / Active Color                                               | 2    | brand, neutral, info, success, warning, danger, contrast |
| Theme / Typography, Spacing, Radius, Border Width, Opacity, Shadow | 2    | Classic, Normal, Default, Default, Default, Default      |

## Naming

- `--cck-{collection prefix-}{token name}`, with `/` and spaces turned into `-`: `--cck-brand-color`, `--cck-radius-md`, `--cck-font-weight-medium`, `--cck-violet-600`, `--cck-ramp-brand-base`.
- The prefix `cck` is `$meta.globalPrefix` in the JSON and nowhere else. Other themes choose their own.

## JSON format

- A collection has `name`, `tier`, optional `prefix`, `defaultMode`, `modes` and `tokens`, and no other field. The token JSON holds only what the CSS and the TypeScript exports need; what a consumer shows of a collection belongs to that consumer's own config.
- `modeCollections` has one entry per Theme collection and per Component collection except Structure, in file order: the collection name, the attribute its selectors use (`attrName`, without `data-`), the `componentName` of a Component collection (so `Button / Size` and `Form Field / Size` may both use `size`), the modes (name, and value: the slug of the name) and the default mode name. Core and Structure have no attribute, so they have no entry.
- A token has `name`, `type` (`color`, `number` or `string`), `unit` (required on `number`: `px`, `rem`, `em`, `%`, `unitless`), and `valuesByMode`.
- A value is a literal or an alias `{Collection name#token name}`, for example `{Core / Size#size-16}`. The emitter turns an alias into `var(--…)` and never resolves it.
- Font families are plain `string` values with their fallback stack.

## Modes and attributes

- Bare `[data-cck-<axis>]` selectors are allowed only in the generated token file: they are global markers that hold only custom properties and are meant to be inherited. Component CSS stays class-qualified.
- Each Theme collection emits one block per mode on `[data-cck-<axis>="<mode slug>"]`; its default mode also sits on `:root`. The value is the lowercase slug of the mode name, and selectors are case-sensitive. Shipped values: `color-mode`: `light`, `dark`; `brand`: `dahlia`; `typography`: `classic`; `spacing`: `normal`; `radius`, `border-width`, `opacity`, `shadow`: `default`.
- Active Color has no `:root` fallback: `[data-cck-color="<family>"]` applies only where set, and a component sets it from its `color` option.
- A `data-cck-color` marker resolves against the color mode in effect where it is set. A color-mode switch below it needs its own `data-cck-color` marker.
- Theme scope is resolved per axis: for each attribute, the nearest ancestor that has it, else the `:root` default.
- A portal host must carry, for every axis, the trigger's effective mode, resolved up the trigger's ancestor chain, not only the attributes of the nearest marked element. The cdk `portal` module does this: its host copies `dir` and, for every page collection the theme lists in `ThemeConfig.modeCollections`, the `data-<axis>` attribute of the trigger's closest ancestor that has it, and follows changes while the overlay is open. An axis no ancestor sets is absent on the host, so the `:root` default applies.

## Build errors

The `tokens` target fails with the collection and token named when:

1. An alias points to a collection or token that does not exist.
2. A token's `valuesByMode` keys differ from its collection's `modes`.
3. Two tokens make the same variable name.
4. A `number` token has no unit or an unknown one.
5. A token at `:root` aliases a token of another multi-mode collection (it would ignore nested mode markers).
6. A collection has a field that is not in [JSON format](#json-format); the error names the field.
7. A collection's `defaultMode` is not one of its `modes`.
8. Two Theme collections, or two Component collections of one component, make the same mode attribute.

## Component tier (Tier 3)

- `Button / Size` (modes `sm`, `md`, `lg`) emits `.cck-button[data-size="sm"]` and so on; its default mode also sits on `.cck-button`. `Button / Structure` emits `.cck-button`. Tier 3 is never at `:root`.
- `Form Field / Size` (modes `sm`, `md`, `lg`, heights `size-32`, `size-40`, `size-48` as the Button) is emitted on the field root and inherited by its input wrapper, which carries `data-size` too. `Form Field / Structure` holds the box of an input wrapper that holds an Input (radius, border, background, state colors, focus ring). `Input / Structure` is the same box for a standalone Input, always the `md` size, and its text colors. `Form Field / Size` also holds the `padding-block` of a Textarea in the box, and `Form Field / Structure` the `zone-gap` between neighbours and the Prefix and Suffix text colors. `Textarea / Structure` is the box for a standalone Textarea (the Input's roles, plus a `padding-block`), always `md`. `Field Error / Structure` holds the FieldError text style and color (`danger/text`). `Label / Structure` holds the required marker color and gap. No token is named `min-rows` or `max-rows`: `--cck-textarea-min-rows` and `--cck-textarea-max-rows` are author-set custom properties ([css.md](./css.md#textarea-custom-properties)).
- `Checkbox / Size`, `Switch / Size` and `Radio / Size` (modes `sm`, `md`, `lg`) are emitted on the control root (`.cck-checkbox[data-size="sm"]`, default on `.cck-checkbox`). They hold the box (16, 20, 24px) or the track and thumb, the hit area (`hit-size`: 24, 24, 28px, never under 24 by 24 CSS px), the hover halo and the label text style. They are their own collections and do not follow the Form Field size. The token prefix names the part it styles: `box-*` is the `background` part (the Checkbox and Radio box), `hit-*` the `input-wrapper` (the Switch `track`), `halo-*` the `backdrop`, `track-*` the Switch pill drawn on the `track`, `thumb-*` the `thumb` and `label-*` the `label`. Their `Structure` collections name tokens by part and property (`box-border-color`, `track-checked-bg`, `thumb-disabled-color`, `label-text-color`) and read the Active Color tokens for the checked fill (`color`), the mark (`on-color`), the checked border (`edge`) and the halo (`container`). `motion-duration` is a string token (`150ms`).
- `Tabs / Size` (modes `sm`, `md`, `lg`) is emitted on the Tabs root (`.cck-tabs[data-size="sm"]`, default on `.cck-tabs`) and inherited by the list and the triggers. It holds the trigger height (`size-32`, `size-36`, `size-40`), the trigger inline padding and the label text style. `Tabs / Structure` holds the list chrome (`list-*`, `line-*`), the indicator (`indicator-bg`, `indicator-label-color`, `indicator-line-*`, from the Active Color tokens), the label colors and the focus ring. `motion-duration` is a string token. The two Tabs collections are also emitted for the TabNav root (`.cck-tab-nav`, the collection field `alsoFor`) with the same variables, so TabNav has no tokens of its own and reads `--cck-tabs-*`.
- `Radio Group / Structure` (prefix `radio-group`) holds the `gap` between stacked radios and the `inline-gap` between radios in a row. No Size collection: the radios keep their own.
- `Popover__content / Structure` (prefix `popover`) holds the content surface (`bg`, `text-color`, `border-*`, `radius`, `shadow`, `padding`, `gap`), the `side-offset` and `max-inline-size`, the arrow (`arrow-bg`, the content's surface; `arrow-width`, `arrow-height`), the text style, the Title (`title-*`) and Description (`description-color`) styles, the focus ring, the Close button (`close-*`) and the motion (`motion-duration`, `motion-distance`). It has no Size collection. The collection is named after the class `.cck-popover__content`, because that is where the tokens must be emitted: the Popover root renders no element, and the content is portaled out of any block. A part that lives in an overlay names its Structure collection `<Block>__<part>` the same way.
- `Select / Size` (prefix `select`, modes `sm`, `md`, `lg`) holds the trigger's height, inline padding and text style. `Select / Structure` holds the trigger box (`radius`, `border-*`, `bg`, `text-color`, `placeholder-color`, the chevron `icon-*`, the read-only, disabled and focus looks) and `min-inline-size`. `Select__content / Structure` holds the list (`content-*`: surface, border, radius, shadow, padding, `content-side-offset`, text style, motion), the options (`option-*`), the indicator (`indicator-*`) the group label (`group-label-*`) and the separator (it reads `content-border-*` and `option-padding-block`; it has no token of its own); it is named after `.cck-select__content` for the reason the Popover collection is, and its token names carry the `content-` prefix so the three collections repeat no name. The max height of the list is not a token: it is the documented custom property `--cck-select-content-max-height` ([css.md](./css.md#select-custom-properties)).
- `Tooltip__content / Structure` (prefix `tooltip`) holds the bubble (`bg`, `text-color`, `radius`, `shadow`, `padding-inline`, `padding-block`), the `side-offset` and `max-inline-size`, the arrow (`arrow-bg`, the bubble's fill; `arrow-width`, `arrow-height`), the text style and the motion. It is named after `.cck-tooltip__content` for the reason the Popover collection is.
- `Dialog__content / Structure` (prefix `dialog`) is named and emitted like the Popover one, on `.cck-dialog__content`, because the Dialog root renders no element and the content is portaled. It holds the content surface, the `viewport-margin` and `max-inline-size`, the `backdrop-bg` read by `::backdrop` (a pseudo-element inherits the tokens of its element), the text style, the Title (`title-*`) and Description (`description-color`) styles, the focus ring, the Close button (`close-*`) and the motion. It has no Size collection.
- `Accordion / Size` (prefix `accordion`, modes `sm`, `md`) is emitted on the Accordion root and inherited by the items. It holds the trigger height (`size-32`, `size-40`), the inline padding (also the content's), the `content-padding-block-end` and the text style. `Accordion / Structure` holds the item chrome (`gap`, `radius`, `border-*`, `bg`), the trigger and content colors, the chevron (`icon-size`, `icon-width`), the focus ring and `motion-duration`. The size variable `--accordion-content-height` is written by the base, not a token.
- The `Theme / Active Color` token `edge` is backed by `<family>/edge` in `Theme / Color`. Which families take the fill and which take `on-container` is in [css.md](./css.md#checkbox-switch-and-radio).
- The `tokens` target lists the files in `input` and merges them before checking aliases; every file has the same `$meta.globalPrefix`.

## Follow

- Edit the JSON, then run the `tokens` target. Check the generated file.
- Give a new Theme token a value in every mode of its collection.
- Keep one token object per line.
- Name a token by its role (`surface/2`), not by its look or mode.

## Anti-patterns

- A mode name (`light`, `dark`) in a token name.
- A hex value or a literal size in a Theme token that a Core token already holds.
- Resolving an alias in the emitter or the CSS instead of using `var()`.
