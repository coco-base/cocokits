import { Directive, HostAttributeToken, computed, inject } from '@angular/core';
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
    '[attr.id]': 'id() || null',
  },
})
export class CckHint {
  private readonly ownId = inject(new HostAttributeToken('id'), { optional: true }) ?? undefined;
  private readonly field = inject(CckFormField, { optional: true });

  /** The id of the host: the author's, or the one the field gives it (`<fieldId>-hint-<n>`). */
  protected readonly id = this.field?._registerPart('hints', this.ownId) ?? computed(() => this.ownId);

  protected readonly parts = getHintProps();

  constructor() {
    themeAttrs(hintAnatomy); // applies the root part's theme attributes to the host
  }
}
