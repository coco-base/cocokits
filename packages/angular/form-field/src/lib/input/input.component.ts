import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { toBooleanOrPresent } from '@cocokits/common-utils';

import { injectFormFieldStore } from '../form-field.store';

@Component({
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
export class InputComponent extends _UiBaseComponent<'input'> implements OnInit, OnDestroy {
  protected readonly componentName = 'input';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.store.state.disabled(), classes: this.classNames().disabled },
  ]);

  protected cd = inject(ChangeDetectorRef);
  protected store = injectFormFieldStore();
  private ngControl = inject(NgControl, { optional: true, self: true });

  public _focused = signal(false);

  // region ---------------- INPUTS ----------------
  /**
   * Input type of the element.
   * @storybook argType will be overridden by storybook
   */
  public override _type = input<string | null | undefined>(undefined, { alias: 'type' });

  /**
   * Whether the input is required.
   * @storybook argType will be overridden by storybook
   */
  public _required = input(undefined, { transform: toBooleanOrPresent, alias: 'required' });

  /**
   * Whether the input is disabled.
   * @storybook argType will be overridden by storybook
   */
  public disabled = input(undefined, { transform: toBooleanOrPresent });
  // endregion

  constructor() {
    super();
    this.baseClassOptions.skipType = true;
    this.store.registerComponent('input', this, this.cd);
  }

  ngOnInit() {
    if (this.ngControl?.control) {
      this.store.setController(this.ngControl.control);
    }
  }

  protected onFocus() {
    this._focused.set(true);
  }

  protected onBlur() {
    this._focused.set(false);
  }

  ngOnDestroy() {
    this.store.unregisterComponent(this, this.cd);
  }
}
