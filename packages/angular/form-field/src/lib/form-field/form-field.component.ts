import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  public hasError = this.store.state.hasError;

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
    { if: this.store.control?.untouched(), classes: this.classNames().untouched },
    { if: this.store.control?.touched(), classes: this.classNames().touched },
    { if: this.store.control?.pristine(), classes: this.classNames().pristine },
    { if: this.store.control?.dirty(), classes: this.classNames().dirty },
    { if: this.store.control?.valid(), classes: this.classNames().valid },
    { if: this.store.control?.invalid(), classes: this.classNames().invalid },
    { if: this.store.control?.pending(), classes: this.classNames().pending },
    { if: this.store.state.hasError(), classes: this.classNames().error },
    { if: this.store.state.hasInput(), classes: this.classNames().withInput },
    { if: this.store.state.hasTextarea(), classes: this.classNames().withTextarea },
    { if: this.store.state.hasSelect(), classes: this.classNames().withSelect },
  ]);

  public wrapperElemRef = viewChild<ElementRef<HTMLElement>>('wrapperElem');

  private __setStoreWrapperElemRef = effect(() => {
    const wrapperElemRef = this.wrapperElemRef();

    if (wrapperElemRef) {
      this.store.formField.wrapperElem = wrapperElemRef.nativeElement;
    }
  });

  ngOnInit() {
    this.store.formField.disable = this.disabled;
    this.store.formField.hideRequiredMarker = this.hideRequiredMarker;
    this.store.formField.hasFormField = true;

    // Call change detection, when the control has changes outside of component
    this.store.ngControl?.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((_) => {
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this.store.formField.hasFormField = false;
  }
}
