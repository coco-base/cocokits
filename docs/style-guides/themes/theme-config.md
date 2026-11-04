# ThemeConfig

The executable schema of a theme's visual options. It is the single source for the theme layer's types. Behaviour, icons and templates are not in it.

## Concept

Per component, a theme lists the options it supports. Each option has:

- `attrName`: the rendered attribute, `data-<attrName>`. A reserved base `data-*` name (for example `disabled`, `selected`, `orientation`, `state`) cannot be reused; the type rejects it.
- `values`: the allowed values (literal unions, so types stay precise).
- `default`: one of `values`, or `null` to render no attribute unless an option is given.
- `partNames`: the names of the anatomy parts that render the attribute (`root` if omitted).
- `description`.

A config may also carry `modeCollections`, the theme's modes index (see [Values from token collections](#values-from-token-collections)). The portal host of an overlay reads it to copy the page-wide mode attributes (the collections without a `componentName`) from the trigger's ancestors; a theme without it mirrors no modes. cocokits sets it from its generated index; frames-x sets an empty list.

`size`, `variant` and `color` are the common option names; a theme may add its own (for example `rounded`). Booleans are only for true two-state options and render as presence attributes (`data-rounded=""`, absent when false). A component missing from the config is not supported by the theme; `{}` means supported with no options.

The types, `defineThemeConfig` and `resolveThemeAttrs` belong in `@cocokits/shared`, and each theme exports one instance from the root of `@cocokits/theme-<name>`. This is the intended shape; the exact types are fixed when they are implemented.

## Example (illustrative)

```ts
export const exampleThemeConfig = defineThemeConfig({
  name: 'example',
  components: {
    switch: {
      size: { attrName: 'size', values: ['sm', 'md', 'lg'], default: 'md', partNames: ['root', 'thumb'], description: 'Track and thumb size.' },
    },
    iconButton: {
      rounded: { attrName: 'rounded', values: [true, false], default: false, description: 'Fully rounded corners.' },
    },
    separator: {},
  },
});
```

An option with `partNames: ['root', 'thumb']` lands on both parts, including parts a framework renders internally.

## Precedence

For every option whose `partNames` include the part, the value is, in order:

1. the component's own option (the typed prop or input on the theme layer);
2. the nearest theme provider's override for that component;
3. the config `default`.

`null` at any level renders no attribute; an unknown value is a type error. The theme layer renders the result as `data-*` attributes; it never adds classes and never changes behaviour. See [theme-layer-per-framework](./theme-layer-per-framework.md) for how the values reach the parts.

## Types in the theme layer

- Each framework layer derives literal unions from the config, for example `(typeof exampleThemeConfig)['components']['switch']['size']['values'][number]`.
- A component without `size` in the config gets no `size` prop. Theme-only options are named typed props. There is no untyped `additional` record and no global type registration. Never widen a union to `string`.

## Values from token collections

- An option whose values a multi-mode token collection defines (for example the Active Color families, or a component's `Size` modes) takes `values` and `default` from the exports that the `tokens` target generates from the token JSON: `<collectionName>Modes`, `<CollectionName>Mode` and `<collectionName>DefaultMode` (`themeActiveColorModes`, `buttonSizeModes`). Never copy such a list or default by hand, and never read the JSON at runtime.
- Exception: a component may choose its own default from the collection, typed by the generated `<CollectionName>Mode` (for example `const BADGE_DEFAULT_COLOR: ThemeActiveColorMode = 'contrast'`); it never copies the collection's default by hand.
- A component that needs only some of a shared collection narrows it with `pickModes` or `omitModes` (`src/narrow-modes.ts` in the theme package); a default outside the result is a type error.
- Only an option with no collection (for example `variant`) is written by hand.
- The same file exports the modes index `modeCollections` (`ModeCollection[]` from `@cocokits/shared`): one entry per collection that has a mode attribute, with the collection name, the attribute name without `data-` (`attrName`), a component collection's `componentName`, the modes (name and attribute value) and the default mode name. The executor makes `attrName` and the values with the code that writes the selectors, so the naming exists once. The theme's `src/index.ts` re-exports it, and `theme-<name>:docs-data` reads it from the built entry. It holds no field for a consumer such as the docs site; a consumer keeps its own settings (for example which collections are page modes) in its own config, by collection name.

## Not in the schema

- No author-set lengths such as an offset or a radius: those are [documented custom properties](./css-conventions.md#documented-custom-properties), not options.
- No behavioural defaults (`loop`, `closeOnSelect` and similar are base props; a theme cannot set them).
- No icons or templates: those come from the theme layer through the fw-core theme runtime, never from machines.

Why: [themes](../../why/themes.md).

## Adding a value (example)

Adding `xl` to an option: if a token collection defines the values (a size), add the mode to that collection and run the `tokens` target, which regenerates the list; otherwise add it to `values`. Then add the tokens and CSS for `[data-size='xl']` on every part in `partNames`.
