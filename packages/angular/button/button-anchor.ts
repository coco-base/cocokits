import { Directive } from '@angular/core';
import { CckButtonBase } from './button-base';

/**
 * The Button root on a native `<a>`. It renders the `cck-button` class and stays a link (role
 * `link`, Enter only); it never renders `type`. When disabled it sets `aria-disabled="true"`,
 * `tabindex="-1"` and `data-disabled`, keeps `href`, and blocks activation with a click guard
 * that also stops a consumer `(click)` and `RouterLink` on the same element. The theme styles it.
 *
 * @example
 * <a cckButton href="/docs">Read the docs</a>
 * @cckPart root
 * @cckSlot default - The link label, as written.
 * @cckDataAttr data-disabled - present when disabled
 */
@Directive({
  selector: 'a[cckButton]',
  exportAs: 'cckButton',
  host: {
    '[attr.aria-disabled]': 'props()["aria-disabled"] ?? null',
    '[attr.tabindex]': 'props().tabindex ?? null',
  },
})
export class CckButtonAnchor extends CckButtonBase {
  protected readonly rootElementTag = 'a';
}
