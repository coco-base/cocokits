# Testing Angular components

Angular-specific spec and harness conventions. Test structure and what each kind covers: [testing](../testing/index.md) and [architecture](../../architecture.md#9-tests-and-quality-gates). Tests run with the package's `test` target (Vitest), see [targets.md](../workspace/targets.md). Names below are examples.

## Setup

- Zoneless TestBed (no `provideZoneChangeDetection`).
- After a state change: `await fixture.whenStable()`. Do not loop `fixture.detectChanges()` or call `markForCheck`.
- `@testing-library/angular` and `@testing-library/user-event` for rendering and interaction; add an axe matcher where accessibility is asserted. Add these dev dependencies to the package when the first test needs them.
- Drive with `user.click` / `user.keyboard` / `user.tab`, not by calling methods.
- The setup is the Analog Vitest plugin (`@analogjs/vite-plugin-angular`, which needs `@angular/build`), `jsdom`, and a `tests/setup.ts` that calls `setupTestBed()` from `@analogjs/vitest-angular/setup-testbed`. Both Angular packages (`angular`, `angular-core`) use it.
- SSR tests: a file with `// @vitest-environment node` renders with `renderApplication` and `provideServerRendering()`, so any `window` access fails. Call `destroyPlatform()` first (the TestBed platform would be reused) and set `ngDevMode = false` for the render (the dev-mode renderer reads `document`). Hydration tests render on the server in a jsdom file, restore the DOM globals that the server platform overwrites, mount the markup and bootstrap with `provideClientHydration()`. The working example is `packages/angular/button/tests/fixtures.ts`.

## What a component's tests cover

What every component covers is in [component-tests](../testing/component-tests.md). Angular adds:

1. RTL through `[cckDir]` (or `provideCckDirection('rtl')`) from `@cocokits/angular-core`; generated ids never contain item values.
2. Disabled and read-only behaviour: no state change, `data-disabled` / `data-readonly`, native `disabled`, read-only stays focusable.
3. Two-way, one-way seed and unbound modes; change-detail reasons.
4. Forms in two groups ([forms](./forms.md)): model integration (`[formField]`) and native participation (real `<form>` submit, reset, `required`).
5. axe: no violations; on `document.body` for overlays.
6. SSR: a smoke test per entry point that renders on the server and asserts markup (including the hidden input when `name` is set) and no `window` access.
7. Compound components: children added, removed or reordered by `@if` / `@for` (keyed reorder included) update the rendered parts in DOM order.
8. Overlays ([overlays](./overlays.md)): query via `screen`; `aria-controls` only while mounted.
9. Theming: with a theme provided, parts carry the theme attributes (including internally rendered parts); without one, none.

## Example spec (illustrative)

```ts
@Component({
  imports: [CckExampleImports],
  template: `<label for="s">Wi-Fi</label>
    <button id="s" cckExample [(checked)]="on" [disabled]="disabled()"></button>`,
})
class Host { readonly on = signal(false); readonly disabled = signal(false); }

describe('CckExample', () => {
  it('reflects parent writes', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.on.set(true);
    await fixture.whenStable();
    expect(screen.getByRole('switch')).toHaveAttribute('data-checked', '');
  });
});
```

## Harnesses

A component may ship a CDK test harness in its `testing` entry point (`@cocokits/angular/<name>/testing`, created by the `angular-testing` kind of the library generator), never in the runtime entry, because it depends on `@angular/cdk/testing`. `@angular/cdk` is an optional peer of `@cocokits/angular`, added by the generator, and only files under `*/testing` import it.

- `static hostSelector` uses the fixed `cck-` class, never the directive attribute, so it works for themed, `hostDirectives`-wrapped and user-authored variants. Base parts only, not per theme.
- The harness file is `<name>-harness.ts` (one file per class when an entry has several, such as `select-option-harness.ts`), with its spec in `testing/tests/`.
- Filters extend `BaseHarnessFilters`; `static with(options)` builds a `HarnessPredicate`.
- Methods are async, task-oriented verbs (`check`, `select`, `isDisabled`, `focus`). Never expose `TestElement`. Read state from ARIA / DOM, not component internals.
- Overlay harnesses locate content with `this.documentRootLocatorFactory()`.

Test a harness with `TestbedHarnessEnvironment.loader(fixture).getHarness(...)`, then drive and assert.
