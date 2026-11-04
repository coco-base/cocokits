import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getHintProps, hintAnatomy } from '@cocokits/machines/hint';

/**
 * A short help text for a control, on the author's element (a `<div>` by default). It renders its
 * content as written and has no role and no ARIA: give it an `id` and list that id in the
 * control's `aria-describedby`. It works on its own, inside or outside a `[cckFormField]`, and
 * sets no style.
 *
 * @example
 * <div cckHint id="email-hint">We only use it for the receipt.</div>
 * @cckPart root
 * @cckSlot default - The hint text, optionally with an icon.
 */
@Directive({
  selector: '[cckHint]',
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
