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

import { getExtraHostElementClass } from './form-field.utils';
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

  protected extraHostElementClass = computed(() => getExtraHostElementClass(this.store, this.classNames()));

  ngOnInit() {
    this.store.formField.disable = this.disabled;
    this.store.formField.hideRequiredMarker = this.hideRequiredMarker;
    this.store.formField.hasFormField = true;
  }

  ngOnDestroy() {
    this.store.formField.hasFormField = false;
  }
}
