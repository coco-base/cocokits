import { DestroyRef, Directive, ElementRef, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { bindAttrs, listenLast } from '@cocokits/angular-core';
import { injectCckMenu } from './menu';

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
  host: {
    '[class]': 'props().class',
    '[attr.role]': 'props().role',
    '[attr.tabindex]': 'props().tabIndex',
    '[attr.aria-disabled]': 'props()["aria-disabled"] ?? null',
    '[attr.data-disabled]': 'props()["data-disabled"] ?? null',
    '(focus)': 'props().onFocus($event)',
  },
})
export class CckMenuItem {
  /**
   * Whether the item is disabled. It stays focusable and runs nothing.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Emits when the item runs, with a cancelable event. Call `preventDefault()` on it to keep the menu open.
   * @remarks It never emits for a disabled item.
   * @example
   * <cck-menu-item (triggered)="$event.preventDefault()">Stay</cck-menu-item>
   */
  readonly triggered = output<Event>();

  private readonly root = injectCckMenu('Item');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly registration = this.root._addItem(this.element, this.disabled);
  protected readonly props = computed(() =>
    this.root._parts().item({ key: this.registration.key, disabled: this.disabled(), text: '' }),
  );

  constructor() {
    inject(DestroyRef).onDestroy(this.registration.remove);
    bindAttrs(this.element, () => this.root._theme().item);
    // After the consumer's own click listeners, so their `preventDefault()` on the click vetoes the run.
    listenLast(this.element, 'click', (event) => {
      if (event.defaultPrevented) return;
      this.root._runItem(
        this.registration.key,
        () => {
          const itemEvent = new Event('triggered', { cancelable: true });
          this.triggered.emit(itemEvent);
          return itemEvent.defaultPrevented;
        },
        event,
      );
    });
  }
}
