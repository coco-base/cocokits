import { ChangeDetectionStrategy, Component, computed, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { injectFormFieldStore } from '../form-field.store';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-trailing',
  templateUrl: './trailing.component.html',
  styleUrls: ['./trailing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class TrailingComponent extends _UiBaseComponent<'trailing'> {
  protected readonly componentName = 'trailing';

  private store = injectFormFieldStore();

  protected extraHostElementClassConditions = computed(() => [
    { if: this.clickable() && !this.store.state.disabled(), classes: this.classNames().clickable },
  ]);

  /**
   * Whether the component is clickable.
   */
  public clickable: InputSignal<boolean> = input(false);
}
