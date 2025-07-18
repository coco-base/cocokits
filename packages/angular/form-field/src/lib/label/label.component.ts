import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { injectFormFieldStore } from '../form-field.store';

@Component({
  imports: [],
  selector: 'cck-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class LabelComponent extends _UiBaseComponent<'label'> {
  protected readonly componentName = 'label';
  protected extraHostElementClassConditions = computed(() => []);

  protected store = injectFormFieldStore();

  /**
   * The for attribute specifies which form element a label is bound to.
   */
  public for = input<string>();
}
