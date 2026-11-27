import { DestroyRef, Directive, computed, forwardRef, inject, model, output, signal } from '@angular/core';
import { IdGenerator } from '@cocokits/angular-core';
import { menuAnatomy, type MenuItemChangeReason } from '@cocokits/machines/menu';
import type { ValueChangeDetails } from '@cocokits/shared';
import { injectCckMenu } from './menu-inject';

/** Why the value of a menu radio group changed. */
export type MenuRadioGroupChangeReason = MenuItemChangeReason;

/** What `valueChangeDetails` sends: the new `value`, the `reason` and the `event`. */
export type MenuRadioGroupChangeDetails = ValueChangeDetails<string | null, MenuRadioGroupChangeReason>;

/**
 * What a group and a radio group share: the id, and the count of group labels that name them. The group label finds
 * its group through it.
 *
 * Not for direct use or extension outside CocoKits: it is exported only because the group parts find each other
 * through it.
 * @internal
 */
@Directive()
export abstract class CckMenuGroupBase {
  /** How many group labels are mounted in the group. @internal */
  readonly _labels = signal(0);
  /** The id of the group; the id of its label derives from it. @internal */
  readonly _id = inject(IdGenerator).getId(menuAnatomy.classes.group);
  protected readonly root = injectCckMenu('Group');
}

/**
 * A group of items with a shared label. It has `role="group"`. Put a `cck-menu-group-label` in it to name it; the group points at the label with `aria-labelledby`.
 *
 * @example
 * <cck-menu-group>
 *   <cck-menu-group-label>Edit</cck-menu-group-label>
 *   <cck-menu-item>Cut</cck-menu-item>
 *   <cck-menu-item>Copy</cck-menu-item>
 * </cck-menu-group>
 * @cckPart group
 * @cckSlot default - The group label and the items. When not set, the group is empty.
 */
@Directive({
  selector: 'cck-menu-group',
  exportAs: 'cckMenuGroup',
  providers: [{ provide: CckMenuGroupBase, useExisting: forwardRef(() => CckMenuGroup) }],
  host: {
    '[class]': 'props().class',
    '[attr.role]': 'props().role',
    '[attr.aria-labelledby]': 'props()["aria-labelledby"] ?? null',
  },
})
export class CckMenuGroup extends CckMenuGroupBase {
  protected readonly props = computed(() => this.root._parts().group({ id: this._id, hasLabel: this._labels() > 0 }));
}

/**
 * A group of radio items with one value. It has `role="group"`. Each `cck-menu-radio-item` is checked while its `value` is the value of the group.
 *
 * @remarks Put a `cck-menu-group-label` in it to name it.
 *
 * The value is a model. Use `[(value)]` to read and change it. A press on a radio item sets it and closes the menu; Space sets it and keeps the menu open.
 *
 * @example
 * <cck-menu-radio-group [(value)]="sort">
 *   <cck-menu-group-label>Sort by</cck-menu-group-label>
 *   <cck-menu-radio-item value="name">Name</cck-menu-radio-item>
 *   <cck-menu-radio-item value="date">Date</cck-menu-radio-item>
 * </cck-menu-radio-group>
 * @cckPart radioGroup
 * @cckSlot default - The group label and the `cck-menu-radio-item` elements. When not set, the group is empty.
 */
@Directive({
  selector: 'cck-menu-radio-group',
  exportAs: 'cckMenuRadioGroup',
  providers: [{ provide: CckMenuGroupBase, useExisting: forwardRef(() => CckMenuRadioGroup) }],
  host: {
    '[class]': 'props().class',
    '[attr.role]': 'props().role',
    '[attr.aria-labelledby]': 'props()["aria-labelledby"] ?? null',
    '[attr.value]': 'null',
  },
})
export class CckMenuRadioGroup extends CckMenuGroupBase {
  /**
   * The `value` of the checked radio item. `null` checks none.
   * @cckSemantic menu.radioGroup.value
   * @defaultValue null
   */
  readonly value = model<string | null>(null);

  /**
   * Emits after the user checks a radio item. It sends the new `value`, the `reason` and the `event`.
   * @remarks It never emits when the parent changes `value`.
   * @example
   * <cck-menu-radio-group (valueChangeDetails)="onSort($event.value)">...</cck-menu-radio-group>
   * @cckSemantic menu.radioGroup.valueChange
   */
  readonly valueChangeDetails = output<MenuRadioGroupChangeDetails>();

  protected readonly props = computed(() =>
    this.root._parts().radioGroup({ id: this._id, hasLabel: this._labels() > 0 }),
  );

  /**
   * A radio item was pressed: sets the value and emits once.
   *
   * @param value - The value of the item.
   * @param reason - Why it changed.
   * @param event - The press.
   * @internal
   */
  _choose(value: string, reason: MenuRadioGroupChangeReason, event: Event): void {
    if (this.value() === value) return;
    this.value.set(value);
    this.valueChangeDetails.emit({ value, reason, event });
  }
}

/**
 * The label of a group or a radio group. The group points at it with `aria-labelledby`, so it names the group.
 *
 * @example
 * <cck-menu-group><cck-menu-group-label>Edit</cck-menu-group-label>...</cck-menu-group>
 * @cckPart groupLabel
 * @cckSlot default - The text of the label. When not set, the label is empty.
 */
@Directive({
  selector: 'cck-menu-group-label',
  exportAs: 'cckMenuGroupLabel',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
  },
})
export class CckMenuGroupLabel {
  private readonly group = inject(CckMenuGroupBase);
  private readonly root = injectCckMenu('GroupLabel');
  protected readonly props = computed(() => this.root._parts().groupLabel({ id: this.group._id }));

  constructor() {
    const group = this.group;
    group._labels.update((count) => count + 1);
    inject(DestroyRef).onDestroy(() => {
      group._labels.update((count) => count - 1);
    });
  }
}
