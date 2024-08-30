import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';

import { IconButtonComponent } from '@cocokits/angular-button';
import { _UiBaseComponent } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { fromAttrByNameToBoolean } from '@cocokits/angular-utils';
import { ThemeSvgIcon } from '@cocokits/core';

import { injectFormFieldStore } from '../form-field.store';

@Component({
  standalone: true,
  imports: [SvgIconComponent, IconButtonComponent],
  selector: 'cck-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class ChipComponent extends _UiBaseComponent<'chip'> {
  protected readonly componentName = 'chip';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.disabled() ?? this.formFieldStore.state.disabled(), classes: this.classNames().disabled },
    { if: this.removable(), classes: this.classNames().removable },
  ]);

  protected formFieldStore = injectFormFieldStore();

  protected removeIcon: ThemeSvgIcon;

  removable = input<boolean>();
  disabled = fromAttrByNameToBoolean('disabled');

  remove = output();

  constructor() {
    super();

    const removeIcon = this.uiComponentConfig.chip.component?.chipRemoveIcon;

    if (!removeIcon) {
      throw new Error('`chipRemoveIcon` has not defined in `uiComponentConfig` of selected theme');
    }
    this.removeIcon = removeIcon;
  }

  protected onRemoveBtnClick() {
    this.remove.emit();
  }
}
