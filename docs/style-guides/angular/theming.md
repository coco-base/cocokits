# Theming: same-element theme directive and part attributes

How visual options (size, variant, color, theme-only options) reach an Angular component. Why: [themes](../../why/themes.md). The theme layer, `ThemeConfig` and precedence are in [architecture](../../architecture.md); theme CSS and config rules are in [themes](../themes/index.md). The fw-core theme runtime is the theme support in `@cocokits/angular-core`; its TSDoc is the API reference, and component names below are illustrative.

## Two halves

| Half | Lives in | Does |
|---|---|---|
| **Base parts** (`@cocokits/angular/<name>`) | Base entry point | Each part reads the theme attributes that apply to it from the fw-core theme runtime and renders them as `data-*`. The result without a theme provider is in [architecture §4](../../architecture.md#4-theme-configuration-size-variant-color-theme-only-options). This is the only theme-related code in a base package. |
| **Theme directive** (`@cocokits/theme-<name>-angular`) | Theme package, written by hand | Same selector as the root part (an attribute selector on the author's element); adds the theme's typed inputs (`size`, `variant`, `color`, theme-only options) and provides their values to the base parts through the fw-core theme runtime. Renders nothing itself. |

Base parts never take a `theme` input. Option values flow from the root element's injector, so child parts and parts a component renders internally see the root's options. Attributes land on the parts the `ThemeConfig` names for that option; a `null` option value removes the attribute.

Runtime responsibilities:

- Provide the executable `ThemeConfig` for the app or a subtree; nested providers override for their subtree, and a missing provider means "unthemed", never an error.
- Let a theme directive provide its option values on the root element's injector: `provideThemeOptions(componentName, themeDirective, resolveOptions)`. Signal handling: [signals-and-inputs](./signals-and-inputs.md#reactivity).
- `themeAttrs(anatomy)` returns a signal of the `data-*` record of every part. The root part is the host element: the call applies the `root` record to it, the documented exception to "no `setAttribute`" (`Renderer2` in an effect). A part a template renders binds its record ([architecture §10](../../architecture.md#10-simplicity-and-reuse), item 7). A part that is its own directive on the author's element (a compound part other than the root) reads the record of its anatomy part from the root's `themeAttrs` and applies it with `bindAttrs(element, () => record)`; a root that renders no element (`<ng-container>`) has no record to apply, and `themeAttrs` skips it.

## Example: base part and theme directive (illustrative)

```ts
// One call per component, with the anatomy only. The root record lands on the host.
protected readonly themeAttrs = themeAttrs(exampleAnatomy);

// Internally rendered part: its record bound with the cckAttrs directive (angular-core)
// <button [class]="triggerProps().class" [cckAttrs]="themeAttrs().trigger" …>
```

```ts
// Theme directive in @cocokits/theme-<name>-angular
@Directive({
  selector: '[cckExample]',
  providers: [
    provideThemeOptions(
      'example',
      forwardRef(() => ExampleTheme),
      (theme: ExampleTheme) => ({ size: theme.size, color: theme.color }),
    ),
  ],
})
export class ExampleTheme {
  /** Theme size; allowed values come from the theme's ThemeConfig. */
  readonly size = input<ExampleSize | null>();
  readonly color = input<ExampleColor | null>();
}
```

## Rules

- The theme directive uses the root part's selector. A theme that wants its own selector may use `hostDirectives` and must list every input and output it re-exposes.
- A theme directive never binds `data-*` itself; the base parts do. The no-wrapper, no-behaviour rule is in [theme-layer-per-framework](../themes/theme-layer-per-framework.md).
- One component imports the theme directives of one theme; two theme directives with the same selector on one element is a configuration error.
- Typed unions come from the theme package's own types; there is no global type registry.
- Theme directives live in `@cocokits/theme-<name>-angular`, never in a base entry point or in the base `imports` tuple.
