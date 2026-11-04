# SSR, DOM access and lifecycle

How shared code touches the DOM, survives server rendering (including Next.js) and cleans up after itself. The import-time rule is in [docs/architecture.md](../../architecture.md); this page adds the details.

## Module purity

- No statements at module top level other than imports, exports, type declarations and constants that are pure literals or calls marked `/* @__PURE__ */`. No `addEventListener`, `new ResizeObserver`, `document.createElement`, polyfills or registry mutation at import time. A test that imports each package entry in node enforces it.
- Feature detection is lazy and memoised per window, never a module constant.
- Module-level mutable state is allowed only inside a ref-counted per-document singleton (below).

## DOM access

- Reach the DOM through a scope object or helpers that take a node and return `null` on the server. Never the `document`, `window` or `navigator` globals.
- Resolve the active element through shadow roots, check containment with a shadow-aware `contains`, read event targets with a composed-path-aware helper, and do not use `instanceof HTMLElement` across realms.
- Tolerate missing elements: every effect or action that looks up an element returns early on `null`. This is what lets code run in node tests and under SSR.
- DOM work happens only in effects, actions and event handlers, never while computing props.

## Next.js and SSR

- The first client render equals the server render: initial state comes from props, and values that need the DOM start at a deterministic default and update after mount. No register-then-render that renders an empty list on the server.
- Effects start only after mount.
- Shared layers export plain functions and data, never top-level directives or framework imports, so `'use client'` survives the React build.

## Cleanup

- Everything that subscribes (listener, observer, timer, animation frame) returns an idempotent cleanup, or an instance with `destroy()`. One cleanup removes everything the setup added, with the same options used to add it.
- Effects must be restartable: they can be set up, cleaned up and set up again on the same instance (React StrictMode does exactly this), so they keep no state outside their closure.
- After `destroy()`, methods do nothing.
- An error inside an effect is warned about in development and does not stop other effects.
- Timers and animation frames go through one scheduler module that returns cleanups and works with fake timers. Deferred work re-reads state when it runs.

## Ref-counted per-document singletons

Process-wide resources (layer stack, scroll lock, live region, modality listeners, observer pools) are ref-counted, keyed per `Document`, and torn down when the count reaches 0, so iframes and multiple roots never share one stack. Callers acquire and release; release is idempotent. Machines use the cdk modules that own such state and never hold it. No class singletons. Test resets are marked `@internal`.
