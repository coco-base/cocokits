import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { injectFormFieldStore } from '../form-field.store';

@Component({
  standalone: true,
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
  public clickable = input(false);

  protected extraHostElementClass = computed(() => {
    const classNames: string[] = [];

    if (this.clickable() && !this.store.state.disabled()) {
      classNames.push(...this.classNames().clickable);
    }

    return classNames;
  });
}
