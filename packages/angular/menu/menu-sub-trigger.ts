import { DestroyRef, Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { getMenuSubTriggerProps, type MenuEvent, type MenuItemEntry } from '@cocokits/machines/menu';
import { injectCckMenuSub } from './menu-sub';

/**
 * The item of a menu that opens a submenu. It has `role="menuitem"`, `aria-haspopup="menu"` and `aria-expanded`. Its content is yours: text, and an icon if you like.
 *
 * @remarks Put it first in a `cckMenuSub`. A disabled sub-trigger stays in the menu and can have focus, but it opens nothing.
 *
 * @example
 * <ng-container cckMenuSub>
 *   <cck-menu-sub-trigger>Share</cck-menu-sub-trigger>
 *   <ng-template cckMenuPortal>...</ng-template>
 * </ng-container>
 * @cckPart subTrigger
 * @cckSlot default - The label of the item. When not set, the item is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'cck-menu-sub-trigger',
  exportAs: 'cckMenuSubTrigger',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.tabindex]': 'props().tabIndex',
    '[attr.aria-haspopup]': 'props()["aria-haspopup"]',
    '[attr.aria-expanded]': 'props()["aria-expanded"]',
    '[attr.aria-controls]': 'props()["aria-controls"] ?? null',
    '[attr.aria-disabled]': 'props()["aria-disabled"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
    '[attr.data-disabled]': 'props()["data-disabled"] ?? null',
    '[attr.data-highlighted]': 'props()["data-highlighted"] ?? null',
    '[attr.disabled]': 'null',
    '(click)': 'props().onClick($event)',
    '(pointermove)': 'props().onPointerMove($event)',
    '(focus)': 'props().onFocus($event)',
    '(keydown)': 'props().onKeyDown($event)',
  },
})
export class CckMenuSubTrigger {
  /**
   * Whether the sub-trigger is disabled. It stays focusable and opens nothing.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * The `id` of the sub-trigger. When not set, the sub-trigger gets a generated id.
   * @remarks The sub-content is named by the id the sub-trigger renders.
   */
  readonly id = input<string | undefined>(undefined);

  private readonly sub = injectCckMenuSub('SubTrigger');
  private readonly parent = this.sub._parent;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly registration = this.parent._addItem({
    element: this.element,
    disabled: this.disabled,
    kind: computed(() => 'item' as const),
    checked: computed(() => false),
    value: computed(() => undefined),
    hasDescription: computed(() => false),
    apply: () => undefined,
  });

  private readonly entry = computed<MenuItemEntry>(() => ({
    key: this.registration.key,
    disabled: this.disabled(),
    text: '',
  }));

  protected readonly props = computed(() =>
    getMenuSubTriggerProps(
      this.parent._state(),
      this.entry(),
      { id: this.sub._id, open: this.sub.open(), mounted: this.sub._mounted(), triggerId: this.id() },
      (event) => {
        this.send(event);
      },
    ),
  );

  constructor() {
    const sub = this.sub;
    sub._trigger.set(this.element);
    sub._triggerId.set(this.id);
    inject(DestroyRef).onDestroy(() => {
      sub._triggerId.update((current) => (current === this.id ? null : current));
      sub._trigger.update((current) => (current === this.element ? null : current));
      this.registration.remove();
    });
    bindAttrs(this.element, () => sub._theme().subTrigger);
    // A disabled sub-trigger opens nothing; the submenu reads it through the sub-trigger.
    sub._disabled = this.disabled;
  }

  /** The submenu answers its own events; the parent menu answers the rest. */
  private send(event: MenuEvent): void {
    if (event.type.startsWith('SUB.')) this.sub._send(event);
    else this.parent._send(event);
  }
}
