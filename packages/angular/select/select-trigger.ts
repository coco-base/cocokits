import { DestroyRef, Directive, TemplateRef, inject } from '@angular/core';
import { injectCckSelect } from './select';
import type { SelectTriggerContext } from './select-types';

/**
 * Replaces the text of the trigger with your own markup. The template receives the selected values as
 * `selected`; the Select renders it only while something is selected. Without it, the trigger shows the labels
 * of the selected options joined with `, `.
 *
 * @example
 * <div cckSelect multiple [(value)]="dishes" placeholder="Choose dishes">
 *   <ng-template cckSelectTrigger let-selected="selected">{{ selected.length }} selected</ng-template>
 *   <div cckSelectOption value="Cake">Cake</div>
 * </div>
 * @cckTemplate ng-template[cckSelectTrigger]
 */
@Directive({ selector: 'ng-template[cckSelectTrigger]', exportAs: 'cckSelectTrigger' })
export class CckSelectTrigger<T = unknown> {
  /**
   * Types the template context: the selected values are `selected`.
   *
   * @param directive - The directive the template belongs to.
   * @param context - The context the Select renders the template with.
   * @returns Always `true`; only the type matters.
   */
  static ngTemplateContextGuard<T>(
    directive: CckSelectTrigger<T>,
    context: unknown,
  ): context is {
    /** The selected values; empty while nothing is selected (the placeholder shows then). */
    readonly selected: readonly T[];
  } {
    return directive instanceof CckSelectTrigger && typeof context === 'object';
  }

  private readonly root = injectCckSelect<unknown>('Trigger');
  private readonly template = inject<TemplateRef<SelectTriggerContext<T>>>(TemplateRef);

  constructor() {
    this.root._triggerTemplate.set(this.template);
    inject(DestroyRef).onDestroy(() => {
      this.root._triggerTemplate.update((current) => (current === this.template ? null : current));
    });
  }
}
