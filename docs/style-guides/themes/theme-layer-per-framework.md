# Theme layer per framework

The thin typed code that turns a theme's options into `data-*` attributes on the base parts. The rule is stated in [architecture.md](../../architecture.md) (section 4); this file is the owner of the authoring details shared by all frameworks. This file does not fix the names of the fw-core theme runtime; the code below is illustrative.

## Packages

One theme is a framework-free package plus one package per framework. A framework package depends on the framework-free package and on `@cocokits/<fw>-core`, never on another framework's package. The theme layers are scaffolded with the `library` generator and written by hand.

## Names

The Angular directive is `Cck<Name>Theme` (`CckButtonTheme`). The React and Vue wrapper has the base component's name (`Button`). Both are root exports of `@cocokits/theme-<name>-<fw>`. The story compiler relies on these names to import a themed component.

## How parts get their attributes

- Base parts, the runtime and precedence: [architecture.md](../../architecture.md) (section 4). The runtime resolves the attributes from the `ThemeConfig` of the nearest provider and the options a theme layer provided for that component, and reaches parts a component renders internally (focus guards, generated triggers). It never throws for a missing provider. Resolution is pure, so the server and the first client render match.
- The theme layer supplies the typed options of one component instance to the runtime and forwards everything else unchanged: props, refs, events, models, slots and children. Boolean and model props default to `undefined` so the base decides.
- The theme layer adds no behaviour, ARIA or extra DOM (no handlers, no `loopFocus`). Overlay parts are portaled by the base; the theme layer adds no portal, container or scope wrapper.

## Angular: directive on the same element

The theme is a directive on the same element as the base (same selector, or attaching the base through `hostDirectives`). Importing it adds typed inputs to that element and provides the options to the runtime (`provideThemeOptions`; signal handling: [signals-and-inputs](../angular/signals-and-inputs.md#reactivity)). Never a wrapper component that renders the base in its template, never `extends` a base class, never `[class]` / `ngClass` for options.

```ts
// Illustrative
@Directive({ selector: 'button[cckSwitch]' })
export class ExampleSwitchTheme {
  readonly size = input<ExampleSwitchSize | null>();
}
```

## React and Vue: wrapper

The theme component wraps the base ([architecture](../../architecture.md), section 4) and forwards everything else.

```tsx
// Illustrative (React)
export function Switch({ size, children, ...props }: SwitchProps) {
  return (
    <ThemeOptions componentName="switch" options={{ size }}>
      <Base.Root {...props}>{children}</Base.Root>
    </ThemeOptions>
  );
}
```

The wrapper lives in `packages/themes/<name>/<fw>/`, never inside the framework package ([react](../react/theming.md), [vue](../vue/theming.md)). In Vue the wrapper is an SFC that forwards props, emits and slots to the base parts and provides the options to the runtime. In Next.js the wrapper carries `'use client'` like any client component.

## Tests

A theme-layer test per framework checks, with `it.each` over the config values, that each option's `data-*` lands on the right parts; that behaviour is unchanged (the wrapper forwards the value binding); that an unthemed base renders no theme `data-*`; and that the nearest provider's override wins. Conventions: [testing](../testing/index.md).
