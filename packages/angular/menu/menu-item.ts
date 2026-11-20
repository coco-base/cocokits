import { Directive, forwardRef } from '@angular/core';
import { CckMenuItemBase } from './menu-item-base';

/**
 * One action of the menu. Its content is yours: text, and an icon if you like. A click, Enter or Space runs it, and the menu closes.
 *
 * A disabled item stays in the menu and can have focus, but it runs nothing.
 *
 * @example
 * <cck-menu-item (triggered)="rename()">Rename</cck-menu-item>
 * @cckPart item
 * @cckSlot default - The label of the action. When not set, the item is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'cck-menu-item',
  exportAs: 'cckMenuItem',
  providers: [{ provide: CckMenuItemBase, useExisting: forwardRef(() => CckMenuItem) }],
})
export class CckMenuItem extends CckMenuItemBase {
  protected itemKind(): 'item' {
    return 'item';
  }

  protected isChecked(): boolean {
    return false;
  }

  protected itemValue(): undefined {
    return undefined;
  }

  protected apply(): void {
    // A plain item has no state.
  }
}
