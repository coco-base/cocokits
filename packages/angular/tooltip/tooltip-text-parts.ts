import { Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckTooltip } from './tooltip';

/**
 * The first line of a tooltip with more than one line: a short heading, usually bold. It is part of the tooltip text, so the trigger is described by the title and the description together.
 *
 * @example
 * <cck-tooltip-content>
 *   <cck-tooltip-title>Autosave</cck-tooltip-title>
 *   <cck-tooltip-description>Changes are saved as you type.</cck-tooltip-description>
 * </cck-tooltip-content>
 * @cckPart title
 * @cckSlot default - The text of the title. When not set, the title is empty.
 */
@Directive({
  selector: 'cck-tooltip-title',
  exportAs: 'cckTooltipTitle',
  host: { '[class]': 'props().class' },
})
export class CckTooltipTitle {
  private readonly root = injectCckTooltip('Title');
  protected readonly props = computed(() => this.root._parts().title);

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().title);
  }
}

/**
 * The explanation under the title of a tooltip, in a smaller size. It is part of the tooltip text, so the trigger is described by the title and the description together.
 *
 * @example
 * <cck-tooltip-content>
 *   <cck-tooltip-title>Autosave</cck-tooltip-title>
 *   <cck-tooltip-description>Changes are saved as you type.</cck-tooltip-description>
 * </cck-tooltip-content>
 * @cckPart description
 * @cckSlot default - The text of the description. When not set, the description is empty.
 */
@Directive({
  selector: 'cck-tooltip-description',
  exportAs: 'cckTooltipDescription',
  host: { '[class]': 'props().class' },
})
export class CckTooltipDescription {
  private readonly root = injectCckTooltip('Description');
  protected readonly props = computed(() => this.root._parts().description);

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().description);
  }
}
