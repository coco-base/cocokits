import {
  Component,
  HostAttributeToken,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import { fieldErrorAnatomy, getFieldErrorProps } from '@cocokits/machines/field-error';

/**
 * An error message of the field, written as the `cck-field-error` tag. Inside a
 * `cck-form-field` it shows its content while the field is invalid and was touched or submitted (the
 * gate of `aria-invalid`), or always with `force`; outside a field the content always shows. The
 * root is a polite live region (`aria-live="polite"`) that is always rendered, so the text is
 * announced when it appears; it has no role. Inside a field the control's `aria-describedby` names it (the
 * element is empty while the error is hidden), so the text is also read as the description on focus. An error
 * without an `id` gets `<fieldId>-error-<n>`.
 *
 * The content you write is created once and only inserted while it shows, so keep it cheap (text, an
 * icon).
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Email address</label>
 *   <input cckInput type="email" required />
 *   <cck-field-error>Enter an email address.</cck-field-error>
 * </cck-form-field>
 * @cckPart root
 * @cckSlot default - The message; inserted only while the error shows.
 */
@Component({
  selector: 'cck-field-error',
  exportAs: 'cckFieldError',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'parts().root.class',
    '[attr.id]': 'id() || null',
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
  private readonly ownId = inject(new HostAttributeToken('id'), { optional: true }) ?? undefined;

  /** The id of the host: the author's, or the one the field gives it (`<fieldId>-error-<n>`). */
  protected readonly id = this.field?._registerPart('errors', this.ownId) ?? computed(() => this.ownId);

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
