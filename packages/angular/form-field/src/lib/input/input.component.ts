import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { fromAttrByNameToBoolean, fromControl } from '@cocokits/angular-utils';

import { injectFormFieldStore } from '../form-field.store';

@Component({
  standalone: true,
  imports: [],
  selector: 'input[cck-input], input[cckInput]',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
    '[disabled]': 'store.state.disabled()',
    '[type]': 'type()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class InputComponent extends _UiBaseComponent<'input'> implements OnInit {
  protected readonly componentName = 'input';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.store.state.disabled(), classes: this.classNames().disabled },
  ]);

  protected cd = inject(ChangeDetectorRef);
  protected store = injectFormFieldStore();
  private ngControl = inject(NgControl, { optional: true, self: true });
  private destroyRef = inject(DestroyRef);

  private required = fromAttrByNameToBoolean('required');
  private focused = signal(false);

  /**
   * Input type of the element.
   */
  public override type = input<string | null>();

  /**
   * Whether the input is disabled.
   */
  public disabled = fromAttrByNameToBoolean('disabled');

  constructor() {
    super();
    this.baseClassOptions.skipType = true;
  }

  ngOnInit() {
    this.store.input.disabled = this.disabled;
    this.store.input.required = this.required;
    this.store.input.focused = this.focused;

    if (this.ngControl?.control) {
      this.store.ngControl = this.ngControl.control;
      this.store.control = fromControl(this.ngControl.control, { destroyRef: this.destroyRef });

      // Call change detection, when the control has changes outside of component
      this.ngControl.control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((_) => {
        this.cd.markForCheck();
      });
    }
  }

  protected onFocus() {
    this.focused.set(true);
  }

  protected onBlur() {
    this.focused.set(false);
  }
}
