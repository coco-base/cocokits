# Next.js and SSR

Next.js is React plus server rendering and React Server Components (why: [rendered contract](../../why/rendered-contract.md)). The general SSR rules are in [architecture](../../architecture.md) (framework-free layers, Next.js). Every React component, and every machine or cdk module it imports, meets these three constraints.

1. **No `window`/`document` at import time or in render.** `window`, `document`, `navigator`, `matchMedia`, `localStorage` and observers are used only in effects, handlers and ref callbacks. The only module-level environment check allowed is `typeof document !== 'undefined'`, never a property read.
2. **`'use client'` survives the build**, per module ([package-layout.md](./package-layout.md)): every emitted module that defines a part, hook, context or handler starts with it; barrels and pure modules never do. A Server Component imports a component entry point; the bundler follows the barrel to the client modules. Types and the anatomy stay importable on the server.
3. **Server render equals the first client render.** No `typeof window` branches in JSX; initial state from props, never from measurement; no register-then-render (every part renders its own markup in place); closed overlays render nothing, and an open-by-default overlay renders nothing on the server and the first client render, its portal mounts after hydration ([overlays.md](./overlays.md)). Measured geometry and DOM-derived state (such as a tab stop) are applied in a layout effect after hydration.

Also: use an isomorphic layout effect instead of `useLayoutEffect` (no server warning); guard observers and disconnect them in cleanup.

## What to test

With the existing `test` target (Vitest, Node environment):

- Hydration and the emitted `'use client'` directives are tested for every package ([architecture §9](../../architecture.md#9-tests-and-quality-gates), [component-tests.md](../testing/component-tests.md)); a package without the setup adds it.
