import { Directive } from '@angular/core';
import { CckIconButtonBase } from './icon-button-base';

/**
 * A link with only an icon that looks like a button, on a native `<a>`. It stays a link: Enter opens it, and it has no `type`. The theme gives it its look.
 *
 * Put one icon inside, and name the link with `aria-label` or `aria-labelledby`.
 *
 * A disabled link gets `aria-disabled="true"` and `tabindex="-1"`, and keeps its `href`. A click on it does nothing. Your own `(click)` and a `routerLink` on the same element do not run.
 *
 * @example
 * <a cckIconButton href="/docs" aria-label="Documentation"><cck-svg-icon iconName="link" /></a>
 * @cckPart root
 * @cckSlot default - The icon. When not set, the link is empty, so name it with `aria-label` or `aria-labelledby`.
 */
@Directive({
  selector: 'a[cckIconButton]',
  exportAs: 'cckIconButton',
  host: {
    '[attr.aria-disabled]': 'props()["aria-disabled"] ?? null',
    '[attr.tabindex]': 'props().tabindex ?? null',
  },
})
export class CckIconButtonAnchor extends CckIconButtonBase {
  protected readonly rootElementTag = 'a';
}
