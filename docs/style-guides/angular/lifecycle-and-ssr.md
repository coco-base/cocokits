# Lifecycle, zoneless and SSR

When browser work may run, how resources are cleaned up, and what the server render must already contain. The framework-free SSR rules are in [architecture](../../architecture.md).

## Rules

- Work zoneless: no `NgZone`, no `zone.js` import, no `setTimeout` or `Promise.resolve().then(markForCheck)` to wait for change detection. One exception: the overlay roots (Dialog, Popover, Tooltip, Select) start their high-frequency browser work (the dismiss layer's document listeners, positioning, focus-visible tracking, the Tooltip's delay timers) through `injectZoneBoundary()` from `@cocokits/angular-core`, which runs it outside `NgZone` and brings every callback that writes state or emits back in; with no real zone it calls plainly. Why: [overlays](../../why/overlays.md#overlay-roots-start-their-listeners-outside-the-zone).
- Do not touch `window`, `document`, `navigator`, `localStorage`, `ResizeObserver` or `matchMedia` in constructors, field initialisers or at module level. Use `inject(DOCUMENT)`.
- Browser-only work goes in `afterNextRender` (one-shot), `afterRenderEffect` (reactive) or `afterEveryRender` (checks that no signal can trigger, such as re-reading DOM order after a keyed reorder; write a signal there only when the result differs), or in event handlers. These never run on the server. Do not use `ngAfterViewInit` + `setTimeout` or `isPlatformBrowser` branching for what these hooks cover.
- Phase DOM measurement with `afterRenderEffect({ earlyRead, write })` so the browser does not thrash layout. No `getBoundingClientRect` in `effect` or `ngAfterViewInit`.
- Clean up observers, listeners, registrations and key managers with `inject(DestroyRef).onDestroy(...)`; pass `onCleanup` for resources created inside `effect` / `afterRenderEffect`; use `takeUntilDestroyed()` for any RxJS that remains. Do not implement `ngOnDestroy` only to unsubscribe.
- Initial server markup must already be correct: selected item, `aria-*`, `hidden`, every part of a compound component, the hidden form input when `name` is set. Measurements (for example an indicator position) are applied after hydration.
- Overlays render nothing on the server ([overlays](./overlays.md)).

## Pattern: measure and write

```ts
// Example (illustrative)
constructor() {
  const destroyRef = inject(DestroyRef);
  afterNextRender(() => {
    const observer = new ResizeObserver(() => this.resized.update((n) => n + 1));
    observer.observe(this.indicator().nativeElement.parentElement!);
    destroyRef.onDestroy(() => observer.disconnect());
  });
  afterRenderEffect({
    earlyRead: () => {
      this.resized();
      const el = this.items()[this.selectedIndex()]?.nativeElement;
      return el ? { left: el.offsetLeft, width: el.offsetWidth } : null;
    },
    write: (rect) => {
      const r = rect();
      const el = this.indicator().nativeElement;
      this.renderer.setStyle(el, '--indicator-left', r ? `${r.left}px` : null, RendererStyleFlags2.DashCase);
      this.renderer.setStyle(el, '--indicator-width', r ? `${r.width}px` : null, RendererStyleFlags2.DashCase);
    },
  });
}
```

## Performance

- No content queries for structure (they re-query on every change); `@for` must `track` a stable key.
- Use `@defer` or lazy slots for heavy panels.
