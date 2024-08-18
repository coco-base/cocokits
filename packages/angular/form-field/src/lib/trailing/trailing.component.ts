import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

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

  protected extraHostElementClass = computed(() => {
    const classNames: string[] = [];

    if (this.clickable() && !this.store.state.disabled()) {
      classNames.push(...this.classNames().clickable);
    }

    return classNames;
  });

  /**
   * Whether the component is clickable.
   */
  public clickable = input(false);
}
