import {
  DestroyRef,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  type OnInit,
} from '@angular/core';
import { IdGenerator, bindAttrs, listenFirst } from '@cocokits/angular-core';
import { tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { injectCckTabNav, type CckTabNavRegistration } from './tab-nav';

/**
 * One link of a tab nav, on a native `<a>`. It stays a native link, and it can carry `routerLink`. The active link gets `aria-current="page"`.
 *
 * A disabled link gets `aria-disabled="true"`, leaves the tab order and keeps its `href`. A click on it does not open the page.
 *
 * With a panel, the links are tabs. The active link then gets `aria-selected="true"` and no `aria-current`. Space opens a link.
 *
 * @example
 * <nav cckTabNav aria-label="Project">
 *   <a cckTabNavLink routerLink="/overview" [active]="true">Overview</a>
 * </nav>
 * @cckPart link
 * @cckSlot default - The text of the link. When not set, the link is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'a[cckTabNavLink]',
  exportAs: 'cckTabNavLink',
  host: {
    '[class]': 'props().class',
    '[attr.id]': 'id()',
    '[attr.role]': 'props().role ?? null',
    '[attr.aria-selected]': 'props()["aria-selected"] ?? null',
    '[attr.aria-controls]': 'props()["aria-controls"] ?? null',
    '[attr.aria-current]': 'props()["aria-current"] ?? null',
    '[attr.aria-disabled]': 'props()["aria-disabled"] ?? null',
    '[attr.tabindex]': 'props().tabIndex ?? null',
    '[attr.data-active]': 'props()["data-active"] ?? null',
    '[attr.data-disabled]': 'props()["data-disabled"] ?? null',
    '[attr.active]': 'null',
    '[attr.disabled]': 'null',
    '(keydown)': 'onKeydown($event)',
  },
})
export class CckTabNavLink implements CckTabNavRegistration, OnInit {
  /**
   * Whether the link is the link of the current page. Set it from your router. The indicator moves under the active link.
   * @defaultValue false
   */
  readonly active = input(false, { transform: booleanAttribute });

  /**
   * Whether the user cannot use the link. It leaves the tab order, and a click does not open its page.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * The `id` of the link. While the link is active, the panel is named by it. When not set, the link gets a generated id.
   * @cckSemantic none
   * @cckParity Declared as an input; the directive forwards it to the element.
   */
  readonly id = input(inject(IdGenerator).getId(tabNavAnatomy.classes.link));

  /** The link element. @internal */
  readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly root = injectCckTabNav('cckTabNavLink');
  private readonly destroyRef = inject(DestroyRef);
  protected readonly props = computed(() =>
    this.root._parts().link({
      active: this.active(),
      disabled: this.disabled(),
      id: this.id(),
      tabStop: this.root._stopLink() === this,
    }),
  );

  constructor() {
    bindAttrs(this._element, () => this.root._theme().link);

    // Not a host `(click)`: only a capture-phase listener runs before the consumer's handlers and RouterLink.
    // Same reason as the Button's guard: a `host` listener cannot stop the others.
    listenFirst(this._element, 'click', (event) => {
      this.props().onClick?.(event);
    });
  }

  /** Registers with the TabNav so the indicator and the keys can find the links. @internal */
  ngOnInit(): void {
    this.destroyRef.onDestroy(this.root._register(this));
  }

  /**
   * Space activates the link in panel mode, without scrolling the page; a disabled link only swallows the key.
   *
   * @param event - The key press on the link.
   * @internal
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.root._panelMode() || event.key !== ' ' || event.defaultPrevented) return;
    event.preventDefault();
    if (!this.disabled()) this._element.click();
  }
}
