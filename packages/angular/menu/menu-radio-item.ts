import { Directive, forwardRef, inject, input } from '@angular/core';
import type { MenuItemChange } from '@cocokits/machines/menu';
import { CckMenuRadioGroup } from './menu-group';
import { CckMenuItemBase } from './menu-item-base';

/**
 * An item that sets the value of its radio group. It has `role="menuitemradio"` and `aria-checked`. Put a `cck-menu-item-indicator` in it to show the mark. It is checked while its `value` is the value of the group.
 *
 * Use it instead of a `cck-radio` inside a menu. It has the role that screen readers expect in a menu, the focus stays in the menu, the menu keys work on it, and a press sets the value once: a `cck-radio` in an item would act twice for one click.
 *
 * A click or Enter sets the value and closes the menu. Space sets it and keeps the menu open.
 *
 * @example
 * <cck-menu-radio-group [(value)]="sort">
 *   <cck-menu-radio-item value="name">Name</cck-menu-radio-item>
 * </cck-menu-radio-group>
 * @cckPart radioItem
 * @cckSlot default - The indicator and the label. When not set, the item is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'cck-menu-radio-item',
  exportAs: 'cckMenuRadioItem',
  providers: [{ provide: CckMenuItemBase, useExisting: forwardRef(() => CckMenuRadioItem) }],
  host: { '[attr.value]': 'null' },
})
export class CckMenuRadioItem extends CckMenuItemBase {
  /**
   * The value the item sets in its radio group.
   * @cckSemantic menu-radio-item.value
   */
  readonly value = input.required<string>();

  private readonly group = inject(CckMenuRadioGroup, { optional: true });

  protected itemKind(): 'radio' {
    return 'radio';
  }

  protected isChecked(): boolean {
    return this.group?.value() === this.value();
  }

  protected itemValue(): string {
    return this.value();
  }

  protected apply(change: MenuItemChange, event: Event): void {
    if (change.type === 'radio') this.group?._choose(change.value, change.reason, event);
  }
}
