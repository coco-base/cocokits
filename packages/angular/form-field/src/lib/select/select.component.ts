import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChild,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  Input,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

import { firstValueFrom } from 'rxjs';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';
import { OverlayConfig, OverlayConnectElemOrigin, OverlayService } from '@cocokits/angular-overlay';
import { isNullish, toBooleanOrPresent } from '@cocokits/common-utils';
import { ThemeSvgIcon } from '@cocokits/core';

import { injectFormFieldStore } from '../form-field.store';
import { injectSelectStore, SelectStore, SelectStoreService, SelectTriggerSource } from '../select.store';
import { SelectPreviewComponent } from '../select-preview/select-preview.component';

const SELECT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectComponent),
  multi: true,
};

@Component({
  imports: [SvgIconComponent],
  selector: 'cck-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    SELECT_CONTROL_VALUE_ACCESSOR,
    {
      provide: SelectStore,
      useClass: SelectStoreService,
    },
  ],
  host: {
    '[class]': 'hostClassNames()',
    '(click)': 'onHostClick($event)',
  },
})
export class SelectComponent<T = any>
  extends _UiBaseComponent<'select'>
  implements OnInit, OnDestroy, ControlValueAccessor
{
  protected readonly componentName = 'select';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.formFieldStore.state.disabled(), classes: this.classNames().disabled },
    { if: this.selectStore.isMultiple(), classes: this.classNames().multiple },
    { if: !this.selectStore.isMultiple(), classes: this.classNames().single },
    { if: this.isOpened(), classes: this.classNames().opened },
    { if: !this.isOpened(), classes: this.classNames().closed },
  ]);

  /** @ignore */
  override size = computed(() => this._size() ?? this.formFieldStore.formField.size?.());

  protected formFieldStore = injectFormFieldStore();
  protected selectStore = injectSelectStore<T>();
  private cd = inject(ChangeDetectorRef);
  private elemRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private overlay = inject(OverlayService);
  private injector = inject(Injector);

  protected dropdownIcon: ThemeSvgIcon;
  private ngControl: NgControl | null = null;

  protected customTrigger = contentChild(SelectPreviewComponent);

  protected optionsTemp = viewChild('optionsTemp', { read: TemplateRef });

  protected triggerValue = computed(() => this.selectStore.selectedItems().join(', '));

  public selected = this.selectStore.selectedItems;

  /**
   * Avoid using `effect` to listen for changes in selection and update the form controller value.
   * The `ControlValueAccessor` integrates with signals through the `formControl` function, which converts a form controller into a signal.
   * If we use effect, then we update another signal value inside the effect process, which is against Angular's signal guidelines.
   * The effect will listen to selectedItems from selectStore, and then update the form control value.
   * Following this, `formControl` will update all signals such as `value`, `touched` etc.
   *
   * From Angular Guidelines: When not to use effects
   * Avoid using effects for propagation of state changes.
   * This can result in ExpressionChangedAfterItHasBeenChecked errors,
   * infinite circular updates, or unnecessary change detection cycles.
   */
  private __onSelectedItemsChangedFromOption = this.selectStore.changes$
    .pipe(takeUntilDestroyed())
    .subscribe(({ selected, triggerSource }) => {
      if (triggerSource === SelectTriggerSource.FromOption) {
        this._controlValueAccessorChangeFn(selected);
        this._onTouched();
        this.selectionChange.emit(selected);
      }
    });

  /**
   * Whether the overlay to select an options is opened.
   * @storybook argType will be overridden by storybook
   */
  public isOpened = signal(false);
  // region ---------------- INPUTS ----------------

  /**
   * Whether the input is disabled.
   * @storybook argType will be overridden by storybook
   */
  public disabled = input(undefined, { transform: toBooleanOrPresent });

  /**
   * Whether the component is required.
   * @storybook argType will be overridden by storybook
   */
  public _required = input(undefined, { transform: toBooleanOrPresent, alias: 'required' });

  /**
   * Whether the user should be allowed to select multiple options.
   */
  @Input() set multiple(multiple: boolean) {
    this.selectStore.resetWithOption({ multiple });
  }

  /**
   * The max-height of options overlay when it's open. If set to `null` there is no max-height, and it takes the height of content
   */
  public maxOptionsHeight: InputSignal<number> = input<number>(220);

  /**
   * Value of the select control.
   */
  @Input() set value(value: T | T[]) {
    this.selectStore.setSelection(value);
  }

  /**
   * Placeholder to be shown if no value has been selected.
   */
  public placeholder: InputSignal<string> = input('');

  /**
   * Target element to attach the overlay to.
   * If not provided, the overlay will be attached root component.
   */
  public appendTo = input<OverlayConfig['appendTo']>();

  // endregion
  // region ---------------- OUTPUTS ----------------

  /**
   * Event emitted when the select panel has been toggled.
   */
  public openedChange: OutputEmitterRef<boolean> = output<boolean>();

  /**
   * Event emitted when the selected value has been changed by the user.
   */
  public selectionChange: OutputEmitterRef<T[]> = output<T[]>();

  // endregion

  constructor() {
    super();

    const dropdownIcon = this.themeConfig.components.select?.templates?.dropdownIcon;

    if (!dropdownIcon) {
      throw new Error('`dropdownIcon` has not defined in `ThemeConfigToken` of selected theme');
    }
    this.dropdownIcon = dropdownIcon;

    this.formFieldStore.registerComponent('select', this, this.cd);
  }

  ngOnInit() {
    this.ngControl = this.injector.get<NgControl | null>(NgControl, null);

    if (this.ngControl?.control) {
      this.formFieldStore.setController(this.ngControl.control);
    }
  }

  protected async onHostClick(e: Event) {
    e.stopPropagation();

    if (this.formFieldStore.state.disabled()) {
      return;
    }

    const optionsTemp = this.optionsTemp();
    if (!optionsTemp) {
      throw new Error(`No options available for select component`);
    }

    const connectTo = this.formFieldStore.formField.wrapperElem?.()?.nativeElement ?? this.elemRef.nativeElement;

    this.selectStore.renderedOverlay = this.overlay.open<void, T>(optionsTemp, {
      panelClass: [this.classNames().overlay],
      appendTo: this.appendTo(),
      size: {
        minWidth: connectTo.getBoundingClientRect().width + 'px',
        maxHeight: this.maxOptionsHeight() ? this.maxOptionsHeight() + 'px' : '',
      },
      positionStrategy: {
        type: 'connectToElement',
        connectTo,
        origin: OverlayConnectElemOrigin.BottomLeft,
      },
    });

    this.isOpened.set(true);
    this.openedChange.emit(true);
    this._onTouched();
    // await this.selectStore.renderedOverlay.afterClose;
    await firstValueFrom(this.selectStore.renderedOverlay.overlayRef.close$);
    this.openedChange.emit(false);
    this.isOpened.set(false);
  }

  ngOnDestroy() {
    this.formFieldStore.unregisterComponent(this, this.cd);
  }

  // region ---------------- ControlValueAccessor ----------------
  /**
   * Called when the select is blurred. Needed to properly implement ControlValueAccessor.
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
  writeValue(value: T | T[] | null | undefined) {
    isNullish(value)
      ? this.selectStore.clear({ triggerSource: SelectTriggerSource.FromControl })
      : this.selectStore.setSelection(value, { triggerSource: SelectTriggerSource.FromControl });
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
  setDisabledState(_isDisabled: boolean) {
    // Do nothing.
  }
  // endregion
}
