# Component tests

One framework component rendered in a DOM. They live in the framework package and run with that package's `test` target (Vitest, `pnpm nx run <project>:test`, [targets.md](../workspace/targets.md)). Which behaviour a component must have comes from its approved requirements; these tests check that the implementation renders that one contract in each framework. Components named here are examples.

## Setup

- Use the framework's testing library for rendering and a user-event library for interaction; both are added to the package that needs them. After a state change wait for the framework to settle (Angular `fixture.whenStable()`, Vue `nextTick()`, awaiting the user action in React).
- Render with the framework's strict settings where they exist (for example React StrictMode, Angular zoneless).
- Fixed time zone and locale; disable animations (fake timers: [testing](./index.md)).
- Write only tests the package's `test` target can run (Vitest, Node environment, `**/*.test.ts(x)`). A test that needs a DOM environment or a renderer library needs that dependency and configuration added to the package first, in the same change.
- Fixtures are render functions or templates inside the test file.

## Queries

- By role and accessible name: `getByRole('tab', { name: 'Account' })`.
- By part class only when the part has no role, or in anatomy tests.
- Never `data-part`; `data-testid` only on test containers, not on parts.
- Open overlays are portaled outside the component root: query from the document (`screen`), not from the root element.

## What to cover

Cover what applies to the component:

1. **Rendered contract**: the element per part, focus and ref target, each part's class, the declared `data-*` for each state, roles and ARIA links (`aria-controls` and `id`, `aria-labelledby`), as the component's requirements state. An attribute the component renders but does not declare is a failure.
2. **Bindings**: controlled, uncontrolled and initial-value use in the framework's idiom, with `null` kept as "nothing selected" ([architecture.md](../../architecture.md) section 6); change callbacks per [architecture.md](../../architecture.md) section 6 (never when props sync); a parent that ignores a change keeps the controlled value.
3. **Keyboard and focus**: every documented key, including RTL and orientation variants where the pattern supports them, exactly one tab stop for composites (when the selected item is removed or disabled the tab stop moves to the first enabled item and the selection is unchanged; [cdk-modules](../framework-agnostic/cdk-modules.md)), and focus movement and return for overlays ([accessibility](../accessibility/index.md)).
4. **Forms**, for form-capable components, against a real `<form>` with a submit button: the value appears in `FormData` after a real submit and is absent when disabled; native `input` / `change` events fire on user interaction and not on prop sync; the `form` attribute and disabled `fieldset` work; `required` blocks submit and validation focuses the visible control; `form.reset()` restores the default value. In Angular, also the Signal Forms integration.
5. **Consumer veto**: a user handler calling `preventDefault()` stops the built-in behaviour.
6. **Polymorphism and refs**: the framework's mechanism (React `render` prop, Vue `asChild`, Angular attribute selectors) keeps props, handlers and the part class, and refs reach the DOM node.
7. **Compound components**: children register and unregister when added, removed or reordered at runtime and the rendered order and tab stop follow; generated ids differ for values that differ only in whitespace or punctuation; every part is present in server output; a part used outside its root throws the documented error.
8. **Theme layer**: each theme option lands as its `data-*` on the right parts, behaviour is unchanged, and an unthemed base renders no theme `data-*`. These tests live with the theme package ([themes](../themes/theme-layer-per-framework.md)).
9. **Cleanup**: listeners and observers are removed on unmount; React StrictMode keeps state and leaves no duplicate listeners.
10. **Accessibility checks**: see [accessibility-checks](./accessibility-checks.md); add them when the package has the tooling, and do not describe a check as run if it was not.
11. **Overlays**: the overlay tests in [overlays-and-positioning](../framework-agnostic/overlays-and-positioning.md#rules-for-every-framework-adapter).

## Server render and hydration

Every framework (Angular, React, Vue) has a server render test and a hydration test for its components; only React also has an import-safety test. This is the test invariant that backs the SSR rules in [architecture.md](../../architecture.md).

- Render the component to a string with the framework's server renderer (Angular `renderApplication` with server rendering, React `renderToString`, Vue `renderToString` over an SSR app).
- Hydrate the server HTML on the client with the framework's hydration API and assert there are no hydration warnings or errors (spy on `console.error` / `console.warn`), the markup equals the first client render, and a user interaction after hydration changes `data-*` as expected.
- Assert on the server HTML: every part is present with its class, ARIA and ids; compound components render every trigger and panel, and the selected or active state the spec names is already in the server HTML in every framework; a closed overlay renders nothing and no `aria-controls` points at missing content.
- Ids come from the framework's SSR-stable generator, not a module counter; no `typeof window` branches in templates.
- For React, also assert that component entries keep the `'use client'` directive in the build output when that is relevant to the change; plain Node cannot prove React Server Component compatibility.
- React and its theme layer: one test per package imports every entry point under the `react-server` condition and renders each namespace part from a server module. Plain Node and `renderToString` do not prove this. Run it with the target [targets.md](../workspace/targets.md) lists for it; if none is listed, report `not available`, which is never evidence that the requirement passed.
- React only: import safety. Importing each React entry point in plain Node, without `window` or `document`, does not throw and has no side effects. Angular and Vue have no such test; their server render and hydration tests cover it.

## Test-writing rules

- Assert the precondition before acting.
- Never weaken an assertion to make it pass; fix the component.
- One assertion per `waitFor`, and no negative assertions inside it; prefer `findBy*`.
- Snapshot only small static artefacts (for example an export list), never `connect()` or machine output.
- Assert state as `data-*` (`toHaveAttribute('data-selected')`), never as a modifier class; presence booleans are present or absent, never `"false"`.
- Interact the way a user does (real key and pointer sequences), not by dispatching synthetic events or calling internal setters, except for events the library cannot produce.
