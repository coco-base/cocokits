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
 * One link of a TabNav. It stays a native link (also a router link: put it on the `a` that carries
 * `routerLink`). The active link renders `aria-current="page"`; a disabled link renders `aria-disabled="true"`,
 * leaves the tab order, keeps its `href` and does not navigate. With a linked panel the links are `tab`s
 * instead: the active one has `aria-selected="true"` and no `aria-current`, Space activates a link. `active`
 * and `disabled` do not stay on the host element.
 *
 * @example
 * <a cckTabNavLink href="/overview" active>Overview</a>
 * @cckPart link
 * @cckSlot default - The link content.
 * @cckDataAttr data-active - present on the active link
 * @cckDataAttr data-disabled - present when disabled
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
   * Whether this link is the current page; the author sets it from the router. The indicator follows it.
   * @defaultValue false
   */
  readonly active = input(false, { transform: booleanAttribute });

  /**
   * Whether the link is disabled: it is out of the tab order and its activation is prevented.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * The id of the link, which the linked panel is labelled by while the link is active. Generated when left out.
   * @cckSemantic none
   * @remarks Angular only: React and Vue take a native `id` on the link.
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
