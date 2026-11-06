import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { bindAttrs, mergeIds } from '@cocokits/angular-core';
import { injectCckTooltip } from './tooltip';

/**
 * Marks the focusable element a compound Tooltip describes. Put it on any focusable element: a `button`, or
 * another component by adding the directive next to it. Its `aria-describedby` names the hidden description
 * when the root has a message, else the content while it is mounted. A disabled button cannot be focused, so it
 * never shows the tooltip; put the trigger on a focusable wrapper around it.
 *
 * @example
 * <button cckTooltipTrigger aria-label="Copy link">...</button>
 * @cckPart trigger
 * @cckSlot default - The trigger content.
 * @cckDataAttr data-state - `open` or `closed`
 */
@Directive({
  selector: '[cckTooltipTrigger]',
  exportAs: 'cckTooltipTrigger',
  host: {
    '[class]': 'props().class',
    '[id]': 'id() ?? props().id',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.data-state]': 'props()["data-state"]',
    '(pointerenter)': 'props().onPointerEnter($event)',
    '(pointerleave)': 'props().onPointerLeave($event)',
    '(pointerdown)': 'props().onPointerDown($event)',
    '(focus)': 'props().onFocus($event)',
    '(blur)': 'props().onBlur($event)',
  },
})
export class CckTooltipTrigger {
  /**
   * The id of the trigger; it wins over the generated one and follows changes.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | null | undefined>(null);

  /**
   * The ids that describe the trigger; the tooltip adds its own to them.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly ariaDescribedby = input<string | null | undefined>(null, { alias: 'aria-describedby' });

  private readonly root = injectCckTooltip('Trigger');
  protected readonly props = computed(() => this.root._parts().trigger);
  protected readonly describedBy = computed(() => mergeIds(this.ariaDescribedby(), this.props()['aria-describedby']));

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._triggerPart.set(element);
    inject(DestroyRef).onDestroy(() => {
      this.root._triggerPart.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().trigger);
  }
}
