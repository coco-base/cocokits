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

/** What `selectionChange` emits: the Select, the new value and why it changed. */
export interface CckSelectChange<V = string> {
  /** The Select that changed. */
  readonly source: CckSelect<V>;
  /** The new value: an option's value or `null` for a single Select, the list of values for a multiple one. */
  readonly value: V | null;
  /** Why the value changed. */
  readonly reason: SelectValueChangeReason;
  /** The event that caused the change. */
  readonly event: Event | null;
}

/**
 * A select: a trigger that shows the selection and a listbox of options in an overlay. It is a custom
 * listbox, not a native `<select>`. The options are the content you write, `[cckSelectOption]` and
 * `[cckSelectOptionGroup]`; the trigger, the placeholder, the value and the icon are rendered for you.
 *
 * The value is a model: `[(value)]`, `[value]` or unbound. `V` is the type of the value, taken from the binding:
 * an option's value for a single Select (`string` unless the options carry something else, and then
 * `compareWith` and `itemToStringValue` tell the Select how to compare and submit it), a list with
 * `multiple`. `undefined` means unbound and `null` means nothing is selected; the Select writes `null` when a
 * clearing option is chosen or the form is reset. In a single Select an option whose value is `null` or
 * `undefined` clears the value (unless `canSelectNullableOptions`), and one whose value is `''` clears it and shows
 * the placeholder. The trigger shows the text of the selected options, joined with `, `. The Select is a Signal
 * Forms custom control and, through the static `ngNoCva` attribute, also binds to `formControlName`,
 * `[formControl]` and `ngModel`. While `name` is set it renders hidden native inputs, so `FormData`, `required`,
 * `form`, `reset` and autofill work.
 *
 * Inside a `[cckFormField]` the trigger is the field's control (`<fieldId>-control`) and the list lines up with
 * the field's input wrapper. Name the Select with the field's label, `aria-label` or `aria-labelledby`. Focus
 * stays on the trigger while the list is open; the highlighted option is the `aria-activedescendant`.
 *
 * @example
 * <div cckSelect [(value)]="dish" placeholder="Choose a dish" aria-label="Dish">
 *   <div cckSelectOption value="Cake">Cake</div>
 *   <div cckSelectOption value="Pizza">Pizza</div>
 * </div>
 * @typeParam V - The type of the value, taken from the `value` binding. Defaults to `string`.
 * @cckPart root
 * @cckPart trigger
 * @cckPart value
 * @cckPart dropdownIcon
 * @cckPart content
 * @cckSlot default - The options and option groups.
 * @cckSlot trigger ng-template[cckSelectTrigger] - What the trigger shows while something is selected, in place of
 * the labels joined with a comma.
 */
@Component({
  selector: '[cckSelect]',
  exportAs: 'cckSelect',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, CckSelectContent, NgTemplateOutlet],
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
   * The selected value: an option's value for a single Select, a list of values with `multiple`. `undefined`
   * means unbound (nothing is selected) and `null` means nothing is selected. `''` shows the placeholder too. A
   * write from the parent or a forms library never emits `selectionChange`.
   * @cckSemantic select.value
   */
  readonly value = model<V | null | undefined>(undefined);

  /**
   * Emits after every change of the value the user makes and after a form reset, with the Select, the new value
   * (a list with `multiple`, `null` when a clearing option was chosen) and the reason. Never for a write from the
   * parent or a forms library.
   * @cckSemantic select.valueChange
   */
  readonly selectionChange = output<CckSelectChange<V>>();

  /**
   * Emits `true` or `false` after every change of the open state, including `open()`, `close()` and `toggle()`.
   * @remarks The reason of a close is in `closePredicate`; the React `onOpenChange` and Vue `update:open` carry it.
   * @cckSemantic select.openChange
   */
  readonly openedChange = output<boolean>();

  /**
   * Emits after the list opens.
   * @cckSemantic none
   * @remarks Angular only: React and Vue report an open through `onOpenChange` and `update:open`.
   */
  readonly opened = output();

  /**
   * Emits after the list closes.
   * @cckSemantic none
   * @remarks Angular only: React and Vue report a close through `onOpenChange` and `update:open`.
   */
  readonly closed = output();

  /**
   * Whether several options can be selected. The value is then a list, and choosing an option toggles it and
   * keeps the list open.
   * @defaultValue false
   */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * The text shown while nothing is selected.
   * @cckSemantic select.value.placeholder
   * @defaultValue ''
   */
  readonly placeholder = input('');

  /**
   * Whether an option's value is the selected value. Use it when the options carry objects.
   * @cckSemantic select.isItemEqual
   * @defaultValue Object.is
   * @see https://github.com/angular/components/blob/main/src/material/select/select.ts MatSelect.compareWith
   */
  readonly compareWith = input<(o1: CckSelectItem<V>, o2: CckSelectItem<V>) => boolean>((a, b) => Object.is(a, b));

  /**
   * Turns a value into the string the hidden form input submits, and matches an autofilled string to an option.
   * @cckSemantic select.itemToStringValue
   * @defaultValue String
   */
  readonly itemToStringValue = input<(value: CckSelectItem<V>) => string>((value) => String(value));

  /**
   * Orders the values of a `multiple` Select after a choice. Without it they follow the order of the options.
   * @cckSemantic none
   * @remarks Angular only: React and Vue keep the selection order.
   * @see https://github.com/angular/components/blob/main/src/material/select/select.ts MatSelect.sortComparator
   */
  readonly sortComparator = input<
    ((a: CckSelectOptionRef, b: CckSelectOptionRef, options: readonly CckSelectOptionRef[]) => number) | undefined
  >(undefined);

  /**
   * How long a pause empties the type-to-find buffer, in milliseconds. A character is matched at once.
   * @cckSemantic none
   * @remarks Angular only: React and Vue use 500 ms.
   * @defaultValue 500
   */
  readonly typeaheadDebounceInterval = input<number | undefined>(undefined);

  /**
   * Whether an option whose value is `null` or `undefined` is selected like any other instead of clearing a
   * single Select; it then shows its label.
   * @cckSemantic none
   * @remarks Angular only: a `null` item always clears in React and Vue.
   * @defaultValue false
   */
  readonly canSelectNullableOptions = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * Whether Escape and an outside press keep the list open. The check runs first, before `closePredicate`.
   * Choosing an option, the trigger, `close()` and focus leaving still close it. Disabling these closes weakens
   * the pattern: a keyboard user can no longer leave with Escape.
   * @defaultValue false
   * @remarks Angular only: React refuses with `onEscapeKeyDown` and `onPointerDownOutside`, Vue with the matching events.
   * @cckSemantic none
   * @see https://github.com/angular/components/blob/main/src/cdk/overlay/overlay-directives.ts cdkConnectedOverlayDisableClose
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * Decides, for every close the Select makes itself (the trigger, Escape, an outside press, choosing an
   * option), whether it happens: `false` keeps the list open. It runs after `disableClose`. A value chosen in
   * the list still changes. `open()`, `close()`, `toggle()` and focus leaving are never checked: focus leaving
   * chooses the highlighted option and closes. Refusing Escape weakens the pattern.
   * @remarks Angular only: React refuses with `details.cancel()` in `onOpenChange`, Vue by controlling `open`.
   * @cckSemantic none
   * @see https://github.com/angular/components/blob/main/src/material/dialog/dialog-config.ts MatDialogConfig.closePredicate
   */
  readonly closePredicate = input<((details: SelectOpenChangeDetails) => boolean) | undefined>(undefined);

  /**
   * The native `autocomplete` of the hidden form inputs, for the browser's autofill.
   * @cckSemantic select.autocomplete
   * @defaultValue 'off'
   */
  readonly autocomplete = input<string | undefined>(undefined);

  /**
   * The ids this control is described by (`aria-describedby`), kept off the host and given to the trigger.
   * @cckSemantic select.trigger.aria-describedby
   */
  override readonly ariaDescribedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /**
   * The `name` that `FormData` submits. Signal Forms writes its field name into it. Left out, it is the path of
   * the bound forms control joined with `.`, and none without a forms library. Without a name and without
   * `required` no hidden input renders.
   * @cckSemantic select.name
   * @defaultValue ''
   */
  override readonly name = input('');

  /**
   * The id of the form the hidden inputs belong to (native `form`), for a Select outside its form.
   */
  readonly form = input<string | undefined>(undefined);

  /**
   * The side of the trigger (or the field box) the list prefers. `start` and `end` follow the direction; it
   * flips when there is no room.
   * @cckSemantic select.content.side
   * @defaultValue 'bottom'
   */
  readonly side = input<OverlaySide>('bottom');

  /**
   * How the list lines up along the anchor's edge.
   * @cckSemantic select.content.align
   * @defaultValue 'start'
   */
  readonly align = input<OverlayAlign>('start');

  /**
   * The author's label, kept off the host and given to the trigger and the list.
   * @cckSemantic select.trigger.aria-label
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The ids of the elements that label the Select, kept off the host and given to the trigger and the list.
   * @cckSemantic select.trigger.aria-labelledby
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * Whether the user left the control. Signal Forms writes it; a value that is given wins, otherwise it is set
   * after the first blur.
   * @cckSemantic none
   * @remarks Signal Forms' input; the React and Vue Select take no such prop.
   */
  override readonly touched = input(false, { transform: booleanAttribute });

  /**
   * Whether the user changed the control. Signal Forms writes it; a value that is given wins, otherwise it is
   * set after the first change.
   * @cckSemantic none
   * @remarks Signal Forms' input; the React and Vue Select take no such prop.
   */
  override readonly dirty = input(false, { transform: booleanAttribute });

  /**
   * Whether a submit of the owner form was attempted. A value that is given wins, also `false`; otherwise a
   * `submit` event of the form sets it and a reset clears it.
   * @cckSemantic none
   * @remarks Signal Forms' input; the React and Vue Select take no such prop.
   */
  override readonly submitted = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * Whether an asynchronous validator is running.
   * @cckSemantic none
   * @remarks Signal Forms' input; the React and Vue Select take no such prop.
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
   * @cckSemantic none
   * @remarks Angular only (Material): React and Vue own the state with `open` and `defaultOpen`.
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
   * @cckSemantic none
   * @remarks Angular only (Material): React and Vue own the state with `open` and `defaultOpen`.
   */
  open(): void {
    this.ctl.open();
  }

  /**
   * Closes the list. Nothing is checked: `disableClose` and `closePredicate` guard the user's closes only.
   * @cckSemantic none
   * @remarks Angular only (Material): React and Vue own the state with `open` and `defaultOpen`.
   */
  close(): void {
    this.ctl.close();
  }

  /**
   * Opens the list when it is closed and closes it when it is open.
   * @cckSemantic none
   * @remarks Angular only (Material): React and Vue own the state with `open` and `defaultOpen`.
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
  if (!root) throw new Error(`CocoKits: cckSelect${part} must be placed inside an element with cckSelect.`);
  return root;
}
