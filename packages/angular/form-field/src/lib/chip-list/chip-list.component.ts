/* eslint-disable @typescript-eslint/member-ordering */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Input,
  input,
  OnDestroy,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { hasValue, toBooleanOrPresent } from '@cocokits/common-utils';

import { ChipComponent } from '../chip/chip.component';
import { injectFormFieldStore } from '../form-field.store';
import { SelectStore, SelectStoreService } from '../select.store';

@Component({
  standalone: true,
  imports: [ChipComponent],
  selector: 'cck-chip-list',
  templateUrl: './chip-list.component.html',
  styleUrls: ['./chip-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: SelectStore,
      useClass: SelectStoreService,
    },
  ],
  host: {
    '[class]': 'hostClassNames()',
    '(click)': 'onHostClick()',
  },
})
export class ChipListComponent<T = any> extends _UiBaseComponent<'chipList'> implements OnDestroy {
  protected readonly componentName = 'chipList';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.formFieldStore.state.disabled(), classes: this.classNames().disabled },
  ]);

  override size = computed(() => this._size() ?? this.formFieldStore.formField.size?.());

  protected formFieldStore = injectFormFieldStore();
  protected selectionStore = inject(SelectStore);
  private cd = inject(ChangeDetectorRef);

  private readonly separatorKeysCodes = ['Enter'];

  /** A function to determine the display value of each chip item. */
  @Input() displayBy: (item: T) => any = (item) => item;

  /**
   * Sets the list of chips to be displayed in the component.
   * When this input is updated, the selection store is updated with the new chips.
   */
  @Input() set chips(chips: T[]) {
    this.selectionStore.setSelection(chips);
  }
  /** Determines whether a chip should be added when the input loses focus. */
  addOnBlur = input(true);

  /** The placeholder text displayed in the input field. */
  placeholder = input<string>();

  /** Disables the chip list, preventing user interaction. */
  disabled = input(undefined, { transform: toBooleanOrPresent });

  /** Emits the current list of selected chips whenever a change occurs. */
  change = output<T[]>();

  /** Emits the chip item that has been removed from the list. */
  remove = output<T>();

  /** Emits the chip item that has been added to the list. */
  add = output<T>();

  private inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  __onFormFieldWrapperClick = effect((onCleanup) => {
    const callback = () => this.onHostClick();

    this.formFieldStore.formField.wrapperElem()?.nativeElement.addEventListener('click', callback);

    onCleanup(() => {
      this.formFieldStore.formField.wrapperElem()?.nativeElement.removeEventListener('click', callback);
    });
  });

  constructor() {
    super();

    this.selectionStore.resetWithOption({ multiple: true });
    this.formFieldStore.registerComponent('chipList', this, this.cd);
  }

  protected onHostClick() {
    this.inputRef().nativeElement.focus();
  }

  protected onChipClick(e: MouseEvent) {
    e.stopPropagation();
  }

  protected onInputBlur() {
    const inputElem = this.inputRef().nativeElement;
    const value = inputElem.value.trim();

    if (this.addOnBlur() && hasValue(value)) {
      this.selectionStore.select(value);
      inputElem.value = '';
    }
  }

  protected onKeyup(e: KeyboardEvent) {
    const inputElem = this.inputRef().nativeElement;
    const value = inputElem.value.trim();

    if (this.separatorKeysCodes.includes(e.key) && hasValue(value)) {
      this.selectionStore.select(value);
      inputElem.value = '';
    }
  }

  protected onChipRemove(chip: T) {
    this.selectionStore.deselect(chip);
  }

  ngOnDestroy() {
    this.formFieldStore.unregisterComponent(this, this.cd);
  }
}
