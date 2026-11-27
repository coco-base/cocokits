import { Directive, TemplateRef, inject, input } from '@angular/core';
import { CckTooltip } from './tooltip';

/**
 * The element that the rich tooltip describes. Put `[cckTooltipTriggerFor]` on any focusable element, also next to the attribute of another component, and give it an `ng-template` with a `cck-tooltip-content`.
 *
 * It applies the root: write the root's inputs, like `cckTooltipShowDelay` or `cckTooltipDisableClose`, on the same element, and reach `show()`, `hide()` and `toggle()` with `#tip="cckTooltip"`. Do not also write `cckTooltip` there.
 *
 * A trigger with only an icon needs `aria-label` or `aria-labelledby`. Its name must not come from the tooltip.
 *
 * The trigger is described by the title and the description of the content, also while the tooltip is closed. A disabled button cannot get the focus, so it never shows a tooltip. Put the trigger on a focusable element around it.
 *
 * @example
 * <button type="button" aria-label="Copy" [cckTooltipTriggerFor]="copy"><cck-svg-icon iconName="copy" /></button>
 * <ng-template #copy>
 *   <cck-tooltip-content><cck-tooltip-title>Copy the link</cck-tooltip-title></cck-tooltip-content>
 * </ng-template>
 * @cckPart trigger
 * @cckSlot default - The content of the trigger. When not set, the trigger is empty, so name it with `aria-label`.
 */
@Directive({
  selector: '[cckTooltipTriggerFor]',
  exportAs: 'cckTooltipTrigger',
  hostDirectives: [
    {
      directive: CckTooltip,
      inputs: [
        'cckTooltipShowDelay',
        'cckTooltipHideDelay',
        'cckTooltipDisabled',
        'cckTooltipPositionAtOrigin',
        'cckTooltipDisableClose',
      ],
    },
  ],
})
export class CckTooltipTrigger {
  /**
   * The template of the tooltip: an `ng-template` with the `cck-tooltip-content` inside.
   * @example
   * <button type="button" [cckTooltipTriggerFor]="copy">Copy</button>
   * <ng-template #copy><cck-tooltip-content>Copy <b>the</b> link</cck-tooltip-content></ng-template>
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly cckTooltipTriggerFor = input.required<TemplateRef<unknown>>();

  /**
   * The `id` of the trigger. When not set, the trigger gets a generated id.
   * @remarks A menu, popover or dialog trigger on the same element owns the `id`, so the tooltip then leaves it alone.
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

  constructor() {
    const root = inject(CckTooltip);
    root._template = this.cckTooltipTriggerFor;
    root._authorIds = { id: this.id, describedBy: this.ariaDescribedby };
  }
}
