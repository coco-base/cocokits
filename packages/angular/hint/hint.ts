import { Directive, inject, input } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import { getHintProps, hintAnatomy } from '@cocokits/machines/hint';

/**
 * A short help text for a control. It has no role and no ARIA attributes.
 *
 * Inside a `cck-form-field`, the control is described by the hint without your help. A hint without an `id` then gets `<fieldId>-hint-<n>`. Outside a field, give the hint an `id` and list it in the `aria-describedby` of the control.
 *
 * @example
 * <label for="email">Email address</label>
 * <input id="email" type="email" aria-describedby="email-hint" />
 * <cck-hint id="email-hint">We only use it for the receipt.</cck-hint>
 * @cckPart root
 * @cckSlot default - The text of the hint. It can hold an icon too. When not set, the hint is empty.
 */
@Directive({
  selector: 'cck-hint',
  exportAs: 'cckHint',
  host: {
    '[class]': 'parts.root.class',
    '[attr.id]': 'renderedId() || null',
  },
})
export class CckHint {
  /**
   * The `id` of the hint. A bound id can change, and the control description follows it. When not set, the hint gets `<fieldId>-hint-<n>` inside a `cck-form-field`, or no id outside one.
   * @cckSemantic none
   * @cckParity Declared as an input; the directive forwards it to the element.
   */
  readonly id = input<string | undefined>(undefined);

  private readonly field = inject(CckFormField, { optional: true });

  /** The id of the host: the author's, or the one the field gives it (`<fieldId>-hint-<n>`). */
  protected readonly renderedId = this.field?._registerPart('hints', this.id) ?? this.id;

  protected readonly parts = getHintProps();

  constructor() {
    themeAttrs(hintAnatomy); // applies the root part's theme attributes to the host
  }
}
