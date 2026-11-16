import { DestroyRef, Directive, effect, forwardRef, inject, signal, untracked, type Signal } from '@angular/core';
import { CckOverlayLayer, CckPortal } from '@cocokits/angular-core';
import type { OverlayPositionOptions } from '@cocokits/cdk/positioning';
import {
  getMenuSubPlacement,
  transitionMenuSub,
  type MenuEvent,
  type MenuSubTransition,
  type MenuTransition,
} from '@cocokits/machines/menu';
import { CckMenuBase, type MenuChangeDetails, type MenuContentRegistration, type MenuSubHandle } from './menu-base';

/**
 * A submenu: an item of a menu that opens another menu. Put it on an `ng-container`; it makes no element. It holds the open state of the submenu and links the sub-trigger, the sub-content and the items.
 *
 * Write the sub-trigger, then a `cckMenuPortal` template with the sub-content, inside the submenu. The sub-content opens at the bottom end corner of the sub-trigger, a gap away. When there is no room, it opens on the start side, and then above.
 *
 * The submenu opens when the pointer rests on the sub-trigger, and with Enter, Space, a click or the arrow key that points toward the content (Right Arrow, Left Arrow in right-to-left text). It closes when the pointer moves to another item of the parent menu, and with Escape or the arrow key that points back. A press on an item of the submenu closes the whole menu.
 *
 * @example
 * <cck-menu-content>
 *   <cck-menu-item>Rename</cck-menu-item>
 *   <ng-container cckMenuSub>
 *     <cck-menu-sub-trigger>Share</cck-menu-sub-trigger>
 *     <ng-template cckMenuPortal>
 *       <cck-menu-sub-content>
 *         <cck-menu-item>Email</cck-menu-item>
 *       </cck-menu-sub-content>
 *     </ng-template>
 *   </ng-container>
 * </cck-menu-content>
 * @cckPart sub
 * @cckNoElement
 * @cckSlot default - The `cck-menu-sub-trigger` and the `cckMenuPortal` template. When not set, there is nothing to open.
 */
@Directive({
  selector: '[cckMenuSub]',
  exportAs: 'cckMenuSub',
  providers: [CckPortal, CckOverlayLayer, { provide: CckMenuBase, useExisting: forwardRef(() => CckMenuSub) }],
})
export class CckMenuSub extends CckMenuBase implements MenuSubHandle {
  private readonly openState = signal(false);
  readonly open = this.openState.asReadonly();

  /** Whether the sub-trigger is disabled. @internal */
  _disabled: Signal<boolean> = signal(false);
  /** The menu this submenu belongs to. @internal */
  readonly _parent = inject(CckMenuBase, { skipSelf: true });

  protected override readonly isSub = true;
  protected override readonly guarded = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    const parent = this._parent;
    const remove = parent._addSub(this);
    inject(DestroyRef).onDestroy(() => {
      remove();
      this.clearTimer();
    });
    // The submenu cannot outlive its parent: when the parent closes, it closes with it.
    effect(() => {
      if (parent.open()) return;
      untracked(() => {
        this.clearTimer();
        if (!this.openState()) return;
        this.returnFocus = false;
        this.stopDismissLayer();
        this.openState.set(false);
      });
    });
  }

  /**
   * The pointer moved over another item of the parent menu: an open submenu closes.
   *
   * @param event - The pointer event.
   * @internal
   */
  _pointerLeft(event: Event): void {
    this.handleSub({ type: 'SUB.PARENT.POINTER_MOVE', event });
  }

  protected setOpen(open: boolean): void {
    this.openState.set(open);
  }

  protected announce(next: MenuTransition, details: MenuChangeDetails): void {
    // An item of the submenu ran: the whole menu closes, and its trigger takes the focus back.
    if (next.open || next.reason !== 'item') return;
    this.returnFocus = false;
    this._parent._itemRanInSub(details.event ?? new Event('item'));
  }

  protected refuses(): boolean {
    return false;
  }

  protected vetoes(): boolean {
    return false;
  }

  protected dismissEvent(reason: 'escape' | 'outside-press' | 'focus-out', event: Event | null): MenuEvent {
    return { type: 'SUB.DISMISS', reason: reason === 'escape' ? 'escape' : 'outside-press', event };
  }

  protected override dismissOn(): readonly ('escape' | 'outside-press')[] {
    return ['escape', 'outside-press'];
  }

  protected override positionOptions(
    trigger: HTMLElement,
    content: MenuContentRegistration,
  ): Partial<OverlayPositionOptions> {
    const sideOffset = content.sideOffset();
    return {
      ...getMenuSubPlacement(trigger.getBoundingClientRect().width),
      ...(sideOffset === undefined ? {} : { sideOffset }),
    };
  }

  protected override handleSub(event: MenuEvent): boolean {
    const next = transitionMenuSub({ open: this.open(), disabled: this._disabled() }, event);
    if (!next) return false;
    this.clearTimer();
    if (next.delay === undefined) {
      this.apply(next);
      return true;
    }
    // The pointer rests on the sub-trigger: the submenu opens after a short delay, and not when it left before.
    this.timer = setTimeout(() => {
      this.timer = null;
      this.apply(next);
    }, next.delay);
    return true;
  }

  /** Writes the open state a submenu transition asks for. */
  private apply(next: MenuSubTransition): void {
    if (next.open === this.open()) return;
    this.returnFocus = !next.open && next.focus === 'trigger';
    // A click, a key or a press opens the submenu and focuses an item; the pointer leaves the focus where it is.
    if (next.open) this.initial = next.reason === 'pointer' ? null : (next.initial ?? 'first');
    this.setOpen(next.open);
    if (next.open) this.startDismissLayer();
    else this.stopDismissLayer();
  }

  private clearTimer(): void {
    if (this.timer === null) return;
    clearTimeout(this.timer);
    this.timer = null;
  }
}

/** Finds the submenu above a sub-trigger. @internal */
export function injectCckMenuSub(part: string): CckMenuSub {
  const sub = inject(CckMenuSub, { optional: true });
  if (!sub) throw new Error(`CocoKits: cckMenu${part} must be placed inside an element with cckMenuSub.`);
  return sub;
}
