import { Directive, computed } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { CckTextControlBase } from '@cocokits/angular/input';
import { getTextareaProps, textareaAnatomy } from '@cocokits/machines/textarea';
import type { ChangeDetails } from '@cocokits/shared';

/** Why the value of a Textarea changed: the user typed (`'user'`) or the form was reset (`'form-reset'`). */
export type TextareaChangeReason = 'user' | 'form-reset';

/** What the framework-neutral change callback of a Textarea receives; the Angular output adds the `value`. */
export type TextareaChangeDetails = ChangeDetails<TextareaChangeReason>;

/**
 * A multi-line text control on a native `<textarea>`. It follows the Input contract: a Signal Forms
 * custom control that, through the static `ngNoCva` attribute, also binds to `formControlName`,
 * `[formControl]` and `ngModel` with no ControlValueAccessor, and that takes part in a native `<form>`
 * itself (`FormData`, constraint validation, reset, `fieldset[disabled]`).
 *
 * Inside a `[cckFormField]` it gets the id `<fieldId>-control`, the label's `for` points at it, and its
 * `aria-describedby` ends with the field's feedback wrapper. `name` defaults to the path of the bound
 * forms control. `aria-invalid="true"` appears only while the control is invalid and was touched or the
 * form was submitted. Enter inserts a line break and never submits the form.
 *
 * The value is a string with LF line breaks: a model value with CR or CRLF is shown with LF, and the
 * model is never rewritten for it. Native `rows`, `cols`, `wrap` and the other textarea attributes pass
 * through.
 *
 * @example
 * <div cckFormField>
 *   <label cckLabel>Message</label>
 *   <textarea cckTextarea [(value)]="message"></textarea>
 * </div>
 * @cckPart root
 */
@Directive({
  selector: 'textarea[cckTextarea]',
  exportAs: 'cckTextarea',
  host: {
    '[value]': 'text()',
  },
})
export class CckTextarea extends CckTextControlBase<TextareaChangeReason> {
  protected readonly parts = computed(() => getTextareaProps(this.state(), this.fieldContext()));

  constructor() {
    super();
    themeAttrs(textareaAnatomy); // applies the root part's theme attributes to the host
  }

  /** A textarea reads its value back with LF line breaks, so the model is compared and shown the same way. */
  protected override domText(value: string): string {
    return value.replace(/\r\n?/g, '\n');
  }
}
