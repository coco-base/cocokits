import { ChangeDetectionStrategy, Component, computed, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { injectFormFieldStore } from '../form-field.store';

@Component({
  imports: [],
  selector: 'cck-leading',
  templateUrl: './leading.component.html',
  styleUrls: ['./leading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class LeadingComponent extends _UiBaseComponent<'leading'> {
  protected readonly componentName = 'leading';
  private store = injectFormFieldStore();

  /**
   * Whether the component is clickable.
   */
  public clickable: InputSignal<boolean> = input(false);

  protected override extraHostElementClassConditions = computed(() => [
    { if: this.clickable() && !this.store.state.disabled(), classes: this.classNames().clickable },
  ]);
}
