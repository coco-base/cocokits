import {
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { CckAttrs, injectFormParticipation, themeAttrs } from '@cocokits/angular-core';
import { CckChip } from '@cocokits/angular/chip';
import { CckFormControlBase, handleHiddenInputInvalid, hiddenInputEntries } from '@cocokits/angular/form-control';
import { chipAnatomy } from '@cocokits/machines/chip';
import {
  addChipListValue,
  chipListAnatomy,
  getChipListProps,
  isChipListAddKey,
  removeChipListValue,
  type ChipListChangeReason,
} from '@cocokits/machines/chip-list';
import type { ValueChangeDetails } from '@cocokits/shared';
import { hasAccessibleName, visuallyHiddenStyleText } from '@cocokits/utils';

export type { ChipListChangeReason } from '@cocokits/machines/chip-list';

/** The `value`, the `reason` and the `event` of a change. The `valueChangeDetails` output sends them. */
export type ChipListChangeDetails = ValueChangeDetails<string[], ChipListChangeReason>;

/**
 * A text box for entering several values. Each value the user types and confirms with Enter becomes a removable chip in front of the text box. Inside a `cck-form-field` it is the control of the field.
 *
 * The value is a list of distinct texts, in the order they were added. It is a model: use `[(value)]` to read and change it, `[value]` to only set it, or no binding. The list shows one chip for each value, so it needs no content. A value you set that has duplicates or empty texts is shown as it is; only what the user types is checked.
 *
 * Enter adds the text, trimmed, unless the list has it already, and keeps the form from submitting. Enter with no text submits the form as usual. With `addOnBlur`, leaving the text box adds the text too. Each remove button is a tab stop before the text box. Removing a chip moves the focus to the text box.
 *
 * The chip list works with Signal Forms. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`. With a `name`, it makes one hidden native input for each value, so `FormData`, `required`, `form` and reset work. While `required` and empty, one empty hidden input blocks the submit; the blocked submit moves the focus to the text box. The text box has no `name` of its own.
 *
 * Name the list with the label of its field, `aria-label` or `aria-labelledby`. `id`, `aria-label`, `aria-labelledby`, `aria-describedby` and `placeholder` go to the text box, and every other attribute stays on the root.
 *
 * @example
 * <cck-chip-list [(value)]="dishes" placeholder="Add a dish" aria-label="Dishes" />
 * <!-- In the class: readonly dishes = signal(['Pizza']); -->
 * @cckPart root
 * @cckPart input
 */
@Component({
  selector: 'cck-chip-list',
  exportAs: 'cckChipList',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, CckChip],
  host: {
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.placeholder]': 'null',
    '[attr.data-filled]': 'parts().root["data-filled"]',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    @for (item of value(); track $index) {
      <cck-chip removable [disabled]="parts().chipDisabled" (removed)="onRemove($index)">{{ item }}</cck-chip>
    }
    <input
      #input
      [class]="parts().input.class"
      [cckAttrs]="theme().input"
      [attr.type]="parts().input.type"
      [attr.id]="parts().input.id"
      [attr.autocomplete]="parts().input.autocomplete"
      [attr.placeholder]="parts().input.placeholder"
      [attr.disabled]="parts().input.disabled ? '' : null"
      [attr.readonly]="parts().input.readonly ? '' : null"
      [attr.aria-required]="parts().input['aria-required']"
      [attr.aria-invalid]="parts().input['aria-invalid']"
      [attr.aria-describedby]="parts().input['aria-describedby']"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="ariaLabelledBy() ?? null"
      [value]="draft()"
      (input)="onInput($event)"
      (keydown)="onKeyDown($event)"
      (blur)="onInputBlur($event)"
    />
    @for (entry of hiddenEntries(); track $index) {
      <input
        type="text"
        tabindex="-1"
        aria-hidden="true"
        autocomplete="off"
        [attr.style]="hiddenStyle"
        [attr.name]="parts().formInput.name"
        [attr.form]="form() ?? null"
        [attr.required]="parts().formInput.required ? '' : null"
        [attr.disabled]="parts().formInput.disabled ? '' : null"
        [attr.value]="entry"
        (invalid)="onInvalid($event)"
      />
    }
  `,
})
export class CckChipList extends CckFormControlBase implements FormValueControl<string[]> {
  /**
   * The values, in the order they were added. Each one is a chip.
   *
   * When not set, the list is empty.
   *
   * @remarks Changing the value from code never emits `valueChangeDetails`.
   * @example
   * <cck-chip-list [(value)]="dishes" aria-label="Dishes" />
   * <!-- In the class: readonly dishes = signal(['Pizza', 'Salad']); -->
   * @cckSemantic chip-list.value
   * @defaultValue []
   */
  readonly value = model<string[]>([]);

  /**
   * Emits after the user adds or removes a value, and after a form reset. It sends the new `value`, the `reason` (`'add'`, `'remove'` or `'form-reset'`) and the `event`.
   * @remarks It never emits when the parent or a forms library changes the value. An added text that is empty or already in the list changes nothing and emits nothing.
   * @example
   * <cck-chip-list aria-label="Dishes" (valueChangeDetails)="onChange($event.value, $event.reason)" />
   * <!-- In the class: onChange(dishes: string[], reason: ChipListChangeReason) { console.log(dishes, reason); } -->
   * @cckSemantic chip-list.valueChange
   */
  readonly valueChangeDetails = output<ChipListChangeDetails>();

  /**
   * The `name` that `FormData` sends, once for each value. When not set, the name is the path of the bound forms control, or empty without a forms library. Without a name, no hidden input is made.
   * @remarks The text box never has a `name`.
   * @example
   * <form>
   *   <cck-chip-list name="dish" required aria-label="Dishes" />
   *   <button type="submit">Send</button>
   * </form>
   * @cckSemantic chip-list.name
   * @defaultValue ''
   */
  override readonly name = input('');

  /**
   * The `id` of the form that the hidden inputs belong to. Use it when the list is outside its form. When not set, the form around the list owns the inputs.
   * @cckSemantic chip-list.form
   */
  readonly form = input<string | undefined>(undefined);

  /**
   * Whether leaving the text box adds the text as a chip. When not set, only Enter adds it.
   * @cckSemantic chip-list.addOnBlur
   * @defaultValue false
   */
  readonly addOnBlur = input(false, { transform: booleanAttribute });

  /**
   * The text that shows in the text box while it is empty. When not set, the text box shows no text then.
   * @cckSemantic chip-list.placeholder
   * @defaultValue ''
   */
  readonly placeholder = input('');

  /**
   * The `id` of the text box. When not set, the text box gets `<fieldId>-control` inside a form field, or no id outside one.
   * @remarks Inside a form field, the label of the field points at your id.
   * @cckSemantic chip-list.id
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * The accessible name of the text box, as `aria-label`. When not set, name the list with the label of a form field or with `aria-labelledby`.
   * @cckSemantic chip-list.ariaLabel
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The ids of the elements that name the text box, as `aria-labelledby`. When not set, no element names the list through this input.
   * @cckSemantic chip-list.ariaLabelledBy
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * The ids of the elements that describe the text box, as `aria-describedby`. When not set, the list has no description of its own.
   * @remarks Inside a form field, the field adds the ids of its hints and errors after yours.
   * @cckSemantic chip-list.ariaDescribedBy
   */
  override readonly ariaDescribedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** The theme attributes of every part; the root's are applied to the host. */
  protected readonly theme = themeAttrs(chipListAnatomy);

  protected readonly hiddenStyle = visuallyHiddenStyleText;
  protected readonly draft = signal('');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private mountValue: string[] = [];

  /** Whether a submit was blocked because the list is required and empty. The next value change clears it. */
  private readonly blockedSubmit = linkedSignal<unknown, boolean>({ source: this.value, computation: () => false });

  protected readonly participation = injectFormParticipation({
    element: () => this.inputRef().nativeElement,
    getValue: () => this.draft(),
    onReset: (event) => {
      this.draft.set('');
      this.onNativeReset(event);
    },
  });

  protected readonly parts = computed(() => {
    const blocked = this.blockedSubmit();
    return getChipListProps(
      {
        ...this.facts(),
        id: this.id(),
        value: this.value(),
        draft: this.draft(),
        placeholder: this.placeholder(),
        ...(blocked ? { invalid: true, submitted: true } : {}),
      },
      this.fieldContext(),
    );
  });

  protected readonly hiddenEntries = computed(() => hiddenInputEntries(this.parts().formInput, true));

  constructor() {
    super();
    afterNextRender(() => {
      this.mountValue = [...this.value()];
      this.warnWithoutName();
    });
    // Runs before the view updates, while the focused remove button is still in the document: the focus goes to the
    // text box when the button goes away (its position is no longer in the value) or the list turns read-only.
    effect(() => {
      const length = this.value().length;
      const { disabled, readOnly } = this.parts().control;
      untracked(() => {
        const remove = '.' + chipAnatomy.classes.remove;
        const active = this.element.ownerDocument.activeElement;
        const position = active?.matches(remove)
          ? Array.from(this.element.querySelectorAll(remove)).indexOf(active)
          : -1;
        if (position >= 0 && !disabled && (readOnly || position >= length)) this.inputRef().nativeElement.focus();
      });
    });
  }

  /** The text box, which takes the focus. */
  protected controlElement(): HTMLElement {
    return this.inputRef().nativeElement;
  }

  protected restoreMount(event: Event): void {
    const value = [...this.mountValue];
    this.value.set(value);
    this.valueChangeDetails.emit({ value, reason: 'form-reset', event });
  }

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.parts().chipDisabled || !isChipListAddKey(event) || this.draft().trim() === '') return;
    event.preventDefault();
    this.add(event);
  }

  protected onInputBlur(event: FocusEvent): void {
    if (this.addOnBlur() && !this.parts().chipDisabled) this.add(event);
  }

  /** Focus left the list when it goes to nothing or to an element outside it; it stays while it moves inside. */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node && this.element.contains(next))) this.onBlur();
  }

  protected onRemove(index: number): void {
    const value = this.value();
    const next = removeChipListValue(value, index);
    // The focus moves first: the button is still in the document and the focus never leaves the list.
    this.inputRef().nativeElement.focus();
    if (next !== value) this.commit([...next], 'remove', null);
  }

  protected onInvalid(event: Event): void {
    handleHiddenInputInvalid(event, () => {
      this.inputRef().nativeElement.focus();
    });
    this.blockedSubmit.set(true);
  }

  /** Adds the typed text, if it is new, and clears the text box either way. */
  private add(event: Event): void {
    const value = this.value();
    const next = addChipListValue(value, this.draft());
    this.draft.set('');
    if (next !== value) this.commit([...next], 'add', event);
  }

  private commit(value: string[], reason: ChipListChangeReason, event: Event | null): void {
    this.value.set(value);
    this.dirtyState.set(true);
    this.valueChangeDetails.emit({ value, reason, event });
  }

  private warnWithoutName(): void {
    if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
    if (hasAccessibleName(this.inputRef().nativeElement)) return;
    const fix = this.field
      ? 'Add a <label cckLabel> with text to the FormField, or an aria-label or an aria-labelledby that points to an element with text.'
      : 'Add an aria-label or an aria-labelledby that points to an element with text.';
    console.warn(`CocoKits: a Chip list${this.field ? ' in a FormField' : ''} has no accessible name. ${fix}`);
  }
}
