import { DestroyRef, Directive, TemplateRef, inject } from '@angular/core';
import { injectCckSelect } from './select';
import type { SelectTriggerContext } from './select-types';

/**
 * Your own markup for the trigger, in place of the labels of the selected options.
 *
 * The Select shows this template only while something is selected. While nothing is selected, the placeholder shows. The template receives the selected values as `selected`.
 *
 * @defaultValue The trigger shows the text of the selected options, joined with a comma.
 * @example
 * <cck-select multiple [(value)]="dishes" placeholder="Choose dishes" aria-label="Dishes">
 *   <ng-template cckSelectTrigger let-selected="selected">{{ selected.length }} selected</ng-template>
 *   <cck-select-option value="Cake">Cake</cck-select-option>
 * </cck-select>
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
    /** The values that are selected, as a list. A single Select gives a list of one value. */
    readonly selected: readonly T[];
  } {
    return directive instanceof CckSelectTrigger && typeof context === 'object';
  }

  private readonly root = injectCckSelect<unknown>('cckSelectTrigger');
  private readonly template = inject<TemplateRef<SelectTriggerContext<T>>>(TemplateRef);

  constructor() {
    this.root._triggerTemplate.set(this.template);
    inject(DestroyRef).onDestroy(() => {
      this.root._triggerTemplate.update((current) => (current === this.template ? null : current));
    });
  }
}
