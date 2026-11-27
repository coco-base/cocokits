import { Directive, ElementRef, afterNextRender, computed, inject, signal, type Signal } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import type { PopoverParts } from '@cocokits/machines/popover';
import type { ThemeAttrs } from '@cocokits/shared';

/** What an anchor reads from the root of the trigger it holds. @internal */
export interface PopoverAnchorLink {
  /** The props of the anchor part. */
  readonly props: Signal<PopoverParts['anchor']>;
  /** The theme attributes of the anchor part. */
  readonly theme: Signal<ThemeAttrs>;
}

/**
 * An element that the content lines up with, in place of the trigger. Put the attribute on an element that holds the trigger, at any depth. It only changes where the content shows.
 *
 * The anchor has no role and no ARIA attributes. The trigger keeps `aria-expanded` and gets the focus back. A press on the anchor still counts as a press outside.
 *
 * @example
 * <div cckPopoverAnchor>
 *   <button type="button" [cckPopoverTriggerFor]="share">Share</button>
 * </div>
 * <ng-template #share>
 *   <cck-popover-content aria-label="Share this page">Anyone with the link can view it.</cck-popover-content>
 * </ng-template>
 * @cckPart anchor
 * @cckAround trigger
 * @cckSlot default - The trigger and any other content. When not set, the anchor holds no trigger, so nothing lines up with it.
 * @remarks The trigger lines up with the nearest anchor around it. A trigger in the content of a popover never takes the anchor of that popover.
 * @cckParity Places the content against an element only; there is no virtual anchor.
 */
@Directive({
  selector: '[cckPopoverAnchor]',
  exportAs: 'cckPopoverAnchor',
  host: { '[class]': 'props()?.class ?? null' },
})
export class CckPopoverAnchor {
  /** The element of the anchor; the trigger gives it to its root. @internal */
  readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** The link to the root of the trigger inside; the trigger sets it. @internal */
  readonly _link = signal<PopoverAnchorLink | null>(null);
  protected readonly props = computed(() => this._link()?.props());

  constructor() {
    bindAttrs(this._element, () => this._link()?.theme() ?? {});
    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (!this._link()) {
        console.warn(
          'CocoKits: a cckPopoverAnchor holds no cckPopoverTriggerFor, so no content lines up with it. Put the trigger inside the anchor.',
        );
      }
    });
  }
}
