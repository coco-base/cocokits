import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  viewChildren,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { CckAttrs, CckOverlayLayer, CckPortal, injectFormParticipation, themeAttrs } from '@cocokits/angular-core';
import { CckFormControlBase } from '@cocokits/angular/form-control';
import { CckSvgIcon } from '@cocokits/angular/svg-icon';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { selectAnatomy, type SelectParts } from '@cocokits/machines/select';
import { visuallyHiddenStyleText } from '@cocokits/utils';
import { createSelectController } from './select-controller';
import { CCK_SELECT_CONTENT_HOST, CckSelectContent } from './select-content';
import type {
  CckSelectItem,
  CckSelectOptionRef,
  SelectOpenChangeDetails,
  SelectOptionRegistration,
  SelectTriggerContext,
  SelectValueChangeReason,
} from './select-types';

/**
 * What `selectionChange` sends: the Select, the new value, the reason and the event.
 *
 * @typeParam V - The type of the value of the Select. When not set, it is `string`.
 */
export interface CckSelectChange<V = string> {
  /**
   * The Select that changed.
   */
  readonly source: CckSelect<V>;
  /**
   * The new value. It is the value of one option, or `null` for a single Select. With `multiple`, it is the list of values.
   */
  readonly value: V | null;
  /**
   * Why the value changed: `'user'` when the user chose an option, `'form-reset'` when the form was reset.
   */
  readonly reason: SelectValueChangeReason;
  /**
   * The event that caused the change. It is `null` for a form reset.
   */
  readonly event: Event | null;
}

/**
 * A select: a trigger that shows the choice and a list of options that opens in an overlay. It is a custom listbox, not a native `<select>`. You write the options inside it; the trigger, the placeholder, the value and the icon are made for you.
 *
 * The value is a model. Use `[(value)]` to read and change it, `[value]` to only set it, or no binding. `V` is the type of the value and comes from the binding.
 *
 * A single Select holds the value of one option. With `multiple`, it holds a list. `undefined` means the value is not bound, and `null` means nothing is selected. An option with the value `null` or `undefined` clears a single Select, unless `canSelectNullableOptions` is set. An option with the value `''` clears it and shows the placeholder. The trigger shows the text of the selected options, joined with a comma. To show something else, write a `cckSelectTrigger` template.
 *
 * The Select works with Signal Forms. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`. With a `name`, it makes hidden native inputs, so `FormData`, `required`, `form`, reset and autofill work. Inside a `cck-form-field`, the trigger is the control of the field, and the list lines up with the input of the field. Name the Select with the label of the field, `aria-label` or `aria-labelledby`. The focus stays on the trigger while the list is open. The highlighted option is the `aria-activedescendant`.
 *
 * @remarks The dropdown icon and the option indicator draw the icons your theme names in `components.select.icons` (`dropdownIcon`, `optionIndicator`), else the defaults `chevron-down` and `check`. Register a theme icon with `provideCckIcons`.
 * @example
 * <cck-select [(value)]="dish" placeholder="Choose a dish" aria-label="Dish">
 *   <cck-select-option-group label="Desserts">
 *     <cck-select-option value="Cake">Cake</cck-select-option>
 *     <cck-select-option value="Ice cream">Ice cream</cck-select-option>
 *   </cck-select-option-group>
 *   <cck-select-separator></cck-select-separator>
 *   <cck-select-option value="Pizza">Pizza</cck-select-option>
 * </cck-select>
 * @typeParam V - The type of the value. It comes from the `value` binding. The default is `string`.
 * @cckPart root
 * @cckPart trigger
 * @cckPart value
 * @cckPart dropdownIcon
 * @cckPart content
 * @cckSlot default - The options, the option groups and the separators. When not set, the list is empty.
 * @cckSlot trigger ng-template[cckSelectTrigger] - Your own markup for the trigger, in place of the labels of the selected options. When not set, the trigger shows the labels joined with a comma.
 */
@Component({
  selector: 'cck-select',
  exportAs: 'cckSelect',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, CckSelectContent, CckSvgIcon, NgTemplateOutlet],
  providers: [
    CckPortal,
    CckOverlayLayer,
    // The content directive in the portal template asks for the Select through a token: it cannot import this class.
    { provide: CCK_SELECT_CONTENT_HOST, useExisting: forwardRef(() => CckSelect) },
  ],
  host: {
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.autocomplete]': 'null',
    '[attr.data-state]': 'parts().root["data-state"]',
    '[attr.data-multiple]': 'parts().root["data-multiple"]',
    '[attr.data-placeholder-shown]': 'parts().root["data-placeholder-shown"]',
  },
  templateUrl: './select.html',
})
export class CckSelect<V = string> extends CckFormControlBase implements FormValueControl<V | null | undefined> {
  /**
   * The selected value. A single Select holds the value of one option. A Select with `multiple` holds a list of values.
   *
   * When not set, nothing is selected.
   *
   * @remarks `null` and `''` also mean nothing is selected, and the placeholder shows. Changing the value from code never emits `selectionChange`.
   * @example
   * <cck-select [(value)]="dish" aria-label="Dish">
   *   <cck-select-option value="Cake">Cake</cck-select-option>
   *   <cck-select-option value="Pizza">Pizza</cck-select-option>
   * </cck-select>
   * <!-- In the class: readonly dish = signal<string | null>('Pizza'); -->
   * @cckSemantic select.value
   */
  readonly value = model<V | null | undefined>(undefined);

  /**
   * Emits after the user changes the value, and after a form reset. It sends a `CckSelectChange` object with the Select, the new value, the reason and the event.
   * @remarks It never emits when the parent or a forms library changes the value. With `multiple`, the new value is a list. It is `null` when the user chose a clearing option.
   * @example
   * <cck-select (selectionChange)="onChange($event)" aria-label="Dish">
   *   <cck-select-option value="Cake">Cake</cck-select-option>
   * </cck-select>
   * <!-- In the class: onChange(change: CckSelectChange) { console.log(change.value, change.reason); } -->
   * @cckSemantic select.valueChange
   */
  readonly selectionChange = output<CckSelectChange<V>>();

  /**
   * Emits `true` or `false` after every change of the open state. This includes a change made by `open()`, `close()` or `toggle()`.
   * @remarks To learn why a close happens, use `closePredicate`.
   * @cckParity Emits a `boolean`; it carries no reason.
   * @cckSemantic select.openChange
   */
  readonly openedChange = output<boolean>();

  /**
   * Emits after the list opens.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly opened = output();

  /**
   * Emits after the list closes.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly closed = output();

  /**
   * Whether the user can choose more than one option. The value is then a list. Choosing an option adds it or removes it, and the list stays open.
   * @example
   * <cck-select multiple [(value)]="dishes" aria-label="Dishes">
   *   <cck-select-option value="Cake">Cake</cck-select-option>
   *   <cck-select-option value="Pizza">Pizza</cck-select-option>
   * </cck-select>
   * <!-- In the class: readonly dishes = signal<string[]>(['Cake']); -->
   * @defaultValue false
   */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * The text that shows while nothing is selected. When not set, the trigger shows no text then.
   * @cckSemantic select.value.placeholder
   * @defaultValue ''
   */
  readonly placeholder = input('');

  /**
   * A function that tells whether an option value is the selected value. Use it when the option values are objects. When not set, the values are compared with `Object.is`.
   * @remarks Pair it with `itemToStringValue`, which turns an object into the text that a form sends.
   * @example
   * <cck-select [(value)]="dish" [compareWith]="sameDish" [itemToStringValue]="dishId" aria-label="Dish">
   *   @for (item of dishes; track item.id) {
   *     <cck-select-option [value]="item">{{ item.name }}</cck-select-option>
   *   }
   * </cck-select>
   * <!-- In the class: sameDish = (a: Dish, b: Dish) => a.id === b.id; dishId = (dish: Dish) => String(dish.id); -->
   * @cckSemantic select.isItemEqual
   * @defaultValue Object.is
   */
  readonly compareWith = input<(o1: CckSelectItem<V>, o2: CckSelectItem<V>) => boolean>((a, b) => Object.is(a, b));

  /**
   * A function that turns a value into the text that the hidden form input sends. The browser autofill uses it to find the option. When not set, the value is turned into text with `String`.
   * @cckSemantic select.itemToStringValue
   * @defaultValue String
   */
  readonly itemToStringValue = input<(value: CckSelectItem<V>) => string>((value) => String(value));

  /**
   * A function that sorts the values of a `multiple` Select after each choice. When not set, the values follow the order of the options.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly sortComparator = input<
    ((a: CckSelectOptionRef, b: CckSelectOptionRef, options: readonly CckSelectOptionRef[]) => number) | undefined
  >(undefined);

  /**
   * How long a pause, in milliseconds, empties the type-to-find text. When not set, the pause is 500 milliseconds. A letter is matched at once.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue 500
   */
  readonly typeaheadDebounceInterval = input<number | undefined>(undefined);

  /**
   * Whether an option with the value `null` or `undefined` is chosen like any other option. When not set, such an option clears a single Select.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue false
   */
  readonly canSelectNullableOptions = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * Whether Escape and a press outside keep the list open. The trigger, choosing an option, `close()` and a focus leave still close it. When not set, they close the list.
   * @remarks A Select that Escape cannot close is harder to leave with the keyboard. Use this input with care. It runs before `closePredicate`.
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   * @defaultValue false
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * A function that decides whether a close that the Select starts happens. Return `false` to keep the list open. When not set, every close happens.
   * @remarks It runs for the trigger, Escape, a press outside and choosing an option, after `disableClose`. It does not run for `open()`, `close()`, `toggle()` and a focus leave. A focus leave chooses the highlighted option and closes the list.
   * @example
   * <cck-select [closePredicate]="canClose" aria-label="Dish">
   *   <cck-select-option value="Cake">Cake</cck-select-option>
   * </cck-select>
   * <!-- In the class: canClose = (details: SelectOpenChangeDetails) => details.reason !== 'escape'; -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly closePredicate = input<((details: SelectOpenChangeDetails) => boolean) | undefined>(undefined);

  /**
   * The native `autocomplete` value of the hidden form inputs. The browser autofill uses it. When not set, the value is `'off'`.
   * @cckSemantic select.autocomplete
   * @defaultValue 'off'
   */
  readonly autocomplete = input<string | undefined>(undefined);

  /**
   * The ids of the elements that describe the Select. The trigger gets them as `aria-describedby`. When not set, the Select has no description of its own.
   * @cckSemantic select.trigger.aria-describedby
   */
  override readonly ariaDescribedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /**
   * The `name` that `FormData` sends. When not set, the name is the path of the bound forms control, or empty without a forms library. Without a name and without `required`, no hidden input is made.
   * @example
   * <form>
   *   <cck-select name="dish" required aria-label="Dish">
   *     <cck-select-option value="Cake">Cake</cck-select-option>
   *   </cck-select>
   *   <button type="submit">Send</button>
   * </form>
   * @cckSemantic select.name
   * @defaultValue ''
   */
  override readonly name = input('');

  /**
   * The `id` of the form that the hidden inputs belong to. Use it when the Select is outside its form. When not set, the form around the Select owns the inputs.
   */
  readonly form = input<string | undefined>(undefined);

  /**
   * The side of the trigger where the list prefers to open. `start` and `end` follow the text direction. The list opens on the other side when there is no room.
   * @cckSemantic select.content.side
   * @defaultValue 'bottom'
   */
  readonly side = input<OverlaySide>('bottom');

  /**
   * How the list lines up with the edge of the trigger.
   * @cckSemantic select.content.align
   * @defaultValue 'start'
   */
  readonly align = input<OverlayAlign>('start');

  /**
   * The accessible name of the Select. The trigger and the list get it. When not set, name the Select with `aria-labelledby` or with the label of a form field.
   * @cckSemantic select.trigger.aria-label
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The ids of the elements that name the Select. The trigger and the list get them as `aria-labelledby`. When not set, no element names the Select through this input.
   * @cckSemantic select.trigger.aria-labelledby
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * Whether the user has left the control. Signal Forms sets this member. When not set, the control becomes touched after the first blur.
   * @cckGroup forms
   * @cckSemantic none
   * @cckParity Signal Forms bind this input.
   * @defaultValue false
   */
  override readonly touched = input(false, { transform: booleanAttribute });

  /**
   * Whether the user has changed the control. Signal Forms sets this member. When not set, the control becomes dirty after the first change.
   * @cckGroup forms
   * @cckSemantic none
   * @cckParity Signal Forms bind this input.
   * @defaultValue false
   */
  override readonly dirty = input(false, { transform: booleanAttribute });

  /**
   * Whether the user tried to submit the form that holds the control. When not set, a `submit` event of the form sets it and a form reset clears it.
   * @remarks A value you give always wins, `false` too.
   * @cckSemantic none
   * @cckParity Signal Forms bind this input.
   */
  override readonly submitted = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * Whether a check of the value is still running. Signal Forms sets this member while an asynchronous validator runs.
   * @cckGroup forms
   * @cckSemantic none
   * @cckParity Signal Forms bind this input.
   * @defaultValue false
   */
  override readonly pending = input(false, { transform: booleanAttribute });

  /** The theme attributes of every part; the root's are applied to the host. @internal */
  readonly _theme = themeAttrs(selectAnatomy);

  /** @internal */
  readonly _contentElement = signal<HTMLElement | null>(null);
  /** @internal */
  readonly _triggerTemplate = signal<TemplateRef<SelectTriggerContext<unknown>> | null>(null);
  /** @internal */
  readonly _options = signal<readonly SelectOptionRegistration[]>([]);

  protected readonly hiddenStyle = visuallyHiddenStyleText;
  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly listbox = viewChild<TemplateRef<void>>('listbox');
  private readonly hiddenInputs = viewChildren<ElementRef<HTMLInputElement>>('hidden');

  protected readonly participation = injectFormParticipation({
    element: () => this.triggerRef()?.nativeElement,
    getValue: () => this.triggerRef()?.nativeElement.value ?? '',
    onReset: (event) => {
      this.onNativeReset(event);
    },
  });

  /** The state, the overlay and the transitions of the Select. */
  protected readonly ctl = createSelectController<V>({
    value: this.value,
    multiple: this.multiple,
    compareWith: this.compareWith,
    itemToStringValue: this.itemToStringValue,
    sortComparator: this.sortComparator,
    typeaheadDebounceInterval: this.typeaheadDebounceInterval,
    canSelectNullableOptions: this.canSelectNullableOptions,
    ariaLabel: this.ariaLabel,
    ariaLabelledBy: this.ariaLabelledBy,
    side: this.side,
    align: this.align,
    disableClose: this.disableClose,
    closePredicate: this.closePredicate,
    facts: this.facts,
    fieldContext: this.fieldContext,
    fieldAnchor: this.fieldAnchor,
    dirty: this.dirtyState,
    options: this._options,
    content: this._contentElement,
    trigger: this.triggerRef,
    listbox: this.listbox,
    hiddenInputs: this.hiddenInputs,
    emitChange: (value, reason, event) => {
      this.selectionChange.emit({ source: this, value, reason, event });
    },
    emitOpen: (open) => {
      this.openedChange.emit(open);
      (open ? this.opened : this.closed).emit();
    },
    onBlur: () => {
      this.onBlur();
    },
  });

  /** The props of every part. @internal */
  readonly parts: Signal<SelectParts<CckSelectItem<V>>> = this.ctl.parts;

  /** @internal */
  readonly _contentProps = computed(() => this.parts().content);
  /** @internal */
  readonly _contentTheme = computed(() => this._theme().content);

  /**
   * Whether the list is open.
   * @example
   * // select = viewChild.required(CckSelect)
   * if (this.select().panelOpen) this.select().close();
   * @cckSemantic none
   * @cckParity The methods own the open state; there is no open input.
   */
  get panelOpen(): boolean {
    return this.ctl.isOpen();
  }

  constructor() {
    super();
    inject(CckPortal).useContainer(inject(ViewContainerRef));
  }

  /**
   * Opens the list. A disabled or read-only Select never opens.
   * @example
   * // select = viewChild.required(CckSelect)
   * this.select().open();
   * @cckSemantic none
   * @cckParity The methods own the open state; there is no open input.
   */
  open(): void {
    this.ctl.open();
  }

  /**
   * Closes the list. It does not run `disableClose` or `closePredicate`, because you ask for the close yourself.
   * @example
   * // select = viewChild.required(CckSelect)
   * this.select().close();
   * @cckSemantic none
   * @cckParity The methods own the open state; there is no open input.
   */
  close(): void {
    this.ctl.close();
  }

  /**
   * Opens the list when it is closed, and closes it when it is open.
   * @example
   * // select = viewChild.required(CckSelect)
   * this.select().toggle();
   * @cckSemantic none
   * @cckParity The methods own the open state; there is no open input.
   */
  toggle(): void {
    this.ctl.toggle();
  }

  /** The native element of the trigger, which takes the focus. */
  protected controlElement(): HTMLElement | undefined {
    return this.triggerRef()?.nativeElement;
  }

  /**
   * Registers an option; the Select reads the registered options in document order.
   * @internal
   */
  _registerOption(option: SelectOptionRegistration): () => void {
    this._options.update((current) => [...current, option]);
    return () => {
      this._options.update((current) => current.filter((candidate) => candidate !== option));
    };
  }

  protected restoreMount(event: Event): void {
    this.ctl.restoreMount(event);
  }
}

/**
 * Finds the Select above a part.
 *
 * @param part - The part's name, for the error message.
 * @returns The Select.
 * @internal
 */
export function injectCckSelect<V>(part: string): CckSelect<V> {
  const root = inject<CckSelect<V>>(CckSelect, { optional: true });
  if (!root) throw new Error(`CocoKits: ${part} must be placed inside a <cck-select>.`);
  return root;
}
