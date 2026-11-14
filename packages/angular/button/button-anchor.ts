import { Directive } from '@angular/core';
import { CckButtonBase } from './button-base';

/**
 * A link that looks like a button, on a native `<a>`. It stays a link: Enter opens it, and it has no `type`. The theme gives it its look.
 *
 * For a link with only an icon, use the Icon button (`a[cckIconButton]`); it needs `aria-label` or `aria-labelledby`.
 *
 * A disabled link gets `aria-disabled="true"` and `tabindex="-1"`, and keeps its `href`. A click on it does nothing. Your own `(click)` and a `routerLink` on the same element do not run.
 *
 * @example
 * <a cckButton href="/docs">Read the docs</a>
 * @cckPart root
 * @cckSlot default - The label of the link. When not set, the link is empty, so name it with `aria-label`.
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
