import { Directive } from '@angular/core';
import { CckButtonBase } from './button-base';

/**
 * The Button root on a native `<button>`. It renders the `cck-button` class, a static
 * `type="button"` (a consumer's static `type="submit"` or `"reset"` wins) and `data-disabled`;
 * the theme styles it. An icon-only button needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <button cckButton (click)="save()">Save</button>
 * @cckPart root
 * @cckSlot default - The button label, as written.
 * @cckDataAttr data-disabled - present when disabled
 */
@Directive({
  selector: 'button[cckButton]',
  exportAs: 'cckButton',
  host: {
    type: 'button',
    '[disabled]': 'props().disabled ?? false',
  },
})
export class CckButton extends CckButtonBase {
  protected readonly rootElementTag = 'button';
}
