import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { toBooleanOrPresent } from '@cocokits/common-utils';

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
export class FormFieldComponent extends _UiBaseComponent<'formField'> implements OnDestroy {
  protected readonly componentName = 'formField';
  protected store = injectFormFieldStore();
  private cd = inject(ChangeDetectorRef);

  /** Whether the required marker should be hidden. */
  public hideRequiredMarker = input<boolean>();

  /** Whether the control is disabled. */
  public disabled = input(undefined, { transform: toBooleanOrPresent });

  protected extraHostElementClassConditions = computed(() => [
    { if: this.store.state.disabled(), classes: this.classNames().disabled },
    { if: this.store.state.focused(), classes: this.classNames().focused },
    { if: this.store.state.hasError(), classes: this.classNames().error },
    { if: this.store.state.hasInput(), classes: this.classNames().withInput },
    { if: this.store.state.hasTextarea(), classes: this.classNames().withTextarea },
    { if: this.store.state.hasSelect(), classes: this.classNames().withSelect },
    { if: this.store.state.hasChipList(), classes: this.classNames().withChipList },
    { if: this.store.control.untouched(), classes: this.classNames().untouched },
    { if: this.store.control.touched(), classes: this.classNames().touched },
    { if: this.store.control.pristine(), classes: this.classNames().pristine },
    { if: this.store.control.dirty(), classes: this.classNames().dirty },
    { if: this.store.control.valid(), classes: this.classNames().valid },
    { if: this.store.control.invalid(), classes: this.classNames().invalid },
    { if: this.store.control.pending(), classes: this.classNames().pending },
  ]);

  public _wrapperElemRef = viewChild.required<ElementRef<HTMLElement>>('wrapperElem');

  constructor() {
    super();
    this.store.registerComponent('formField', this, this.cd);
  }

  ngOnDestroy() {
    this.store.unregisterComponent(this, this.cd);
  }
}
