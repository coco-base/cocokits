# Element override: the `render` prop

One mechanism replaces a part's element: `render`. No `asChild`, no `as`, no generic polymorphism.

- Every part accepts `render?: RenderProp<State>` = `ReactElement | ((props, state) => ReactElement)` and passes it to the shared render helper ([internals.md](./internals.md)).
- A part whose element is fixed by its behaviour contract takes no `render`: the Label is always a native `label`.
- Function form: receives the merged props including `ref` and MUST spread them all onto one element.
- Do not add `asChild`, `as` or a generic `component` prop: they cannot type-check the child, break on fragments and lazy children, and are expensive for the checker. The element type stays fixed in the props type (`ComponentPropsWithRef<'button'>`).
- Interactive parts with a non-native replacement (a `<div>` or `<a>` instead of the native `<button>`): the part takes `nativeButton` (default `true`). With `nativeButton={false}` it renders no `type` and follows Base UI's `useButton`: `role="button"` and `tabIndex` 0 (the Tabs Trigger keeps `role="tab"` and its roving `tabIndex`), Enter activates on keydown by clicking the element, Space is kept from scrolling on keydown and activates on keyup, and an `<a href>` keeps the browser's own Enter. A consumer `preventDefault()` on the keydown or keyup vetoes. A disabled non-native Tabs Trigger gets `aria-disabled="true"` instead of `disabled` and ignores activation. The shared helper is `internal/button-kind.ts`. The TSDoc of `render` says so.
- **Tooltip Trigger:** nothing to activate, so `nativeButton={false}` renders `tabIndex` 0 only (no role, no keys). `type="button"` is rendered only while `nativeButton` is `true`.
- A part learns that its rendered element is not a `<button>` from the prop `nativeButton` (Base UI; default `true`), never by inspecting the element. In development, every button-default part (Dialog and Popover Trigger and Close, Tooltip Trigger, Tabs Trigger, Button) logs a `CocoKits:` error naming the part after mount when the rendered tag does not match: `nativeButton` is `true` and the tag is not `<button>`, or it is `false` and the tag is `<button>`.
- **Exception, the Button:** a non-button replacement is a link. `render` with `nativeButton={false}` means a link (`<a>` or a link component that renders one), with no `role`, no `tabIndex` 0 and no Space handling, and the disabled-link guard of the machine, which runs in the capture phase; the non-native policy bullet (`tabIndex` 0, Space and Enter handling, the kept role) does not apply to it. `render={<button />}` with `nativeButton` left `true` stays a button (why: [rendered contract](../../why/rendered-contract.md)).
- The `state` passed to the function form is the part's public state (for example `{ selected, disabled }`), exported as a named type.

Example (illustrative):

```tsx
<Tabs.Trigger value="docs" render={(props, { selected }) => <a {...props} href="/docs" aria-current={selected ? 'page' : undefined} />} />
```

Tests for every part: the ref reaches the rendered element, `className` merges with the fixed class, the user handler runs first and can veto, both `render` forms keep all props; for interactive parts also the non-button keyboard and disabled policy ([testing.md](./testing.md)).
