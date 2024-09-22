import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
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
import { toBooleanOrPresent } from '@cocokits/common-utils';

let NEXT_ID = 1;

export interface CckToggleChange {
  checked: boolean;
}

const TOGGLE_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ToggleComponent),
  multi: true,
};

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [TOGGLE_CONTROL_VALUE_ACCESSOR],
  host: {
    '[class]': 'hostClassNames()',
    '(click)': 'onHostClick($event)',
  },
})
export class ToggleComponent extends _UiBaseComponent<'toggle'> implements ControlValueAccessor {
  protected readonly componentName = 'toggle';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.disabled(), classes: this.classNames().disabled },
    { if: this.checked(), classes: this.classNames().checked },
    { if: !this.checked(), classes: this.classNames().unchecked },
    { if: this.labelPosition() === 'before', classes: this.classNames().labelBefore },
  ]);

  private cd = inject(ChangeDetectorRef);
  private elemRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * A unique id for the slide-toggle input. If none is supplied, it will be auto-generated.
   */
  id: InputSignal<string> = input(`TOGGLE_${NEXT_ID++}`);

  /**
   * Whether the label should appear after or before the slide-toggle. Defaults to 'after'.
   */
  labelPosition: InputSignal<'before' | 'after'> = input<'before' | 'after'>('after');

  /**
   * Whether the slide-toggle element is checked or not.
   */
  checked: ModelSignal<boolean> = model(false);

  /**
   * Whether the slide toggle is disabled.
   * @storybook argType will be overridden by storybook
   */
  public _disabled = model<boolean | null | undefined>(undefined, { alias: 'disabled' });
  protected disabled = computed(() => toBooleanOrPresent(this._disabled()));

  /**
   * An event will be dispatched each time the slide-toggle changes its value.
   */
  change: OutputEmitterRef<CckToggleChange> = output<CckToggleChange>();

  /**
   * Toggles the checked state of the slide-toggle.
   */
  public toggle() {
    this.setChecked(!this.checked());
  }

  /**
   * Set the checked state of the slide-toggle.
   */
  public setChecked(checked: boolean) {
    const hasChanged = this.checked() !== checked;

    if (hasChanged) {
      this.checked.set(checked);
      this.controlValueAccessorChangeFn(checked);
      this.change.emit({ checked });
    }
  }

  /**
   *  Skip click events that didn't come from the `<label/>` element and accept only the host element.
   *  For example click on padding part of host element.
   *  This prevents the click handler on the host from triggering twice when clicking on the `<label/>` element. After
   *  the click event on the `<label/>` propagates, the browsers dispatches click on the associated
   *  `<input/>`. By preventing clicks on the label by bubbling, we ensure only one click event
   *  bubbles when the label is clicked.
   */
  protected onHostClick(event: MouseEvent) {
    if (event.target !== this.elemRef.nativeElement) {
      return;
    }
    this.toggle();
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
      this.onTouched();
      this.cd.markForCheck();
    });
  }

  /**
   * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
   * @docs-private
   */
  protected onTouched: () => any = () => {
    // Do nothing.
  };

  private controlValueAccessorChangeFn: (value: any) => void = () => {
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
    this.controlValueAccessorChangeFn = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
   */
  setDisabledState(isDisabled: boolean) {
    this._disabled.set(isDisabled);
  }
}
