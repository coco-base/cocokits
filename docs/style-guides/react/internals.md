# Shared internal helpers

Rules for the small React-specific helpers that parts share (`packages/react/src/internal/`, not exported). Stateless generic helpers (`dataAttr`, `cx`, `toIdSegment`, `visuallyHiddenStyle`, DOM queries) come from `@cocokits/utils`; a helper two frameworks need goes to `utils` or `cdk`, not here. Helper names below describe the role, not a fixed API.

| Helper | Rule |
|---|---|
| Compose event handlers | The consumer's handler runs first; its `preventDefault()` vetoes ours. Ours checks `defaultPrevented` before doing anything and calls `preventDefault()` only afterwards, so it never vetoes itself. |
| `mergeProps(ours, theirs)` | The user wins; handlers are composed; `className` is joined; `style` is merged; `undefined` user values never override; `ref` is not merged here. |
| Merge refs | Accepts object and callback refs; callback refs return a cleanup instead of being called with `null`. |
| Render helper | Implements the `render` prop ([render-prop.md](./render-prop.md)): element form merges under the element's props, function form receives all merged props including `ref`. |
| Controllable state | One source of truth for controlled and uncontrolled state ([controlled-state.md](./controlled-state.md)); `undefined` is uncontrolled, `null` is a value; the change callback fires from the setter only on change. |
| Isomorphic layout effect | `useLayoutEffect` in the browser, `useEffect` on the server, chosen by a `typeof document` check at module level (the only allowed module-level environment check). |
| Part context | A context plus a hook that throws a named error outside the root ([compound-parts.md](./compound-parts.md)). |
| Hidden input and form-control hook | Render the hidden native input and follow the owning form through `@cocokits/cdk/form-control` ([forms.md](./forms.md)). |
| DOM order helpers | Pure functions over elements (document-position sort, enabled check, next index for a key); no `window`/`document` access at import. |

A helper that is a rule above has a unit test next to it. Do not add a helper for a single use.
