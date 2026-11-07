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
 * An error message for a control. Inside a `cck-form-field`, it shows while the field is invalid and the user has left the control or has tried to submit. Outside a field, it always shows.
 *
 * The element is always there and is a polite live region, so screen readers announce the text when it shows. It has no role. Inside a field, the control is described by the error, so the text is also read on focus.
 *
 * An error without an `id` inside a field gets `<fieldId>-error-<n>`. The content is made once and added only while the error shows, so keep it small, like text or an icon.
 *
 * @example
 * <label for="email">Email address</label>
 * <input id="email" type="email" aria-describedby="email-error" />
 * <cck-field-error id="email-error">Enter an email address.</cck-field-error>
 * @cckPart root
 * @cckSlot default - The text of the message. It is added only while the error shows. When not set, the error is empty.
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
   * Whether the message always shows, whatever the state of the field is.
   * @defaultValue false
   */
  readonly force = input(false, { transform: booleanAttribute });

  protected readonly parts = computed(() => getFieldErrorProps({ force: this.force(), state: this.field?._state() }));

  constructor() {
    themeAttrs(fieldErrorAnatomy); // applies the root part's theme attributes to the host
  }
}
