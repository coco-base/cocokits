import { Directive, forwardRef, model, output } from '@angular/core';
import type { MenuItemChange, MenuItemChangeReason } from '@cocokits/machines/menu';
import type { ValueChangeDetails } from '@cocokits/shared';
import { CckMenuItemBase } from './menu-item-base';

/** Why the checked state of a menu checkbox item changed. */
export type MenuCheckboxItemChangeReason = MenuItemChangeReason;

/** What `checkedChangeDetails` sends: the new `value`, the `reason` and the `event`. */
export type MenuCheckboxItemChangeDetails = ValueChangeDetails<boolean, MenuCheckboxItemChangeReason>;

/**
 * An item that toggles a state. It has `role="menuitemcheckbox"` and `aria-checked`. Put a `cck-menu-item-indicator` in it to show the mark.
 *
 * Use it instead of a `cck-checkbox` inside a menu. It has the role that screen readers expect in a menu, the focus stays in the menu, the menu keys work on it, and a press changes the state once: a `cck-checkbox` in an item would act twice for one click, once as the item and once as the checkbox.
 *
 * A click or Enter toggles it and closes the menu. Space toggles it and keeps the menu open. Use `[(checked)]` to read and change the state.
 *
 * @example
 * <cck-menu-checkbox-item [(checked)]="showHidden">
 *   <cck-menu-item-indicator>✓</cck-menu-item-indicator>
 *   Show hidden files
 * </cck-menu-checkbox-item>
 * @cckPart checkboxItem
 * @cckSlot default - The indicator and the label. When not set, the item is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'cck-menu-checkbox-item',
  exportAs: 'cckMenuCheckboxItem',
  providers: [{ provide: CckMenuItemBase, useExisting: forwardRef(() => CckMenuCheckboxItem) }],
  host: { '[attr.checked]': 'null' },
})
export class CckMenuCheckboxItem extends CckMenuItemBase {
  /**
   * Whether the item is checked. Use `[(checked)]` to read and change it.
   * @cckSemantic menu-checkbox-item.checked
   * @defaultValue false
   */
  readonly checked = model(false);

  /**
   * Emits after the user toggles the item. It sends the new `value`, the `reason` and the `event`.
   * @remarks It never emits when the parent changes `checked`.
   * @example
   * <cck-menu-checkbox-item (checkedChangeDetails)="onToggle($event.value)">Show hidden</cck-menu-checkbox-item>
   * @cckSemantic menu-checkbox-item.checkedChange
   */
  readonly checkedChangeDetails = output<MenuCheckboxItemChangeDetails>();

  protected itemKind(): 'checkbox' {
    return 'checkbox';
  }

  protected isChecked(): boolean {
    return this.checked();
  }

  protected itemValue(): undefined {
    return undefined;
  }

  protected apply(change: MenuItemChange, event: Event): void {
    if (change.type !== 'checkbox') return;
    this.checked.set(change.checked);
    this.checkedChangeDetails.emit({ value: change.checked, reason: change.reason, event });
  }
}
