import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { bindAttrs, mergeIds } from '@cocokits/angular-core';
import { injectCckTooltip } from './tooltip';

/**
 * The element that the tooltip describes, in the rich form. Put the attribute on any focusable element, also next to the attribute of another component.
 *
 * A trigger with only an icon needs `aria-label` or `aria-labelledby`. Its name must not come from the tooltip.
 *
 * The trigger is described by the text of `cckTooltip`, or by the content while it shows. A disabled button cannot get the focus, so it never shows a tooltip. Put the trigger on a focusable element around it.
 *
 * @example
 * <ng-container cckTooltip="Copy link">
 *   <button cckTooltipTrigger type="button" aria-label="Copy">…</button>
 * </ng-container>
 * @cckPart trigger
 * @cckSlot default - The content of the trigger. When not set, the trigger is empty, so name it with `aria-label`.
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
   * The `id` of the trigger. When not set, the trigger gets a generated id.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | null | undefined>(null);

  /**
   * The ids of the elements that describe the trigger. The tooltip adds its own id after them. When not set, only the tooltip describes the trigger.
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
