import { Directive } from '@angular/core';
import { CckIconButtonBase } from './icon-button-base';

/**
 * A button with only an icon, on a native `<button>`. It takes the inputs and behaviour of the Button: its `type` is `button` unless you write `type="submit"` or `type="reset"`. The theme gives it its look.
 *
 * Put one icon inside, a `cck-svg-icon` or your own `<svg>` with `aria-hidden="true"`, and no text. Name the button with `aria-label` or `aria-labelledby`; in development a missing name logs an error. For a toggle, write your own `aria-pressed`.
 *
 * @example
 * <button cckIconButton aria-label="Add item" (click)="add()"><cck-svg-icon iconName="plus" /></button>
 * @cckPart root
 * @cckSlot default - The icon. When not set, the button is empty, so name it with `aria-label` or `aria-labelledby`.
 */
@Directive({
  selector: 'button[cckIconButton]',
  exportAs: 'cckIconButton',
  host: {
    type: 'button',
    '[disabled]': 'props().disabled ?? false',
  },
})
export class CckIconButton extends CckIconButtonBase {
  protected readonly rootElementTag = 'button';
}
