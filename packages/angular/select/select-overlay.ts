import { afterRenderEffect, untracked, type ElementRef, type Signal, type TemplateRef } from '@angular/core';
import type { CckDirection, CckOverlayLayer, CckPortal, ZoneBoundary } from '@cocokits/angular-core';
import { createTriggerDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { startOverlayPosition, type OverlayAlign, type OverlaySide } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import type { SelectEvent } from '@cocokits/machines/select';

/** What {@link createSelectOverlay} reads from the Select. @internal */
export interface SelectOverlayOptions {
  /** Whether the list is open. */
  readonly isOpen: Signal<boolean>;
  /** Whether the list is in the document: open, or closed with an exit animation still running. */
  readonly mounted: Signal<boolean>;
  /** Tells the Select whether the list is in the document. */
  readonly setMounted: (mounted: boolean) => void;
  /** The trigger button. */
  readonly trigger: Signal<ElementRef<HTMLButtonElement> | undefined>;
  /** The portal template of the list. */
  readonly listbox: Signal<TemplateRef<void> | undefined>;
  /** The list element, once it rendered. */
  readonly content: Signal<HTMLElement | null>;
  /** The element the list lines up with when the trigger is a field's control. */
  readonly fieldAnchor: Signal<HTMLElement | null>;
  readonly side: Signal<OverlaySide>;
  readonly align: Signal<OverlayAlign>;
  /** Tells the Select the side and align the positioning module settled on. */
  readonly setPlacement: (placement: { side: OverlaySide; align: OverlayAlign } | null) => void;
  /** Applies a machine event; false when it took no effect, so that a refused Escape stays with the layer. */
  readonly send: (event: SelectEvent) => boolean;
  readonly portal: CckPortal;
  readonly zone: ZoneBoundary;
  readonly direction: CckDirection;
  readonly layer: CckOverlayLayer;
  readonly parentLayer: CckOverlayLayer | null;
}

/** What {@link createSelectOverlay} gives back. @internal */
export interface SelectOverlay {
  /**
   * Registers the dismiss layer if it is not registered yet. The Select starts it as soon as the list opens, so
   * an Escape or an outside press that comes before the list has rendered still closes it.
   */
  readonly startDismissLayer: () => void;
  /** Removes the dismiss layer; safe to call when there is none. */
  readonly stopDismissLayer: () => void;
  /** Whether the dismiss layer is registered. */
  readonly hasDismissLayer: () => boolean;
  /** Whether a press outside is being decided: the focus move it causes must not close the list on its own. */
  readonly focusOutHeld: () => boolean;
  /** Stops the presence. */
  readonly destroy: () => void;
}

/**
 * The overlay lifecycle of a Select: mounting through the presence, attaching the portal, positioning the
 * list and the dismiss layer. Call it in the constructor, in an injection context.
 *
 * @param o - What the Select gives and the services it uses.
 * @returns The controls of the dismiss layer.
 * @internal
 */
export function createSelectOverlay(o: SelectOverlayOptions): SelectOverlay {
  let dismissal: { readonly layer: DismissLayer; readonly stop: () => void } | null = null;
  let focusOutHeld = false;

  const presence = createPresence({
    getElement: () => o.content(),
    onStateChange: (state) => {
      o.setMounted(state !== 'unmounted');
    },
  });

  const startDismissLayer = (): void => {
    if (dismissal || !o.trigger()) return;
    const created = o.zone.outside(() =>
      createTriggerDismissLayer({
        trigger: () => o.trigger()?.nativeElement ?? null,
        inside: () => [o.trigger()?.nativeElement ?? null, o.fieldAnchor(), o.content()],
        parent: () => o.parentLayer?.current ?? null,
        escape: (intent) =>
          o.zone.inside(() => o.send({ type: 'LIST.DISMISS', reason: 'escape', event: intent.event })),
        press: (intent, focusLeft) =>
          o.zone.inside(() =>
            o.send({ type: 'LIST.DISMISS', reason: 'outside-press', event: intent.event, focusLeft }),
          ),
        holdFocusOut: (held) => {
          o.zone.inside(() => {
            focusOutHeld = held;
          });
        },
      }),
    );
    dismissal = created;
    o.layer.current = created.layer;
  };

  const stopDismissLayer = (): void => {
    const current = dismissal;
    if (!current) return;
    current.stop();
    if (o.layer.current === current.layer) o.layer.current = null;
    dismissal = null;
  };

  // Opening mounts at once; closing waits for the exit animation (read after the closed state rendered).
  afterRenderEffect({
    write: () => {
      const show = o.isOpen() && o.listbox() !== undefined && o.trigger() !== undefined;
      untracked(() => {
        presence.setOpen(show);
      });
    },
  });

  afterRenderEffect({
    write: () => {
      const [mounted, template, trigger] = [o.mounted(), o.listbox(), o.trigger()?.nativeElement];
      untracked(() => {
        if (mounted && template && trigger) o.portal.attach(template, undefined, trigger);
        else o.portal.detach();
      });
    },
  });

  afterRenderEffect({
    write: (onCleanup) => {
      const [mounted, trigger, content] = [o.mounted(), o.trigger()?.nativeElement, o.content()];
      if (!mounted || !trigger || !content) return;
      const [side, align] = [o.side(), o.align()];
      const stop = untracked(() =>
        o.zone.outside(() =>
          startOverlayPosition({
            getAnchor: () => o.fieldAnchor() ?? trigger,
            getContent: () => content,
            side,
            align,
            getDirection: () => o.direction.dir(),
            onPlacementChange: (placement) => {
              o.zone.inside(() => {
                o.setPlacement(placement);
              });
            },
          }),
        ),
      );
      onCleanup(() => {
        stop();
        o.setPlacement(null);
      });
    },
  });

  afterRenderEffect({
    write: (onCleanup) => {
      const open = o.isOpen();
      // A layer started before the list rendered must not outlive a close made by the parent.
      if (!open)
        untracked(() => {
          stopDismissLayer();
        });
      if (!open || !o.trigger() || !o.content()) return;
      untracked(() => {
        startDismissLayer();
        onCleanup(() => {
          stopDismissLayer();
        });
      });
    },
  });

  return {
    startDismissLayer,
    stopDismissLayer,
    hasDismissLayer: () => dismissal !== null,
    focusOutHeld: () => focusOutHeld,
    destroy: () => {
      presence.destroy();
    },
  };
}
