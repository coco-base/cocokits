import { Directive } from '@angular/core';
import { CckButtonBase } from './button-base';

/**
 * A button on a native `<button>`. Its `type` is `button` unless you write `type="submit"` or `type="reset"`. The theme gives it its look.
 *
 * For a button with only an icon, use the Icon button (`cckIconButton`); it needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <button cckButton (click)="save()">Save</button>
 * @cckPart root
 * @cckSlot default - The label of the button. When not set, the button is empty, so name it with `aria-label`.
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
