import { Renderer2, afterRenderEffect, inject, type Signal } from '@angular/core';
import { injectZoneBoundary } from '@cocokits/angular-core';

/** What {@link closeOnAncestorScroll} reads. @internal */
export interface TooltipScrollOptions {
  /** Listens only while true (the tooltip is shown). */
  readonly active: Signal<boolean>;
  /** The trigger; a scroll of anything that contains it counts. */
  readonly trigger: Signal<HTMLElement | null>;
  /** Called, inside the zone, with the scroll event. */
  readonly onScroll: (event: Event) => void;
}

/**
 * Calls `onScroll` when an ancestor of the trigger (the document included) scrolls: the content would stay
 * behind while the trigger moves. A scroll of the content or of an unrelated element does not count. The
 * listener is passive, in the capture phase (scroll does not bubble), outside the zone, and only runs in the
 * browser. Call it in an injection context.
 *
 * @param options - The signals to read and the callback.
 * @internal
 */
export function closeOnAncestorScroll(options: TooltipScrollOptions): void {
  const { active, trigger, onScroll } = options;
  const renderer = inject(Renderer2);
  const zone = injectZoneBoundary();
  afterRenderEffect({
    write: (onCleanup) => {
      const element = trigger();
      if (!active() || !element) return;
      const roots = new Set<EventTarget>([element.ownerDocument, element.getRootNode()]);
      const stops = zone.outside(() =>
        [...roots].map((root) =>
          renderer.listen(
            root,
            'scroll',
            (event: Event) => {
              const target = event.target;
              if (target instanceof Node && target.contains(element)) {
                zone.inside(() => {
                  onScroll(event);
                });
              }
            },
            { capture: true, passive: true },
          ),
        ),
      );
      onCleanup(() => {
        for (const stop of stops) stop();
      });
    },
  });
}
