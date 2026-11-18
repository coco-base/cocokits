import { DestroyRef, Directive, computed, inject } from '@angular/core';
import { injectCckMenu } from './menu-inject';
import { CckMenuItemBase } from './menu-item-base';

/**
 * The mark of a checkbox item or a radio item. It is decorative, so it has `aria-hidden`. Put your own icon or text in it.
 *
 * @remarks It has `data-state` of `checked` or `unchecked`, and the theme shows it only while the item is checked.
 *
 * @example
 * <cck-menu-checkbox-item [(checked)]="on"><cck-menu-item-indicator><cck-svg-icon iconName="check" /></cck-menu-item-indicator>Show</cck-menu-checkbox-item>
 * @cckPart itemIndicator
 * @cckSlot default - The mark. When not set, the indicator is empty.
 */
@Directive({
  selector: 'cck-menu-item-indicator',
  exportAs: 'cckMenuItemIndicator',
  host: {
    '[class]': 'props().class',
    '[attr.aria-hidden]': 'props()["aria-hidden"]',
    '[attr.data-state]': 'props()["data-state"]',
  },
})
export class CckMenuItemIndicator {
  private readonly item = inject(CckMenuItemBase);
  private readonly root = injectCckMenu('ItemIndicator');
  protected readonly props = computed(() => this.root._parts().itemIndicator({ checked: this.item._checked() }));
}

/**
 * Content before the text of an item, such as an icon. It is decorative, so it has `aria-hidden`: the text of the item names the item. An item with only an icon needs an `aria-label`.
 *
 * @example
 * <cck-menu-item><cck-menu-item-leading><cck-svg-icon iconName="setting" /></cck-menu-item-leading>Rename</cck-menu-item>
 * @cckPart itemLeading
 * @cckSlot default - The icon. When not set, the part is empty.
 */
@Directive({
  selector: 'cck-menu-item-leading',
  exportAs: 'cckMenuItemLeading',
  host: { '[class]': 'props().class', '[attr.aria-hidden]': 'props()["aria-hidden"]' },
})
export class CckMenuItemLeading {
  private readonly root = injectCckMenu('ItemLeading');
  protected readonly props = computed(() => this.root._parts().itemLeading);
}

/**
 * Content after the text of an item, such as an icon. It is decorative, so it has `aria-hidden`.
 *
 * @example
 * <cck-menu-item>Share<cck-menu-item-trailing><cck-svg-icon iconName="chevron-right" /></cck-menu-item-trailing></cck-menu-item>
 * @cckPart itemTrailing
 * @cckSlot default - The icon. When not set, the part is empty.
 */
@Directive({
  selector: 'cck-menu-item-trailing',
  exportAs: 'cckMenuItemTrailing',
  host: { '[class]': 'props().class', '[attr.aria-hidden]': 'props()["aria-hidden"]' },
})
export class CckMenuItemTrailing {
  private readonly root = injectCckMenu('ItemTrailing');
  protected readonly props = computed(() => this.root._parts().itemTrailing);
}

/**
 * The keyboard shortcut of an item, as text, such as `Ctrl+C`. It only shows the text: it adds no shortcut.
 *
 * @example
 * <cck-menu-item>Copy<cck-menu-item-shortcut>Ctrl+C</cck-menu-item-shortcut></cck-menu-item>
 * @cckPart itemShortcut
 * @cckSlot default - The text of the shortcut. When not set, the part is empty.
 */
@Directive({
  selector: 'cck-menu-item-shortcut',
  exportAs: 'cckMenuItemShortcut',
  host: { '[class]': 'props().class' },
})
export class CckMenuItemShortcut {
  private readonly root = injectCckMenu('ItemShortcut');
  protected readonly props = computed(() => this.root._parts().itemShortcut);
}

/**
 * A second line of text under the label of an item. The item is described by it: the item points at it with `aria-describedby`.
 *
 * @example
 * <cck-menu-item>Rename<cck-menu-item-supporting-text>Changes the file name</cck-menu-item-supporting-text></cck-menu-item>
 * @cckPart itemSupportingText
 * @cckSlot default - The text. When not set, the part is empty.
 */
@Directive({
  selector: 'cck-menu-item-supporting-text',
  exportAs: 'cckMenuItemSupportingText',
  host: { '[class]': 'props().class', '[id]': 'props().id' },
})
export class CckMenuItemSupportingText {
  private readonly item = inject(CckMenuItemBase);
  private readonly root = injectCckMenu('ItemSupportingText');
  protected readonly props = computed(() => this.root._parts().itemSupportingText({ key: this.item._key }));

  constructor() {
    const item = this.item;
    item._descriptions.update((count) => count + 1);
    inject(DestroyRef).onDestroy(() => {
      item._descriptions.update((count) => count - 1);
    });
  }
}
