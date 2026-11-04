# Components, selectors and DI

How a part is declared: directive vs component, selector choice, decorator metadata, config tokens and DI scope. Names below are examples.

## Directive on the user's element

- Implement each anatomy part as a standalone `@Directive` placed on the user's element, with an attribute selector (`[cckExample]`). A part whose role has a native element ([architecture §5](../../architecture.md#5-selectors-and-component-shape-angular-compound-components-all-frameworks): trigger, form value, modal) fixes that tag (`button[cckExample]`, as the Button does). A wrapper tag that renders a native control inside breaks label association, `type`/`name`/`form`, user ARIA and CSS, and the shared rendered contract. Why: [rendered contract](../../why/rendered-contract.md).
- Use `@Component` only when the part renders DOM the user cannot supply; it still takes an attribute selector. Components ship no styles (`encapsulation: ViewEncapsulation.None`).
- Each part must work as a `hostDirective`, so it must not depend on its own selector attribute being present.
- Directives of one component that share inputs, host bindings or setup (`CckButton` and `CckButtonAnchor`) extend one abstract base `@Directive()` without a selector (naming: [architecture §10](../../architecture.md#10-simplicity-and-reuse) item 4), which declares them once; Angular inherits its inputs, `host` and fields. Do not share them through a setup function: each class would still declare the inputs and host bindings. Only sibling directives of one component share a base, or components that implement one control contract on different native elements (`CckTextControlBase` for `CckInput` and `CckTextarea`); such a base is exported from the first component's entry and marked not for direct use. The part of every form control that does not depend on its model (the Signal Forms state inputs, touched/dirty/submitted, the FormField report, the tracking of a forms library) is one abstract base, `CckFormControlBase`, in its own entry ([packages and entry points](../workspace/packages-and-entry-points.md)); the text and checked bases extend it. Why: [simplicity and reuse](../../why/simplicity.md#simplicity-and-reuse). A helper that several components use stays a function in `@cocokits/angular-core` (`themeAttrs`). A theme directive never extends ([theme-layer-per-framework](../themes/theme-layer-per-framework.md#angular-directive-on-the-same-element)).

## Selector decision rule

The selector rule (attribute only; a tag only when the behaviour contract requires a native element) is in [architecture](../../architecture.md#5-selectors-and-component-shape-angular-compound-components-all-frameworks); this adds the Angular-only cases.

| Situation | Selector | Example |
|---|---|---|
| Template slot | `ng-template[cckXSlot]` | `ng-template[cckExampleLabel]` |
| Theme directive (`@cocokits/theme-<name>-angular`) | same selector as its root part | `[cckExample]` |
| A part whose default element matters to docs | attribute selector; the meta's `defaultElements` names the element | `<span cckExample>` |

Attribute names are camelCase with the `cck` prefix.

## Decorator metadata

- Do not write `standalone: true` or `changeDetection` (both are the defaults).
- Use the `host` object; no `@HostBinding` / `@HostListener`.
- Set `exportAs: 'cckX'` on every part so templates can reference it (`#ex="cckExample"`). Public methods meant for templates carry TSDoc.
- No `CommonModule`, `ngClass`, `ngStyle`, `*ngIf` / `*ngFor`. Import only what the template uses; use `@if` / `@for` (with `track`) / `@switch` and `@let`.
- Use `inject()` everywhere; no constructor injection.

## Config tokens

Config sets behavioural defaults that inputs override. Visual defaults belong to the theme ([theming](./theming.md)). A tree-shakable `InjectionToken` with a `factory` default and a `provideCckXConfig()` function that merges over the parent config is enough.

```ts
// Example (illustrative)
export const CCK_EXAMPLE_CONFIG = new InjectionToken<CckExampleConfig>('CCK_EXAMPLE_CONFIG', {
  factory: () => DEFAULTS,
});

export function provideCckExampleConfig(exampleConfig: Partial<CckExampleConfig>): FactoryProvider {
  return {
    provide: CCK_EXAMPLE_CONFIG,
    useFactory: () => ({ ...inject(CCK_EXAMPLE_CONFIG, { skipSelf: true }), ...exampleConfig }),
  };
}
```

## DI rules

- A child that needs its parent's configuration injects the parent class: `inject(ParentComponent, { optional: true })`, and reads its signals. A token (`providers: [{ provide: CCK_EXAMPLE, useExisting: CckExample }]`) is the exception, used only where injecting the class would make a circular import or the parent must be substitutable. A comment records the reason.
- Wrap the lookup in an `injectCckX(partName)` function that throws a clear message ("`<part>` must be placed inside `<root>`") instead of a bare NG0201.
- A token uses `providers` when projected content must see it; `viewProviders` only for the component's own template.
- `{ self: true }` to read a sibling directive on the same host; `{ skipSelf: true }` for nested config merging and nested-instance detection.
- Do not provide a token in `root`.
