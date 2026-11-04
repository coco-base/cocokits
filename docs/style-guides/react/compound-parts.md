# Compound parts

How a part is written in React: context, prop order, handler composition, refs, ids, collections and the Rules of React. The shared rules (one rendered contract, sibling parts, children registering through context) are in [architecture](../../architecture.md); this file adds what is specific to React.

## Shape

- Compound components are sibling parts linked by `value`. The root provides context; each part renders itself in place.
- A part MUST NOT inspect `children`, register JSX or labels with the root for the root to render later, or derive order from `Children.map` indices. Registries hold DOM nodes (for keyboard navigation and the tab stop) only.
- Every part destructures `ref` and `render`, reads its context through a hook that names the part, computes derived values in render, takes its theme attributes from the fw-core theme runtime ([theming.md](./theming.md)) and renders through the shared render helper with `mergeProps(ours, elementProps)` ([internals.md](./internals.md)).
- A part renders exactly what the component's approved contract declares (element, role, focus and ref target, `data-*`).

## Context

- Create it with one helper that throws a clear error when a part is used outside its root, for example `CocoKits: <Tabs.Trigger> must be placed within <Tabs.Root>.` No fake default value.
- When the machine takes a `send` that reads the latest state through a ref, do not call `getXProps` in the Root and put the result in context: the lint rule on refs read during render rejects it. Put the state and a stable `dispatch` in context and let each part call `getXProps(context.state, context.dispatch)`.
- Memoize context values (`useMemo`); functions placed in context use `useCallback`.
- Use a scoped context only when a component renders another component's parts internally. Nested roots of the same type already work.

## Prop order and handlers

1. Internal defaults and ARIA: `type`, `role`, `aria-*`, state `data-*`, theme `data-*`, `tabIndex`, `className` with the fixed part class.
2. User props through `mergeProps(ours, theirs)` ([internals.md](./internals.md)).
3. `ref` merged last by the render helper.

## Refs

- `ref` is a prop; no `forwardRef`. Type props with `ComponentPropsWithRef<'tag'>`.
- Merge internal and user refs with one merge-refs helper. Registration ref callbacks return a cleanup instead of handling `null`.

## Ids

- Ids come from `useId()` + part + a stable per-item key; the shared id rules are in [machines](../framework-agnostic/machines.md).

## Collections and keyboard

Collection, order and tab-stop rules: [machines](../framework-agnostic/cdk-modules.md#collections).

- Items register their DOM node with the root in a stable ref callback (commit phase, returns a cleanup), never during render.
- The root re-evaluates the tab stop in a layout effect after every commit.
- One `onKeyDown` on the container; it returns when the event target is not a registered item (nested composites). Read the direction from the fw-core direction runtime.

## Rules of React

- Components and hooks are pure: no `ref.current` reads or writes, no `window`/`document`, no mutation of props, state or context during render.
- Hooks run unconditionally at the top level; a part that may render `null` computes its element first and returns `null` late.
- Do not derive state from props in `useEffect` or call `setState` in render; compute during render. Effects only synchronize external systems and return a cleanup. Code must survive StrictMode double invocation.
- State derived from the DOM (the tab stop, whether overlay content is mounted) is set from layout effects or ref callbacks with an equality guard.
- Non-reactive logic called from effects (form reset, document listeners) reads the latest props and callbacks through a ref assigned in a layout effect (never during render), because the supported floor is React 19.0. Once the floor is ≥19.2, use `useEffectEvent` instead; never list the effect event in deps or call it during render. [Why](../../why/forms.md#latest-callbacks-through-a-ref-until-react-192).
- DOM measurement runs in an isomorphic layout effect and writes CSS variables on the node directly instead of storing them in state.
- Hand-written `useMemo`/`useCallback` only for context values, functions in context or effect deps, and registering ref callbacks. Do not wrap exported components in `memo` or define components inside components.
- A large collection may use an external store read through `useSyncExternalStore(subscribe, get, getServer)` with immutable, referentially stable snapshots; always pass `getServerSnapshot`.
