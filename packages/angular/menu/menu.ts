import {
  DestroyRef,
  Directive,
  Renderer2,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
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
import { startOverlayPosition } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import {
  getMenuProps,
  menuAnatomy,
  transitionMenu,
  type MenuAlign,
  type MenuChangeReason,
  type MenuEvent,
  type MenuInitialFocus,
  type MenuItemEntry,
  type MenuParts,
  type MenuSide,
  type MenuState,
} from '@cocokits/machines/menu';
import type { ChangeDetails } from '@cocokits/shared';
import { visuallyHiddenStyle } from '@cocokits/utils';

/** What the content part tells the root about itself. @internal */
export interface MenuContentRegistration {
  /** The content element, in the portal host. */
  readonly element: HTMLElement;
  /** The wanted side. */
  readonly side: Signal<MenuSide>;
  /** The wanted alignment. */
  readonly align: Signal<MenuAlign>;
  /** Whether the author named the content with `aria-label` or `aria-labelledby`. */
  readonly named: Signal<boolean>;
}

/** What an item part tells the root about itself. @internal */
export interface MenuItemRegistration {
  /** The key of the item, unique in the root. */
  readonly key: string;
  /** The item element. */
  readonly element: HTMLElement;
  /** Whether the item is disabled. */
  readonly disabled: Signal<boolean>;
}

/** Why the open state of a Menu changed. */
export type MenuOpenChangeReason = MenuChangeReason;

/** What `opened`, `closed` and `closePredicate` receive: the `reason` of the change and the `event` behind it. */
export type MenuChangeDetails = ChangeDetails<MenuOpenChangeReason>;

/**
 * A button that opens a list of actions. Put the root on an `ng-container`; it makes no element. It holds the open state and links the trigger, the content and the items.
 *
 * You write the content in a `cckMenuPortal` template. It shows in the overlay container, not next to the trigger.
 *
 * On open, the focus moves to the first item. The arrow keys, Home, End and typing move between the items. Enter, Space or a click runs one. The menu then closes and the focus goes back to the trigger. Escape, a press outside and Tab also close it.
 *
 * @example
 * <ng-container cckMenu [(open)]="menuOpen">
 *   <button cckMenuTrigger>Actions</button>
 *   <ng-template cckMenuPortal>
 *     <cck-menu-content>
 *       <cck-menu-item (triggered)="rename()">Rename</cck-menu-item>
 *       <cck-menu-item [disabled]="true">Move</cck-menu-item>
 *       <cck-menu-item (triggered)="remove()">Delete</cck-menu-item>
 *     </cck-menu-content>
 *   </ng-template>
 * </ng-container>
 * @cckPart root
 * @cckNoElement
 * @cckSlot default - The trigger and the `cckMenuPortal` template. When not set, there is nothing to open.
 */
@Directive({
  selector: '[cckMenu]',
  exportAs: 'cckMenu',
  providers: [CckPortal, CckOverlayLayer],
})
export class CckMenu {
  /**
   * Whether the menu is open. Use `[(open)]` to read and change it.
   * @remarks `openChange` emits the new value when the menu opens or closes itself. `opened` and `closed` also send the reason.
   * @defaultValue false
   */
  readonly open = model(false);

  /**
   * Whether Escape and a press outside keep the menu open. The trigger, an item, a focus leave and a change from the parent still close it.
   * @remarks It runs before `closePredicate`. Keep a way to close the menu for keyboard users, such as the trigger.
   * @defaultValue false
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly disableClose = input(false, { transform: booleanAttribute });

  /**
   * A function that decides whether a close that the menu starts happens. Return `false` to keep it open. When not set, every close happens.
   * @remarks It runs for every close the menu starts, after `disableClose`. Those are the trigger, an item, Escape, a press outside and a focus leave. It does not run when the parent changes `open`.
   * @example
   * <ng-container cckMenu [closePredicate]="canClose">
   *   <button cckMenuTrigger>Actions</button>
   *   <ng-template cckMenuPortal>
   *     <cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: canClose = (details: MenuChangeDetails) => details.reason !== 'outside-press'; -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly closePredicate = input<((details: MenuChangeDetails) => boolean) | undefined>(undefined);

  /**
   * Emits after the user opens the menu with the trigger. It sends the `reason` and the `event`.
   * @remarks It never emits when the parent changes `open`.
   * @example
   * <ng-container cckMenu (opened)="onOpen($event)">
   *   <button cckMenuTrigger>Actions</button>
   *   <ng-template cckMenuPortal>
   *     <cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: onOpen(details: MenuChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly opened = output<MenuChangeDetails>();

  /**
   * Emits after the menu closes itself. It sends the `reason` and the `event`.
   * @remarks The trigger, an item, Escape, a press outside and a focus leave close it. It never emits when the parent changes `open`.
   * @example
   * <ng-container cckMenu (closed)="onClose($event)">
   *   <button cckMenuTrigger>Actions</button>
   *   <ng-template cckMenuPortal>
   *     <cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content>
   *   </ng-template>
   * </ng-container>
   * <!-- In the class: onClose(details: MenuChangeDetails) { console.log(details.reason); } -->
   * @cckParity Only this framework has this member.
   * @cckSemantic none
   */
  readonly closed = output<MenuChangeDetails>();

  /** The theme attributes of every part; the parts apply their own record. @internal */
  readonly _theme = themeAttrs(menuAnatomy);

  /** @internal */
  readonly _trigger = signal<HTMLElement | null>(null);
  /** The `id` input of the trigger, so the content can be named by the id the trigger renders. @internal */
  readonly _triggerId = signal<Signal<string | undefined> | null>(null);
  /** @internal */
  readonly _content = signal<MenuContentRegistration | null>(null);
  /** @internal */
  readonly _template = signal<TemplateRef<void> | null>(null);
  /** The mounted items in document order. @internal */
  readonly _items = domOrderedList<MenuItemRegistration>((item) => item.element);
  private itemCount = 0;
  /** Whether the content is in the document: open, or closed with an exit animation still running. */
  private readonly mounted = signal(false);
  private readonly placement = signal<{ side: MenuSide; align: MenuAlign } | null>(null);
  /** The key of the item that has or last had focus. */
  private readonly activeKey = signal<string | undefined>(undefined);
  /** Which item focus goes to when the menu opens. */
  private initial: MenuInitialFocus = 'first';
  private readonly typeahead = createTypeahead();
  private readonly id = inject(IdGenerator).getId(menuAnatomy.classes.root);
  private readonly portal = inject(CckPortal);
  private readonly direction = inject(CckDirection);
  private readonly renderer = inject(Renderer2);
  private readonly zone = injectZoneBoundary();
  private readonly layer = inject(CckOverlayLayer);
  private readonly parentLayer = inject(CckOverlayLayer, { optional: true, skipSelf: true });
  private dismissLayer: DismissLayer | null = null;
  private readonly presence = createPresence({
    getElement: () => this._content()?.element ?? null,
    onStateChange: (state) => {
      this.mounted.set(state !== 'unmounted');
    },
  });

  private readonly state = computed<MenuState>(() => ({
    id: this.id,
    open: this.open(),
    mounted: this.mounted(),
    side: this.placement()?.side ?? this._content()?.side(),
    align: this.placement()?.align ?? this._content()?.align(),
    items: this._items.items().map((item): MenuItemEntry => ({
      key: item.key,
      disabled: item.disabled(),
      // Read when a key needs it, so a text that changed after the render is matched.
      get text() {
        return item.element.textContent;
      },
    })),
    activeKey: this.activeKey(),
    named: this._content()?.named() ?? false,
    triggerId: this._triggerId()?.(),
    typeahead: this.typeahead,
  }));

  /** The props of the trigger, the content and the items. @internal */
  readonly _parts: Signal<MenuParts> = computed(() =>
    getMenuProps(this.state(), (event) => {
      this.send(event);
    }),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.presence.destroy();
      this.typeahead.reset();
    });

    // The content renders only once there is a trigger to anchor it, so a missing trigger needs a message.
    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (this._template() && !this._trigger()) {
        console.warn(
          'CocoKits: a MenuPortal has no MenuTrigger, so its content never opens. Add a cckMenuTrigger inside the same cckMenu.',
        );
      }
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
        const [mounted, template, trigger] = [this.mounted(), this._template(), this._trigger()];
        untracked(() => {
          if (mounted && template && trigger) this.portal.attach(template, undefined, trigger);
          else this.portal.detach();
        });
      },
    });

    afterRenderEffect({
      write: (onCleanup) => {
        const [mounted, trigger, content] = [this.mounted(), this._trigger(), this._content()];
        if (!mounted || !trigger || !content) return;
        const [side, align] = [content.side(), content.align()];
        const stop = untracked(() =>
          this.zone.outside(() =>
            startOverlayPosition({
              getAnchor: () => trigger,
              getContent: () => content.element,
              side,
              align,
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

  /**
   * Registers an item. The item removes itself when it is destroyed.
   *
   * @param element - The item element.
   * @param disabled - Whether the item is disabled.
   * @returns The registration and the function that removes it.
   * @internal
   */
  _addItem(element: HTMLElement, disabled: Signal<boolean>): { readonly key: string; readonly remove: () => void } {
    const key = `${this.id}-item-${String(this.itemCount)}`;
    this.itemCount += 1;
    const remove = this._items.add({ key, element, disabled });
    return {
      key,
      remove: () => {
        remove();
        this.focusContentAfterRemoval(key, element);
      },
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

  /**
   * Starts what an open Menu needs: the dismiss layer, the focus guards, the move of focus into the content and
   * the return of focus when it closes.
   *
   * @param trigger - The trigger element.
   * @param content - The content element.
   * @returns The cleanup.
   */
  private engage(trigger: HTMLElement, content: HTMLElement): () => void {
    const host = content.parentElement;
    const [start, end] = [this.createGuard(), this.createGuard()];
    if (host) {
      this.renderer.insertBefore(host, start, content);
      this.renderer.appendChild(host, end);
    }
    this.startDismissLayer();
    const guards = connectFocusGuards({
      getContent: () => this._content()?.element ?? null,
      getTrigger: () => this._trigger(),
      getGuards: () => [start, end],
    });
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
      guards.destroy();
      for (const guard of [start, end]) this.renderer.removeChild(guard.parentNode, guard);
      this.typeahead.reset();
      // A cleanup caused by closing returns focus; one caused by the Menu being destroyed does not. It waits
      // a frame, so a press on empty space (which blurs to the body after the layer saw it) cannot undo it.
      if (!untracked(this.open)) {
        this.activeKey.set(undefined);
        this.initial = 'first';
        scheduleFocus(trigger.ownerDocument, () => {
          if (!this.open()) focusReturn.restore();
        });
      }
    };
  }

  /** Moves focus to the first or last item, or to the content when it has none. */
  private focusInitial(): void {
    const items = this._items.items();
    const target = (this.initial === 'last' ? items.at(-1) : items[0])?.element ?? this._content()?.element;
    target?.focus();
  }

  /**
   * Registers the dismiss layer if it is not registered yet. The trigger starts it as soon as the user opens the
   * Menu, so an Escape that comes before the content has rendered still closes it.
   */
  private startDismissLayer(): void {
    if (this.dismissLayer) return;
    const layer = this.zone.outside(() =>
      createDismissLayer({
        getInsideElements: () => [this._trigger(), this._content()?.element ?? null],
        onDismiss: (intent) => {
          const { reason, event } = intent;
          this.zone.inside(() => {
            const refused = this.disableClose() && (reason === 'escape' || reason === 'outside-press');
            // A refused close keeps the layers below open too.
            if (refused || !this.send({ type: 'CONTENT.DISMISS', reason, event })) intent.preventDefault();
          });
        },
        dismissOn: ['escape', 'outside-press', 'focus-out'],
        getParent: () => this.parentLayer?.current ?? null,
      }),
    );
    this.dismissLayer = layer;
    this.layer.current = layer;
  }

  /** Removes the dismiss layer; safe to call when there is none. */
  private stopDismissLayer(): void {
    const layer = this.dismissLayer;
    if (!layer) return;
    layer.destroy();
    if (this.layer.current === layer) this.layer.current = null;
    this.dismissLayer = null;
  }

  /** A focusable, empty, invisible `span` that catches Tab at an end of the content. */
  private createGuard(): HTMLElement {
    const guard = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setAttribute(guard, 'tabindex', '0');
    for (const [name, value] of Object.entries(visuallyHiddenStyle)) {
      this.renderer.setStyle(guard, name, value);
    }
    return guard;
  }

  /**
   * Applies an event. Focus events and key results act on the items; the rest go to the machine: `closePredicate`
   * may refuse a close, then `open` is written and `opened` or `closed` emits.
   *
   * @param event - What happened.
   * @returns Whether the open state changed.
   */
  private send(event: MenuEvent): boolean {
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
      default:
    }
    const next = transitionMenu(this.state(), event);
    if (!next) return false;
    const details: MenuChangeDetails = { reason: next.reason, event: event.event };
    if (!next.open && this.closePredicate()?.(details) === false) return false;
    if (next.open) this.initial = next.initial ?? 'first';
    this.open.set(next.open);
    if (next.open) this.startDismissLayer();
    else this.stopDismissLayer();
    (next.open ? this.opened : this.closed).emit(details);
    return true;
  }
}

/**
 * Finds the Menu root above a part.
 *
 * @param part - The part's name, for the error message.
 * @returns The root.
 * @internal
 */
export function injectCckMenu(part: string): CckMenu {
  const root = inject(CckMenu, { optional: true });
  if (!root) throw new Error(`CocoKits: cckMenu${part} must be placed inside an element with cckMenu.`);
  return root;
}
