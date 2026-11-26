import {
  DestroyRef,
  Directive,
  Injector,
  Renderer2,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import {
  CckDirection,
  CckOverlayLayer,
  CckPortal,
  IdGenerator,
  domOrderedList,
  injectZoneBoundary,
  themeAttrs,
} from '@cocokits/angular-core';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { captureFocusReturn, connectFocusGuards, scheduleFocus } from '@cocokits/cdk/focus';
import { startOverlayPosition, type OverlayPositionOptions } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import {
  getMenuItemChange,
  getMenuProps,
  menuAnatomy,
  transitionMenu,
  type MenuAlign,
  type MenuEvent,
  type MenuInitialFocus,
  type MenuItemEntry,
  type MenuParts,
  type MenuSide,
  type MenuState,
  type MenuSubEvent,
  type MenuTransition,
} from '@cocokits/machines/menu';
import { insertMenuGuards } from './menu-guard';
import type { MenuChangeDetails, MenuContentRegistration, MenuItemRegistration, MenuSubHandle } from './menu-types';

export type {
  MenuChangeDetails,
  MenuContentRegistration,
  MenuItemRegistration,
  MenuOpenChangeReason,
  MenuSubHandle,
} from './menu-types';

const isSubEvent = (event: MenuEvent): event is MenuSubEvent => event.type.startsWith('SUB.');

/**
 * What the menu and the submenu share: the registered parts, the machine state, the portal, the dismiss layer, the
 * focus and the position. `CckMenu` and `CckMenuSub` extend it, and the parts find the nearest one.
 *
 * Not for direct use or extension outside CocoKits: it is exported only because the entry point shares it between
 * the menu and the submenu.
 * @internal
 */
@Directive()
export abstract class CckMenuBase {
  abstract readonly open: Signal<boolean>;

  /** The theme attributes of every part; the parts apply their own record. @internal */
  readonly _theme = themeAttrs(menuAnatomy);

  /** @internal */
  readonly _trigger = signal<HTMLElement | null>(null);
  /** The `id` input of the trigger, so the content can be named by the id the trigger renders. @internal */
  readonly _triggerId = signal<Signal<string | undefined> | null>(null);
  /** @internal */
  readonly _content = signal<MenuContentRegistration | null>(null);
  /** The template of the content; the trigger gives its input. @internal */
  _template: Signal<TemplateRef<unknown> | null> = signal(null);
  /** The mounted items in document order. @internal */
  readonly _items = domOrderedList<MenuItemRegistration>((item) => item.element);
  /** The submenus of this menu. @internal */
  readonly _subs = signal<ReadonlySet<MenuSubHandle>>(new Set());

  /** Whether the machine treats this menu as a submenu. */
  protected readonly isSub: boolean = false;
  /** Whether focus returns to the trigger when the menu closes. A submenu returns it only after a key. */
  protected returnFocus = true;
  /** Which item focus goes to when the menu opens; `null` moves it nowhere. */
  protected initial: MenuInitialFocus | null = 'first';

  private itemCount = 0;
  /** Whether the content is in the document: open, or closed with an exit animation still running. */
  /** @internal */
  readonly _mounted = signal(false);
  private readonly placement = signal<{ side: MenuSide; align: MenuAlign } | null>(null);
  /** The key of the item that has or last had focus. */
  private readonly activeKey = signal<string | undefined>(undefined);
  private readonly typeahead = createTypeahead();
  /** The id of the menu; the ids of its trigger and content derive from it. @internal */
  readonly _id = inject(IdGenerator).getId(menuAnatomy.classes.root);
  /**
   * The portal of the content. The menu owns it and its layer, so another overlay on the trigger keeps its own; the
   * trigger gives it its view container. @internal
   */
  readonly _portal = new CckPortal();
  private readonly direction = inject(CckDirection);
  private readonly renderer = inject(Renderer2);
  protected readonly zone = injectZoneBoundary();
  private readonly layer = new CckOverlayLayer();
  private readonly parentLayer = inject(CckOverlayLayer, { optional: true, skipSelf: true });
  /** What the parts in the content find: this menu and its layer. Every other token resolves at the declaration. */
  private readonly contentInjector = Injector.create({
    providers: [
      { provide: CckMenuBase, useValue: this },
      { provide: CckOverlayLayer, useValue: this.layer },
    ],
  });
  private dismissLayer: DismissLayer | null = null;
  private readonly presence = createPresence({
    getElement: () => this._content()?.element ?? null,
    onStateChange: (state) => {
      this._mounted.set(state !== 'unmounted');
    },
  });

  /** The state the machine reads. @internal */
  protected readonly state = computed<MenuState>(() => ({
    id: this._id,
    open: this.open(),
    mounted: this._mounted(),
    side: this.placement()?.side ?? this._content()?.side(),
    align: this.placement()?.align ?? this._content()?.align(),
    items: this._items.items().map((item): MenuItemEntry => ({
      key: item.key,
      disabled: item.disabled(),
      // Read when a key needs it, so a text that changed after the render is matched.
      get text() {
        return item.element.textContent;
      },
      kind: item.kind(),
      checked: item.checked(),
      value: item.value(),
      hasDescription: item.hasDescription(),
    })),
    activeKey: this.activeKey(),
    named: this._content()?.named() ?? false,
    triggerId: this._triggerId()?.(),
    typeahead: this.typeahead,
    dir: this.direction.dir(),
    sub: this.isSub,
  }));

  /** The props of the trigger, the content and the items. @internal */
  readonly _parts: Signal<MenuParts> = computed(() =>
    getMenuProps(this.state(), (event) => {
      this.send(event);
    }),
  );

  /** The state of the machine, for the parts that build their own props. @internal */
  readonly _state: Signal<MenuState> = this.state;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.presence.destroy();
      this.typeahead.reset();
    });

    // Opening mounts at once; closing waits for the exit animation (read after the closed state rendered).
    afterRenderEffect({
      write: () => {
        const show = this.open() && this._template() !== null && this._trigger() !== null;
        untracked(() => {
          this.presence.setOpen(show);
        });
      },
    });

    afterRenderEffect({
      write: () => {
        const [mounted, template, trigger] = [this._mounted(), this._template(), this._trigger()];
        untracked(() => {
          if (mounted && template && trigger)
            this._portal.attach(template, undefined, trigger, { injector: this.contentInjector });
          else this._portal.detach();
        });
      },
    });

    // Positioned once the content has rendered: only then it has its class and theme attributes, which carry the gap.
    afterRenderEffect({
      write: (onCleanup) => {
        const [mounted, trigger, content] = [this._mounted(), this._trigger(), this._content()];
        if (!mounted || !trigger || !content?.ready()) return;
        const options = this.positionOptions(trigger, content);
        const stop = untracked(() =>
          this.zone.outside(() =>
            startOverlayPosition({
              ...options,
              getAnchor: () => trigger,
              getContent: () => content.element,
              getDirection: () => this.direction.dir(),
              onPlacementChange: (placement) => {
                this.zone.inside(() => {
                  this.placement.set(placement);
                });
              },
            }),
          ),
        );
        onCleanup(() => {
          stop();
          this.placement.set(null);
        });
      },
    });

    afterRenderEffect({
      write: (onCleanup) => {
        const [open, trigger, content] = [this.open(), this._trigger(), this._content()];
        // A layer the trigger started before the content rendered must not outlive a close made by the parent.
        if (!open)
          untracked(() => {
            this.stopDismissLayer();
          });
        if (!open || !trigger || !content) return;
        untracked(() => {
          onCleanup(this.engage(trigger, content.element));
        });
      },
    });
  }

  protected abstract setOpen(open: boolean): void;

  protected abstract announce(next: MenuTransition, details: MenuChangeDetails): void;

  protected abstract refuses(reason: 'escape' | 'outside-press' | 'focus-out'): boolean;

  protected abstract vetoes(details: MenuChangeDetails): boolean;

  protected abstract dismissEvent(reason: 'escape' | 'outside-press' | 'focus-out', event: Event | null): MenuEvent;

  /** What a `SUB.*` event does here; only a submenu answers. */
  protected abstract handleSub(event: MenuEvent): boolean;

  /** The side, the alignment and the offsets the content is placed with. */
  protected positionOptions(_trigger: HTMLElement, content: MenuContentRegistration): Partial<OverlayPositionOptions> {
    const [sideOffset, alignOffset] = [content.sideOffset(), content.alignOffset()];
    return {
      side: content.side(),
      align: content.align(),
      ...(sideOffset === undefined ? {} : { sideOffset }),
      ...(alignOffset === undefined ? {} : { alignOffset }),
    };
  }

  /** Whether the dismiss layer listens for the focus leaving. */
  protected dismissOn(): readonly ('escape' | 'outside-press' | 'focus-out')[] {
    return ['escape', 'outside-press', 'focus-out'];
  }

  /** Whether Tab at an end of the content is caught by a guard that closes the menu. */
  protected readonly guarded: boolean = true;

  /**
   * Registers an item. The item removes itself when it is destroyed.
   *
   * @param item - What the item tells the menu.
   * @returns The key and the function that removes the item.
   * @internal
   */
  _addItem(item: Omit<MenuItemRegistration, 'key'>): { readonly key: string; readonly remove: () => void } {
    const key = `${this._id}-item-${String(this.itemCount)}`;
    this.itemCount += 1;
    const remove = this._items.add({ ...item, key });
    return {
      key,
      remove: () => {
        remove();
        this.focusContentAfterRemoval(key, item.element);
      },
    };
  }

  /**
   * Sends an event to the menu from a part that builds its own props.
   *
   * @param event - What happened.
   * @returns Whether the open state changed.
   * @internal
   */
  _send(event: MenuEvent): boolean {
    return this.send(event);
  }

  /**
   * Registers a submenu of this menu.
   *
   * @param sub - The submenu.
   * @returns The function that unregisters it.
   * @internal
   */
  _addSub(sub: MenuSubHandle): () => void {
    this._subs.update((subs) => new Set(subs).add(sub));
    return () => {
      this._subs.update((subs) => {
        const next = new Set(subs);
        next.delete(sub);
        return next;
      });
    };
  }

  /**
   * Runs an item: its event first, then the close unless the event was prevented.
   *
   * @param key - The key of the item.
   * @param run - Fires the item event; returns whether a handler prevented it.
   * @param event - The click.
   * @internal
   */
  _runItem(key: string, run: () => boolean, event: Event): void {
    const entry = this.state().items?.find((item) => item.key === key);
    if (!entry || entry.disabled) return;
    this.send({ type: 'ITEM.RUN', key, disabled: false, prevented: run(), event });
  }

  /**
   * An item of a submenu ran: the whole menu closes.
   *
   * @param event - The click.
   * @internal
   */
  _itemRanInSub(event: Event): void {
    this.send({ type: 'ITEM.RUN', key: '', disabled: false, event });
  }

  /** A removed item that had the focus sends it to the content, so the keyboard stays in the menu. */
  private focusContentAfterRemoval(key: string, element: HTMLElement): void {
    const content = this._content()?.element;
    if (!this.open() || !content || this.activeKey() !== key) return;
    const active = element.ownerDocument.activeElement;
    if (active === element || active === null || active === element.ownerDocument.body) content.focus();
  }

  private itemElement(key: string): HTMLElement | undefined {
    return this._items.items().find((item) => item.key === key)?.element;
  }

  /** Applies what a press on a checkbox or radio item asks for. */
  private applyItemChange(key: string, event: Event): void {
    const entry = this.state().items?.find((item) => item.key === key);
    const change = entry ? getMenuItemChange(entry) : null;
    if (change)
      this._items
        .items()
        .find((item) => item.key === key)
        ?.apply(change, event);
  }

  /**
   * Starts what an open menu needs: the dismiss layer, the focus guards, the move of focus into the content and
   * the return of focus when it closes.
   *
   * @param trigger - The trigger element.
   * @param content - The content element.
   * @returns The cleanup.
   */
  private engage(trigger: HTMLElement, content: HTMLElement): () => void {
    const inserted = this.guarded ? insertMenuGuards(this.renderer, content) : null;
    this.startDismissLayer();
    const connected = inserted
      ? connectFocusGuards({
          getContent: () => this._content()?.element ?? null,
          getTrigger: () => this._trigger(),
          getGuards: () => inserted.guards,
        })
      : null;
    const focusReturn = captureFocusReturn({
      getTrigger: () => this._trigger(),
      getContent: () => this._content()?.element ?? null,
    });
    const cancelFocus = scheduleFocus(trigger.ownerDocument, () => {
      if (this.open()) this.focusInitial();
    });
    return () => {
      cancelFocus();
      this.stopDismissLayer();
      connected?.destroy();
      inserted?.remove();
      this.typeahead.reset();
      // A cleanup caused by closing returns focus; one caused by the menu being destroyed does not. It waits
      // a frame, so a press on empty space (which blurs to the body after the layer saw it) cannot undo it.
      if (!untracked(this.open)) {
        this.activeKey.set(undefined);
        const back = this.returnFocus;
        this.initial = 'first';
        this.returnFocus = true;
        if (back) {
          scheduleFocus(trigger.ownerDocument, () => {
            if (!this.open()) focusReturn.restore();
          });
        }
      }
    };
  }

  /** Moves focus to the first or last item, or to the content when it has none. */
  private focusInitial(): void {
    if (this.initial === null) return;
    const items = this._items.items();
    const target = (this.initial === 'last' ? items.at(-1) : items[0])?.element ?? this._content()?.element;
    target?.focus();
  }

  /**
   * Registers the dismiss layer if it is not registered yet. The trigger starts it as soon as the user opens the
   * menu, so an Escape that comes before the content has rendered still closes it.
   */
  protected startDismissLayer(): void {
    if (this.dismissLayer) return;
    const layer = this.zone.outside(() =>
      createDismissLayer({
        getInsideElements: () => [this._trigger(), this._content()?.element ?? null],
        onDismiss: (intent) => {
          const { reason, event } = intent;
          this.zone.inside(() => {
            // A refused close keeps the layers below open too.
            if (this.refuses(reason) || !this.send(this.dismissEvent(reason, event))) intent.preventDefault();
          });
        },
        dismissOn: this.dismissOn(),
        getParent: () => this.parentLayer?.current ?? null,
      }),
    );
    this.dismissLayer = layer;
    this.layer.current = layer;
  }

  /** Removes the dismiss layer; safe to call when there is none. */
  protected stopDismissLayer(): void {
    const layer = this.dismissLayer;
    if (!layer) return;
    layer.destroy();
    if (this.layer.current === layer) this.layer.current = null;
    this.dismissLayer = null;
  }

  /**
   * Applies an event. Focus events and key results act on the items; the rest go to the machine: `closePredicate`
   * may refuse a close, then `open` is written and `opened` or `closed` emits.
   *
   * @param event - What happened.
   * @returns Whether the open state changed.
   */
  protected send(event: MenuEvent): boolean {
    if (isSubEvent(event)) return this.handleSub(event);
    switch (event.type) {
      case 'ITEM.FOCUS':
        this.activeKey.set(event.key);
        return false;
      case 'CONTENT.MOVE':
        this.itemElement(event.key)?.focus();
        return false;
      case 'ITEM.PRESS':
        this.itemElement(event.key)?.click();
        return false;
      case 'ITEM.CHECK':
        this.applyItemChange(event.key, event.event);
        return false;
      case 'ITEM.POINTER_MOVE':
        for (const sub of this._subs()) sub._pointerLeft(event.event);
        return false;
      case 'ITEM.RUN':
        if (!event.disabled) this.applyItemChange(event.key, event.event);
        break;
      default:
    }
    const next = transitionMenu(this.state(), event);
    return next ? this.change(next, event) : false;
  }

  /** Writes the open state a transition asks for, unless `closePredicate` refuses a close. */
  protected change(next: MenuTransition, event: { readonly event: Event | null }): boolean {
    const details: MenuChangeDetails = { reason: next.reason, event: event.event };
    if (!next.open && this.vetoes(details)) return false;
    if (next.open) this.initial = next.initial ?? 'first';
    this.setOpen(next.open);
    if (next.open) this.startDismissLayer();
    else this.stopDismissLayer();
    this.announce(next, details);
    return true;
  }
}
