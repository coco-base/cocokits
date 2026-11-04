import { Component, ViewEncapsulation, booleanAttribute, computed, inject, input } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import { fieldErrorAnatomy, getFieldErrorProps } from '@cocokits/machines/field-error';

/**
 * An error message of the field, on the author's element (a `<div>` by default). Inside a
 * `[cckFormField]` it shows its content while the field is invalid and was touched or submitted (the
 * gate of `aria-invalid`), or always with `force`; outside a field the content always shows. The
 * root is a polite live region (`aria-live="polite"`) that is always rendered, so the text is
 * announced when it appears; it has no role. Inside a field it sits in the feedback wrapper, which
 * the control's `aria-describedby` names, so the text is also read as the description on focus.
 *
 * The content you write is created once and only inserted while it shows, so keep it cheap (text, an
 * icon).
 *
 * @example
 * <div cckFormField>
 *   <label cckLabel>Email address</label>
 *   <input cckInput type="email" required />
 *   <div cckFieldError>Enter an email address.</div>
 * </div>
 * @cckPart root
 * @cckSlot default - The message; inserted only while the error shows.
 */
@Component({
  selector: '[cckFieldError]',
  exportAs: 'cckFieldError',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'parts().root.class',
    '[attr.aria-live]': 'parts().root["aria-live"]',
  },
  template: `
    @if (parts().shown) {
      <ng-content />
    }
  `,
})
export class CckFieldError {
  private readonly field = inject(CckFormField, { optional: true });

  /**
   * Whether the content shows regardless of the field state.
   * @defaultValue false
   */
  readonly force = input(false, { transform: booleanAttribute });

  protected readonly parts = computed(() => getFieldErrorProps({ force: this.force(), state: this.field?._state() }));

  constructor() {
    themeAttrs(fieldErrorAnatomy); // applies the root part's theme attributes to the host
  }
}
