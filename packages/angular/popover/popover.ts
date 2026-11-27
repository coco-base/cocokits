import {
  DestroyRef,
  Directive,
  Renderer2,
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
import { CckDirection, IdGenerator, createOverlayOutlet, injectZoneBoundary, themeAttrs } from '@cocokits/angular-core';
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
import { CckPopoverAnchor } from './popover-anchor';

/** What the content part tells the root about itself. @internal */
export interface PopoverContentRegistration {
  /** The content element, in the portal host. */
  readonly element: HTMLElement;
  /** The wanted side. */
  readonly side: Signal<PopoverSide>;
  /** The wanted alignment. */
  readonly align: Signal<PopoverAlign>;
  /** The gap to the anchor in px, when the author set one; else the theme's `--side-offset`. */
  readonly sideOffset: Signal<number | undefined>;
  /** The shift along the anchor edge in px, when the author set one. */
  readonly alignOffset: Signal<number | undefined>;
  /** Whether the content has rendered once, so it has its class and theme attributes: only then it is positioned. */
  readonly ready: Signal<boolean>;
}

/** Why the open state of a Popover changed. */
export type PopoverOpenChangeReason = PopoverChangeReason;

/** What `opened`, `closed` and `closePredicate` receive: the `reason` of the change and the `event` behind it. */
export type PopoverChangeDetails = ChangeDetails<PopoverOpenChangeReason>;

/**
 * A panel that opens next to a button and does not block the page. The trigger applies the root, so it makes no element: write its inputs and outputs on the `cckPopoverTriggerFor` button. It holds the open state and links the trigger, the content and the close button.
 *
 * You write the content in an `ng-template` and give it to the trigger by reference. It shows in the overlay container, not next to the trigger.
 *
 * On open, the focus moves into the content. Escape, the close button and a press outside close it, and the focus goes back to the trigger. Tab past the first or last element also closes it.
 *
 * @example
 * <div cckPopoverAnchor>
 *   <button type="button" [cckPopoverTriggerFor]="share" [(open)]="shared">Share</button>
 * </div>
 * <ng-template #share>
 *   <cck-popover-content side="top">
 *     <cck-popover-arrow></cck-popover-arrow>
 *     <h2 cckPopoverTitle>Share this page</h2>
 *     <cck-popover-description>Anyone with the link can view it.</cck-popover-description>
 *     <button cckPopoverClose type="button">Close</button>
 *   </cck-popover-content>
 * </ng-template>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The `ng-template` you give to `cckPopoverTriggerFor`, with the `cck-popover-content` inside. When not set, the build fails, because the input is required.
 */
@Directive()
export class CckPopover {
  /**
   * Whether the content is open. Use `[(open)]` to read and change it.
   * @remarks `openChange` emits the new value when the popover opens or closes itself. `opened` and `closed` also send the reason.
   * @defaultValue false
   */
  readonly open = model(false);

  /**
   * Whether Escape, a press outside and a focus leave keep the popover open. The close button, the trigger and a change from the parent still close it.
   * @remarks It runs before `closePredicate`. Keep a close button, so a keyboard user can still leave.
   * @defaultValue false
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * A function that decides whether a close that the popover starts happens. Return `false` to keep it open. When not set, every close happens.
   * @remarks It runs for the close button, the trigger, Escape, a press outside and a focus leave, after `disableClose`. It does not run when the parent changes `open`.
   * @example
   * <button type="button" [cckPopoverTriggerFor]="share" [closePredicate]="canClose">Share</button>
   * <ng-template #share>
   *   <cck-popover-content aria-label="Share this page">Anyone with the link can view it.</cck-popover-content>
   * </ng-template>
   * <!-- In the class: canClose = (details: PopoverChangeDetails) => details.reason !== 'outside-press'; -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly closePredicate = input<((details: PopoverChangeDetails) => boolean) | undefined>(undefined);

  /**
   * Whether the focus goes back to the trigger when the popover closes.
   * @defaultValue true
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly restoreFocus = input(true, { transform: booleanAttribute });

  /**
   * Emits after the user opens the popover with the trigger. It sends the `reason` and the `event`.
   * @remarks It never emits when the parent changes `open`.
   * @example
   * <button type="button" [cckPopoverTriggerFor]="share" (opened)="onOpen($event)">Share</button>
   * <ng-template #share>
   *   <cck-popover-content aria-label="Share this page">Anyone with the link can view it.</cck-popover-content>
   * </ng-template>
   * <!-- In the class: onOpen(details: PopoverChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly opened = output<PopoverChangeDetails>();

  /**
   * Emits after the popover closes itself. It sends the `reason` and the `event`.
   * @remarks The close button, the trigger, Escape, a press outside and a focus leave close it. It never emits when the parent changes `open`.
   * @example
   * <button type="button" [cckPopoverTriggerFor]="share" (closed)="onClose($event)">Share</button>
   * <ng-template #share>
   *   <cck-popover-content aria-label="Share this page">Anyone with the link can view it.</cck-popover-content>
   * </ng-template>
   * <!-- In the class: onClose(details: PopoverChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly closed = output<PopoverChangeDetails>();

  /** The theme attributes of every part; the parts apply their own record. @internal */
  readonly _theme = themeAttrs(popoverAnatomy);

  /** @internal */
  readonly _trigger = signal<HTMLElement | null>(null);
  /** The element the content is placed against instead of the trigger: the nearest anchor around the trigger. @internal */
  readonly _anchor = signal<HTMLElement | null>(null);
  /** @internal */
  readonly _content = signal<PopoverContentRegistration | null>(null);
  /** The template of the content; the trigger gives its input. @internal */
  _template: Signal<TemplateRef<unknown> | null> = signal(null);
  /** The arrow element a `cck-popover-arrow` registered; the content positions it. @internal */
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
  /**
   * The portal, the layer and the content injector. The popover owns them, so another overlay on the trigger keeps
   * its own. The content finds no anchor of an outer popover, so a trigger in the content lines up with itself.
   */
  private readonly outlet = createOverlayOutlet(CckPopover, this, [{ provide: CckPopoverAnchor, useValue: null }]);
  /** The portal of the content; the trigger gives it its view container. @internal */
  readonly _portal = this.outlet.portal;
  private readonly direction = inject(CckDirection);
  private readonly renderer = inject(Renderer2);
  private readonly zone = injectZoneBoundary();
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
      // A trigger removed after it opened, before the content rendered, has only its layer to take down.
      this.stopDismissLayer();
      this.presence.destroy();
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
          if (mounted && template && trigger)
            this._portal.attach(template, undefined, trigger, { injector: this.outlet.injector });
          else this._portal.detach();
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
        if (!mounted || !trigger || !content?.ready()) return;
        const [side, align] = [content.side(), content.align()];
        const [sideOffset, alignOffset] = [content.sideOffset(), content.alignOffset()];
        const stop = untracked(() =>
          this.zone.outside(() =>
            startOverlayPosition({
              getAnchor: () => anchor ?? trigger,
              getContent: () => content.element,
              side,
              align,
              ...(sideOffset === undefined ? {} : { sideOffset }),
              ...(alignOffset === undefined ? {} : { alignOffset }),
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
          focusReturn.destroy();
        });
      } else focusReturn.destroy();
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
        getParent: () => this.outlet.parentLayer?.current ?? null,
      }),
    );
    this.dismissLayer = layer;
    this.outlet.layer.current = layer;
  }

  /** Removes the dismiss layer; safe to call when there is none. */
  private stopDismissLayer(): void {
    const layer = this.dismissLayer;
    if (!layer) return;
    layer.destroy();
    if (this.outlet.layer.current === layer) this.outlet.layer.current = null;
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
  if (!root)
    throw new Error(`CocoKits: cckPopover${part} must be placed inside the template of a cckPopoverTriggerFor.`);
  return root;
}
