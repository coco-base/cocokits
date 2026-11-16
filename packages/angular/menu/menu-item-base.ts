import {
  DestroyRef,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { bindAttrs, listenLast, themeAttrs } from '@cocokits/angular-core';
import { menuAnatomy, type MenuItemChange, type MenuItemEntry, type MenuItemKind } from '@cocokits/machines/menu';
import { injectCckMenu } from './menu-inject';

/**
 * What every item of a menu shares: the registration, the host bindings of the machine and the run of the item.
 * `CckMenuItem`, `CckMenuCheckboxItem` and `CckMenuRadioItem` extend it and say what kind of item they are.
 *
 * Not for direct use or extension outside CocoKits: it is exported only because the item parts find each other
 * through it.
 * @internal
 */
@Directive({
  host: {
    '[class]': 'props().class',
    '[attr.role]': 'props().role',
    '[attr.tabindex]': 'props().tabIndex',
    '[attr.aria-checked]': 'props()["aria-checked"] ?? null',
    '[attr.aria-disabled]': 'props()["aria-disabled"] ?? null',
    '[attr.aria-describedby]': 'props()["aria-describedby"] ?? null',
    '[attr.data-state]': 'props()["data-state"] ?? null',
    '[attr.data-disabled]': 'props()["data-disabled"] ?? null',
    '[attr.data-highlighted]': 'props()["data-highlighted"] ?? null',
    '[attr.disabled]': 'null',
    '(focus)': 'props().onFocus($event)',
    '(keydown)': 'props().onKeyDown($event)',
    '(pointermove)': 'props().onPointerMove($event)',
  },
})
export abstract class CckMenuItemBase {
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

  /** How many supporting texts are mounted in the item. @internal */
  readonly _descriptions = signal(0);

  /** The key of the item in its menu. @internal */
  readonly _key: string;

  /** Whether the item is checked, for the indicator. @internal */
  readonly _checked = computed(() => this.isChecked());

  /** The item element. */
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly root = injectCckMenu('Item');
  /** The theme options of the item's own element (a theme directive on it), else the ones of the menu around it. */
  private readonly theme = themeAttrs(menuAnatomy);
  private readonly registration: { readonly key: string; readonly remove: () => void };

  /** What the machine reads of the item. */
  protected readonly entry = computed<MenuItemEntry>(() => ({
    key: this._key,
    disabled: this.disabled(),
    text: '',
    kind: this.itemKind(),
    checked: this.isChecked(),
    value: this.itemValue(),
    hasDescription: this._descriptions() > 0,
  }));

  protected readonly props = computed(() => this.root._parts().item(this.entry()));

  constructor() {
    this.registration = this.root._addItem({
      element: this.element,
      disabled: this.disabled,
      kind: computed(() => this.itemKind()),
      checked: computed(() => this.isChecked()),
      value: computed(() => this.itemValue()),
      hasDescription: computed(() => this._descriptions() > 0),
      apply: (change, event) => {
        this.apply(change, event);
      },
    });
    this._key = this.registration.key;
    inject(DestroyRef).onDestroy(this.registration.remove);
    bindAttrs(this.element, () => this.theme().item);
    // After the consumer's own click listeners, so their `preventDefault()` on the click vetoes the run.
    listenLast(this.element, 'click', (event) => {
      if (event.defaultPrevented) return;
      this.root._runItem(
        this._key,
        () => {
          const itemEvent = new Event('triggered', { cancelable: true });
          this.triggered.emit(itemEvent);
          return itemEvent.defaultPrevented;
        },
        event,
      );
    });
  }

  /** What the item is. Read after the item is built, so a subclass may answer from its own fields. */
  protected abstract itemKind(): MenuItemKind;

  /** Whether the item is checked: a checkbox item's state, a radio item's match with its group. */
  protected abstract isChecked(): boolean;

  /** The value a radio item sets. */
  protected abstract itemValue(): string | undefined;

  /** Applies the change a press asks for. */
  protected abstract apply(change: MenuItemChange, event: Event): void;
}
