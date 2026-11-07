import { Directive, computed } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { CckTextControlBase } from '@cocokits/angular/input';
import { getTextareaProps, textareaAnatomy } from '@cocokits/machines/textarea';
import type { ChangeDetails } from '@cocokits/shared';

/**
 * Why the value of a Textarea changed.
 * @cckValue 'user' - The user changed the text.
 * @cckValue 'form-reset' - The form that holds the textarea was reset.
 */
export type TextareaChangeReason = 'user' | 'form-reset';

/** The `reason` and the `event` of a change. The `valueChangeDetails` output sends them with the `value`. */
export type TextareaChangeDetails = ChangeDetails<TextareaChangeReason>;

/**
 * A multi-line text control on a native `<textarea>`. Name it with a label, `aria-label` or `aria-labelledby`. Enter adds a line break and never submits the form.
 *
 * The textarea works with Signal Forms. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`. It is a native form control, so `FormData`, validation, form reset and a disabled `fieldset` work as usual.
 *
 * Inside a `cck-form-field`, the textarea gets the id `<fieldId>-control`, and the label of the field points at it. The textarea is described by the hints and errors of the field. `aria-invalid` shows only after the user has left the textarea or has tried to submit the form.
 *
 * The line breaks of the value show as LF. A value with CR or CRLF is shown with LF, but your value does not change. The native `rows`, `cols` and `wrap` attributes work as usual.
 *
 * @example
 * <label for="message">Message</label>
 * <textarea cckTextarea id="message" [(value)]="message"></textarea>
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
