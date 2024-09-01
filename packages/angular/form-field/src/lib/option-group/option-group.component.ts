import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { SelectComponent } from '../select/select.component';
import { toBooleanOrPresent } from '@cocokits/common-utils';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-option-group',
  templateUrl: './option-group.component.html',
  styleUrls: ['./option-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class OptionGroupComponent extends _UiBaseComponent<'optionGroup'> {
  protected readonly componentName = 'optionGroup';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.disabled() ?? false, classes: this.classNames().disabled },
  ]);

  override _effectedSize = computed(() => this.size() ?? this.selectComp?._effectedSize());

  private selectComp = inject(SelectComponent, { optional: true });

  /**
   * Whether the input is disabled.
   */
  public disabled = input(null, { transform: toBooleanOrPresent });

  /**
   * Label for the option group.
   */
  public label = input<string>();
}
