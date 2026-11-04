# SSR

Every Vue part renders on the server and hydrates without mismatch. The general rules (framework-free layers, no DOM at import time) are in [architecture](../../architecture.md).

- Do not touch `window`, `document`, `ResizeObserver` or `matchMedia` at module scope or in setup. DOM work goes in `onMounted`, event handlers, or `flush: 'post'` watchers guarded on an element ref.
- Render identical markup on the server and the first client render: collections and measurements apply after mount.
- The hidden form input renders on the server too ([forms.md](./forms.md)); the owning form is tracked after mount.
- Dispose observers and listeners in `onScopeDispose`.

Example (illustrative, post-mount measurement):

```ts
let ro: ResizeObserver | undefined
onMounted(() => {
  if (typeof ResizeObserver === 'undefined') return
  ro = new ResizeObserver(measure)
})
onScopeDispose(() => ro?.disconnect())
```

Server render test: `renderToString` output contains the expected roles and the hidden input, and `createSSRApp(App).mount()` over that HTML logs no hydration warning ([testing.md](./testing.md)).
