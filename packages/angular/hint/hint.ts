import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getHintProps, hintAnatomy } from '@cocokits/machines/hint';

/**
 * A short help text for a control, written as the `cck-hint` tag. It renders its
 * content as written and has no role and no ARIA: give it an `id` and list that id in the
 * control's `aria-describedby`. It works on its own, inside or outside a `cck-form-field`, and
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
  },
})
export class CckHint {
  protected readonly parts = getHintProps();

  constructor() {
    themeAttrs(hintAnatomy); // applies the root part's theme attributes to the host
  }
}
