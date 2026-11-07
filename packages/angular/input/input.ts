import { Directive, computed, input } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getInputProps, inputAnatomy, type InputType } from '@cocokits/machines/input';
import type { ChangeDetails } from '@cocokits/shared';
import { CckTextControlBase } from './text-control-base';

/** Why the value of an Input changed: the user typed (`'user'`) or the form was reset (`'form-reset'`). */
export type InputChangeReason = 'user' | 'form-reset';

/** The `reason` and `event` of a change. The `valueChangeDetails` output emits them with the `value`. */
export type InputChangeDetails = ChangeDetails<InputChangeReason>;

/**
 * A single-line text control on a native `<input>`. It is a Signal Forms custom control and, through
 * the static `ngNoCva` attribute, also binds to `formControlName`, `[formControl]` and `ngModel` with no
 * ControlValueAccessor. It takes part in a native `<form>` itself: `FormData`, constraint validation,
 * the `form` attribute, implicit submission and `fieldset[disabled]` work.
 *
 * Inside a `cck-form-field` it gets the id `<fieldId>-control`, the label's `for` points at it, and its
 * `aria-describedby` ends with the field's feedback wrapper. An `id` or `aria-describedby` you write
 * wins or comes first. `type` is `text` unless you set it, and `name` defaults to the path of the bound
 * forms control (`address.street`). The state facts are `data-*` attributes; `aria-invalid="true"`
 * appears only while the control is invalid and was touched or the form was submitted.
 *
 * A nullish value (a reset nullable control, an unset `ngModel`) renders empty and is never echoed back.
 * The value is a model: `[(value)]`, `[value]` or unbound. With a one-way `[value]` typing diverges from
 * the parent until the parent sets a new value.
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Email address</label>
 *   <input cckInput type="email" [(value)]="email" />
 * </cck-form-field>
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
   * The `type`. A value outside the six text types (`text`, `email`, `password`, `search`, `tel`, `url`)
   * renders `text`.
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
