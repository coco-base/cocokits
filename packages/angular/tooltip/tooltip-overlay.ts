import { Injector, afterRenderEffect, signal, untracked, type Signal, type TemplateRef } from '@angular/core';
import type { CckDirection, CckOverlayLayer, CckPortal, ZoneBoundary } from '@cocokits/angular-core';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { startOverlayPosition, type OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import type { TooltipAlign, TooltipEvent, TooltipSide } from '@cocokits/machines/tooltip';
import {
  CckTooltipBubble,
  TOOLTIP_BUBBLE_CONTEXT,
  type TooltipBubbleContext,
  type TooltipContentRegistration,
} from './tooltip-bubble';

/** A point in viewport coordinates, in px. */
export interface TooltipOrigin {
  readonly x: number;
  readonly y: number;
}

/** A zero-size anchor at the point; its scrolling ancestors are the trigger's. */
const pointAnchor = ({ x, y }: TooltipOrigin, contextElement: Element): OverlayVirtualAnchor => ({
  getBoundingClientRect: () => ({ x, y, width: 0, height: 0, top: y, right: x, bottom: y, left: x }),
  contextElement,
});

/** What {@link createTooltipOverlay} reads from the Tooltip. @internal */
export interface TooltipOverlayOptions {
  /** Whether the tooltip is shown (open and not disabled). */
  readonly shown: Signal<boolean>;
  /** Whether there is something to show. */
  readonly hasContent: Signal<boolean>;
  /** The trigger element. */
  readonly trigger: Signal<HTMLElement | null>;
  /** The compound form's portal template. */
  readonly template: Signal<TemplateRef<void> | null>;
  /** Whether the host renders the one-attribute bubble. */
  readonly hasBubble: Signal<boolean>;
  /** What the one-attribute bubble renders. */
  readonly bubbleContext: TooltipBubbleContext;
  /** The registered content part. */
  readonly content: Signal<TooltipContentRegistration | null>;
  /** The registered arrow element. */
  readonly arrow: Signal<HTMLElement | null>;
  /** The point the content is placed against, if any. */
  readonly anchorPoint: Signal<TooltipOrigin | null>;
  /** Whether Escape and an outside press are refused. */
  readonly disableClose: Signal<boolean>;
  /** Sends an event to the machine. */
  readonly send: (event: TooltipEvent) => void;
  readonly injector: Injector;
  readonly portal: CckPortal;
  readonly zone: ZoneBoundary;
  readonly direction: CckDirection;
  readonly layer: CckOverlayLayer;
  readonly parentLayer: CckOverlayLayer | null;
}

/** What {@link createTooltipOverlay} gives back. @internal */
export interface TooltipOverlay {
  /** Whether the content is in the document: shown, or hidden with an exit animation still running. */
  readonly mounted: Signal<boolean>;
  /** The side and align the positioning module settled on. */
  readonly placement: Signal<{ side: TooltipSide; align: TooltipAlign } | null>;
  /** Whether the positioning module reported that the arrow cannot point at the anchor. */
  readonly arrowHidden: Signal<boolean>;
  /** Registers the dismiss layer if it is not registered yet. */
  readonly startDismissLayer: () => void;
  /** Removes the dismiss layer; safe to call when there is none. */
  readonly stopDismissLayer: () => void;
  /** Stops the presence and the dismiss layer. */
  readonly destroy: () => void;
}

/**
 * The overlay lifecycle of a Tooltip: mounting through the presence, attaching the portal, positioning the
 * content and the dismiss layer. Call it in the constructor, in an injection context.
 *
 * @param o - What the Tooltip gives and the services it uses.
 * @returns The overlay state and its controls.
 * @internal
 */
export function createTooltipOverlay(o: TooltipOverlayOptions): TooltipOverlay {
  const mounted = signal(false);
  const placement = signal<{ side: TooltipSide; align: TooltipAlign } | null>(null);
  const arrowHidden = signal(false);
  let dismissLayer: DismissLayer | null = null;

  const presence = createPresence({
    getElement: () => o.content()?.element ?? null,
    onStateChange: (state) => {
      mounted.set(state !== 'unmounted');
    },
  });

  const startDismissLayer = (): void => {
    if (dismissLayer) return;
    const layer = o.zone.outside(() =>
      createDismissLayer({
        getInsideElements: () => [o.trigger(), o.content()?.element ?? null],
        onDismiss: (intent) => {
          const { reason, event } = intent;
          if (reason === 'focus-out') return;
          o.zone.inside(() => {
            // A refused close keeps the layers below open too.
            if (o.disableClose()) intent.preventDefault();
            else o.send({ type: 'CONTENT.DISMISS', reason, event });
          });
        },
        getParent: () => o.parentLayer?.current ?? null,
      }),
    );
    dismissLayer = layer;
    o.layer.current = layer;
  };

  const stopDismissLayer = (): void => {
    const layer = dismissLayer;
    if (!layer) return;
    layer.destroy();
    if (o.layer.current === layer) o.layer.current = null;
    dismissLayer = null;
  };

  // Showing mounts at once; hiding waits for the exit animation (read after the closed state rendered).
  afterRenderEffect({
    write: () => {
      const show = o.shown() && o.hasContent() && o.trigger() !== null;
      untracked(() => {
        presence.setOpen(show);
      });
    },
  });

  afterRenderEffect({
    write: () => {
      const [isMounted, template, trigger, bubble] = [mounted(), o.template(), o.trigger(), o.hasBubble()];
      untracked(() => {
        if (isMounted && trigger && template) o.portal.attach(template, undefined, trigger);
        else if (isMounted && trigger && bubble) {
          const injector = Injector.create({
            providers: [{ provide: TOOLTIP_BUBBLE_CONTEXT, useValue: o.bubbleContext }],
            parent: o.injector,
          });
          o.portal.attachComponent(CckTooltipBubble, trigger, { injector });
        } else o.portal.detach();
      });
    },
  });

  afterRenderEffect({
    write: (onCleanup) => {
      const [isMounted, trigger, content, arrow, point] = [
        mounted(),
        o.trigger(),
        o.content(),
        o.arrow(),
        o.anchorPoint(),
      ];
      if (!isMounted || !trigger || !content) return;
      const [side, align] = [content.side(), content.align()];
      const stop = untracked(() =>
        o.zone.outside(() =>
          startOverlayPosition({
            getAnchor: () => (point ? pointAnchor(point, trigger) : trigger),
            getContent: () => content.element,
            side,
            align,
            getDirection: () => o.direction.dir(),
            onPlacementChange: (next) => {
              o.zone.inside(() => {
                placement.set(next);
              });
            },
            ...(arrow
              ? {
                  getArrow: () => arrow,
                  onArrowHiddenChange: (hidden: boolean) => {
                    o.zone.inside(() => {
                      arrowHidden.set(hidden);
                    });
                  },
                }
              : {}),
          }),
        ),
      );
      onCleanup(() => {
        stop();
        placement.set(null);
        arrowHidden.set(false);
      });
    },
  });

  // While shown, the tooltip is a layer of the stack, so Escape reaches the topmost one; `change` starts the
  // layer at once, this effect removes it when `disabled` closed the tooltip.
  afterRenderEffect({
    write: () => {
      const [shown, trigger] = [o.shown(), o.trigger()];
      untracked(() => {
        if (shown && trigger) startDismissLayer();
        else stopDismissLayer();
      });
    },
  });

  return {
    mounted,
    placement,
    arrowHidden,
    startDismissLayer,
    stopDismissLayer,
    destroy: () => {
      presence.destroy();
      stopDismissLayer();
    },
  };
}
