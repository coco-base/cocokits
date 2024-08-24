import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { FormFieldStore, FormFieldStoreService, injectFormFieldStore } from '../form-field.store';

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: FormFieldStore,
      useClass: FormFieldStoreService,
    },
  ],
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class FormFieldComponent extends _UiBaseComponent<'formField'> implements OnInit, OnDestroy {
  protected readonly componentName = 'formField';
  protected store = injectFormFieldStore();

  /**
   * Whether the required marker should be hidden.
   */
  public hideRequiredMarker = input<boolean>();

  /**
   * Whether the control is disabled.
   */
  public disabled = model<boolean>();

  protected extraHostElementClassConditions = computed(() => [
    { if: this.store.state.disabled(), classes: this.classNames().disabled },
    { if: this.store.state.focused(), classes: this.classNames().focused },
    { if: this.store.input.control?.untouched(), classes: this.classNames().untouched },
    { if: this.store.input.control?.touched(), classes: this.classNames().touched },
    { if: this.store.input.control?.pristine(), classes: this.classNames().pristine },
    { if: this.store.input.control?.dirty(), classes: this.classNames().dirty },
    { if: this.store.input.control?.valid(), classes: this.classNames().valid },
    { if: this.store.input.control?.invalid(), classes: this.classNames().invalid },
    { if: this.store.state.hasError(), classes: this.classNames().error },
    { if: this.store.input.control?.pending(), classes: this.classNames().pending },
    { if: this.store.state.hasInput(), classes: this.classNames().withInput },
    { if: this.store.state.hasTextarea(), classes: this.classNames().withTextarea },
  ]);

  ngOnInit() {
    this.store.formField.disable = this.disabled;
    this.store.formField.hideRequiredMarker = this.hideRequiredMarker;
    this.store.formField.hasFormField = true;
  }

  ngOnDestroy() {
    this.store.formField.hasFormField = false;
  }
}
