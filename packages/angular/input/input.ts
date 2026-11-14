import { Directive, computed, input } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getInputProps, inputAnatomy, type InputType } from '@cocokits/machines/input';
import type { ChangeDetails } from '@cocokits/shared';
import { CckTextControlBase } from './text-control-base';

/**
 * Why the value of an Input changed.
 * @cckValue 'user' - The user changed the text.
 * @cckValue 'form-reset' - The form that holds the input was reset.
 */
export type InputChangeReason = 'user' | 'form-reset';

/** The `reason` and the `event` of a change. The `valueChangeDetails` output sends them with the `value`. */
export type InputChangeDetails = ChangeDetails<InputChangeReason>;

/**
 * A single-line text control on a native `<input>`. Name it with a label, `aria-label` or `aria-labelledby`.
 *
 * The input works with Signal Forms. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`. It is a native form control, so `FormData`, validation, the `form` attribute, submit on Enter and a disabled `fieldset` work as usual.
 *
 * Inside a `cck-form-field`, the input gets the id `<fieldId>-control`, and the label of the field points at it. The input is described by the hints and errors of the field, after your own `aria-describedby`. `aria-invalid` shows only after the user has left the input or has tried to submit the form.
 *
 * The value is a model. Use `[(value)]` to read and change it, `[value]` to only set it, or no binding.
 *
 * @example
 * <label for="email">Email address</label>
 * <input cckInput id="email" type="email" [(value)]="email" />
 * @cckPart root
 */
@Directive({
  selector: 'input[cckInput]',
  exportAs: 'cckInput',
  host: {
    '[value]': 'text()',
    '[attr.type]': 'parts().root.type',
  },
})
export class CckInput extends CckTextControlBase<InputChangeReason> {
  /**
   * The native `type` of the input. It can be `text`, `email`, `password`, `search`, `tel` or `url`. Any other value shows a `text` input.
   * @cckSemantic none
   * @cckParity Declared as an input.
   * @defaultValue 'text'
   */
  readonly type = input<string | undefined>(undefined);

  protected readonly parts = computed(() =>
    getInputProps(
      { ...this.state(), type: this.type() as InputType | undefined }, // the machine renders `text` for any other value
      this.fieldContext(),
    ),
  );

  constructor() {
    super();
    themeAttrs(inputAnatomy); // applies the root part's theme attributes to the host
  }
}
