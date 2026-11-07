import { Directive, HostAttributeToken, computed, inject } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import { getHintProps, hintAnatomy } from '@cocokits/machines/hint';

/**
 * A short help text for a control, written as the `cck-hint` tag. It renders its
 * content as written and has no role and no ARIA: give it an `id` and list that id in the
 * control's `aria-describedby`. Inside a `cck-form-field` the control is described by it already, and a
 * hint without an `id` gets `<fieldId>-hint-<n>`. It works on its own, inside or outside a `cck-form-field`, and
 * sets no style.
 *
 * @example
 * <cck-hint id="email-hint">We only use it for the receipt.</cck-hint>
 * @cckPart root
 * @cckSlot default - The hint text, optionally with an icon.
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
