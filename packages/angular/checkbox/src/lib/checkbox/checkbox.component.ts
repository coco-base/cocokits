import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  output,
  OutputEmitterRef,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { TrustHtmlPipe } from '@cocokits/angular-utils';
import { toBooleanOrPresent } from '@cocokits/common-utils';

import { CheckboxChange } from './checkbox.model';

// Increasing integer for generating unique ids for checkbox components.
let NEXT_ID = 1;

const CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxComponent),
  multi: true,
};

@Component({
  imports: [TrustHtmlPipe],
  selector: 'cck-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [CHECKBOX_CONTROL_VALUE_ACCESSOR],
  host: {
    '[class]': 'hostClassNames()',
    '(click)': 'preventBubblingFromLabel($event)',
  },
})
export class CheckboxComponent extends _UiBaseComponent<'checkbox'> implements ControlValueAccessor {
  protected readonly componentName = 'checkbox';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.indeterminate(), classes: this.classNames().indeterminate },
    { if: this.checked() && !this.indeterminate(), classes: this.classNames().checked },
    { if: !this.checked() && !this.indeterminate(), classes: this.classNames().unchecked },
    { if: this.disabled(), classes: this.classNames().disabled },
  ]);

  private cd = inject(ChangeDetectorRef);

  // region ---------------- INPUTS ----------------
  /** Whether the checkbox is checked. */
  public checked: ModelSignal<boolean | undefined> = model<boolean>();

  /**
   * Whether the checkbox is disabled.
   * @storybook argType will be overridden by storybook
   */
  public _disabled = model<boolean | null | undefined>(undefined, { alias: 'disabled' });
  protected disabled = computed(() => toBooleanOrPresent(this._disabled()));

  /**
   * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
   * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
   * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
   * set to false.
   */
  public indeterminate: ModelSignal<boolean | undefined> = model<boolean>();

  /**
   * A unique id for the checkbox input. If none is supplied, it will be auto-generated.
   */
  public id: InputSignal<string> = input<string>(`cck-checkbox-${NEXT_ID++}`);

  /** The value attribute of the native input element */
  public value: InputSignal<any> = input<any>('');

  /** Name value will be applied to the input element if present */
  public name: InputSignal<string | null> = input<string | null>(null);
  // endregion

  // region ---------------- OUTPUTS ----------------
  /** Event emitted when the checkbox's `checked` value changes. */
  public readonly change: OutputEmitterRef<CheckboxChange> = output<CheckboxChange>();

  /** Event emitted when the checkbox's `indeterminate` value changes. */
  public readonly indeterminateChange: OutputEmitterRef<boolean> = output<boolean>();
  // endregion

  // region ---------------- PUBLIC METHODS ----------------
  /** Toggles the `checked` state of the checkbox. */
  public toggle(): void {
    this.updateCheck(!this.checked());
    this._controlValueAccessorChangeFn(this.checked());
    this.updateIndeterminate(false);
  }
  // endregion

  // region ---------------- PRIVATE METHODS ----------------

  private updateCheck(checked: boolean) {
    const hasChanged = this.checked() !== checked;
    this.checked.set(checked);

    if (hasChanged) {
      this.change.emit({ source: this, checked });
    }
  }

  private updateIndeterminate(indeterminate: boolean) {
    const hasChanged = this.indeterminate() !== indeterminate;
    this.indeterminate.set(indeterminate);

    if (hasChanged) {
      this.indeterminateChange.emit(indeterminate);
    }
  }

  protected onInputClick() {
    this.toggle();
  }

  protected onInteractionEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise, the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();
  }

  protected onBlur() {
    // When a focused element becomes disabled, the browser *immediately* fires a blur event.
    // Angular does not expect events to be raised during change detection, so any state change
    // (such as a form control's 'ng-touched') will cause a changed-after-checked error.
    // See https://github.com/angular/angular/issues/17793. To work around this, we defer
    // telling the form control it has been touched until the next tick.
    Promise.resolve().then(() => {
      this._onTouched();
      this.cd.markForCheck();
    });
  }

  /**
   *  Prevent click events that come from the `<label/>` element from bubbling. This prevents the
   *  click handler on the host from triggering twice when clicking on the `<label/>` element. After
   *  the click event on the `<label/>` propagates, the browsers dispatches click on the associated
   *  `<input/>`. By preventing clicks on the label by bubbling, we ensure only one click event
   *  bubbles when the label is clicked.
   */
  protected preventBubblingFromLabel(event: MouseEvent) {
    event.stopPropagation();
  }

  /**
   * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
   * @docs-private
   */
  protected _onTouched: () => any = () => {
    // Do nothing.
  };

  private _controlValueAccessorChangeFn: (value: any) => void = () => {
    // Do nothing.
  };

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
   */
  writeValue(value: any) {
    this.checked.set(!!value);
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
   */
  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
   */
  setDisabledState(isDisabled: boolean) {
    this._disabled.set(isDisabled);
  }

  // endregion
}
