import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  ViewEncapsulation,
} from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { _UiBaseComponent } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { isNotNullish, isNullish, toBooleanOrPresent } from '@cocokits/common-utils';

import { OptionGroupComponent } from '../option-group/option-group.component';
import { injectSelectStore, SelectTriggerSource } from '../select.store';
import { SelectComponent } from '../select/select.component';

@Component({
  standalone: true,
  imports: [CheckboxComponent, SvgIconComponent],
  selector: 'cck-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
    '(click)': 'onHostClick($event)',
  },
})
export class OptionComponent<T = any> extends _UiBaseComponent<'option'> {
  protected readonly componentName = 'option';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.disabled(), classes: this.classNames().disabled },
    { if: this.isSelected(), classes: this.classNames().selected },
    { if: this.selectStore.isMultiple(), classes: this.classNames().multiple },
    { if: !this.selectStore.isMultiple(), classes: this.classNames().single },
  ]);

  /** @ignore */
  override size = computed(() => this._size() ?? this.selectComp?.size());

  protected isSelected = computed(() => {
    const value = this.value();
    return isNotNullish(value) ? this.selectStore.isSelected(value)() : false;
  });

  private optionGroupComp = inject(OptionGroupComponent, { optional: true });
  private selectComp = inject(SelectComponent, { optional: true });
  protected selectStore = injectSelectStore<T>();

  // region ---------------- INPUTS ----------------
  /**
   * Whether the input is disabled.
   * @storybook argType will be overridden by storybook
   */
  public _disabled = input(undefined, { alias: 'disabled', transform: toBooleanOrPresent });
  protected disabled = computed(() => this._disabled() ?? this.optionGroupComp?.disabled() ?? false);

  /**
   * Value of the select control.
   */
  public value: InputSignal<T | undefined> = input<T>();
  // endregion

  protected onHostClick(e: Event) {
    e.stopPropagation();

    if (this.disabled()) {
      return;
    }

    const value = this.value();

    if (this.selectStore.isMultiple()) {
      if (isNullish(value)) {
        return;
      }
      this.selectStore.toggle(value, { triggerSource: SelectTriggerSource.FromOption });
      return;
    }

    isNullish(value)
      ? this.selectStore.clear({ triggerSource: SelectTriggerSource.FromOption })
      : this.selectStore.select(value, { triggerSource: SelectTriggerSource.FromOption });

    this.selectStore.renderedOverlay?.overlayRef.close();
  }

  protected onCheckboxClick(checked: boolean) {
    const value = this.value();

    if (isNullish(value)) {
      return;
    }

    checked
      ? this.selectStore.select(value, { triggerSource: SelectTriggerSource.FromOption })
      : this.selectStore.deselect(value, { triggerSource: SelectTriggerSource.FromOption });
  }
}
