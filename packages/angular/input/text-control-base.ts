import {
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  output,
  type Signal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { injectFormParticipation } from '@cocokits/angular-core';
import { CckFormControlBase, type FormControlParts } from '@cocokits/angular/form-control';
import type { FormFieldControlParts } from '@cocokits/machines/form-field';
import type { InputProps } from '@cocokits/machines/input';
import type { ValueChangeDetails } from '@cocokits/shared';
import { hasAccessibleName } from '@cocokits/utils';

/** What a text control reports to its FormField, and the root props with the control's own class. */
type Parts = FormFieldControlParts & FormControlParts;

/** The reasons a text control gives for a change of its value. */
type Reason = 'user' | 'form-reset';

/**
 * The control contract that `CckInput` and `CckTextarea` share: the value model, the change output, the
 * form participation and the host bindings; the model-free part is `CckFormControlBase`. A subclass adds only
 * its selector, its machine call (`parts`), the `[value]` host binding (the base has no element to check it
 * against) and what is its own (the Input's `type`).
 *
 * Not for direct use or extension outside CocoKits: it is exported only because the Input and the
 * Textarea are separate entry points and cannot share a relative file. Its members are the members of
 * both components, so changing one weighs as the same change on both.
 *
 * @typeParam R - The reasons the subclass reports for a change of the value (`InputChangeReason`,
 * `TextareaChangeReason`). Each subclass names its own set, within the base reasons `'user'` and `'form-reset'`.
 * @internal
 */
@Directive({
  host: {
    '[attr.id]': 'parts().root.id',
    '[attr.name]': 'parts().root.name',
    '[attr.disabled]': 'parts().root.disabled ? "" : null',
    '[attr.readonly]': 'parts().root.readonly ? "" : null',
    '[attr.required]': 'parts().root.required ? "" : null',
    '[attr.aria-invalid]': 'parts().root["aria-invalid"]',
    '[attr.aria-describedby]': 'parts().root["aria-describedby"]',
    '[attr.data-filled]': 'parts().root["data-filled"]',
    '(input)': 'onInput($event)',
    '(focus)': 'focused.set(true)',
    '(blur)': 'onBlur()',
  },
})
export abstract class CckTextControlBase<R extends Reason = Reason>
  extends CckFormControlBase
  implements FormValueControl<string | null | undefined>
{
  private readonly element = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef).nativeElement;
  private mountValue = '';

  protected readonly participation = injectFormParticipation({
    getValue: () => this.text(),
    onReset: (event) => {
      this.onNativeReset(event);
    },
  });

  /**
   * The text of the control. Use `[(value)]` to read and change it.
   * @remarks A `null` or `undefined` value shows an empty control and emits no change. With a one-way `[value]`, typing changes the control but not your value.
   * @defaultValue ''
   */
  readonly value = model<string | null | undefined>('');

  /**
   * Emits after the user changes the text, and after a form reset. It sends the new `value`, the `reason` and the `event`.
   * @remarks It never emits when the parent or a forms library changes the value.
   * @example
   * <!-- A textarea[cckTextarea] takes the same binding. -->
   * <input cckInput aria-label="Name" (valueChangeDetails)="onChange($event.value, $event.reason)" />
   * <!-- In the class: onChange(text: string, reason: InputChangeReason) { console.log(text, reason); } -->
   * @cckSemantic *.valueChange
   */
  readonly valueChangeDetails = output<ValueChangeDetails<string, R>>();

  /**
   * The `id` of the control. When not set, the control gets `<fieldId>-control` inside a form field, or no id outside one.
   * @remarks Inside a form field, the label of the field points at your id.
   */
  readonly id = input<string | undefined>(undefined);

  /** The value as the DOM shows it (see {@link domText}). */
  protected readonly text = computed(() => this.domText(this.value() ?? ''));

  /** The machine props the control tracks. A subclass adds its own props to them when it calls its machine. */
  protected readonly state = computed<Omit<InputProps, 'type'>>(() => ({
    value: this.value(),
    id: this.id(),
    ...this.facts(),
  }));

  /** The result of the subclass's machine call, from `state()` and `fieldContext()`. */
  protected abstract override readonly parts: Signal<Parts>;

  constructor() {
    super();
    afterNextRender(() => {
      this.mountValue = this.text();
      this.warnWithoutName();
    });
  }

  /**
   * The text the DOM shows for a model value. The default is the value itself; the Textarea writes line
   * breaks as the element reads them back. The model is never rewritten.
   */
  protected domText(value: string): string {
    return value;
  }

  protected onInput(event: Event): void {
    const value = this.element.value;
    this.value.set(value);
    this.dirtyState.set(true);
    this.valueChangeDetails.emit({ value, reason: 'user' as R, event });
  }

  protected controlElement(): HTMLElement {
    return this.element;
  }

  protected restoreMount(event: Event): void {
    this.value.set(this.mountValue);
    this.valueChangeDetails.emit({ value: this.mountValue, reason: 'form-reset' as R, event });
  }

  private warnWithoutName(): void {
    if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
    if (!hasAccessibleName(this.element)) {
      const [article, name] = this.element instanceof HTMLTextAreaElement ? ['a', 'Textarea'] : ['an', 'Input'];
      const fix = this.field
        ? `Add a <label cckLabel> with text to the FormField, or an aria-label, a title, or an aria-labelledby that points to an element with text, to the ${name}.`
        : `Add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id, to the ${name}.`;
      console.warn(`CocoKits: ${article} ${name}${this.field ? ' in a FormField' : ''} has no accessible name. ${fix}`);
    }
  }
}
