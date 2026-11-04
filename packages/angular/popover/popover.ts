import {
  DestroyRef,
  Directive,
  Renderer2,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import {
  CckDirection,
  CckOverlayLayer,
  CckPortal,
  IdGenerator,
  injectZoneBoundary,
  themeAttrs,
} from '@cocokits/angular-core';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { captureFocusReturn, connectFocusGuards, focusFirst, scheduleFocus } from '@cocokits/cdk/focus';
import { startOverlayPosition } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import {
  getPopoverProps,
  popoverAnatomy,
  transitionPopover,
  type PopoverAlign,
  type PopoverChangeReason,
  type PopoverEvent,
  type PopoverParts,
  type PopoverSide,
  type PopoverState,
} from '@cocokits/machines/popover';
import type { ChangeDetails } from '@cocokits/shared';
import { visuallyHiddenStyle } from '@cocokits/utils';

/** What the content part tells the root about itself. @internal */
export interface PopoverContentRegistration {
  /** The content element, in the portal host. */
  readonly element: HTMLElement;
  /** The wanted side. */
  readonly side: Signal<PopoverSide>;
  /** The wanted alignment. */
  readonly align: Signal<PopoverAlign>;
}

/** Why the open state of a Popover changed. */
export type PopoverOpenChangeReason = PopoverChangeReason;

/** What `opened`, `closed` and `closePredicate` of a Popover receive: why the change happened and the event behind it. */
export type PopoverChangeDetails = ChangeDetails<PopoverOpenChangeReason>;

/**
 * The root of a Popover: it renders no element, it holds the open state and connects the trigger, the
 * content and the Close button. The content is declared in a `cckPopoverPortal` template and rendered in
 * the overlay container, not next to the trigger. It is non-modal: focus moves into it on open and back to
 * the trigger on Escape, Close or an outside press on empty space (unless `restoreFocus` is `false`); Tab past either end leaves it and closes it.
 *
 * @example
 * <ng-container cckPopover [(open)]="shared">
 *   <button cckPopoverTrigger>Share</button>
 *   <ng-template cckPopoverPortal>
 *     <div cckPopoverContent aria-label="Share this page">
 *       <button cckPopoverClose>Close</button>
 *     </div>
 *   </ng-template>
 * </ng-container>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The trigger and the portal template.
 */
@Directive({
  selector: '[cckPopover]',
  exportAs: 'cckPopover',
  providers: [CckPortal, CckOverlayLayer],
})
export class CckPopover {
  /**
   * Whether the content is open. Two-way, one-way (the start value) or unbound.
   * @remarks The model output `openChange` emits the new value when the popover changes itself. `opened` and `closed` emit the reason, for the content's own changes only.
   * @defaultValue false
   */
  readonly open = model(false);

  /**
   * Whether Escape, an outside press and focus leaving keep the popover open. The check runs first, before
   * `closePredicate`, `open` and `closed`; Close, the trigger and a write from the parent still close.
   * Disabling these closes weakens the pattern: keep a Close button, so a keyboard user can leave.
   * @defaultValue false
   * @remarks Angular only: React refuses with `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside` and `onInteractOutside`, Vue with the matching events.
   * @cckSemantic none
   * @see https://github.com/angular/components/blob/main/src/cdk/overlay/overlay-directives.ts cdkConnectedOverlayDisableClose
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * Decides, for every close the popover makes itself (Close, the trigger, Escape, an outside press, focus
   * leaving), whether it happens: `false` keeps the popover open. It runs after `disableClose`. A write to
   * `open` from the parent is never checked.
   * @remarks Angular only: React refuses with `details.cancel()` in `onOpenChange`, Vue by not taking `update:open`.
   * @cckSemantic none
   */
  readonly closePredicate = input<((details: PopoverChangeDetails) => boolean) | undefined>(undefined);

  /**
   * Whether focus returns to the trigger when the popover closes.
   * @defaultValue true
   * @remarks Angular only: React refuses with `event.preventDefault()` in `onCloseAutoFocus`, Vue in `closeAutoFocus`.
   * @cckSemantic none
   * @see https://github.com/angular/components/blob/main/src/material/menu/menu-trigger.ts matMenuTriggerRestoreFocus
   */
  readonly restoreFocus = input(true, { transform: booleanAttribute });

  /**
   * Emits after the popover opens by itself (the trigger), with the reason and the event. Never for a write from the parent.
   * @remarks Angular only: React and Vue report an open through `onOpenChange` and `update:open`.
   * @cckSemantic none
   */
  readonly opened = output<PopoverChangeDetails>();

  /**
   * Emits after the popover closes by itself (Close, the trigger, Escape, an outside press, focus leaving), with the reason and the event.
   * Never for a write from the parent.
   * @remarks Angular only: React and Vue report a close through `onOpenChange` and `update:open`.
   * @cckSemantic none
   */
  readonly closed = output<PopoverChangeDetails>();

  /** The theme attributes of every part; the parts apply their own record. @internal */
  readonly _theme = themeAttrs(popoverAnatomy);

  /** @internal */
  readonly _trigger = signal<HTMLElement | null>(null);
  /** The element the content is placed against instead of the trigger; the last anchor mounted wins. @internal */
  readonly _anchor = signal<HTMLElement | null>(null);
  /** @internal */
  readonly _content = signal<PopoverContentRegistration | null>(null);
  /** @internal */
  readonly _template = signal<TemplateRef<void> | null>(null);
  /** The arrow element a `cckPopoverArrow` registered; the content positions it. @internal */
  readonly _arrow = signal<HTMLElement | null>(null);
  /** How many titles are mounted. @internal */
  readonly _titles = signal(0);
  /** How many descriptions are mounted. @internal */
  readonly _descriptions = signal(0);

  /** Whether the content is in the document: open, or closed with an exit animation still running. */
  private readonly mounted = signal(false);
  private readonly placement = signal<{ side: PopoverSide; align: PopoverAlign } | null>(null);
  /** Whether the positioning module reported that the arrow cannot point at the anchor. */
  private readonly arrowHidden = signal(false);
  private readonly id = inject(IdGenerator).getId(popoverAnatomy.classes.root);
  private readonly portal = inject(CckPortal);
  private readonly direction = inject(CckDirection);
  private readonly renderer = inject(Renderer2);
  private readonly zone = injectZoneBoundary();
  private readonly layer = inject(CckOverlayLayer);
  private readonly parentLayer = inject(CckOverlayLayer, { optional: true, skipSelf: true });
  private dismissLayer: DismissLayer | null = null;
  private readonly presence = createPresence({
    getElement: () => this._content()?.element ?? null,
    onStateChange: (state) => {
      this.mounted.set(state !== 'unmounted');
    },
  });

  private readonly state = computed<PopoverState>(() => ({
    id: this.id,
    open: this.open(),
    mounted: this.mounted(),
    hasTitle: this._titles() > 0,
    hasDescription: this._descriptions() > 0,
    arrowHidden: this.arrowHidden(),
    side: this.placement()?.side ?? this._content()?.side(),
    align: this.placement()?.align ?? this._content()?.align(),
  }));

  /** The props of the trigger, the content and the Close part. @internal */
  readonly _parts: Signal<PopoverParts> = computed(() =>
    getPopoverProps(this.state(), (event) => {
      this.send(event);
    }),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.presence.destroy();
    });

    // The content renders only once there is a trigger to anchor it, so a missing trigger needs a message.
    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (this._template() && !this._trigger()) {
        console.warn(
          'CocoKits: a PopoverPortal has no PopoverTrigger, so its content never opens. Add a cckPopoverTrigger inside the same cckPopover.',
        );
      }
    });

    // Opening mounts at once; closing waits for the exit animation (read after the closed state rendered).
    afterRenderEffect({
      write: () => {
        const show = this.open() && this._template() !== null && this._trigger() !== null;
        untracked(() => {
          this.presence.setOpen(show);
        });
      },
    });

    afterRenderEffect({
      write: () => {
        const [mounted, template, trigger] = [this.mounted(), this._template(), this._trigger()];
        untracked(() => {
          if (mounted && template && trigger) this.portal.attach(template, undefined, trigger);
          else this.portal.detach();
        });
      },
    });

    afterRenderEffect({
      write: (onCleanup) => {
        const [mounted, trigger, content, anchor, arrow] = [
          this.mounted(),
          this._trigger(),
          this._content(),
          this._anchor(),
          this._arrow(),
        ];
        if (!mounted || !trigger || !content) return;
        const [side, align] = [content.side(), content.align()];
        const stop = untracked(() =>
          this.zone.outside(() =>
            startOverlayPosition({
              getAnchor: () => anchor ?? trigger,
              getContent: () => content.element,
              side,
              align,
              getDirection: () => this.direction.dir(),
              onPlacementChange: (placement) => {
                this.zone.inside(() => {
                  this.placement.set(placement);
                });
              },
              ...(arrow
                ? {
                    getArrow: () => arrow,
                    onArrowHiddenChange: (hidden: boolean) => {
                      this.zone.inside(() => {
                        this.arrowHidden.set(hidden);
                      });
                    },
                  }
                : {}),
            }),
          ),
        );
        onCleanup(() => {
          stop();
          this.placement.set(null);
          this.arrowHidden.set(false);
        });
      },
    });

    afterRenderEffect({
      write: (onCleanup) => {
        const [open, trigger, content] = [this.open(), this._trigger(), this._content()];
        // A layer the trigger started before the content rendered must not outlive a close made by the parent.
        if (!open)
          untracked(() => {
            this.stopDismissLayer();
          });
        if (!open || !trigger || !content) return;
        untracked(() => {
          onCleanup(this.engage(trigger, content.element));
        });
      },
    });
  }

  /**
   * Starts what an open Popover needs: the dismiss layer, the focus guards, the move of focus into the
   * content and the return of focus when it closes.
   *
   * @param trigger - The trigger element.
   * @param content - The content element.
   * @returns The cleanup.
   */
  private engage(trigger: HTMLElement, content: HTMLElement): () => void {
    const host = content.parentElement;
    const [start, end] = [this.createGuard(), this.createGuard()];
    if (host) {
      this.renderer.insertBefore(host, start, content);
      this.renderer.appendChild(host, end);
    }
    this.startDismissLayer();
    const guards = connectFocusGuards({
      getContent: () => this._content()?.element ?? null,
      getTrigger: () => this._trigger(),
      getGuards: () => [start, end],
    });
    const focusReturn = captureFocusReturn({
      getTrigger: () => this._trigger(),
      getContent: () => this._content()?.element ?? null,
    });
    const cancelFocus = scheduleFocus(trigger.ownerDocument, () => {
      const current = this._content()?.element;
      if (this.open() && current) focusFirst(current);
    });
    return () => {
      cancelFocus();
      this.stopDismissLayer();
      guards.destroy();
      for (const guard of [start, end]) this.renderer.removeChild(guard.parentNode, guard);
      // A cleanup caused by closing returns focus; one caused by the Popover being destroyed does not. It waits
      // a frame, so a press on empty space (which blurs to the body after the layer saw it) cannot undo it.
      if (!untracked(this.open)) {
        scheduleFocus(trigger.ownerDocument, () => {
          if (!this.open() && this.restoreFocus()) focusReturn.restore();
        });
      }
    };
  }

  /**
   * Registers the dismiss layer if it is not registered yet. The trigger starts it as soon as the user opens the
   * Popover, so an Escape that comes before the content has rendered still closes it.
   */
  private startDismissLayer(): void {
    if (this.dismissLayer) return;
    const layer = this.zone.outside(() =>
      createDismissLayer({
        getInsideElements: () => [this._trigger(), this._content()?.element ?? null],
        onDismiss: (intent) => {
          const { reason, event } = intent;
          this.zone.inside(() => {
            // A refused close keeps the layers below open too.
            if (this.disableClose() || !this.send({ type: 'CONTENT.DISMISS', reason, event })) intent.preventDefault();
          });
        },
        dismissOn: ['escape', 'outside-press', 'focus-out'],
        getParent: () => this.parentLayer?.current ?? null,
      }),
    );
    this.dismissLayer = layer;
    this.layer.current = layer;
  }

  /** Removes the dismiss layer; safe to call when there is none. */
  private stopDismissLayer(): void {
    const layer = this.dismissLayer;
    if (!layer) return;
    layer.destroy();
    if (this.layer.current === layer) this.layer.current = null;
    this.dismissLayer = null;
  }

  /** A focusable, empty, invisible `span` that catches Tab at an end of the content. */
  private createGuard(): HTMLElement {
    const guard = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setAttribute(guard, 'tabindex', '0');
    for (const [name, value] of Object.entries(visuallyHiddenStyle)) {
      this.renderer.setStyle(guard, name, value);
    }
    return guard;
  }

  /**
   * Applies an event: `closePredicate` may refuse a close, then `open` is written and `opened` or `closed` emits.
   *
   * @param event - What happened.
   * @returns Whether the open state changed.
   */
  private send(event: PopoverEvent): boolean {
    const next = transitionPopover(this.state(), event);
    if (!next) return false;
    const details: PopoverChangeDetails = { reason: next.reason, event: event.event };
    if (!next.open && this.closePredicate()?.(details) === false) return false;
    this.open.set(next.open);
    if (next.open) this.startDismissLayer();
    else this.stopDismissLayer();
    (next.open ? this.opened : this.closed).emit(details);
    return true;
  }
}

/**
 * Finds the Popover root above a part.
 *
 * @param part - The part's name, for the error message.
 * @returns The root.
 * @internal
 */
export function injectCckPopover(part: string): CckPopover {
  const root = inject(CckPopover, { optional: true });
  if (!root) throw new Error(`CocoKits: cckPopover${part} must be placed inside an element with cckPopover.`);
  return root;
}
